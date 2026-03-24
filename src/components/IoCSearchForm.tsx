import { useEffect, useRef, useState } from 'preact/hooks';
import { AVAILABLE_MODELS } from '@/hooks/useAnalyzeIoC.ts';

type IoCSearchFormProps = {
    loading: boolean;
    onSubmit: (event: any) => void;
    hasCustomKeys: boolean;
    onOpenSettings: () => void;
    selectedModel: string;
    onModelChange: (model: string) => void;
};

export default function IoCSearchForm({ loading, onSubmit, hasCustomKeys, onOpenSettings, selectedModel, onModelChange }: IoCSearchFormProps) {
    const [modelOpen, setModelOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!modelOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (!dropdownRef.current?.contains(e.target as Node)) {
                setModelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [modelOpen]);

    const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) ?? AVAILABLE_MODELS[0];
    return (
        <form
            onSubmit={onSubmit}
            className="w-full max-w-3xl "
        >
            <div className="space-y-5 p-5 md:p-6">
                <p className="space-y-2 text-sm text-center">
                    Envía una IP, un dominio o un hash y un modelo de IA redacta un veredicto del IoC basandose en la información de distintas fuentes de datos de inteligencia de amenazas y analizadores de IoC.
                </p>

                <div className="rounded-3xl border border-primary/30 bg-slate-950/45 p-3 shadow-inner shadow-black/10">
                    <div className="mb-3 flex items-center justify-between px-2">
                        <label htmlFor="ioc-input" className="text-xs uppercase tracking-[0.28em] text-secondary/85">
                            Indicador de compromiso
                        </label>
                        <button
                            type="button"
                            onClick={onOpenSettings}
                            title="Configurar API keys"
                            className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-secondary/80 transition hover:bg-primary/20 hover:text-secondary"
                        >
                            {hasCustomKeys && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                            <span>API keys</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary/80">
                                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                                    <path d="M10.5 18a7.5 7.5 0 1 1 5.303-2.197L21 21" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <input
                                className="h-14 w-full rounded-2xl border border-primary/30 bg-white/8 pl-12 pr-4 text-base text-white shadow-sm outline-none transition placeholder:text-slate-400 focus:border-secondary focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(196,187,240,0.15)]"
                                type="text"
                                placeholder="Ejemplo: 8.8.8.8, example.org o 44d88612fea8a8f36de82e1278abb02f"
                                id="ioc-input"
                                name="ioc-input"
                                autoComplete="off"
                            />
                        </div>

                        <button
                            type="submit"
                            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-slate-950 shadow-[0_14px_32px_rgba(195,166,253,0.34)] transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70 md:min-w-44"
                            disabled={loading}
                        >
                            <span>{loading ? 'Analizando...' : 'Iniciar análisis'}</span>
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                                <path d="M5 12h14M13 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-row justify-between mt-3">
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5">IP pública</span>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5">Dominio</span>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5">MD5</span>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5">SHA1</span>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5">SHA256</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 shrink-0">Modelo:</span>
                            <div ref={dropdownRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => !loading && setModelOpen((o) => !o)}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 pl-3 pr-2.5 py-1.5 text-xs text-secondary transition hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>{currentModel.label}</span>
                                    <svg
                                        viewBox="0 0 24 24"
                                        className={`h-3 w-3 fill-none stroke-current stroke-2 transition-transform ${modelOpen ? 'rotate-180' : ''}`}
                                    >
                                        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>

                                {modelOpen && (
                                    <div className="absolute top-full right-0 mt-2 z-20 min-w-48 overflow-hidden rounded-2xl border border-primary/30 bg-slate-950/95 shadow-[0_12px_40px_rgba(195,166,253,0.2)] backdrop-blur">
                                        {AVAILABLE_MODELS.map((m) => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => { onModelChange(m.id); setModelOpen(false); }}
                                                className={`flex w-full flex-col px-4 py-3 text-left transition hover:bg-primary/15 ${m.id === selectedModel ? 'bg-primary/10' : ''}`}
                                            >
                                                <span className={`text-xs font-medium ${m.id === selectedModel ? 'text-primary' : 'text-white'}`}>
                                                    {m.label}
                                                </span>
                                                <span className="text-[10px] text-slate-500">{m.provider}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </form>
    );
}