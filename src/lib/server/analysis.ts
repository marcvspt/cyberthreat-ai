import { TEXTS_GENERAL } from '@/lib/texts.ts';
import { analyzeIP } from '@/lib/server/analysis/ip.ts';
import { analyzeDomain } from '@/lib/server/analysis/domain.ts';
import { analyzeHash } from '@/lib/server/analysis/hash.ts';
import type { IoCType } from '@/lib/types/analysis.ts';
import type { ResolvedApiKeys } from '@/lib/types/api-keys.ts';

export async function analyzeIocByType(iocType: IoCType, ioc: string, keys: ResolvedApiKeys, signal: AbortSignal) {
    switch (iocType) {
        case 'ip':
            return analyzeIP(ioc, signal, keys.userVTKey, keys.userAbuseKey)
        case 'domain':
            return analyzeDomain(ioc, signal, keys.userVTKey)
        case 'hash':
            return analyzeHash(ioc, signal, keys.userVTKey, keys.userPolyKey)
        default:
            throw new Error(TEXTS_GENERAL.errors.unsupportedIoc)
    }
}
