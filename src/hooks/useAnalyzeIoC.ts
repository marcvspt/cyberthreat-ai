import { useState } from 'preact/hooks';
import type { ApiKeys, AiModel, StreamStatus, AnalyzeIoCMeta } from '@/scripts/types.ts';
import { AI_MODELS } from '@/scripts/utils.ts';

export type { AiModel, StreamStatus, AnalyzeIoCMeta };

export const AVAILABLE_MODELS = AI_MODELS;

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id;

function parseSseEvents(chunk: string) {
    return chunk
        .split('\n\n')
        .filter(Boolean)
        .map((block) => {
            const eventLine = block.split('\n').find((line) => line.startsWith('event:'));
            const dataLines = block
                .split('\n')
                .filter((line) => line.startsWith('data:'))
                .map((line) => line.slice(5).trim());

            return {
                event: eventLine ? eventLine.slice(6).trim() : 'message',
                data: dataLines.join('')
            };
        });
}

export function useAnalyzeIoC(keys: ApiKeys) {
    const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
    const [data, setData] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<StreamStatus>('idle');
    const [meta, setMeta] = useState<AnalyzeIoCMeta | null>(null);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
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
        setData('Preparando contexto y consultando la IA...\n');

        try {
            const requestHeaders: Record<string, string> = {};
            if (keys.openrouter) requestHeaders['X-OpenRouter-Key'] = keys.openrouter;
            if (keys.virustotal) requestHeaders['X-VT-Key'] = keys.virustotal;
            if (keys.abuseipdb) requestHeaders['X-AbuseIPDB-Key'] = keys.abuseipdb;
            if (keys.polyswarm) requestHeaders['X-Polyswarm-Key'] = keys.polyswarm;

            const response = await fetch(`/api/ctai?ioc=${encodeURIComponent(ioc)}&model=${encodeURIComponent(selectedModel)}`, {
                headers: requestHeaders
            });

            if (!response.ok) {
                const result = await response.json();
                setData(`Error: ${result.error || 'Analysis failed'}`);
                setStatus('error');
                return;
            }

            if (!response.body) {
                throw new Error('Streaming no disponible en la respuesta');
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
                        setStatus('streaming');
                    }

                    if (event.event === 'chunk' && typeof payload.content === 'string') {
                        setStatus('streaming');
                        setData((current) => current + payload.content);
                    }

                    if (event.event === 'error') {
                        setData(`Error: ${payload.error || 'Analysis failed'}`);
                        setStatus('error');
                    }

                    if (event.event === 'done') {
                        setStatus('done');
                    }
                }
            }
        } catch (error: any) {
            setData(`Error: ${error.message}`);
            setStatus('error');
        } finally {
            setLoading(false);
        }

        e.target.reset();
    };

    return { data, loading, status, meta, selectedModel, setSelectedModel, handleSubmit };
}
