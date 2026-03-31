type AlertBoxVariant = 'warning' | 'error'

type AlertLine = {
    title: string
    detail?: string
}

type AlertBoxProps = {
    variant: AlertBoxVariant
    lines: AlertLine[]
    role?: 'status' | 'alert'
    ariaLive?: 'polite' | 'assertive' | 'off'
}

const STYLES: Record<AlertBoxVariant, { wrapper: string; title: string; detail: string }> = {
    warning: {
        wrapper: 'rounded-xl border border-warning/35 bg-warning-bg/35 px-4 py-3 text-warning-text',
        title: 'text-sm font-semibold text-warning-title',
        detail: 'mt-0.5 text-sm italic text-warning-text/90'
    },
    error: {
        wrapper: 'rounded-xl border border-danger/35 bg-danger-bg/35 px-4 py-3 text-danger-text',
        title: 'text-sm font-semibold text-danger-title',
        detail: 'mt-0.5 text-sm text-danger-text/90'
    }
}

export default function AlertBox({ variant, lines, role, ariaLive }: AlertBoxProps) {
    const styles = STYLES[variant]

    return (
        <div className={styles.wrapper} role={role} aria-live={ariaLive} aria-atomic="true">
            {lines.map((line, i) => (
                <div key={i} className={i < lines.length - 1 ? 'mb-2' : ''}>
                    <p className={styles.title}>{line.title}</p>
                    {line.detail && <p className={styles.detail}>{line.detail}</p>}
                </div>
            ))}
        </div>
    )
}
