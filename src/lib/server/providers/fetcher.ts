import { TEXTS_GENERAL } from '@/lib/texts.ts';
import { ProviderError } from '@/lib/server/errors.ts'
import type { CtiSourceRequest, ErrorType, SourceEvidence, SourceMetric, SourceWarning } from '@/lib/types/analysis.ts';

const CTI_TIMEOUT_MS = 10_000

export async function fetchProviderJson(
    provider: string,
    input: RequestInfo | URL,
    init: RequestInit = {},
    emptyStatusCodes: number[] = []
): Promise<unknown> {
    const timeout = AbortSignal.timeout(CTI_TIMEOUT_MS)
    const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout
    let response: Response

    try {
        response = await fetch(input, { ...init, signal })
    } catch {
        throw new ProviderError('ioc', provider, 'api_unavailable')
    }

    const isEmpty = response.status === 404 || emptyStatusCodes.includes(response.status)
    if (!response.ok || isEmpty) {
        await response.body?.cancel().catch(() => {})
        if (isEmpty) {
            throw new ProviderError('ioc', provider, 'not_found')
        }
        if (response.status === 401 || response.status === 403) {
            throw new ProviderError('ioc', provider, 'invalid_api_key')
        }
        throw new ProviderError('ioc', provider, 'api_unavailable')
    }

    try {
        return await response.json()
    } catch {
        throw new ProviderError('ioc', provider, 'api_unavailable')
    }
}

export function collectMetrics(values: Record<string, number | boolean | null | undefined>): SourceMetric[] {
    const metrics: SourceMetric[] = []
    for (const [label, value] of Object.entries(values)) {
        if (value != null) metrics.push({ label, value })
    }
    return metrics
}

function warningMessageFor(name: string, reason: ErrorType): string {
    if (reason === 'not_found') return TEXTS_GENERAL.errors.sourceNotFound(name)
    if (reason === 'invalid_api_key') return TEXTS_GENERAL.errors.sourceInvalidKey(name)
    if (reason === 'api_unavailable') return TEXTS_GENERAL.errors.sourceUnavailable(name)
    return TEXTS_GENERAL.errors.sourceUnknownError(name)
}

export async function fetchAllSources(sources: CtiSourceRequest[], signal: AbortSignal): Promise<{
    results: SourceEvidence[]
    warnings: SourceWarning[]
    error?: ProviderError
}> {
    signal.throwIfAborted()
    const settled = await Promise.allSettled(sources.map(async (source) => {
        const metrics = await source.fetch()
        if (!metrics.length) throw new ProviderError('ioc', source.name, 'not_found')
        return metrics
    }))
    signal.throwIfAborted()

    const warnings: SourceWarning[] = []
    const results: SourceEvidence[] = []
    const errors: ProviderError[] = []

    for (let i = 0; i < settled.length; i++) {
        const { name } = sources[i]
        const r = settled[i]

        if (r.status === 'fulfilled') {
            results.push({ name, metrics: r.value })
        } else {
            const error = r.reason instanceof ProviderError ? r.reason : new ProviderError('ioc', name);
            warnings.push({ source: name, message: warningMessageFor(name, error.errorType), reason: error.errorType })
            errors.push(error)
        }
    }

    const error = results.length ? undefined : errors.find(({ errorType }) => errorType !== 'not_found');
    return { results, warnings, error }
}
