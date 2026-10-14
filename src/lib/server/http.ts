export const jsonHeaders = { 'Content-Type': 'application/json' };

export function jsonResponse(body: unknown, status: number) {
    return new Response(JSON.stringify(body), {
        status,
        headers: jsonHeaders
    })
}

export function getClientIp(request: Request) {
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    if (cfConnectingIp) {
        return cfConnectingIp
    }

    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0]?.trim() || 'unknown'
    }

    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
        return realIp
    }

    return 'unknown'
}
