import { SITE_DATA } from '@/lib/site.ts';
import { ProviderError, toClientError } from '@/lib/server/errors.ts';
import { buildPrompt } from '@/lib/server/prompts/analysis.ts';
import { createSseEvent } from '@/lib/server/sse.ts';
import type { OpenRouterStreamParams, ErrorType } from '@/lib/types/analysis.ts';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_TIMEOUT_MS = 60_000;

export async function createOpenRouterStream({
    ioc,
    iocType,
    toolResult,
    apiKey,
    model,
    siteUrl,
    requestSignal
}: OpenRouterStreamParams) {
    if (!apiKey) {
        throw new ProviderError('ai', 'OpenRouter', 'invalid_api_key')
    }

    const streamController = new AbortController()
    const signal = AbortSignal.any([
        requestSignal,
        streamController.signal,
        AbortSignal.timeout(OPENROUTER_TIMEOUT_MS)
    ])
    let response: Response

    try {
        response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            signal,
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
        throw new ProviderError('ai', 'OpenRouter', 'api_unavailable')
    }

    if (!response.ok) {
        streamController.abort()
        let errorType: ErrorType = 'unknown'
        if (response.status === 401 || response.status === 403) {
            errorType = 'invalid_api_key'
        } else if (response.status === 429 || response.status >= 500) {
            errorType = 'api_unavailable'
        }

        throw new ProviderError('ai', 'OpenRouter', errorType)
    }

    if (!response.body) {
        streamController.abort()
        throw new ProviderError('ai', 'OpenRouter', 'api_unavailable')
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

                    if (streamController.signal.aborted) {
                        return
                    }
                    if (done) {
                        throw new ProviderError('ai', 'OpenRouter', 'api_unavailable')
                    }

                    buffer += decoder.decode(value, { stream: true })
                    const parts = buffer.split(/\r?\n\r?\n/)
                    buffer = parts.pop() ?? ''

                    for (const part of parts) {
                        const lines = part.split(/\r?\n/)
                        const dataLines = lines
                            .filter((line) => line.startsWith('data:'))
                            .map((line) => line.slice(5).replace(/^ /, ''))

                        if (dataLines.length === 0) {
                            continue
                        }

                        const payload = dataLines.join('\n').trim()

                        if (payload === '[DONE]') {
                            controller.enqueue(encoder.encode(createSseEvent('done', { done: true })))
                            controller.close()
                            return
                        }

                        const parsed = JSON.parse(payload)
                        const choice = parsed?.choices?.[0]

                        if (parsed?.error || choice?.finish_reason === 'error') {
                            throw new ProviderError('ai', 'OpenRouter', 'model_error')
                        }
                        const routedModel = typeof parsed?.model === 'string' ? parsed.model : ''

                        if (!routedModelSent && routedModel) {
                            routedModelSent = true
                            controller.enqueue(encoder.encode(createSseEvent('model', {
                                model: routedModel
                            })))
                        }

                        const delta = choice?.delta?.content || choice?.delta?.reasoning

                        if (typeof delta === 'string' && delta.length > 0) {
                            controller.enqueue(encoder.encode(createSseEvent('chunk', { content: delta })))
                        }
                    }
                }
            } catch (error: unknown) {
                if (!streamController.signal.aborted) {
                    const providerError = error instanceof ProviderError
                        ? error
                        : new ProviderError('ai', 'OpenRouter', 'api_unavailable')
                    controller.enqueue(encoder.encode(createSseEvent('error', toClientError(providerError))))
                    controller.close()
                }
            } finally {
                streamController.abort()
                reader.releaseLock()
            }
        },
        cancel() {
            streamController.abort()
        }
    })
}
