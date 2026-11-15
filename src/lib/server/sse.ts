import type { AnalysisEventPayloads, AnalyzeIoCMeta, IocAnalysisResult } from '@/lib/types/analysis.ts';

export const streamHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-store, no-transform',
    Connection: 'keep-alive',
};

export function createSseEvent<Event extends keyof AnalysisEventPayloads>(event: Event, data: AnalysisEventPayloads[Event]) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export function createAnalysisMeta(result: IocAnalysisResult, model: string): AnalyzeIoCMeta {
    const { ioc, type, sources, warnings } = result;
    return { ioc, type, model, sources, hasEvidence: sources.length > 0, ...(warnings?.length ? { warnings } : {}) };
}

export function createNoDataStream(meta: AnalyzeIoCMeta) {
    const encoder = new TextEncoder()

    return new ReadableStream<Uint8Array>({
        start(controller) {
            controller.enqueue(encoder.encode(createSseEvent('meta', meta)))
            controller.enqueue(encoder.encode(createSseEvent('done', { done: true })))
            controller.close()
        }
    })
}
