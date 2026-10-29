import { TEXTS_GENERAL } from '@/lib/texts.ts';
import type { LinkItem, SocialLinkItem } from '@/lib/types/site.ts';

export const HEADER_LINKS = {
    repository: { id: 'repository', label: TEXTS_GENERAL.header.repositoryLink, href: 'https://github.com/marcvspt/cyberthreat-ai' },
    aboutMe: { id: 'about-me', label: TEXTS_GENERAL.header.aboutMeLink, href: 'https://marcvspt.tech/about' },
} satisfies Record<'repository' | 'aboutMe', LinkItem>;

export const SOCIAL_DATA: SocialLinkItem[] = [
    { id: 'linkedin', label: TEXTS_GENERAL.social.linkedin, href: 'https://www.linkedin.com/in/marcopat01/' },
    { id: 'github', label: TEXTS_GENERAL.social.github, href: 'https://github.com/marcvspt' },
    { id: 'hackthebox', label: TEXTS_GENERAL.social.hackthebox, href: 'https://app.hackthebox.com/profile/935643' },
    { id: 'x', label: TEXTS_GENERAL.social.x, href: 'https://x.com/marcvspt' },
    { id: 'email', label: TEXTS_GENERAL.social.email, href: 'mailto:marcvspt@gmail.com' },
];

export const SUPPORT_LINKS: LinkItem[] = [
    { id: 'buy-me-a-coffee', label: TEXTS_GENERAL.header.buyMeACoffee, href: 'https://buymeacoffee.com/marcvspt' },
    { id: 'github-sponsors', label: TEXTS_GENERAL.header.githubSponsors, href: 'https://github.com/sponsors/marcvspt' },
];

export const EXTERNAL_RESOURCES = {
    cubepath: { id: 'cubepath', label: TEXTS_GENERAL.brands.cubepath, href: 'https://cubepath.com' },
    astro: { id: 'astro', label: TEXTS_GENERAL.brands.astro, href: 'https://astro.build' },
    react: { id: 'react', label: TEXTS_GENERAL.brands.react, href: 'https://react.dev' },
    tailwind: { id: 'tailwind', label: TEXTS_GENERAL.brands.tailwind, href: 'https://tailwindcss.com' },
    openrouter: { id: 'openrouter', label: TEXTS_GENERAL.brands.openrouter, href: 'https://openrouter.ai' },
    virustotal: { id: 'virustotal', label: TEXTS_GENERAL.brands.virustotal, href: 'https://www.virustotal.com' },
    abuseipdb: { id: 'abuseipdb', label: TEXTS_GENERAL.brands.abuseipdb, href: 'https://www.abuseipdb.com' },
    polyswarm: { id: 'polyswarm', label: TEXTS_GENERAL.brands.polyswarm, href: 'https://polyswarm.io' },
    robtex: { id: 'robtex', label: TEXTS_GENERAL.brands.robtex, href: 'https://www.robtex.com' },
} satisfies Record<'cubepath' | 'astro' | 'react' | 'tailwind' | 'openrouter' | 'virustotal' | 'abuseipdb' | 'polyswarm' | 'robtex', LinkItem>;

export const LICENSE_LINK: LinkItem = {
    id: 'license',
    label: TEXTS_GENERAL.footer.licenseName,
    href: 'https://github.com/marcvspt/cyberthreat-ai/blob/master/LICENSE',
};
