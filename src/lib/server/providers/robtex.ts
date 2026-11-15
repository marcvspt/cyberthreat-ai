import { ProviderError } from '@/lib/server/errors.ts';
import { fetchProviderJson } from '@/lib/server/providers/fetcher.ts'

const ROBTEX_API_REPUTATION = 'https://freeapi.robtex.com/api/v1/domain_reputation'
const ROBTEX_API_RANKING = 'https://freeapi.robtex.com/api/v1/domain_ranking'

export async function fetchRobtexDomain(domain: string) {
    const results = await Promise.allSettled([
        fetchProviderJson('Robtex', `${ROBTEX_API_REPUTATION}?hostname=${domain}`),
        fetchProviderJson('Robtex', `${ROBTEX_API_RANKING}?hostname=${domain}`)
    ])
    const [repResult, rankResult] = results

    const reputation = repResult.status === 'fulfilled' ? repResult.value : null
    const ranking = rankResult.status === 'fulfilled' ? rankResult.value : null

    if (reputation === null && ranking === null) {
        for (const result of results) {
            if (result.status === 'rejected' &&
                (!(result.reason instanceof ProviderError) || result.reason.errorType !== 'not_found')) {
                throw result.reason
            }
        }
        throw new ProviderError('ioc', 'Robtex', 'not_found')
    }

    return { reputation, ranking }
}
