import { fetchProviderJson } from '@/lib/server/providers/fetcher.ts';
import type { HashAlgorithm } from '@/lib/types/analysis.ts';

const POLYSWARM_API = 'https://api.polyswarm.network/v3/search/hash'

export type PolySwarmHashType = HashAlgorithm

export async function fetchPolySwarmHash(hash: string, hashType: PolySwarmHashType, apiKey?: string) {
    // PolySwarm returns 204 when the hash does not exist in their dataset.
    const headers = apiKey ? { Authorization: apiKey } : undefined
    return fetchProviderJson(
        'PolySwarm',
        `${POLYSWARM_API}/${hashType}?hash=${hash}`,
        { headers },
        [204]
    )
}
