import { VIRUSTOTAL_API_KEY, POLYSWARM_API_KEY } from 'astro:env/server';
import { fetchAllSources } from '@/scripts/iocs/fetcher.ts'
import { fetchPolySwarmHash } from '@/scripts/sources/polyswarm'
import { detectHashType } from '@/scripts/core/iocValidators.ts'
import { fetchVirusTotalHash } from '@/scripts/sources/virustotal'

export async function analyzeHash(hash: string, vtKey?: string, polyKey?: string) {
    const ioc = hash.trim().toLowerCase()
    const hashType = detectHashType(ioc)
    const displayType = hashType ? `hash/${hashType}` : 'hash'
    const resolvedVTKey = vtKey || VIRUSTOTAL_API_KEY
    const resolvedPolyKey = polyKey || POLYSWARM_API_KEY

    const sources = [
        {
            name: 'VirusTotal',
            fetch: () => fetchVirusTotalHash(ioc, resolvedVTKey)
        },
        {
            name: 'PolySwarm',
            fetch: () => {
                if (!hashType) {
                    throw new Error('Unsupported hash type for PolySwarm')
                }
                return fetchPolySwarmHash(ioc, hashType, resolvedPolyKey)
            }
        }
    ]

    const { results, warnings } = await fetchAllSources(sources)

    return {
        ioc,
        type: displayType,
        sources: results,
        ...(warnings.length ? { warnings } : {})
    }
}