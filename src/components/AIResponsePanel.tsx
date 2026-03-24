import { useEffect, useState } from 'preact/hooks';
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
        return 'Recolectando evidencia de las herramientas...';
    }

    if (status === 'streaming') {
        return 'La IA está redactando la respuesta...';
    }

    if (status === 'done') {
        return 'Respuesta completada';
    }

    return 'La consulta terminó con error';
}

export default function AIResponsePanel({ data, loading, status, meta }: AIResponsePanelProps) {
    const [emptyMessage, setEmptyMessage] = useState(() => getRandomMessage(EMPTY_MESSAGES.idle));

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
                    <h2 className="text-lg font-semibold text-white">Análisis realizado por la IA</h2>
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

                    <div className="font-mono text-sm leading-7 whitespace-pre-wrap text-slate-100">
                        {data || <span className="italic text-slate-300/90">{emptyMessage}</span>}
                    </div>
                </div>
            </div>
        </section>
    );
}