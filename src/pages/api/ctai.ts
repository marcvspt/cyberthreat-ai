import { TEXTS_GENERAL } from '@/lib/texts.ts';
import type { APIRoute } from 'astro';
import { OPENROUTER_API_KEY, RATE_LIMIT_POINTS, RATE_LIMIT_DURATION } from 'astro:env/server';
import { toClientError } from '@/lib/server/errors.ts';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { jsonHeaders, jsonResponse, getClientIp } from '@/lib/server/http.ts';
import { streamHeaders, createAnalysisMeta, createNoDataStream } from '@/lib/server/sse.ts';
import { resolveIocType, resolveModel, resolveRequestApiKeys } from '@/lib/server/request.ts';
import { analyzeIocByType } from '@/lib/server/analysis.ts';
import { createOpenRouterStream } from '@/lib/server/openrouter.ts';

const rateLimiter = new RateLimiterMemory({
    points: RATE_LIMIT_POINTS,
    duration: RATE_LIMIT_DURATION
})

export const GET = (async (context) => {
    const { request, site } = context;
    const { url } = request
    const urlObject = new URL(url)
    const clientIp = getClientIp(context)

    try {
        await rateLimiter.consume(`ctai:${clientIp}`, 1)
    } catch (rejected: unknown) {
        const msBeforeNext = rejected && typeof rejected === 'object' && 'msBeforeNext' in rejected
            ? Number((rejected as Record<string, unknown>).msBeforeNext)
            : 1000
        const retryAfterSeconds = Math.max(1, Math.ceil(msBeforeNext / 1000))

        return new Response(JSON.stringify({
            error: TEXTS_GENERAL.errors.rateLimitError,
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
        return jsonResponse({ error: TEXTS_GENERAL.errors.missingIoc }, 400)
    }

    const iocType = resolveIocType(ioc)

    if (!iocType) {
        return jsonResponse({ error: TEXTS_GENERAL.errors.invalidIoc }, 400)
    }

    const rawModel = urlObject.searchParams.get("model") ?? ""
    const resolvedModel = resolveModel(rawModel)
    const requestKeys = resolveRequestApiKeys(request, OPENROUTER_API_KEY || '')

    if (!site) {
        return jsonResponse({ error: TEXTS_GENERAL.errors.siteConfiguration }, 500)
    }

    try {
        const toolResult = await analyzeIocByType(iocType, ioc, requestKeys, request.signal)
        const meta = createAnalysisMeta(toolResult, resolvedModel)

        if (toolResult.error) {
            return jsonResponse({ ...toClientError(toolResult.error), meta }, 500)
        }

        if (!meta.hasEvidence) {
            const stream = createNoDataStream(meta)
            return new Response(stream, { status: 200, headers: streamHeaders })
        }

        const stream = createOpenRouterStream({
            iocType,
            meta,
            apiKey: requestKeys.openRouterKey,
            siteUrl: site.origin,
            requestSignal: request.signal
        })

        return new Response(stream, {
            status: 200,
            headers: streamHeaders
        })
    } catch (error: unknown) {
        return jsonResponse(toClientError(error), 500)
    }
}) satisfies APIRoute;
