const VIRUSTOTAL_API_DOMAIN = "https://www.virustotal.com/api/v3/domains"
const ROBTEX_API_REPUTATION = "https://freeapi.robtex.com/api/v1/domain_reputation"
const ROBTEX_API_RANKING = "https://freeapi.robtex.com/api/v1/domain_ranking"

const VIRUSTOTAL_API_KEY = import.meta.env.VIRUSTOTAL_API_KEY

export async function analyzeDomain(domain: string, vtKey?: string) {
    const ioc = domain.trim().toLowerCase()
    const resolvedVTKey = vtKey || VIRUSTOTAL_API_KEY

    const [virustotalResponse, robtexReputationResponse, robtexRankingResponse] = await Promise.all([
        fetch(`${VIRUSTOTAL_API_DOMAIN}/${ioc}`, {
            headers: { "x-apikey": resolvedVTKey }
        }),
        fetch(`${ROBTEX_API_REPUTATION}?hostname=${ioc}`),
        fetch(`${ROBTEX_API_RANKING}?hostname=${ioc}`),
    ])

    const [virustotalData, robtexReputationData, robtexRankingData] = await Promise.all([
        virustotalResponse.json(),
        robtexReputationResponse.json(),
        robtexRankingResponse.json(),
    ])

    return {
        ioc: ioc,
        type: "domain",
        source1: {
            name: "VirusTotal",
            apiResponse: virustotalData
        },
        source2: {
            name: "Robtex",
            apiResponse: {
                reputation: robtexReputationData,
                ranking: robtexRankingData,
            }
        }
    }
}