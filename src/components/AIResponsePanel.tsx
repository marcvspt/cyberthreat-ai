import { useEffect, useState } from 'preact/hooks';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import type { AnalyzeIoCMeta, StreamStatus } from '@/scripts/types.ts';
import { EMPTY_MESSAGES, getRandomMessage, getStatusMessage } from '@/scripts/catalog/statusMessages.ts';
import AlertBox from '@/components/AlertBox.tsx';

type AIResponsePanelProps = {
    data: string;
    loading: boolean;
    status: StreamStatus;
    meta: AnalyzeIoCMeta | null;
};

export default function AIResponsePanel({ data, loading, status, meta }: AIResponsePanelProps) {
    const [emptyMessage, setEmptyMessage] = useState(() => getRandomMessage(EMPTY_MESSAGES.idle));
    const renderedMarkdown = data ? (marked.parse(data, { async: false, breaks: true, gfm: true }) as string) : '';
    const safeRenderedMarkdown = renderedMarkdown ? DOMPurify.sanitize(renderedMarkdown) : '';
    const isError = status === 'error';
    const titleId = 'analysis-results-title';
    const statusId = 'analysis-results-status';

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
        <section
            className="w-full max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-primary/12 shadow-2xl backdrop-blur"
            role="region"
            aria-labelledby={titleId}
            aria-describedby={statusId}
        >
            <header className="flex items-center justify-between border-b border-primary/20 bg-primary/10 px-5 py-4">
                <div>
                    <h2 id={titleId} className="text-lg font-semibold text-white">Resultados del análisis</h2>
                </div>
                <span className="rounded-full border border-secondary/35 bg-secondary/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-secondary">
                    {status}
                </span>
            </header>

            <div className="space-y-4 px-5 py-5 text-gray-100">
                {meta ? (
                    <>
                        <dl className="grid gap-2 rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm text-slate-200 md:grid-cols-3 place-items-center">
                            <div className="text-center">
                                <dt className="text-secondary/85"><strong>IoC:</strong></dt>
                                <dd className="break-all">{meta.ioc}</dd>
                            </div>
                            <div className="text-center">
                                <dt className="text-secondary/85"><strong>Tipo:</strong></dt>
                                <dd className="break-all">{meta.type}</dd>
                            </div>
                            <div className="text-center">
                                <dt className="text-secondary/85"><strong>Modelo:</strong></dt>
                                <dd className="break-all">{meta.model}</dd>
                            </div>
                        </dl>
                    </>
                ) : null}

                <div className="min-h-72 rounded-2xl border border-primary/25 bg-[linear-gradient(180deg,rgba(195,166,253,0.16),rgba(196,187,240,0.08))] p-5">
                    <div id={statusId} className="mb-4 flex items-center gap-3 text-sm text-slate-300" role="status" aria-live="polite" aria-atomic="true">
                        <span className={`h-2.5 w-2.5 rounded-full ${loading ? 'animate-pulse bg-primary' : 'bg-secondary'}`} aria-hidden="true"></span>
                        <span>{getStatusMessage(status)}</span>
                    </div>

                    {meta?.warnings && meta.warnings.length > 0 && (
                        <div className="mb-4">
                            <AlertBox
                                variant="warning"
                                role="status"
                                ariaLive="polite"
                                lines={(() => {
                                    const badKey = meta.warnings.filter((w) => w.reason === 'invalid_api_key')
                                    const noData = meta.warnings.filter((w) => w.reason !== 'invalid_api_key')
                                    const lines = []
                                    if (badKey.length > 0) {
                                        lines.push({
                                            title: `${badKey.length} ${badKey.length === 1 ? 'fuente' : 'fuentes'} con API Key no válida`,
                                            detail: badKey.map((w) => w.source).join(', ')
                                        })
                                    }
                                    if (noData.length > 0) {
                                        lines.push({
                                            title: `${noData.length} ${noData.length === 1 ? 'fuente' : 'fuentes'} sin datos para este IoC`,
                                            detail: noData.map((w) => w.source).join(', ')
                                        })
                                    }
                                    return lines
                                })()}
                            />
                        </div>
                    )}

                    {isError && data ? (
                        <AlertBox
                            variant="error"
                            role="alert"
                            ariaLive="assertive"
                            lines={[{ title: 'Error en el análisis', detail: data.replace(/^Error:\s*/i, '') }]}
                        />
                    ) : data ? (
                        <div
                            role="article"
                            tabIndex={0}
                            className="text-sm leading-7 text-slate-100 [&_p]:my-4 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:underline [&_a]:text-secondary [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-primary/25 [&_pre]:bg-slate-950/50 [&_pre]:p-4"
                            dangerouslySetInnerHTML={{ __html: safeRenderedMarkdown }}
                        />
                    ) : (
                        <div className="font-mono text-sm leading-7 whitespace-pre-wrap text-slate-100" role="status" aria-live="polite" aria-atomic="true">
                            <span className="italic text-slate-300/90">{emptyMessage}</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}