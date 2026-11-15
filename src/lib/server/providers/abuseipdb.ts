import { z } from 'astro/zod';
import { TEXTS_GENERAL } from '@/lib/texts.ts';
import { ProviderError } from '@/lib/server/errors.ts';
import { collectMetrics, fetchProviderJson } from '@/lib/server/providers/fetcher.ts';

const ABUSEIPDB_API = 'https://api.abuseipdb.com/api/v2/check';
const responseSchema = z.object({ data: z.object({
    abuseConfidenceScore: z.number().int().min(0).max(100),
    totalReports: z.number().int().nonnegative(),
}) });

export function normalizeAbuseIPDB(payload: unknown) {
    const result = responseSchema.safeParse(payload);
    if (!result.success) throw new ProviderError('ioc', 'AbuseIPDB', 'api_unavailable');
    const labels = TEXTS_GENERAL.results.metrics;
    return collectMetrics({
        [labels.abuseConfidence]: result.data.data.abuseConfidenceScore,
        [labels.abuseReports]: result.data.data.totalReports,
    });
}

export async function fetchAbuseIPDBIP(ip: string, apiKey: string, signal: AbortSignal) {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey) headers['Key'] = apiKey;
    const url = new URL(ABUSEIPDB_API);
    url.searchParams.set('ipAddress', ip);
    const payload = await fetchProviderJson('AbuseIPDB', url, { headers, signal });
    return normalizeAbuseIPDB(payload);
}
