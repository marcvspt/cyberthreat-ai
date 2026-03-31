import { fetchWithProviderGuard, fetchAllSources } from '@/scripts/iocs/fetcher.ts'
import { fetchAbuseIPDBIP } from '@/scripts/sources/abuseipdb'
import { fetchVirusTotalIP } from '@/scripts/sources/virustotal'

const VIRUSTOTAL_API_KEY = import.meta.env.VIRUSTOTAL_API_KEY
const ABUSEIPDB_API_KEY = import.meta.env.ABUSEIPDB_API_KEY

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