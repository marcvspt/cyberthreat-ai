import { z } from 'astro/zod';
import { TEXTS_GENERAL } from '@/lib/texts.ts';
import { ProviderError } from '@/lib/server/errors.ts';
import { collectMetrics, fetchProviderJson } from '@/lib/server/providers/fetcher.ts';

const VIRUSTOTAL_API_IP = 'https://www.virustotal.com/api/v3/ip_addresses'
const VIRUSTOTAL_API_DOMAIN = 'https://www.virustotal.com/api/v3/domains'
const VIRUSTOTAL_API_FILEHASH = 'https://www.virustotal.com/api/v3/files'

const count = z.number().int().nonnegative().optional();
const responseSchema = z.object({ data: z.object({ attributes: z.object({
    last_analysis_stats: z.object({ malicious: count, suspicious: count, harmless: count, undetected: count }).optional(),
    reputation: z.number().int().optional(),
}) }) });

export function normalizeVirusTotal(payload: unknown) {
    const parsed = responseSchema.safeParse(payload);
    if (!parsed.success) throw new ProviderError('ioc', 'VirusTotal', 'api_unavailable');
    const { last_analysis_stats: stats, reputation } = parsed.data.data.attributes;
    const labels = TEXTS_GENERAL.results.metrics;
    return collectMetrics({
        [labels.malicious]: stats?.malicious,
        [labels.suspicious]: stats?.suspicious,
        [labels.harmless]: stats?.harmless,
        [labels.undetected]: stats?.undetected,
        [labels.reputation]: reputation,
    });
}

async function fetchVirusTotal(baseUrl: string, ioc: string, apiKey: string, signal: AbortSignal) {
    const headers = apiKey ? { 'x-apikey': apiKey } : undefined;
    const payload = await fetchProviderJson('VirusTotal', `${baseUrl}/${encodeURIComponent(ioc)}`, { headers, signal });
    return normalizeVirusTotal(payload);
}

export function fetchVirusTotalIP(ip: string, apiKey: string, signal: AbortSignal) {
    return fetchVirusTotal(VIRUSTOTAL_API_IP, ip, apiKey, signal);
}

export function fetchVirusTotalDomain(domain: string, apiKey: string, signal: AbortSignal) {
    return fetchVirusTotal(VIRUSTOTAL_API_DOMAIN, domain, apiKey, signal);
}

export function fetchVirusTotalHash(hash: string, apiKey: string, signal: AbortSignal) {
    return fetchVirusTotal(VIRUSTOTAL_API_FILEHASH, hash, apiKey, signal);
}
