import { TEXTS_GENERAL } from '@/lib/texts.ts';
import { VIRUSTOTAL_API_KEY, POLYSWARM_API_KEY } from 'astro:env/server';
import { fetchAllSources } from '@/lib/server/providers/fetcher.ts'
import { fetchPolySwarmHash } from '@/lib/server/providers/polyswarm.ts'
import { detectHashType } from '@/lib/validation/ioc.ts'
import { fetchVirusTotalHash } from '@/lib/server/providers/virustotal.ts'

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
                    throw new Error(TEXTS_GENERAL.errors.unsupportedPolySwarmHash)
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
