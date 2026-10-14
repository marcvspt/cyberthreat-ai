import type { SourceWarning } from '@/lib/types/analysis.ts';

export const streamHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
};

export function createSseEvent(event: string, data: unknown) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export function createNoDataStream(ioc: string, iocDisplayType: string, model: string, warnings: SourceWarning[]) {
    const encoder = new TextEncoder()

    return new ReadableStream<Uint8Array>({
        start(controller) {
            controller.enqueue(encoder.encode(createSseEvent('meta', { ioc, type: iocDisplayType, model, warnings })))
            controller.enqueue(encoder.encode(createSseEvent('done', { done: true })))
            controller.close()
        }
    })
}
