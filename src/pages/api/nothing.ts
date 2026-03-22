import type { APIRoute } from 'astro';

export const GET = (({ request }) => {
    const { url } = request
    const urlObject = new URL(url)
    const data = Object.fromEntries(urlObject.searchParams.entries())
    const param = urlObject.searchParams.get('param')

    return new Response(JSON.stringify({ ...data, param }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}) satisfies APIRoute;