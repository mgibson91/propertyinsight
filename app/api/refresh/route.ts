import { getLogger } from '@/utils/logging/logger';

const logger = getLogger('Refresh');

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export function GET(request: Request) {
    const pid = process?.pid;
    const timestamp = new Date().toISOString();

    logger.info(`Refresh endpoint called at ${timestamp}`);

    return new Response(`Hello from ${process.env.VERCEL_REGION}. Process ID: ${pid}. Timestamp: ${timestamp}`);
}