import { useEffect, useState } from 'preact/hooks';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import type { AnalyzeIoCMeta, StreamStatus } from '@/hooks/useAnalyzeIoC.ts';

type AIResponsePanelProps = {
    data: string;
    loading: boolean;
    status: StreamStatus;
    meta: AnalyzeIoCMeta | null;
};

const EMPTY_MESSAGES: Record<StreamStatus, string[]> = {
    idle: [
        'Esperando un IoC para comenzar el análisis.',
        'Lista para inspeccionar IPs, dominios y hashes.',
        'Introduce un indicador y levantaré evidencia técnica.'
    ],
    analyzing: [
        'Investigando el indicador y cruzando señales iniciales...',
        'Recabando datos de las fuentes de inteligencia...',
        'Consultando reputación, contexto y trazas disponibles...',
        'Buscando coincidencias y patrones de riesgo...'
    ],
    streaming: [
        'La IA está redactando la respuesta...',
        'Sintetizando hallazgos y priorizando señales relevantes...',
        'Consultando contexto adicional en la deep web...',
        'Consolidando evidencias para emitir un veredicto...'
    ],
    done: [
        'El análisis terminó, pero todavía no hay texto para mostrar.',
        'La respuesta llegó vacía; revisa la siguiente consulta.',
        'No se recibió contenido visible del modelo en esta ejecución.'
    ],
    error: [
        'La consulta se interrumpió antes de devolver contenido.',
        'Hubo un error durante el análisis del indicador.',
        'No fue posible completar la respuesta de la IA.'
    ]
};

function getRandomMessage(messages: string[], current?: string) {
    if (messages.length === 1) {
        return messages[0];
    }

    const candidates = current ? messages.filter((message) => message !== current) : messages;
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function getStatusMessage(status: StreamStatus) {
    if (status === 'idle') {
        return 'Envía un IoC para iniciar el análisis';
    }

    if (status === 'analyzing') {
        return 'Recolectando evidencias de las herramientas...';
    }

    if (status === 'streaming') {
        return 'La IA está redactando la respuesta...';
    }

    if (status === 'done') {
        return 'Respuesta completada';
    }

    return 'Algo salió mal durante el análisis';
}

export default function AIResponsePanel({ data, loading, status, meta }: AIResponsePanelProps) {
    const [emptyMessage, setEmptyMessage] = useState(() => getRandomMessage(EMPTY_MESSAGES.idle));
    const renderedMarkdown = data ? (marked.parse(data, { async: false, breaks: true, gfm: true }) as string) : '';
    const safeRenderedMarkdown = renderedMarkdown ? DOMPurify.sanitize(renderedMarkdown) : '';
    const isError = status === 'error';

    useEffect(() => {
        if (data) {
            return;
        }

        const messages = EMPTY_MESSAGES[status];
        setEmptyMessage((current) => getRandomMessage(messages, current));

        if (status !== 'analyzing' && status !== 'streaming') {
            return;
        }

        const intervalId = window.setInterval(() => {
            setEmptyMessage((current) => getRandomMessage(messages, current));
        }, 2400);

        return () => window.clearInterval(intervalId);
    }, [data, status]);

    return (
        <section className="w-full max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-primary/12 shadow-2xl backdrop-blur">
            <header className="flex items-center justify-between border-b border-primary/20 bg-primary/10 px-5 py-4">
                <div>
                    <h2 className="text-lg font-semibold text-white">Resultados del análisis</h2>
                </div>
                <span className="rounded-full border border-secondary/35 bg-secondary/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                    {status}
                </span>
            </header>

            <div className="space-y-4 px-5 py-5 text-gray-100">
                {meta ? (
                    <div className="grid gap-2 rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm text-slate-200 md:grid-cols-3 place-items-center">
                        <p><span className="text-secondary/85">IoC:</span> {meta.ioc}</p>
                        <p><span className="text-secondary/85">Tipo:</span> {meta.type}</p>
                        <p><span className="text-secondary/85">Modelo:</span> {meta.model}</p>
                    </div>
                ) : null}

                <div className="min-h-72 rounded-2xl border border-primary/25 bg-[linear-gradient(180deg,rgba(195,166,253,0.16),rgba(196,187,240,0.08))] p-5">
                    <div className="mb-4 flex items-center gap-3 text-sm text-slate-300">
                        <span className={`h-2.5 w-2.5 rounded-full ${loading ? 'animate-pulse bg-primary' : 'bg-secondary'}`}></span>
                        <span>{getStatusMessage(status)}</span>
                    </div>

                    {data ? (
                        <div
                            className={`text-sm leading-7 [&_p]:my-4 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:underline [&_strong]:font-semibold [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:p-4 ${isError ? 'rounded-xl border border-red-400/30 bg-red-950/25 px-4 py-3 text-red-200 [&_a]:text-red-300 [&_code]:bg-red-400/10 [&_pre]:border-red-400/25 [&_pre]:bg-red-950/35' : 'text-slate-100 [&_a]:text-secondary [&_code]:bg-white/10 [&_pre]:border-primary/25 [&_pre]:bg-slate-950/50'}`}
                            dangerouslySetInnerHTML={{ __html: safeRenderedMarkdown }}
                        />
                    ) : (
                        <div className="font-mono text-sm leading-7 whitespace-pre-wrap text-slate-100">
                            <span className="italic text-slate-300/90">{emptyMessage}</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}