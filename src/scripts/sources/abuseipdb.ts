import { fetchWithProviderGuard } from '@/scripts/iocs/fetcher.ts'

const ABUSEIPDB_API = 'https://api.abuseipdb.com/api/v2/check?ipAddress'

export async function fetchAbuseIPDBIP(ip: string, apiKey?: string) {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (apiKey) headers['Key'] = apiKey
    const res = await fetchWithProviderGuard('AbuseIPDB', `${ABUSEIPDB_API}=${ip}&verbose`, { headers })
    return res.json()
}
