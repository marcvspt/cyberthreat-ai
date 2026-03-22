const API_VT_FILEHASH = "https://www.virustotal.com/api/v3/files"
const API_POLYSWARM = "https://api.polyswarm.network/v3/search/hash"

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
    const virustotalKey = import.meta.env.VIRUSTOTAL_API_KEY
    const polyswarmKey = import.meta.env.POLYSWARM_API_KEY
    const hashType = checkHashType(hash)

    const [virustotalResponse, polyswarmResponse] = await Promise.all([
        fetch(`${API_VT_FILEHASH}/${hash}`, {
            headers: { "x-apikey": virustotalKey }
        }),
        fetch(`${API_POLYSWARM}/${hashType}?hash=${hash}`, {
            headers: { "Authorization": polyswarmKey }
        })
    ])

    const virustotalData = await virustotalResponse.json()
    let polyswarmData = null

    if (polyswarmResponse.status !== 204) {
        polyswarmData = await polyswarmResponse.json()
    }

    return {
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