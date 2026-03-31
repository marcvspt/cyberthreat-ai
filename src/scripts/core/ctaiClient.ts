import type { ApiKeys } from '@/scripts/types.ts';

type SseEvent = {
    event: string;
    data: string;
};

export function parseSseEvents(chunk: string): SseEvent[] {
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

export function buildUiErrorMessage(payload: { error?: string }) {
    return payload.error || 'No se pudo completar el análisis';
}

export function buildRequestHeaders(keys: ApiKeys) {
    const requestHeaders: Record<string, string> = {};

    if (keys.openrouter) requestHeaders['X-OpenRouter-Key'] = keys.openrouter;
    if (keys.virustotal) requestHeaders['X-VT-Key'] = keys.virustotal;
    if (keys.abuseipdb) requestHeaders['X-AbuseIPDB-Key'] = keys.abuseipdb;
    if (keys.polyswarm) requestHeaders['X-Polyswarm-Key'] = keys.polyswarm;

    return requestHeaders;
}
