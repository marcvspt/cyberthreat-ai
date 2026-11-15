import { TEXTS_GENERAL } from '@/lib/texts.ts';
import type { AiModel } from '@/lib/types/model.ts';

type ModelSelectorProps = {
    loading: boolean;
    selectedModel: string;
    onModelChange: (model: string) => void;
    models: readonly AiModel[];
};

export default function ModelSelector({ loading, selectedModel, onModelChange, models }: ModelSelectorProps) {
    return (
        <div className="flex min-w-0 items-center gap-2">
            <label htmlFor="analysis-model" className="shrink-0 text-sm text-slate-300">
                {TEXTS_GENERAL.search.modelLabel}
            </label>
            <select
                id="analysis-model"
                value={selectedModel}
                onChange={(event) => onModelChange(event.currentTarget.value)}
                disabled={loading}
                className="min-h-10 min-w-0 max-w-full truncate rounded-2xl border border-primary/30 bg-slate-950 px-3 py-2 text-sm text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
                {models.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
            </select>
        </div>
    );
}
