import { fetchWithProviderGuard } from '@/scripts/iocs/fetcher.ts'

const ABUSEIPDB_API = 'https://api.abuseipdb.com/api/v2/check?ipAddress'

export async function fetchAbuseIPDBIP(ip: string, apiKey?: string) {
    const res = await fetchWithProviderGuard('AbuseIPDB', `${ABUSEIPDB_API}=${ip}&verbose`, {
        headers: { Key: apiKey, Accept: 'application/json' }
    })
    return res.json()
}
