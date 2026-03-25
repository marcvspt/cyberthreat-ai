import type { APIRoute } from 'astro';
import type { IoCType } from '@/scripts/types.ts';
import { ProviderError, toClientError } from '@/scripts/errors.ts';
import { RateLimiterMemory } from 'rate-limiter-flexible';

import { PATTERNS, AI_MODELS } from "@/scripts/utils.ts"

import { analyzeIP } from "@/scripts/iocs/ip.ts"
import { analyzeDomain } from "@/scripts/iocs/domain.ts"
import { analyzeHash } from "@/scripts/iocs/hash.ts"

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL_DEFAULT = "openrouter/auto"
const RATE_LIMIT_POINTS = Number(import.meta.env.RATE_LIMIT_POINTS ?? 8)
const RATE_LIMIT_DURATION = Number(import.meta.env.RATE_LIMIT_DURATION ?? 60)

const ALLOWED_MODELS = new Set(AI_MODELS.map((m) => m.id))
const rateLimiter = new RateLimiterMemory({
    points: RATE_LIMIT_POINTS,
    duration: RATE_LIMIT_DURATION
})

const jsonHeaders = { "Content-Type": "application/json" }
const streamHeaders = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive"
}

function jsonResponse(body: unknown, status: number) {
    return new Response(JSON.stringify(body), {
        status,
        headers: jsonHeaders
    })
}

function getClientIp(request: Request) {
    const cfConnectingIp = request.headers.get("cf-connecting-ip")
    if (cfConnectingIp) {
        return cfConnectingIp
    }

    const forwardedFor = request.headers.get("x-forwarded-for")
    if (forwardedFor) {
        return forwardedFor.split(",")[0]?.trim() || "unknown"
    }

    const realIp = request.headers.get("x-real-ip")
    if (realIp) {
        return realIp
    }

    return "unknown"
}

function buildPrompt(ioc: string, iocType: IoCType, toolResult: unknown) {
    return [
        "You are a senior cyber threat intelligence analyst.",
        "Analyze the provided indicator of compromise and respond in Spanish.",
        "Classify it as malicious (Malicioso), suspicious (Sospechoso), or benign (Benigno).",
        "Response with markdon.",
        "Use this structure exactly:",
        "**Veredicto:** <Malicioso|Sospechoso|Benigno>",
        "**Confianza:** <Baja|Media|Alta>",
        "\n**Resumen:** <short summary of the analysis>",
        "\n**Motivos:**",
        "- <reason>",
        "- <reason>",
        "\n**Acciones recomendadas:**",
        "- <action>",
        "- <action>",
        `IoC: ${ioc}`,
        `IoC type: ${iocType}`,
        `Tool output: ${JSON.stringify(toolResult)}`
    ].join("\n")
}

function createSseEvent(event: string, data: unknown) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

async function createAIStream(ioc: string, iocType: IoCType, toolResult: unknown, apiKey: string, model: string) {
    if (!apiKey) {
        throw new ProviderError('ai', 'OpenRouter')
    }

    let response: Response

    try {
        response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://ctai.marcvspt.tech",
                "X-Title": "CyberThreat AI"
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: "user",
                        content: buildPrompt(ioc, iocType, toolResult)
                    }
                ],
                temperature: 0.2,
                max_tokens: 700,
                stream: true
            })
        })
    } catch {
        throw new ProviderError('ai', 'OpenRouter')
    }

    if (!response.ok) {
        throw new ProviderError('ai', 'OpenRouter')
    }

    if (!response.body) {
        throw new Error("Respuesta sin cuerpo de OpenRouter")
    }

    const decoder = new TextDecoder()
    const encoder = new TextEncoder()
    const reader = response.body.getReader()

    return new ReadableStream<Uint8Array>({
        async start(controller) {
            controller.enqueue(encoder.encode(createSseEvent("meta", {
                ioc,
                type: iocType,
                model
            })))

            let buffer = ""

            try {
                while (true) {
                    const { done, value } = await reader.read()

                    if (done) {
                        break
                    }

                    buffer += decoder.decode(value, { stream: true })
                    const parts = buffer.split("\n\n")
                    buffer = parts.pop() ?? ""

                    for (const part of parts) {
                        const lines = part.split("\n")
                        const dataLines = lines
                            .filter((line) => line.startsWith("data:"))
                            .map((line) => line.slice(5).trim())

                        if (dataLines.length === 0) {
                            continue
                        }

                        const payload = dataLines.join("")

                        if (payload === "[DONE]") {
                            controller.enqueue(encoder.encode(createSseEvent("done", { done: true })))
                            controller.close()
                            return
                        }

                        const parsed = JSON.parse(payload)
                        const deltaChoice = parsed?.choices?.[0]?.delta
                        // Algunos modelos envían en 'content', otros en 'reasoning'
                        const delta = deltaChoice?.content || deltaChoice?.reasoning

                        if (typeof delta === "string" && delta.length > 0) {
                            controller.enqueue(encoder.encode(createSseEvent("chunk", { content: delta })))
                        }
                    }
                }

                controller.enqueue(encoder.encode(createSseEvent("done", { done: true })))
                controller.close()
            } catch (error: unknown) {
                controller.enqueue(encoder.encode(createSseEvent("error", toClientError(error))))
                controller.close()
            } finally {
                reader.releaseLock()
            }
        }
    })
}

export const GET = (async ({ request }) => {
    const { url } = request
    const urlObject = new URL(url)
    const clientIp = getClientIp(request)

    try {
        await rateLimiter.consume(`ctai:${clientIp}`, 1)
    } catch (rejected: any) {
        const retryAfterSeconds = Math.max(1, Math.ceil((rejected?.msBeforeNext ?? 1000) / 1000))

        return new Response(JSON.stringify({
            error: "Too many requests",
            retryAfterSeconds
        }), {
            status: 429,
            headers: {
                ...jsonHeaders,
                "Retry-After": String(retryAfterSeconds),
                "X-RateLimit-Limit": String(RATE_LIMIT_POINTS),
                "X-RateLimit-Window": String(RATE_LIMIT_DURATION)
            }
        })
    }

    const ioc = urlObject.searchParams.get("ioc")

    if (!ioc) {
        return jsonResponse({ error: "Falta el parámetro de IoC" }, 400)
    }

    // Determine IoC type
    let iocType: IoCType | null = null
    for (const [type, pattern] of Object.entries(PATTERNS)) {
        if (pattern.test(ioc)) {
            iocType = type as IoCType
            break
        }
    }

    if (!iocType) {
        return jsonResponse({ error: "Tipo de IoC desconocido" }, 400)
    }

    const rawModel = urlObject.searchParams.get("model") ?? ""
    const resolvedModel = ALLOWED_MODELS.has(rawModel) ? rawModel : OPENROUTER_MODEL_DEFAULT

    const resolvedOrKey: string = request.headers.get('X-OpenRouter-Key') || OPENROUTER_API_KEY || ''
    const userVTKey = request.headers.get('X-VT-Key') || undefined
    const userAbuseKey = request.headers.get('X-AbuseIPDB-Key') || undefined
    const userPolyKey = request.headers.get('X-Polyswarm-Key') || undefined

    try {
        let toolResult: unknown
        switch (iocType) {
            case "ip":
                toolResult = await analyzeIP(ioc, userVTKey, userAbuseKey)
                break
            case "domain":
                toolResult = await analyzeDomain(ioc, userVTKey)
                break
            case "hash":
                toolResult = await analyzeHash(ioc, userVTKey, userPolyKey)
                break
            default:
                throw new Error("Tipo de IoC no soportado")
        }

        const stream = await createAIStream(ioc, iocType, toolResult, resolvedOrKey, resolvedModel)

        return new Response(stream, {
            status: 200,
            headers: streamHeaders
        })
    } catch (error: unknown) {
        return jsonResponse(toClientError(error), 500)
    }
}) satisfies APIRoute;