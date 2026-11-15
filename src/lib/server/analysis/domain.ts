import { VIRUSTOTAL_API_KEY } from 'astro:env/server';
import { fetchAllSources } from '@/lib/server/providers/fetcher.ts';
import { fetchRobtexDomain } from '@/lib/server/providers/robtex.ts'
import { fetchVirusTotalDomain } from '@/lib/server/providers/virustotal.ts'

export async function analyzeDomain(domain: string, signal: AbortSignal, vtKey?: string) {
    const ioc = domain.trim().toLowerCase()
    const resolvedVTKey = vtKey || VIRUSTOTAL_API_KEY

    const sources = [
        {
            name: 'VirusTotal',
            fetch: () => fetchVirusTotalDomain(ioc, resolvedVTKey, signal)
        },
        {
            name: 'Robtex',
            fetch: () => fetchRobtexDomain(ioc, signal)
        }
    ]

    const { results, warnings, error } = await fetchAllSources(sources, signal)

    return {
        ioc,
        type: 'domain',
        sources: results,
        error,
        ...(warnings.length ? { warnings } : {})
    }
}
