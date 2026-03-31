import type { IoCType, ResolvedApiKeys, OpenRouterStreamParams, ErrorType } from '@/scripts/types.ts'
import { ProviderError, toClientError } from '@/scripts/errors.ts'
import { AI_MODELS } from '@/scripts/utils.ts'
import { detectIocType } from '@/scripts/iocValidators.ts'
import { analyzeIP } from '@/scripts/iocs/ip.ts'
import { analyzeDomain } from '@/scripts/iocs/domain.ts'
import { analyzeHash } from '@/scripts/iocs/hash.ts'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_SITE_REFERER = 'https://ctai.marcvspt.tech'
const OPENROUTER_SITE_TITLE = 'CyberThreat AI'

export const OPENROUTER_MODEL_DEFAULT = 'openrouter/free'
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
    return detectIocType(ioc)
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

function buildPrompt(ioc: string, iocType: IoCType, toolResult: any) {
    const warnings = toolResult?.warnings || []
    const warningsText = warnings.length > 0
        ? `\nNote: ${warnings.map((w: any) => w.message).join('; ')}`
        : ''

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
        `Tool output: ${JSON.stringify(toolResult)}`,
        warningsText
    ].filter(line => line !== '').join('\n')
}

export function allSourcesEmpty(toolResult: any): boolean {
    const sources: any[] = toolResult?.sources || []
    return sources.length > 0 && sources.every((s) => s.apiResponse === null)
}

export function createNoDataStream(ioc: string, iocDisplayType: string, model: string, warnings: any[]) {
    const encoder = new TextEncoder()

    return new ReadableStream<Uint8Array>({
        start(controller) {
            controller.enqueue(encoder.encode(createSseEvent('meta', { ioc, type: iocDisplayType, model, warnings })))
            controller.enqueue(encoder.encode(createSseEvent('done', { done: true })))
            controller.close()
        }
    })
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
        throw new ProviderError('ai', 'OpenRouter', 'invalid_api_key')
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
        let errorType: ErrorType = 'unknown'
        if (response.status === 401 || response.status === 403) {
            errorType = 'invalid_api_key'
        } else if (response.status >= 500) {
            errorType = 'api_unavailable'
        }

        let detail: string | undefined
        try {
            const body = await response.json()
            detail = typeof body?.error?.message === 'string' ? body.error.message : undefined
        } catch { /* ignorar si el cuerpo no es JSON */ }

        throw new ProviderError('ai', 'OpenRouter', errorType, detail)
    }

    if (!response.body) {
        throw new Error('Respuesta sin cuerpo de OpenRouter')
    }

    const decoder = new TextDecoder()
    const encoder = new TextEncoder()
    const reader = response.body.getReader()

    const warnings = (toolResult as any)?.warnings || []
    const displayType = typeof (toolResult as any)?.type === 'string' ? (toolResult as any).type : iocType

    return new ReadableStream<Uint8Array>({
        async start(controller) {
            controller.enqueue(encoder.encode(createSseEvent('meta', {
                ioc,
                type: displayType,
                model,
                ...(warnings.length ? { warnings } : {})
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

                        if (parsed?.error) {
                            const msg = typeof parsed.error?.message === 'string'
                                ? parsed.error.message
                                : undefined
                            throw new ProviderError('ai', 'OpenRouter', 'model_error', msg)
                        }
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
