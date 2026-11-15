import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ProviderError } from '@/lib/server/errors.ts';
import { getClientIp } from '@/lib/server/http.ts';
import { createOpenRouterStream } from '@/lib/server/openrouter.ts';
import { normalizeAbuseIPDB } from '@/lib/server/providers/abuseipdb.ts';
import { fetchAllSources, fetchProviderJson } from '@/lib/server/providers/fetcher.ts';
import { normalizePolySwarm } from '@/lib/server/providers/polyswarm.ts';
import { normalizeRobtex } from '@/lib/server/providers/robtex.ts';
import { normalizeVirusTotal } from '@/lib/server/providers/virustotal.ts';
import { createAnalysisMeta, createNoDataStream } from '@/lib/server/sse.ts';
import { readSse } from '@/lib/sse.ts';
import { TEXTS_GENERAL } from '@/lib/texts.ts';
import type { IocAnalysisResult, OpenRouterStreamParams } from '@/lib/types/analysis.ts';
import { parseAnalysisMeta } from '@/lib/ui/ctai-client.ts';

const metricLabels = TEXTS_GENERAL.results.metrics;
const analysis: IocAnalysisResult = {
    ioc: '192.0.2.1',
    type: 'IPv4',
    sources: [{ name: 'VirusTotal', metrics: [{ label: metricLabels.malicious, value: 2 }] }],
};

function openRouterParams(requestSignal = new AbortController().signal): OpenRouterStreamParams {
    return {
        iocType: 'ip',
        meta: createAnalysisMeta(analysis, 'openrouter/auto'),
        apiKey: 'test-key',
        siteUrl: 'https://example.test',
        requestSignal,
    };
}

async function collectEvents(body: ReadableStream<Uint8Array>) {
    const events = [];
    for await (const { event, data } of readSse(body)) events.push({ event, payload: JSON.parse(data) });
    return events;
}

test('la IP proviene del contexto de Astro y tiene un fallback para adaptadores sin dirección', () => {
    assert.equal(getClientIp({ clientAddress: '2001:db8::1' }), '2001:db8::1');
    assert.equal(getClientIp({ clientAddress: 'invalid' }), 'unknown');
    assert.equal(getClientIp({ get clientAddress(): string { throw new Error('Unavailable'); } }), 'unknown');
});

test('los normalizadores conservan cero y descartan texto arbitrario de los proveedores', () => {
    const virusTotal = normalizeVirusTotal({ data: { attributes: {
        last_analysis_stats: { malicious: 0, suspicious: 2 }, whois: 'Texto externo',
    } } });
    assert.deepEqual(virusTotal, [
        { label: metricLabels.malicious, value: 0 },
        { label: metricLabels.suspicious, value: 2 },
    ]);
    const abuseIPDB = normalizeAbuseIPDB({ data: { abuseConfidenceScore: 80, totalReports: 2, reports: ['Texto externo'] } });
    assert.deepEqual(abuseIPDB.map(({ value }) => value), [80, 2]);
    assert.throws(() => normalizeAbuseIPDB({ data: { abuseConfidenceScore: 110, totalReports: 2 } }), ProviderError);
    assert.deepEqual(normalizeRobtex({ majestic: { rank: 42 }, tranco_rank: 12 }), [
        { label: metricLabels.majesticRank, value: 42 },
        { label: metricLabels.trancoRank, value: 12 },
    ]);
    assert.deepEqual(normalizeRobtex({ majestic: { rank: null }, tranco_rank: 0 }), []);
});

test('PolySwarm procesa el sobre de resultados y cuenta las detecciones válidas', () => {
    const matches = { results: [{ failed: true }, { polyscore: '12.5', assertions: [
        { mask: true, verdict: true }, { mask: true, verdict: false }, { mask: false, verdict: true },
    ] }] };
    assert.deepEqual(normalizePolySwarm(matches).map(({ value }) => value), [12.5, 1, 1]);
    assert.deepEqual(normalizePolySwarm({ result: [] }), []);
});

test('el agregador mantiene evidencia parcial y distingue ausencia de datos de un fallo crítico', async () => {
    const signal = new AbortController().signal;
    const available = { name: 'VirusTotal', fetch: async () => analysis.sources[0].metrics };
    const missing = { name: 'Robtex', fetch: async () => [] };
    const unavailable = { name: 'AbuseIPDB', fetch: async () => { throw new ProviderError('ioc', 'AbuseIPDB', 'api_unavailable'); } };
    const partial = await fetchAllSources([available, unavailable], signal);
    assert.deepEqual(partial.results, analysis.sources);
    assert.equal(partial.warnings[0].reason, 'api_unavailable');
    assert.equal(partial.error, undefined);
    const empty = await fetchAllSources([missing], signal);
    assert.deepEqual(empty.results, []);
    assert.equal(empty.warnings[0].reason, 'not_found');
    assert.equal(empty.error, undefined);
    const failed = await fetchAllSources([missing, unavailable], signal);
    assert.equal(failed.error?.errorType, 'api_unavailable');
    assert.equal(failed.warnings.length, 2);
});

test('la cancelación de CTI llega al fetch y detiene la agregación', { timeout: 1000 }, async (context) => {
    const request = new AbortController();
    const provider: { signal?: AbortSignal } = {};
    context.mock.method(globalThis, 'fetch', async (_url: URL, init: RequestInit) => {
        const signal = init.signal;
        if (!signal) throw new Error('Falta la señal');
        provider.signal = signal;
        return new Promise<Response>((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        });
    });
    const pending = fetchAllSources([{
        name: 'Fixture',
        fetch: async () => {
            await fetchProviderJson('Fixture', 'https://example.test', { signal: request.signal });
            return [];
        },
    }], request.signal);
    request.abort();
    await assert.rejects(pending, { name: 'AbortError' });
    assert.equal(provider.signal?.aborted, true);
});

test('el flujo sin datos entrega metadatos interpretables por el cliente y termina sin texto', async () => {
    const meta = createAnalysisMeta({ ...analysis, sources: [] }, 'openrouter/auto');
    const events = await collectEvents(createNoDataStream(meta));
    assert.deepEqual(events.map(({ event }) => event), ['meta', 'done']);
    assert.equal(parseAnalysisMeta(events[0].payload).hasEvidence, false);
    assert.throws(() => parseAnalysisMeta({ ...meta, sources: [null] }));
});

test('el lector SSE admite CRLF, datos multilínea y caracteres UTF-8 divididos', async () => {
    const bytes = new TextEncoder().encode('event: chunk\r\ndata: análisis\r\ndata: útil\r\n\r\n');
    const body = new ReadableStream<Uint8Array>({
        start(controller) {
            for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
            controller.close();
        },
    });
    const chunks = [];
    for await (const frame of readSse(body)) chunks.push(frame);
    assert.deepEqual(chunks, [{ event: 'chunk', data: 'análisis\nútil' }]);
});

test('OpenRouter entrega el contenido visible y separa instrucciones de evidencia', async (context) => {
    context.mock.method(globalThis, 'fetch', async (_url: URL, init: RequestInit) => {
        const { messages } = JSON.parse(String(init.body));
        assert.equal(messages[0].role, 'system');
        assert.equal(messages[1].role, 'user');
        assert.deepEqual(JSON.parse(messages[1].content).sources, analysis.sources);
        return new Response([
            'data: {"model":"test/model","choices":[{"delta":{"reasoning":"privado"}}]}',
            'data: {"choices":[{"delta":{"content":"Veredicto"}}]}',
            'data: [DONE]',
        ].join('\n\n') + '\n\n');
    });
    const events = await collectEvents(createOpenRouterStream(openRouterParams()));
    assert.deepEqual(events.map(({ event }) => event), ['meta', 'model', 'chunk', 'done']);
    assert.deepEqual(events[2].payload, { content: 'Veredicto' });
});

test('OpenRouter termina con error si el stream se cierra sin señal de fin', async (context) => {
    context.mock.method(globalThis, 'fetch', async () => new Response('data: {"choices":[{"delta":{"content":"Parcial"}}]}\n\n'));
    const events = await collectEvents(createOpenRouterStream(openRouterParams()));
    assert.deepEqual(events.map(({ event }) => event), ['meta', 'chunk', 'error']);
    assert.equal(events[2].payload.errorType, 'api_unavailable');
});

test('OpenRouter conserva la evidencia cuando rechaza la clave antes de generar', async (context) => {
    context.mock.method(globalThis, 'fetch', async () => new Response('Detalle privado', { status: 401 }));
    const events = await collectEvents(createOpenRouterStream(openRouterParams()));
    assert.deepEqual(events.map(({ event }) => event), ['meta', 'error']);
    assert.deepEqual(events[0].payload.sources, analysis.sources);
    assert.equal(events[1].payload.errorType, 'invalid_api_key');
    assert.doesNotMatch(events[1].payload.error, /Detalle privado/);
});

test('cancelar el stream de salida aborta OpenRouter mientras inicia la consulta', { timeout: 1000 }, async (context) => {
    const upstream: { signal?: AbortSignal } = {};
    context.mock.method(globalThis, 'fetch', async (_url: URL, init: RequestInit) => {
        const signal = init.signal;
        if (!signal) throw new Error('Falta la señal');
        upstream.signal = signal;
        return new Promise<Response>((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        });
    });
    const reader = createOpenRouterStream(openRouterParams()).getReader();
    assert.match(new TextDecoder().decode((await reader.read()).value), /event: meta/);
    await reader.cancel();
    assert.equal(upstream.signal?.aborted, true);
});
