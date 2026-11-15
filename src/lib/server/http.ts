import { isIP } from 'node:net';
import type { APIContext } from 'astro';

export const jsonHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
};

export function jsonResponse(body: unknown, status: number) {
    return new Response(JSON.stringify(body), {
        status,
        headers: jsonHeaders
    })
}

export function getClientIp(context: Pick<APIContext, 'clientAddress'>) {
    try {
        const address = context.clientAddress;
        return isIP(address) ? address : 'unknown';
    } catch {
        // Astro can throw when the adapter cannot provide a client address.
        return 'unknown';
    }
}
