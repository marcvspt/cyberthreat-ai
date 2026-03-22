const API_VT_DOMAIN = "https://www.virustotal.com/api/v3/domains"
const API_OTX_DOMAIN = "https://otx.alienvault.com/api/v1/indicators/domain"

export async function analyzeDomain(domain: string) {
    const virustotalKey = import.meta.env.VIRUSTOTAL_API_KEY
    const otxKey = import.meta.env.OTX_API_KEY

    const [virustotalResponse, otxResponse] = await Promise.all([
        fetch(`${API_VT_DOMAIN}/${domain}`, {
            headers: { "x-apikey": virustotalKey }
        }),
        fetch(`${API_OTX_DOMAIN}/${domain}/general`, {
            headers: { "X-OTX-API-KEY": otxKey }
        })
    ])

    const [virustotalData, otxData] = await Promise.all([
        virustotalResponse.json(),
        otxResponse.json()
    ])

    return {
        type: "domain",
        source1: {
            name: "VirusTotal",
            apiResponse: virustotalData
        },
        source2: {
            name: "AlienVault OTX",
            apiResponse: otxData
        }
    }
}