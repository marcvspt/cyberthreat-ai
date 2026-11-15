import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import AlertBox from '@/components/AlertBox.tsx';
import { EXTERNAL_RESOURCES } from '@/lib/links.ts';
import { TEXTS_GENERAL } from '@/lib/texts.ts';
import type { AnalyzeIoCMeta, StreamStatus } from '@/lib/types/analysis.ts';

type AIResponsePanelProps = {
    data: string;
    error: string;
    loading: boolean;
    status: StreamStatus;
    meta: AnalyzeIoCMeta | null;
};

const sourceLinks = [
    EXTERNAL_RESOURCES.virustotal,
    EXTERNAL_RESOURCES.abuseipdb,
    EXTERNAL_RESOURCES.polyswarm,
    EXTERNAL_RESOURCES.robtex,
];
const numberFormat = new Intl.NumberFormat('es-MX');

function PlainAnalysisText({ data }: { data: string }) {
    return <p className="whitespace-pre-wrap">{data}</p>;
}

const AnalysisMarkdown = lazy<ComponentType<{ data: string; streaming: boolean }>>(() => import('@/components/AnalysisMarkdown.tsx')
    .catch(() => ({ default: PlainAnalysisText })));

export default function AIResponsePanel({ data, error, loading, status, meta }: AIResponsePanelProps) {
    const results = TEXTS_GENERAL.results;
    const warnings = meta?.warnings ?? [];

    return (
        <section
            className="w-full max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-primary/12 shadow-2xl backdrop-blur"
            aria-labelledby="analysis-results-title"
        >
            <header className="border-b border-primary/20 bg-primary/10 px-5 py-4">
                <h2 id="analysis-results-title" className="text-lg font-semibold text-white">{results.title}</h2>
            </header>

            <div className="space-y-4 px-4 py-5 text-gray-100 sm:px-5">
                <div className="flex items-center gap-3 text-sm text-slate-200" role="status">
                    <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${loading ? 'bg-primary motion-safe:animate-pulse' : 'bg-secondary'}`}
                        aria-hidden="true"
                    />
                    <span>{TEXTS_GENERAL.status.messages[status]}</span>
                </div>

                {meta && (
                    <dl className="grid gap-3 rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm text-slate-200 sm:grid-cols-3">
                        <div className="min-w-0">
                            <dt className="font-semibold text-secondary">{results.iocLabel}</dt>
                            <dd className="wrap-anywhere font-mono">{meta.ioc}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-secondary">{results.typeLabel}</dt>
                            <dd>{meta.type}</dd>
                        </div>
                        {meta.hasEvidence && (
                            <div className="min-w-0">
                                <dt className="font-semibold text-secondary">{results.modelLabel}</dt>
                                <dd className="wrap-anywhere">{meta.model}</dd>
                            </div>
                        )}
                    </dl>
                )}

                {meta && (meta.sources.length > 0 || warnings.length > 0) && (
                    <section aria-labelledby="analysis-sources-title" className="space-y-3">
                        <h3 id="analysis-sources-title" className="font-semibold text-white">{results.sourcesTitle}</h3>
                        {meta.sources.length > 0 && (
                            <ul className="grid gap-3 sm:grid-cols-2">
                                {meta.sources.map(({ name, metrics }) => {
                                    const source = sourceLinks.find(({ label }) => label === name);
                                    return (
                                        <li key={name} className="min-w-0 rounded-2xl border border-primary/25 bg-slate-950/45 p-4">
                                            <h4 className="mb-2 font-medium text-secondary">
                                                {source ? (
                                                    <a className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4" href={source.href} target="_blank" rel="noopener noreferrer">
                                                        {name}
                                                    </a>
                                                ) : name}
                                            </h4>
                                            <dl className="space-y-1.5 text-sm">
                                                {metrics.map(({ label, value }) => (
                                                    <div key={label} className="flex justify-between gap-3">
                                                        <dt>{label}</dt>
                                                        <dd className="shrink-0 font-mono tabular-nums">
                                                            {typeof value === 'number' ? numberFormat.format(value) : value ? TEXTS_GENERAL.common.yes : TEXTS_GENERAL.common.no}
                                                        </dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        {warnings.length > 0 && (
                            <AlertBox
                                variant="warning"
                                role="status"
                                ariaLive="polite"
                                lines={warnings.map(({ message }) => ({ title: message }))}
                            />
                        )}
                    </section>
                )}

                {error && (
                    <AlertBox
                        variant="error"
                        role="alert"
                        lines={[{ title: results.errorTitle, detail: error }]}
                    />
                )}

                {data && (
                    <article
                        aria-labelledby="analysis-verdict-title"
                        className="space-y-3 rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm leading-7 wrap-anywhere sm:p-5"
                    >
                        <h3 id="analysis-verdict-title" className="font-semibold text-white">{results.verdictTitle}</h3>
                        <Suspense fallback={<PlainAnalysisText data={data} />}>
                            <AnalysisMarkdown data={data} streaming={status === 'streaming'} />
                        </Suspense>
                    </article>
                )}
            </div>
        </section>
    );
}
