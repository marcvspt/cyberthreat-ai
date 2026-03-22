const API_VT_IP = "https://www.virustotal.com/api/v3/ip_addresses"
const API_ABUSEIPDB = "https://api.abuseipdb.com/api/v2/check?ipAddress"

const VIRUSTOTAL_API_KEY = import.meta.env.VIRUSTOTAL_API_KEY
const ABUSEIPDB_API_KEY = import.meta.env.ABUSEIPDB_API_KEY

export async function analyzeIP(ip: string) {
    const ioc = ip.trim().toLowerCase()


    const [virustotalResponse, abuseipdbResponse] = await Promise.all([
        fetch(`${API_VT_IP}/${ioc}`, {
            headers: { "x-apikey": VIRUSTOTAL_API_KEY }
        }),
        fetch(`${API_ABUSEIPDB}=${ioc}&verbose`, {
            headers: {
                "Key": ABUSEIPDB_API_KEY,
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