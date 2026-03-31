import { fetchAllSources } from '@/scripts/iocs/fetcher.ts'
import { fetchRobtexDomain } from '@/scripts/sources/robtex'
import { fetchVirusTotalDomain } from '@/scripts/sources/virustotal'

const VIRUSTOTAL_API_KEY = import.meta.env.VIRUSTOTAL_API_KEY

export async function analyzeDomain(domain: string, vtKey?: string) {
    const ioc = domain.trim().toLowerCase()
    const resolvedVTKey = vtKey || VIRUSTOTAL_API_KEY

    const sources = [
        {
            name: 'VirusTotal',
            fetch: () => fetchVirusTotalDomain(ioc, resolvedVTKey)
        },
        {
            name: 'Robtex',
            fetch: () => fetchRobtexDomain(ioc)
        }
    ]

    const { results, warnings } = await fetchAllSources(sources)

    return {
        ioc,
        type: 'domain',
        sources: results,
        ...(warnings.length ? { warnings } : {})
    }
}