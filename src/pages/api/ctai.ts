import type { APIRoute } from 'astro';
import { OPENROUTER_API_KEY, RATE_LIMIT_POINTS, RATE_LIMIT_DURATION } from 'astro:env/server';
import { toClientError } from '@/scripts/core/errors.ts';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import {

    jsonHeaders,
    streamHeaders,
    jsonResponse,
    getClientIp,
    resolveIocType,
    resolveModel,
    resolveRequestApiKeys,
    analyzeIocByType,
    allSourcesEmpty,
    createNoDataStream,
    createOpenRouterStream
} from '@/scripts/core/ctai.ts'

const rateLimiter = new RateLimiterMemory({
    points: Number(RATE_LIMIT_POINTS),
    duration: Number(RATE_LIMIT_DURATION)
})

export const GET = (async ({ request }) => {
    const { url } = request
    const urlObject = new URL(url)
    const clientIp = getClientIp(request)

    try {
        await rateLimiter.consume(`ctai:${clientIp}`, 1)
    } catch (rejected: unknown) {
        const msBeforeNext = rejected && typeof rejected === 'object' && 'msBeforeNext' in rejected
            ? Number((rejected as Record<string, unknown>).msBeforeNext)
            : 1000
        const retryAfterSeconds = Math.max(1, Math.ceil(msBeforeNext / 1000))

        return new Response(JSON.stringify({
            error: "Too many requests",
            retryAfterSeconds
        }), {
            status: 429,
            headers: {
                ...jsonHeaders,
                "Retry-After": String(retryAfterSeconds),
                "X-RateLimit-Limit": String(RATE_LIMIT_POINTS),
                "X-RateLimit-Window": String(RATE_LIMIT_DURATION)
            }
        })
    }

    const ioc = urlObject.searchParams.get("ioc")

    if (!ioc) {
        return jsonResponse({ error: "Falta el parámetro de IoC" }, 400)
    }

    const iocType = resolveIocType(ioc)

    if (!iocType) {
        return jsonResponse({ error: "Tipo de IoC desconocido" }, 400)
    }

    const rawModel = urlObject.searchParams.get("model") ?? ""
    const resolvedModel = resolveModel(rawModel)
    const requestKeys = resolveRequestApiKeys(request, OPENROUTER_API_KEY || '')

    try {
        const toolResult = await analyzeIocByType(iocType, ioc, requestKeys)

        if (allSourcesEmpty(toolResult)) {
            const displayType = typeof toolResult?.type === 'string' ? toolResult.type : iocType
            const stream = createNoDataStream(ioc, displayType, resolvedModel, toolResult.warnings ?? [])
            return new Response(stream, { status: 200, headers: streamHeaders })
        }

        const stream = await createOpenRouterStream({
            ioc,
            iocType,
            toolResult,
            apiKey: requestKeys.openRouterKey,
            model: resolvedModel
        })

        return new Response(stream, {
            status: 200,
            headers: streamHeaders
        })
    } catch (error: unknown) {
        return jsonResponse(toClientError(error), 500)
    }
}) satisfies APIRoute;