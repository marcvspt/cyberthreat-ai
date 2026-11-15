type SseFrame = { event: string; data: string };

// Both upstream and downstream streams use UTF-8 SSE frames.
export async function* readSse(body: ReadableStream<Uint8Array>): AsyncGenerator<SseFrame> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) return;

            buffer += decoder.decode(value, { stream: true });
            const frames = buffer.split(/\r?\n\r?\n/);
            buffer = frames.pop() ?? '';

            for (const frame of frames) {
                let event = 'message';
                const data: string[] = [];
                for (const line of frame.split(/\r?\n/)) {
                    if (line.startsWith('event:')) event = line.slice(6).trim();
                    if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
                }
                if (data.length) yield { event, data: data.join('\n') };
            }
        }
    } finally {
        try {
            await reader.cancel();
        } catch {
            // An aborted or errored body may already be closed.
        } finally {
            reader.releaseLock();
        }
    }
}
