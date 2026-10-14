import { TEXTS_GENERAL } from '@/lib/texts.ts';
const IOC_TYPE_LABELS = TEXTS_GENERAL.search.iocTypes

export default function IocTypeChips() {
    return (
        <ul className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-xs" aria-label={TEXTS_GENERAL.search.supportedIocTypes}>
            {IOC_TYPE_LABELS.map((label) => (
                <li key={label}>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5">
                        {label}
                    </span>
                </li>
            ))}
        </ul>
    )
}
