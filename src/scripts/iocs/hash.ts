import { ProviderError } from '@/scripts/errors.ts'

const VIRUSTOTAL_API_FILEHASH = "https://www.virustotal.com/api/v3/files"
const POLYSWARM_API = "https://api.polyswarm.network/v3/search/hash"

const VIRUSTOTAL_API_KEY = import.meta.env.VIRUSTOTAL_API_KEY
const POLYSWARM_API_KEY = import.meta.env.POLYSWARM_API_KEY

const VALID_HASH_TYPES = {
    MD5: "md5",
    SHA1: "sha1",
    SHA256: "sha256"
}

function checkHashType(hash: string) {
    if (/^[a-f0-9]{32}$/i.test(hash)) {
        return VALID_HASH_TYPES.MD5
    }
    if (/^[a-f0-9]{40}$/i.test(hash)) {
        return VALID_HASH_TYPES.SHA1
    }
    if (/^[a-f0-9]{64}$/i.test(hash)) {
        return VALID_HASH_TYPES.SHA256
    }
    return "N/A"
}

async function fetchWithProviderGuard(provider: string, input: RequestInfo | URL, init?: RequestInit) {
    let response: Response

    try {
        response = await fetch(input, init)
    } catch {
        throw new ProviderError('ioc', provider)
    }

    if (!response.ok) {
        throw new ProviderError('ioc', provider)
    }

    return response
}


export async function analyzeHash(hash: string, vtKey?: string, polyKey?: string) {
    const hashType = checkHashType(hash)
    const ioc = hash.trim().toLowerCase()
    const resolvedVTKey = vtKey || VIRUSTOTAL_API_KEY
    const resolvedPolyKey = polyKey || POLYSWARM_API_KEY

    const [virustotalResponse, polyswarmResponse] = await Promise.all([
        fetchWithProviderGuard('VirusTotal', `${VIRUSTOTAL_API_FILEHASH}/${ioc}`, {
            headers: { "x-apikey": resolvedVTKey }
        }),
        fetchWithProviderGuard('PolySwarm', `${POLYSWARM_API}/${hashType}?hash=${ioc}`, {
            headers: { "Authorization": resolvedPolyKey }
        })
    ])

    const virustotalData = await virustotalResponse.json()
    let polyswarmData = null

    if (polyswarmResponse.status !== 204) {
        polyswarmData = await polyswarmResponse.json()
    }

    return {
        ioc: ioc,
        type: "hash",
        source1: {
            name: "VirusTotal",
            apiResponse: virustotalData
        },
        source2: {
            name: "PolySwarm",
            apiResponse: polyswarmData
        }
    }
}