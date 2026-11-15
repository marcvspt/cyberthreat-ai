import { TEXTS_GENERAL } from '@/lib/texts.ts';
import { AVAILABLE_MODELS } from '@/lib/catalog/models.ts';
import ApiKeysSettingsButton from '@/components/ApiKeysSettingsButton.tsx';
import IoCInputField from '@/components/IoCInputField.tsx';
import IocTypeChips from '@/components/IocTypeChips.tsx';
import ModelSelector from '@/components/ModelSelector.tsx';

type IoCSearchFormProps = {
    loading: boolean;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    hasCustomKeys: boolean;
    onOpenSettings: (trigger: HTMLButtonElement) => void;
    selectedModel: string;
    onModelChange: (model: string) => void;
};

export default function IoCSearchForm({ loading, onSubmit, onCancel, hasCustomKeys, onOpenSettings, selectedModel, onModelChange }: IoCSearchFormProps) {
    return (
        <form
            onSubmit={onSubmit}
            className="w-full max-w-3xl"
        >
            <div className="space-y-5 sm:p-5 md:p-6">
                <p className="space-y-2 text-sm text-center">
                    {TEXTS_GENERAL.search.description}
                </p>

                <div className="rounded-3xl border border-primary/30 bg-slate-950/45 p-3 shadow-inner shadow-black/10">
                    <div className="mb-3 flex items-center justify-between gap-2 px-1 sm:px-2">
                        <label htmlFor="ioc-input" className="text-xs uppercase tracking-[0.28em] text-secondary/85">
                            {TEXTS_GENERAL.search.iocLabel}
                        </label>
                        <ApiKeysSettingsButton hasCustomKeys={hasCustomKeys} onOpenSettings={onOpenSettings} />
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row">
                        <IoCInputField />

                        <button
                            type={loading ? 'button' : 'submit'}
                            onClick={loading ? (event) => {
                                event.preventDefault();
                                onCancel();
                            } : undefined}
                            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-slate-950 shadow-[0_14px_32px_rgba(195,166,253,0.34)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary md:min-w-44"
                        >
                            <span>{loading ? TEXTS_GENERAL.search.cancelAnalysis : TEXTS_GENERAL.search.analyzeButton}</span>
                        </button>
                    </div>

                    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <IocTypeChips />
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
