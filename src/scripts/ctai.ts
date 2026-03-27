import type { IoCType, ResolvedApiKeys, OpenRouterStreamParams } from '@/scripts/types.ts'
import { ProviderError, toClientError } from '@/scripts/errors.ts'
import { PATTERNS, AI_MODELS } from '@/scripts/utils.ts'
import { analyzeIP } from '@/scripts/iocs/ip.ts'
import { analyzeDomain } from '@/scripts/iocs/domain.ts'
import { analyzeHash } from '@/scripts/iocs/hash.ts'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_SITE_REFERER = 'https://ctai.marcvspt.tech'
const OPENROUTER_SITE_TITLE = 'CyberThreat AI'

export const OPENROUTER_MODEL_DEFAULT = 'openrouter/auto'
export const RATE_LIMIT_POINTS = Number(import.meta.env.RATE_LIMIT_POINTS ?? 5)
export const RATE_LIMIT_DURATION = Number(import.meta.env.RATE_LIMIT_DURATION ?? 60)

const ALLOWED_MODELS = new Set(AI_MODELS.map((model) => model.id))

export const jsonHeaders = { 'Content-Type': 'application/json' }
export const streamHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive'
}

export function jsonResponse(body: unknown, status: number) {
    return new Response(JSON.stringify(body), {
        status,
        headers: jsonHeaders
    })
}

export function getClientIp(request: Request) {
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    if (cfConnectingIp) {
        return cfConnectingIp
    }

    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0]?.trim() || 'unknown'
    }

    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
        return realIp
    }

    return 'unknown'
}

export function resolveIocType(ioc: string) {
    for (const [type, pattern] of Object.entries(PATTERNS)) {
        if (pattern.test(ioc)) {
            return type as IoCType
        }
    }

    return null
}

export function resolveModel(rawModel: string) {
    return ALLOWED_MODELS.has(rawModel) ? rawModel : OPENROUTER_MODEL_DEFAULT
}

export function resolveRequestApiKeys(request: Request, defaultOpenRouterApiKey: string) {
    return {
        openRouterKey: request.headers.get('X-OpenRouter-Key') || defaultOpenRouterApiKey || '',
        userVTKey: request.headers.get('X-VT-Key') || undefined,
        userAbuseKey: request.headers.get('X-AbuseIPDB-Key') || undefined,
        userPolyKey: request.headers.get('X-Polyswarm-Key') || undefined
    } satisfies ResolvedApiKeys
}

export function createSseEvent(event: string, data: unknown) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

function buildDisplayModel(requestedModel: string, routedModel: string) {
    return routedModel || requestedModel
}

function buildPrompt(ioc: string, iocType: IoCType, toolResult: unknown) {
    return [
        'You are a senior cyber threat intelligence analyst.',
        'Analyze the provided indicator of compromise and respond in Spanish.',
        'Classify it as malicious (Malicioso), suspicious (Sospechoso), or benign (Benigno).',
        'Response with markdon.',
        'Use this structure exactly:',
        '**Veredicto:** <Malicioso|Sospechoso|Benigno>',
        '**Confianza:** <Baja|Media|Alta>',
        '\n**Resumen:** <short summary of the analysis>',
        '\n**Motivos:**',
        '- <reason>',
        '- <reason>',
        '\n**Acciones recomendadas:**',
        '- <action>',
        '- <action>',
        `IoC: ${ioc}`,
        `IoC type: ${iocType}`,
        `Tool output: ${JSON.stringify(toolResult)}`
    ].join('\n')
}

export async function analyzeIocByType(iocType: IoCType, ioc: string, keys: ResolvedApiKeys) {
    switch (iocType) {
        case 'ip':
            return analyzeIP(ioc, keys.userVTKey, keys.userAbuseKey)
        case 'domain':
            return analyzeDomain(ioc, keys.userVTKey)
        case 'hash':
            return analyzeHash(ioc, keys.userVTKey, keys.userPolyKey)
        default:
            throw new Error('Tipo de IoC no soportado')
    }
}

export async function createOpenRouterStream({
    ioc,
    iocType,
    toolResult,
    apiKey,
    model
}: OpenRouterStreamParams) {
    if (!apiKey) {
        throw new ProviderError('ai', 'OpenRouter')
    }

    let response: Response

    try {
        response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': OPENROUTER_SITE_REFERER,
                'X-Title': OPENROUTER_SITE_TITLE
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'user',
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
        throw new Error('Respuesta sin cuerpo de OpenRouter')
    }

    const decoder = new TextDecoder()
    const encoder = new TextEncoder()
    const reader = response.body.getReader()

    return new ReadableStream<Uint8Array>({
        async start(controller) {
            controller.enqueue(encoder.encode(createSseEvent('meta', {
                ioc,
                type: iocType,
                model
            })))

            let buffer = ''
            let routedModelSent = false

            try {
                while (true) {
                    const { done, value } = await reader.read()

                    if (done) {
                        break
                    }

                    buffer += decoder.decode(value, { stream: true })
                    const parts = buffer.split('\n\n')
                    buffer = parts.pop() ?? ''

                    for (const part of parts) {
                        const lines = part.split('\n')
                        const dataLines = lines
                            .filter((line) => line.startsWith('data:'))
                            .map((line) => line.slice(5).trim())

                        if (dataLines.length === 0) {
                            continue
                        }

                        const payload = dataLines.join('')

                        if (payload === '[DONE]') {
                            controller.enqueue(encoder.encode(createSseEvent('done', { done: true })))
                            controller.close()
                            return
                        }

                        const parsed = JSON.parse(payload)
                        const routedModel = typeof parsed?.model === 'string' ? parsed.model : ''

                        if (!routedModelSent && routedModel) {
                            routedModelSent = true
                            controller.enqueue(encoder.encode(createSseEvent('model', {
                                model: buildDisplayModel(model, routedModel)
                            })))
                        }

                        const deltaChoice = parsed?.choices?.[0]?.delta
                        const delta = deltaChoice?.content || deltaChoice?.reasoning

                        if (typeof delta === 'string' && delta.length > 0) {
                            controller.enqueue(encoder.encode(createSseEvent('chunk', { content: delta })))
                        }
                    }
                }

                controller.enqueue(encoder.encode(createSseEvent('done', { done: true })))
                controller.close()
            } catch (error: unknown) {
                controller.enqueue(encoder.encode(createSseEvent('error', toClientError(error))))
                controller.close()
            } finally {
                reader.releaseLock()
            }
        }
    })
}
