import { useEffect, useState } from 'preact/hooks';
import type { ApiKeys } from '@/hooks/useApiKeys.ts';

type ApiKeysModalProps = {
    isOpen: boolean;
    keys: ApiKeys;
    onSave: (keys: ApiKeys) => void;
    onClose: () => void;
};

const KEY_CONFIG = [
    {
        id: 'openrouter' as const,
        label: 'OpenRouter',
        placeholder: 'sk-or-...',
        hint: 'Requerida para el análisis de IA',
    },
    {
        id: 'virustotal' as const,
        label: 'VirusTotal',
        placeholder: 'Tu API key de VirusTotal',
        hint: 'Usada para IP, dominio y hash',
    },
    {
        id: 'abuseipdb' as const,
        label: 'AbuseIPDB',
        placeholder: 'Tu API key de AbuseIPDB',
        hint: 'Usada para análisis de IP',
    },
    {
        id: 'polyswarm' as const,
        label: 'PolySwarm',
        placeholder: 'Tu API key de PolySwarm',
        hint: 'Usada para análisis de hash',
    },
] as const;

export default function ApiKeysModal({ isOpen, keys, onSave, onClose }: ApiKeysModalProps) {
    const [draft, setDraft] = useState<ApiKeys>(keys);
    const [visible, setVisible] = useState<Partial<Record<keyof ApiKeys, boolean>>>({});

    // Sync draft when modal opens
    useEffect(() => {
        if (isOpen) {
            setDraft(keys);
            setVisible({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (id: keyof ApiKeys, value: string) => {
        setDraft((prev) => ({ ...prev, [id]: value }));
    };

    const toggleVisible = (id: keyof ApiKeys) => {
        setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSave = () => {
        onSave(draft);
        onClose();
    };

    const handleClear = () => {
        const empty: ApiKeys = { openrouter: '', virustotal: '', abuseipdb: '', polyswarm: '' };
        onSave(empty);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Card */}
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-primary/30 bg-[linear-gradient(145deg,rgba(195,166,253,0.18),rgba(196,187,240,0.08))] shadow-[0_24px_80px_rgba(195,166,253,0.2)] backdrop-blur">
                <header className="flex items-center justify-between border-b border-primary/20 bg-primary/10 px-6 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-secondary/90">Configuración</p>
                        <h2 className="text-lg font-semibold text-white">API Keys</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                        title="Cerrar"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                            <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </header>

                <div className="space-y-4 p-6">
                    <p className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-xs leading-5 text-slate-300">
                        Las claves se guardan únicamente en tu navegador. Si las dejas vacías, el servidor usará las configuradas por defecto.
                    </p>

                    {KEY_CONFIG.map(({ id, label, placeholder, hint }) => (
                        <div key={id} className="space-y-1.5">
                            <div className="flex items-baseline justify-between px-1">
                                <label
                                    htmlFor={`key-${id}`}
                                    className="text-xs font-medium uppercase tracking-[0.25em] text-secondary/85"
                                >
                                    {label}
                                </label>
                                <span className="text-[10px] text-slate-500">{hint}</span>
                            </div>
                            <div className="relative">
                                <input
                                    id={`key-${id}`}
                                    type={visible[id] ? 'text' : 'password'}
                                    value={draft[id]}
                                    onInput={(e) =>
                                        handleChange(id, (e.target as HTMLInputElement).value)
                                    }
                                    placeholder={placeholder}
                                    className="h-11 w-full rounded-2xl border border-primary/30 bg-white/8 px-4 pr-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-secondary focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(196,187,240,0.12)]"
                                    autoComplete="off"
                                    spellcheck={false}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisible(id)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
                                    title={visible[id] ? 'Ocultar' : 'Mostrar'}
                                >
                                    {visible[id] ? (
                                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke-linecap="round" stroke-linejoin="round" />
                                            <line x1="1" y1="1" x2="23" y2="23" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linecap="round" stroke-linejoin="round" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="flex items-center justify-between border-t border-primary/20 bg-primary/5 px-6 py-4">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-xs text-slate-400 underline-offset-2 transition hover:text-slate-200 hover:underline"
                    >
                        Limpiar todas
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(195,166,253,0.3)] transition hover:bg-secondary"
                        >
                            Guardar
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
