import { TEXTS_GENERAL } from '@/lib/texts.ts';
import { useEffect, useRef, useState } from 'react';
import type { ApiKeys } from '@/lib/types/api-keys.ts';

type ApiKeysModalProps = {
    keys: ApiKeys;
    onSave: (keys: ApiKeys) => void;
    onClose: () => void;
};

const KEY_CONFIG = [
    {
        id: 'openrouter' as const,
        label: TEXTS_GENERAL.brands.openrouter,
        placeholder: TEXTS_GENERAL.settings.openRouterKeyPlaceholder,
        hint: TEXTS_GENERAL.settings.openRouterKeyHint,
    },
    {
        id: 'virustotal' as const,
        label: TEXTS_GENERAL.brands.virustotal,
        placeholder: TEXTS_GENERAL.settings.virusTotalKeyPlaceholder,
        hint: TEXTS_GENERAL.settings.virusTotalKeyHint,
    },
    {
        id: 'abuseipdb' as const,
        label: TEXTS_GENERAL.brands.abuseipdb,
        placeholder: TEXTS_GENERAL.settings.abuseIpDbKeyPlaceholder,
        hint: TEXTS_GENERAL.settings.abuseIpDbKeyHint,
    },
    {
        id: 'polyswarm' as const,
        label: TEXTS_GENERAL.brands.polyswarm,
        placeholder: TEXTS_GENERAL.settings.polySwarmKeyPlaceholder,
        hint: TEXTS_GENERAL.settings.polySwarmKeyHint,
    },
] as const;

export default function ApiKeysModal({ keys, onSave, onClose }: ApiKeysModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [draft, setDraft] = useState<ApiKeys>(keys);
    const [visible, setVisible] = useState<Partial<Record<keyof ApiKeys, boolean>>>({});

    useEffect(() => {
        const dialog = dialogRef.current;
        dialog?.showModal();
        return () => dialog?.close();
    }, []);

    const close = () => {
        dialogRef.current?.close();
        onClose();
    };

    const handleChange = (id: keyof ApiKeys, value: string) => {
        setDraft((prev) => ({ ...prev, [id]: value }));
    };

    const toggleVisible = (id: keyof ApiKeys) => {
        setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSave = () => {
        onSave(draft);
        close();
    };

    const handleClear = () => {
        const empty: ApiKeys = { openrouter: '', virustotal: '', abuseipdb: '', polyswarm: '' };
        setDraft(empty);
        onSave(empty);
    };

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="api-keys-title"
            aria-describedby="api-keys-description"
            onCancel={(event) => {
                event.preventDefault();
                close();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) close();
            }}
            className="fixed inset-0 m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-3xl border border-primary/30 bg-slate-950 text-white shadow-2xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm"
        >
            <div>
                <header className="flex items-center justify-between border-b border-primary/20 bg-primary/10 px-6 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-secondary/90">{TEXTS_GENERAL.settings.title}</p>
                        <h2 id="api-keys-title" className="text-lg font-semibold text-white">{TEXTS_GENERAL.settings.apiKeysTitle}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                        aria-label={TEXTS_GENERAL.common.close}
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </header>

                <div className="space-y-4 p-6">
                    <p id="api-keys-description" className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm leading-5 text-slate-300">
                        {TEXTS_GENERAL.settings.keysStorageNotice}
                    </p>

                    {KEY_CONFIG.map(({ id, label, placeholder, hint }) => (
                        <div key={id} className="space-y-1.5">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-2 px-1">
                                <label
                                    htmlFor={`key-${id}`}
                                    className="text-xs font-medium uppercase tracking-[0.25em] text-secondary/85"
                                >
                                    {label}
                                </label>
                                <span id={`key-${id}-hint`} className="text-xs text-slate-300">{hint}</span>
                            </div>
                            <div className="relative">
                                <input
                                    id={`key-${id}`}
                                    type={visible[id] ? 'text' : 'password'}
                                    value={draft[id]}
                                    onChange={(event) => handleChange(id, event.currentTarget.value)}
                                    aria-describedby={`key-${id}-hint`}
                                    placeholder={placeholder}
                                    className="h-11 w-full rounded-2xl border border-primary/30 bg-white/8 px-4 pr-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-secondary focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(196,187,240,0.12)]"
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisible(id)}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-secondary"
                                    aria-label={TEXTS_GENERAL.settings.keyVisibility(label, Boolean(visible[id]))}
                                >
                                    {visible[id] ? (
                                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/20 bg-primary/5 px-6 py-4">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-xs text-slate-400 underline-offset-2 transition hover:text-slate-200 hover:underline"
                    >
                        {TEXTS_GENERAL.settings.clearKeys}
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={close}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
                        >
                            {TEXTS_GENERAL.common.cancel}
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(195,166,253,0.3)] transition hover:bg-secondary"
                        >
                            {TEXTS_GENERAL.common.save}
                        </button>
                    </div>
                </footer>
            </div>
        </dialog>
    );
}
