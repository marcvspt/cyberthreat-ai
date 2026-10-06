import { TEXTS_GENERAL } from '@/scripts/catalog/texts.ts';
export const SITE_DATA = {
    name: TEXTS_GENERAL.siteName,
    description: TEXTS_GENERAL.siteDescription,
    url: "https://ctai.marcvspt.tech",
    repository: "https://github.com/marcvspt/cyberthreat-ai",
    aboutMe: "https://marcvspt.tech/about"
}

export const SOCIAL_DATA = [
    {
        id: "linkedin",
        name: TEXTS_GENERAL.socialLabels.linkedin,
        url: "https://www.linkedin.com/in/marcopat01/",
    },
    {
        id: "github",
        name: TEXTS_GENERAL.socialLabels.github,
        url: "https://github.com/marcvspt",
    },
    {
        id: "hackthebox",
        name: TEXTS_GENERAL.socialLabels.hackthebox,
        url: "https://app.hackthebox.com/profile/935643",
    },
    {
        id: "x",
        name: TEXTS_GENERAL.socialLabels.x,
        url: "https://x.com/marcvspt",
    },
    {
        id: "email",
        name: TEXTS_GENERAL.socialLabels.email,
        url: "mailto:marcvspt@gmail.com",
    },
]

export const currentYear = new Date().getFullYear()
