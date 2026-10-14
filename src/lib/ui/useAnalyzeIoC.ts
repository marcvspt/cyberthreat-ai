import { TEXTS_GENERAL } from '@/lib/texts.ts';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ApiKeys } from '@/lib/types/api-keys.ts';
import type { StreamStatus, AnalyzeIoCMeta } from '@/lib/types/analysis.ts';
import { usePersistentModel } from '@/lib/ui/usePersistentModel.ts';
import { buildRequestHeaders, buildUiErrorMessage, parseSseEvents } from '@/lib/ui/ctai-client.ts';
export function useAnalyzeIoC(keys: ApiKeys) {
    const { selectedModel, setSelectedModel } = usePersistentModel();
    const [data, setData] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<StreamStatus>('idle');
    const [meta, setMeta] = useState<AnalyzeIoCMeta | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const ioc = (formData.get('ioc-input') as string).trim();

        if (!ioc) {
            setData('');
            setMeta(null);
            setStatus('idle');
            return;
        }

        setLoading(true);
        setStatus('analyzing');
        setMeta(null);
        setData(TEXTS_GENERAL.results.preparingAnalysis);

        try {
            const requestHeaders = buildRequestHeaders(keys);

            const response = await fetch(`/api/ctai?ioc=${encodeURIComponent(ioc)}&model=${encodeURIComponent(selectedModel)}`, {
                headers: requestHeaders
            });

            if (!response.ok) {
                const result = await response.json();
                setData(`${TEXTS_GENERAL.common.errorPrefix} ${buildUiErrorMessage(result)}`);
                setStatus('error');
                return;
            }

            if (!response.body) {
                throw new Error(TEXTS_GENERAL.errors.streamUnavailable);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n\n');
                buffer = parts.pop() ?? '';

                for (const event of parseSseEvents(parts.join('\n\n'))) {
                    if (!event.data) {
                        continue;
                    }

                    const payload = JSON.parse(event.data);

                    if (event.event === 'meta') {
                        setMeta(payload);
                        setData('');
                        // no cambia status aquí: lo hará 'chunk' (streaming) o 'done' (sin datos)
                    }

                    if (event.event === 'model' && typeof payload.model === 'string') {
                        setMeta((current) => {
                            if (!current) {
                                return current;
                            }

                            return {
                                ...current,
                                model: payload.model
                            };
                        });
                    }

                    if (event.event === 'chunk' && typeof payload.content === 'string') {
                        setStatus('streaming');
                        setData((current) => current + payload.content);
                    }

                    if (event.event === 'error') {
                        setData(`${TEXTS_GENERAL.common.errorPrefix} ${buildUiErrorMessage(payload)}`);
                        setStatus('error');
                    }

                    if (event.event === 'done') {
                        setStatus('done');
                    }
                }
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : TEXTS_GENERAL.errors.unknownError;
            setData(`${TEXTS_GENERAL.common.errorPrefix} ${msg}`);
            setStatus('error');
        } finally {
            setLoading(false);
        }

        form.reset();
    };

    return { data, loading, status, meta, selectedModel, setSelectedModel, handleSubmit };
}
