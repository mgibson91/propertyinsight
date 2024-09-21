export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export function GET(request: Request) {
    const pid = process?.pid;
    return new Response(`Hello from ${process.env.VERCEL_REGION}. Process ID: ${pid}`);
}