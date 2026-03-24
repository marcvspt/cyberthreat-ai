import { useEffect, useState } from 'preact/hooks';
import type { ApiKeys } from '@/scripts/types.ts';

export type { ApiKeys };

const STORAGE_KEY = 'ctai_api_keys';

export const EMPTY_KEYS: ApiKeys = {
    openrouter: '',
    virustotal: '',
    abuseipdb: '',
    polyswarm: '',
};

function readFromStorage(): ApiKeys {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? { ...EMPTY_KEYS, ...JSON.parse(stored) } : { ...EMPTY_KEYS };
    } catch {
        return { ...EMPTY_KEYS };
    }
}

export function useApiKeys() {
    const [keys, setKeys] = useState<ApiKeys>({ ...EMPTY_KEYS });

    // Load from localStorage after mount (SSR-safe)
    useEffect(() => {
        setKeys(readFromStorage());
    }, []);

    const saveKeys = (newKeys: ApiKeys) => {
        setKeys(newKeys);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
        } catch { }
    };

    const clearKeys = () => {
        setKeys({ ...EMPTY_KEYS });
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch { }
    };

    const hasCustomKeys = Object.values(keys).some((v) => v.length > 0);

    return { keys, saveKeys, clearKeys, hasCustomKeys };
}
