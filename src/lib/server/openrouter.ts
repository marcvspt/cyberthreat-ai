import { SITE_DATA } from '@/lib/site.ts';
import { ProviderError, toClientError } from '@/lib/server/errors.ts';
import { buildAnalysisMessages } from '@/lib/server/prompts/analysis.ts';
import { createSseEvent } from '@/lib/server/sse.ts';
import { readSse } from '@/lib/sse.ts';
import type { ErrorType, OpenRouterStreamParams } from '@/lib/types/analysis.ts';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_TIMEOUT_MS = 60_000;

async function fetchOpenRouter(params: OpenRouterStreamParams, signal: AbortSignal) {
    const { apiKey, siteUrl, iocType, meta } = params;
    if (!apiKey) throw new ProviderError('ai', 'OpenRouter', 'invalid_api_key');

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        signal,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': siteUrl,
            'X-Title': SITE_DATA.name,
        },
        body: JSON.stringify({
            model: meta.model,
            messages: buildAnalysisMessages(iocType, meta),
            temperature: 0.2,
            max_tokens: 700,
            stream: true,
        }),
    });

    if (!response.ok) {
        let errorType: ErrorType = 'unknown';
        if (response.status === 401 || response.status === 403) {
            errorType = 'invalid_api_key';
        } else if (response.status === 429 || response.status >= 500) {
            errorType = 'api_unavailable';
        }
        throw new ProviderError('ai', 'OpenRouter', errorType);
    }

    if (!response.body) throw new ProviderError('ai', 'OpenRouter', 'api_unavailable');
    return response.body;
}

export function createOpenRouterStream(params: OpenRouterStreamParams) {
    const streamController = new AbortController();
    const signal = AbortSignal.any([
        params.requestSignal,
        streamController.signal,
        AbortSignal.timeout(OPENROUTER_TIMEOUT_MS),
    ]);
    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
        async start(controller) {
            controller.enqueue(encoder.encode(createSseEvent('meta', params.meta)));
            let routedModelSent = false;
            let receivedContent = false;

            try {
                const body = await fetchOpenRouter(params, signal);
                for await (const { data } of readSse(body)) {
                    if (streamController.signal.aborted) return;

                    const payload = data.trim();
                    if (payload === '[DONE]') {
                        if (!receivedContent) throw new ProviderError('ai', 'OpenRouter', 'model_error');
                        controller.enqueue(encoder.encode(createSseEvent('done', { done: true })));
                        controller.close();
                        return;
                    }

                    const parsed = JSON.parse(payload);
                    const choice = parsed?.choices?.[0];
                    if (parsed?.error || choice?.finish_reason === 'error') {
                        throw new ProviderError('ai', 'OpenRouter', 'model_error');
                    }

                    if (!routedModelSent && typeof parsed?.model === 'string' && parsed.model) {
                        routedModelSent = true;
                        controller.enqueue(encoder.encode(createSseEvent('model', { model: parsed.model })));
                    }

                    const content = choice?.delta?.content;
                    if (typeof content === 'string' && content) {
                        receivedContent ||= Boolean(content.trim());
                        controller.enqueue(encoder.encode(createSseEvent('chunk', { content })));
                    }
                }

                throw new ProviderError('ai', 'OpenRouter', 'api_unavailable');
            } catch (error: unknown) {
                if (!streamController.signal.aborted) {
                    const providerError = error instanceof ProviderError
                        ? error
                        : new ProviderError('ai', 'OpenRouter', 'api_unavailable');
                    controller.enqueue(encoder.encode(createSseEvent('error', toClientError(providerError))));
                    controller.close();
                }
            } finally {
                streamController.abort();
            }
        },
        cancel() {
            streamController.abort();
        },
    });
}
