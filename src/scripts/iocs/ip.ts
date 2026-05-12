import { VIRUSTOTAL_API_KEY, ABUSEIPDB_API_KEY } from 'astro:env/server';
import { fetchAllSources } from '@/scripts/iocs/fetcher.ts'
import { fetchAbuseIPDBIP } from '@/scripts/sources/abuseipdb'
import { fetchVirusTotalIP } from '@/scripts/sources/virustotal'

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