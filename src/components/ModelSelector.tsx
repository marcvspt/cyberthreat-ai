import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { AiModel } from '@/scripts/types.ts';
import { useClickOutside } from '@/hooks/useClickOutside.ts';

type ModelSelectorProps = {
    loading: boolean;
    selectedModel: string;
    onModelChange: (model: string) => void;
    models: readonly AiModel[];
};

export default function ModelSelector({ loading, selectedModel, onModelChange, models }: ModelSelectorProps) {
    const [modelOpen, setModelOpen] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, modelOpen, () => setModelOpen(false));

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const currentModel = useMemo(
        () => models.find((model) => model.id === selectedModel) ?? models[0],
        [models, selectedModel]
    );

    return (
        <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 shrink-0">Modelo:</span>
            <div ref={dropdownRef} className="relative">
                <button
                    type="button"
                    onClick={() => !loading && isHydrated && setModelOpen((open) => !open)}
                    disabled={loading || !isHydrated}
                    className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 pl-3 pr-2.5 py-1.5 text-xs text-secondary transition hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>{isHydrated ? currentModel.label : 'Cargando modelo...'}</span>
                    <svg
                        viewBox="0 0 24 24"
                        className={`h-3 w-3 fill-none stroke-current stroke-2 transition-transform ${modelOpen ? 'rotate-180' : ''}`}
                    >
                        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>

                {modelOpen && (
                    <div className="absolute top-full right-0 mt-2 z-20 min-w-48 overflow-hidden rounded-2xl border border-primary/30 bg-slate-950/95 shadow-[0_12px_40px_rgba(195,166,253,0.2)] backdrop-blur">
                        {models.map((model) => (
                            <button
                                key={model.id}
                                type="button"
                                onClick={() => {
                                    onModelChange(model.id);
                                    setModelOpen(false);
                                }}
                                className={`flex w-full flex-col px-4 py-3 text-left transition hover:bg-primary/15 ${model.id === selectedModel ? 'bg-primary/10' : ''}`}
                            >
                                <span className={`text-xs font-medium ${model.id === selectedModel ? 'text-primary' : 'text-white'}`}>
                                    {model.label}
                                </span>
                                <span className="text-[10px] text-slate-500">{model.provider}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
