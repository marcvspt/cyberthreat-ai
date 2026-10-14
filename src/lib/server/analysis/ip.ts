import { VIRUSTOTAL_API_KEY, ABUSEIPDB_API_KEY } from 'astro:env/server';
import { fetchAllSources } from '@/lib/server/providers/fetcher.ts';
import { fetchAbuseIPDBIP } from '@/lib/server/providers/abuseipdb.ts'
import { fetchVirusTotalIP } from '@/lib/server/providers/virustotal.ts'

export async function analyzeIP(ip: string, vtKey?: string, abuseKey?: string) {
    const ioc = ip.trim().toLowerCase()
    const displayType = ioc.includes(':') ? 'IPv6' : 'IPv4'
    const resolvedVTKey = vtKey || VIRUSTOTAL_API_KEY
    const resolvedAbuseKey = abuseKey || ABUSEIPDB_API_KEY

    const sources = [
        {
            name: 'VirusTotal',
            fetch: () => fetchVirusTotalIP(ioc, resolvedVTKey)
        },
        {
            name: 'AbuseIPDB',
            fetch: () => fetchAbuseIPDBIP(ioc, resolvedAbuseKey)
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
