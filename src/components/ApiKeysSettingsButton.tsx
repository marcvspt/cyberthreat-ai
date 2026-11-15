import { TEXTS_GENERAL } from '@/lib/texts.ts';
type ApiKeysSettingsButtonProps = {
    hasCustomKeys: boolean;
    onOpenSettings: (trigger: HTMLButtonElement) => void;
};

export default function ApiKeysSettingsButton({ hasCustomKeys, onOpenSettings }: ApiKeysSettingsButtonProps) {
    return (
        <button
            type="button"
            onClick={(event) => onOpenSettings(event.currentTarget)}
            aria-haspopup="dialog"
            title={TEXTS_GENERAL.settings.configureApiKeys}
            className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 text-xs text-secondary transition hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
            {hasCustomKeys && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>{TEXTS_GENERAL.settings.apiKeysButton}</span>
        </button>
    );
}
