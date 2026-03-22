const API_VT_FILEHASH = "https://www.virustotal.com/api/v3/files"
const API_POLYSWARM = "https://api.polyswarm.network/v3/search/hash"

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


export async function analyzeHash(hash: string) {
    const hashType = checkHashType(hash)
    const ioc = hash.trim().toLowerCase()

    const [virustotalResponse, polyswarmResponse] = await Promise.all([
        fetch(`${API_VT_FILEHASH}/${ioc}`, {
            headers: { "x-apikey": VIRUSTOTAL_API_KEY }
        }),
        fetch(`${API_POLYSWARM}/${hashType}?hash=${ioc}`, {
            headers: { "Authorization": POLYSWARM_API_KEY }
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