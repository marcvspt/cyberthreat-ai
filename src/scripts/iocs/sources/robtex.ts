import { ProviderError } from '@/scripts/errors.ts'
import { fetchWithProviderGuard } from '@/scripts/iocs/fetcher.ts'

const ROBTEX_API_REPUTATION = 'https://freeapi.robtex.com/api/v1/domain_reputation'
const ROBTEX_API_RANKING = 'https://freeapi.robtex.com/api/v1/domain_ranking'

export async function fetchRobtexDomain(domain: string) {
    const [repResult, rankResult] = await Promise.allSettled([
        fetchWithProviderGuard('Robtex', `${ROBTEX_API_REPUTATION}?hostname=${domain}`),
        fetchWithProviderGuard('Robtex', `${ROBTEX_API_RANKING}?hostname=${domain}`)
    ])

    const reputation = repResult.status === 'fulfilled' ? await repResult.value.json() : null
    const ranking = rankResult.status === 'fulfilled' ? await rankResult.value.json() : null

    if (reputation === null && ranking === null) {
        throw new ProviderError('ioc', 'Robtex', 'not_found')
    }

    return { reputation, ranking }
}
