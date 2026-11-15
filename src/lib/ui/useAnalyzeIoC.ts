import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { readSse } from '@/lib/sse.ts';
import { TEXTS_GENERAL } from '@/lib/texts.ts';
import type { ApiKeys } from '@/lib/types/api-keys.ts';
import type { StreamStatus, AnalyzeIoCMeta } from '@/lib/types/analysis.ts';
import { usePersistentModel } from '@/lib/ui/usePersistentModel.ts';
import { buildRequestHeaders, buildUiErrorMessage, parseAnalysisMeta } from '@/lib/ui/ctai-client.ts';

export function useAnalyzeIoC(keys: ApiKeys) {
    const { selectedModel, setSelectedModel } = usePersistentModel();
    const [data, setData] = useState('');
    const [error, setError] = useState('');
    const [status, setStatus] = useState<StreamStatus>('idle');
    const [meta, setMeta] = useState<AnalyzeIoCMeta | null>(null);
    const activeRequest = useRef<AbortController | null>(null);
    const loading = status === 'analyzing' || status === 'streaming';

    useEffect(() => () => {
        activeRequest.current?.abort();
        activeRequest.current = null;
    }, []);

    const cancelAnalysis = () => {
        const request = activeRequest.current;
        if (!request) return;
        activeRequest.current = null;
        request.abort();
        setData('');
        setStatus('cancelled');
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (activeRequest.current) return;

        const form = event.currentTarget;
        const input = new FormData(form).get('ioc-input');
        const ioc = typeof input === 'string' ? input.trim() : '';
        if (!ioc) return;

        const request = new AbortController();
        activeRequest.current = request;
        setStatus('analyzing');
        setMeta(null);
        setData('');
        setError('');

        const fail = (message: string) => {
            setData('');
            setError(message);
            setStatus('error');
        };

        try {
            const query = new URLSearchParams({ ioc, model: selectedModel });
            const response = await fetch(`/api/ctai?${query}`, {
                headers: buildRequestHeaders(keys),
                signal: request.signal,
            });
            if (activeRequest.current !== request) return;

            if (!response.ok) {
                const result = await response.json().catch(() => null);
                if (activeRequest.current === request) {
                    if (result?.meta) setMeta(parseAnalysisMeta(result.meta));
                    fail(buildUiErrorMessage(result));
                }
                return;
            }

            if (!response.body) {
                fail(TEXTS_GENERAL.errors.streamUnavailable);
                return;
            }

            let hasEvidence: boolean | undefined;
            for await (const { event: name, data: frame } of readSse(response.body)) {
                if (activeRequest.current !== request) return;
                const payload = JSON.parse(frame);

                switch (name) {
                    case 'meta': {
                        const analysisMeta = parseAnalysisMeta(payload);
                        setMeta(analysisMeta);
                        hasEvidence = analysisMeta.hasEvidence;
                        if (hasEvidence) setStatus('streaming');
                        break;
                    }
                    case 'model': {
                        const model: unknown = payload?.model;
                        if (typeof model === 'string') {
                            setMeta((current) => current ? { ...current, model } : current);
                        }
                        break;
                    }
                    case 'chunk': {
                        const content: unknown = payload?.content;
                        if (typeof content === 'string') setData((current) => current + content);
                        break;
                    }
                    case 'error':
                        fail(buildUiErrorMessage(payload));
                        return;
                    case 'done':
                        if (payload?.done !== true || hasEvidence === undefined) {
                            fail(TEXTS_GENERAL.errors.streamInvalid);
                            return;
                        }
                        setStatus(hasEvidence ? 'done' : 'no_data');
                        form.reset();
                        return;
                }
            }

            if (activeRequest.current === request) fail(TEXTS_GENERAL.errors.streamInterrupted);
        } catch (cause: unknown) {
            if (activeRequest.current === request) {
                const invalidStream = cause instanceof SyntaxError
                    || (cause instanceof Error && cause.message === TEXTS_GENERAL.errors.streamInvalid);
                fail(invalidStream ? TEXTS_GENERAL.errors.streamInvalid : TEXTS_GENERAL.errors.streamInterrupted);
            }
        } finally {
            if (activeRequest.current === request) activeRequest.current = null;
        }
    };

    return { data, error, loading, status, meta, selectedModel, setSelectedModel, handleSubmit, cancelAnalysis };
}
