import { fetchWithProviderGuard } from '@/scripts/iocs/fetcher.ts'

const VIRUSTOTAL_API_IP = 'https://www.virustotal.com/api/v3/ip_addresses'
const VIRUSTOTAL_API_DOMAIN = 'https://www.virustotal.com/api/v3/domains'
const VIRUSTOTAL_API_FILEHASH = 'https://www.virustotal.com/api/v3/files'

export async function fetchVirusTotalIP(ip: string, apiKey?: string) {
    const res = await fetchWithProviderGuard('VirusTotal', `${VIRUSTOTAL_API_IP}/${ip}`, {
        headers: { 'x-apikey': apiKey }
    })
    return res.json()
}

export async function fetchVirusTotalDomain(domain: string, apiKey?: string) {
    const res = await fetchWithProviderGuard('VirusTotal', `${VIRUSTOTAL_API_DOMAIN}/${domain}`, {
        headers: { 'x-apikey': apiKey }
    })
    return res.json()
}

export async function fetchVirusTotalHash(hash: string, apiKey?: string) {
    const res = await fetchWithProviderGuard('VirusTotal', `${VIRUSTOTAL_API_FILEHASH}/${hash}`, {
        headers: { 'x-apikey': apiKey }
    })
    return res.json()
}
