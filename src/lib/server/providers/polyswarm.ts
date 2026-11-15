import { z } from 'astro/zod';
import { TEXTS_GENERAL } from '@/lib/texts.ts';
import { ProviderError } from '@/lib/server/errors.ts';
import { collectMetrics, fetchProviderJson } from '@/lib/server/providers/fetcher.ts';
import type { HashAlgorithm } from '@/lib/types/analysis.ts';

const POLYSWARM_API = 'https://api.polyswarm.network/v3/search/hash'

const score = z.union([z.number(), z.string().regex(/^\d+(?:\.\d+)?$/).transform(Number)])
    .pipe(z.number().nonnegative());
const artifactSchema = z.object({
    polyscore: score.nullish(),
    assertions: z.array(z.object({ mask: z.boolean(), verdict: z.boolean().nullish() })).nullish(),
    state: z.string().optional(),
    failed: z.boolean().nullish(),
});
const artifacts = z.union([artifactSchema, z.array(artifactSchema)]);
const responseSchema = z.union([z.object({ result: artifacts }), z.object({ results: artifacts })]);

export function normalizePolySwarm(payload: unknown) {
    const parsed = responseSchema.safeParse(payload);
    if (!parsed.success) throw new ProviderError('ioc', 'PolySwarm', 'api_unavailable');
    const result = 'result' in parsed.data ? parsed.data.result : parsed.data.results;
    const matches = Array.isArray(result) ? result : [result];
    const labels = TEXTS_GENERAL.results.metrics;
    for (const artifact of matches) {
        if (artifact.failed) continue;
        const assertions = artifact.assertions?.filter(({ mask, verdict }) => mask && typeof verdict === 'boolean');
        const malicious = assertions?.filter(({ verdict }) => verdict).length;
        const metrics = collectMetrics({
            [labels.polyScore]: artifact.polyscore,
            [labels.polyMalicious]: assertions?.length ? malicious : undefined,
            [labels.polyHarmless]: assertions?.length ? assertions.length - (malicious ?? 0) : undefined,
            [labels.polyKnownGood]: artifact.state === 'KNOWN_GOOD' ? true : undefined,
        });
        if (metrics.length) return metrics;
    }

    if (matches.some(({ failed }) => failed)) throw new ProviderError('ioc', 'PolySwarm', 'api_unavailable');
    return [];
}

export async function fetchPolySwarmHash(hash: string, hashType: HashAlgorithm, apiKey: string, signal: AbortSignal) {
    const headers = apiKey ? { Authorization: apiKey } : undefined;
    const url = new URL(`${POLYSWARM_API}/${hashType}`);
    url.searchParams.set('hash', hash);
    url.searchParams.set('community', 'default');
    const payload = await fetchProviderJson('PolySwarm', url, { headers, signal }, [204]);
    return normalizePolySwarm(payload);
}
