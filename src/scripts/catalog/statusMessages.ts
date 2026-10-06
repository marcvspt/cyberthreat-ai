import { TEXTS_GENERAL } from '@/scripts/catalog/texts.ts';
import type { StreamStatus } from '@/scripts/types.ts';

export const EMPTY_MESSAGES: Record<StreamStatus, string[]> = TEXTS_GENERAL.emptyMessages;

export function getRandomMessage(messages: string[], current?: string) {
    if (messages.length === 1) {
        return messages[0];
    }

    const candidates = current ? messages.filter((message) => message !== current) : messages;
    return candidates[Math.floor(Math.random() * candidates.length)];
}

export function getStatusMessage(status: StreamStatus) {
    return TEXTS_GENERAL.statusMessages[status];
}
