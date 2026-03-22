const API_VT_IP = "https://www.virustotal.com/api/v3/ip_addresses"
const API_ABUSEIPDB = "https://api.abuseipdb.com/api/v2/check?ipAddress"

export async function analyzeIP(ip: string) {
    const virustotalKey = import.meta.env.VIRUSTOTAL_API_KEY
    const abuseipdbKey = import.meta.env.ABUSEIPDB_API_KEY

    const [virustotalResponse, abuseipdbResponse] = await Promise.all([
        fetch(`${API_VT_IP}/${ip}`, {
            headers: { "x-apikey": virustotalKey }
        }),
        fetch(`${API_ABUSEIPDB}=${ip}&verbose`, {
            headers: {
                "Key": abuseipdbKey,
                "Accept": "application/json"
            }
        })
    ])

    const [virustotalData, abuseipdbData] = await Promise.all([
        virustotalResponse.json(),
        abuseipdbResponse.json()
    ])

    return {
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