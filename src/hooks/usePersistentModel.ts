import { useEffect, useState } from 'react';
import { DEFAULT_MODEL, isAllowedModel } from '@/scripts/catalog/models.ts';

const MODEL_STORAGE_KEY = 'ctai:selected-model';

export function usePersistentModel() {
    const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);

    useEffect(() => {
        try {
            const savedModel = window.localStorage.getItem(MODEL_STORAGE_KEY);
            if (savedModel && isAllowedModel(savedModel)) {
                setSelectedModel(savedModel);
            }
        } catch {
            // La selección sigue disponible aunque localStorage esté bloqueado.
        }
    }, []);

    const onModelChange = (model: string) => {
        if (!isAllowedModel(model)) {
            return;
        }

        setSelectedModel(model);
        try {
            window.localStorage.setItem(MODEL_STORAGE_KEY, model);
        } catch {
            // Conserva la selección en memoria si no se puede persistir.
        }
    };

    return {
        selectedModel,
        setSelectedModel: onModelChange
    };
}
