const API_VT_DOMAIN = "https://www.virustotal.com/api/v3/domains"
const API_OTX_DOMAIN = "https://otx.alienvault.com/api/v1/indicators/domain"

const VIRUSTOTAL_API_KEY = import.meta.env.VIRUSTOTAL_API_KEY
const OTX_API_KEY = import.meta.env.OTX_API_KEY

export async function analyzeDomain(domain: string) {
    const ioc = domain.trim().toLowerCase()

    const [virustotalResponse, otxResponse] = await Promise.all([
        fetch(`${API_VT_DOMAIN}/${ioc}`, {
            headers: { "x-apikey": VIRUSTOTAL_API_KEY }
        }),
        fetch(`${API_OTX_DOMAIN}/${ioc}/general`, {
            headers: { "X-OTX-API-KEY": OTX_API_KEY }
        })
    ])

    const [virustotalData, otxData] = await Promise.all([
        virustotalResponse.json(),
        otxResponse.json()
    ])

    return {
        ioc: ioc,
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