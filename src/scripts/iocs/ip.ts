const VIRUSTOTAL_API_IP = "https://www.virustotal.com/api/v3/ip_addresses"
const ABUSEIPDB_API = "https://api.abuseipdb.com/api/v2/check?ipAddress"

const VIRUSTOTAL_API_KEY = import.meta.env.VIRUSTOTAL_API_KEY
const ABUSEIPDB_API_KEY = import.meta.env.ABUSEIPDB_API_KEY

export async function analyzeIP(ip: string, vtKey?: string, abuseKey?: string) {
    const ioc = ip.trim().toLowerCase()
    const resolvedVTKey = vtKey || VIRUSTOTAL_API_KEY
    const resolvedAbuseKey = abuseKey || ABUSEIPDB_API_KEY

    const [virustotalResponse, abuseipdbResponse] = await Promise.all([
        fetch(`${VIRUSTOTAL_API_IP}/${ioc}`, {
            headers: { "x-apikey": resolvedVTKey }
        }),
        fetch(`${ABUSEIPDB_API}=${ioc}&verbose`, {
            headers: {
                "Key": resolvedAbuseKey,
                "Accept": "application/json"
            }
        })
    ])

    const [virustotalData, abuseipdbData] = await Promise.all([
        virustotalResponse.json(),
        abuseipdbResponse.json()
    ])

    return {
        ioc: ioc,
        type: "ip",
        source1: {
            name: "VirusTotal",
            apiResponse: virustotalData
        },
        source2: {
            name: "AbuseIPDB",
            apiResponse: abuseipdbData
        }
    }
}