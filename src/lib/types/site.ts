export interface LinkItem {
    id: string;
    label: string;
    href: string;
}

export interface SiteData {
    name: string;
    description: string;
}

export interface SocialLinkItem extends LinkItem {
    id: 'linkedin' | 'github' | 'hackthebox' | 'x' | 'email';
}
