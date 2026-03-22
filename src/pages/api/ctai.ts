import type { APIRoute } from 'astro';

import { PATTERNS } from "@/scripts/utils.ts"

import { analyzeIP } from "@/scripts/iocs/ip.ts"
import { analyzeDomain } from "@/scripts/iocs/domain.ts"
import { analyzeHash } from "@/scripts/iocs/hash.ts"

export const GET = (async ({ request }) => {
    const { url } = request
    const urlObject = new URL(url)
    const ioc = urlObject.searchParams.get("ioc")

    if (!ioc) {
        return new Response(
            JSON.stringify({ error: "Missing IoC parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        }
        )
    }

    // Determine IoC type
    let iocType = null
    for (const [type, pattern] of Object.entries(PATTERNS)) {
        if (pattern.test(ioc)) {
            iocType = type
            break
        }
    }

    if (!iocType) {
        return new Response(
            JSON.stringify({ error: "Unknown IoC type" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        }
        )
    }

    try {
        let result
        switch (iocType) {
            case "ip":
                result = await analyzeIP(ioc)
                break
            case "domain":
                result = await analyzeDomain(ioc)
                break
            case "hash":
                result = await analyzeHash(ioc)
                break
            default:
                throw new Error("Invalid analysis type")
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        })
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message || "Analysis failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        }
        )
    }
}) satisfies APIRoute;