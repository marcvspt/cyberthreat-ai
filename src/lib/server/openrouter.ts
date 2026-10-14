import { TEXTS_GENERAL } from '@/lib/texts.ts';
import { SITE_DATA } from '@/lib/site.ts';
import { ProviderError, toClientError } from '@/lib/server/errors.ts';
import { buildPrompt } from '@/lib/server/prompts/analysis.ts';
import { createSseEvent } from '@/lib/server/sse.ts';
import type { OpenRouterStreamParams, ErrorType } from '@/lib/types/analysis.ts';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

function buildDisplayModel(requestedModel: string, routedModel: string) {
    return routedModel || requestedModel
}

export async function createOpenRouterStream({
    ioc,
    iocType,
    toolResult,
    apiKey,
    model,
    siteUrl
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
                'HTTP-Referer': siteUrl,
                'X-Title': SITE_DATA.name
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
        throw new Error(TEXTS_GENERAL.errors.emptyOpenRouterResponse)
    }

    const decoder = new TextDecoder()
    const encoder = new TextEncoder()
    const reader = response.body.getReader()

    const warnings = toolResult.warnings || []
    const displayType = toolResult.type

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
