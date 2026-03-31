import { ProviderError } from '@/scripts/core/errors.ts'
import type { CtiSourceRequest, CtiSourceResult, ErrorType } from '@/scripts/types.ts'

export type SourceResult = CtiSourceResult
export type SourceRequest = CtiSourceRequest

export async function fetchWithProviderGuard(
    provider: string,
    input: RequestInfo | URL,
    init?: RequestInit,
    emptyStatusCodes: number[] = []
) {
    let response: Response

    try {
        response = await fetch(input, init)
    } catch {
        throw new ProviderError('ioc', provider, 'api_unavailable')
    }

    if (!response.ok) {
        if (response.status === 404) {
            throw new ProviderError('ioc', provider, 'not_found')
        }
        if (response.status === 401 || response.status === 403) {
            throw new ProviderError('ioc', provider, 'invalid_api_key')
        }
        throw new ProviderError('ioc', provider, 'api_unavailable')
    }

    if (emptyStatusCodes.includes(response.status)) {
        throw new ProviderError('ioc', provider, 'not_found')
    }

    return response
}

function warningMessageFor(name: string, reason: unknown): string {
    if (reason instanceof ProviderError) {
        if (reason.errorType === 'not_found') return `No se encontraron datos en ${name}`
        if (reason.errorType === 'invalid_api_key') return `API Key incorrecta para ${name}`
        if (reason.errorType === 'api_unavailable') return `${name} no está disponible en este momento`
    }
    return `Error desconocido en ${name}`
}

export async function fetchAllSources(sources: SourceRequest[]): Promise<{
    results: SourceResult[]
    warnings: Array<{ source: string; message: string; reason?: ErrorType }>
}> {
    const settled = await Promise.allSettled(sources.map((s) => s.fetch()))

    const warnings: Array<{ source: string; message: string; reason?: ErrorType }> = []
    const results: SourceResult[] = []
    const errors: unknown[] = []

    for (let i = 0; i < settled.length; i++) {
        const { name } = sources[i]
        const r = settled[i]

        if (r.status === 'fulfilled') {
            results.push({ name, apiResponse: r.value })
        } else {
            const errorType: ErrorType = r.reason instanceof ProviderError ? r.reason.errorType : 'unknown'
            warnings.push({ source: name, message: warningMessageFor(name, r.reason), reason: errorType })
            results.push({ name, apiResponse: null })
            errors.push(r.reason)
        }
    }

    // Si todas las fuentes fallaron por razón crítica (no solo not_found), propagar el primer error
    if (errors.length === sources.length) {
        const firstCritical = errors.find(
            (e) => e instanceof ProviderError && e.errorType !== 'not_found'
        )
        if (firstCritical) {
            throw firstCritical
        }
    }

    return { results, warnings }
}
