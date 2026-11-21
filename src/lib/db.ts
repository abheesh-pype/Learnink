import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let client: NeonQueryFunction<false, false> | null = null;

function getClient() {
    if (!client) {
        const url = process.env.DATABASE_URL;
        if (!url) {
            throw new Error('Please define the DATABASE_URL environment variable inside .env.local');
        }
        client = neon(url);
    }
    return client;
}

/** Run a parameterised SQL statement against Neon and return the result rows. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query(text: string, params: unknown[] = []): Promise<any[]> {
    return getClient().query(text, params);
}

/**
 * Kept so existing call sites (`await dbConnect()`) keep working. Neon's HTTP
 * driver is connectionless, so this only validates the configuration.
 */
export default async function dbConnect() {
    getClient();
}
