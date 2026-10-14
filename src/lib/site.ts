import { TEXTS_GENERAL } from '@/lib/texts.ts';
import type { SiteData } from '@/lib/types/site.ts';

export const SITE_DATA: SiteData = {
    ...TEXTS_GENERAL.site,
};

export const SITE_LOCALE = { html: 'es' } as const;
