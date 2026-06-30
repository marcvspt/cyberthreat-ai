import { useEffect, useState } from 'react';
import { DEFAULT_MODEL, MODEL_IDS } from '@/scripts/catalog/models.ts';

const MODEL_STORAGE_KEY = 'ctai:selected-model';

function getInitialModel() {
    if (typeof window === 'undefined') {
        return DEFAULT_MODEL;
    }

    const savedModel = window.localStorage.getItem(MODEL_STORAGE_KEY);
    return savedModel && MODEL_IDS.has(savedModel) ? savedModel : DEFAULT_MODEL;
}

export function usePersistentModel() {
    const [selectedModel, setSelectedModel] = useState<string>(getInitialModel);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
    }, [selectedModel]);

    const onModelChange = (model: string) => {
        if (!MODEL_IDS.has(model)) {
            return;
        }

        setSelectedModel(model);
    };

    return {
        selectedModel,
        setSelectedModel: onModelChange
    };
}
