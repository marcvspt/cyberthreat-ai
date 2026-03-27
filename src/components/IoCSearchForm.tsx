import { AVAILABLE_MODELS } from '@/hooks/useAnalyzeIoC.ts';
import ApiKeysSettingsButton from '@/components/ApiKeysSettingsButton';
import IoCInputField from '@/components/IoCInputField';
import ModelSelector from '@/components/ModelSelector';
import type { IoCSearchFormProps } from '@/scripts/types.ts';

export default function IoCSearchForm({ loading, onSubmit, hasCustomKeys, onOpenSettings, selectedModel, onModelChange }: IoCSearchFormProps) {
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
                        <ApiKeysSettingsButton hasCustomKeys={hasCustomKeys} onOpenSettings={onOpenSettings} />
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row">
                        <IoCInputField />

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
                        <ModelSelector
                            loading={loading}
                            selectedModel={selectedModel}
                            onModelChange={onModelChange}
                            models={AVAILABLE_MODELS}
                        />
                    </div>
                </div>


            </div>
        </form>
    );
}