import { z } from 'astro/zod';
import { TEXTS_GENERAL } from '@/lib/texts.ts';
import { ProviderError } from '@/lib/server/errors.ts';
import { collectMetrics, fetchProviderJson } from '@/lib/server/providers/fetcher.ts';

const ROBTEX_API_REPUTATION = 'https://freeapi.robtex.com/api/v1/domain_reputation'
const ROBTEX_API_RANKING = 'https://freeapi.robtex.com/api/v1/domain_ranking'

const rank = z.number().int();
const ranking = z.union([rank, z.object({ rank: rank.nullish() })]).nullish();
const reportSchema = z.object({
    status: z.string().optional(),
    majestic: ranking,
    tranco: ranking,
    majestic_rank: rank.nullish(),
    tranco_rank: rank.nullish(),
});

function rankValue(value: z.infer<typeof ranking>) {
    const position = typeof value === 'number' ? value : value?.rank;
    return position != null && position > 0 ? position : undefined;
}

export function normalizeRobtex(payload: unknown) {
    const report = reportSchema.safeParse(payload);
    if (!report.success || report.data.status === 'error') {
        throw new ProviderError('ioc', 'Robtex', 'api_unavailable');
    }
    const { majestic, tranco, majestic_rank, tranco_rank } = report.data;
    const labels = TEXTS_GENERAL.results.metrics;
    return collectMetrics({
        [labels.majesticRank]: rankValue(majestic_rank) ?? rankValue(majestic),
        [labels.trancoRank]: rankValue(tranco_rank) ?? rankValue(tranco),
    });
}

async function fetchRobtexReport(baseUrl: string, domain: string, signal: AbortSignal) {
    const url = new URL(baseUrl);
    url.searchParams.set('hostname', domain);
    const payload = await fetchProviderJson('Robtex', url, { signal });
    return normalizeRobtex(payload);
}

export async function fetchRobtexDomain(domain: string, signal: AbortSignal) {
    const results = await Promise.allSettled([
        fetchRobtexReport(ROBTEX_API_REPUTATION, domain, signal),
        fetchRobtexReport(ROBTEX_API_RANKING, domain, signal),
    ])
    const [repResult, rankResult] = results

    const reputation = repResult.status === 'fulfilled' ? repResult.value : []
    const rankings = rankResult.status === 'fulfilled' ? rankResult.value : []
    const metrics = new Map([...reputation, ...rankings].map((metric) => [metric.label, metric]));

    if (!metrics.size) {
        for (const result of results) {
            if (result.status === 'rejected' &&
                (!(result.reason instanceof ProviderError) || result.reason.errorType !== 'not_found')) {
                throw result.reason
            }
        }
        throw new ProviderError('ioc', 'Robtex', 'not_found')
    }

    return [...metrics.values()];
}
