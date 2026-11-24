// Server-side only.
import https from "https";
import dns from "dns";
import type { LookupFunction } from "net";

/**
 * Google's share links (maps.app.goo.gl/…, goo.gl/…) are short redirects to a full google.com/maps address.
 * Some networks block the short domains (the browser shows DNS_PROBE_FINISHED_NXDOMAIN), so we store the full
 * address instead. Host names are looked up through public DNS (Google 8.8.8.8, Cloudflare 1.1.1.1) because
 * the local network may be the thing blocking them. If anything fails, the original link is returned.
 */
const resolver = new dns.promises.Resolver({ timeout: 3000, tries: 1 });
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

const publicLookup: LookupFunction = (hostname, options, callback) => {
    resolver.resolve4(hostname).then(
        (addresses) => {
            if (!addresses.length) return callback(new Error(`No address for ${hostname}`), "", 4);
            if (options?.all) {
                (callback as unknown as (err: null, list: { address: string; family: number }[]) => void)(
                    null,
                    addresses.map((address) => ({ address, family: 4 }))
                );
            } else {
                callback(null, addresses[0], 4);
            }
        },
        (err) => callback(err, "", 4)
    );
};

function requestRedirect(url: string): Promise<{ status: number; location?: string }> {
    return new Promise((resolve, reject) => {
        const req = https.request(
            url,
            { method: "GET", lookup: publicLookup, timeout: 6000, headers: { "User-Agent": "Mozilla/5.0" } },
            (res) => {
                res.resume(); // we only need the headers
                resolve({ status: res.statusCode ?? 0, location: res.headers.location });
            }
        );
        req.on("timeout", () => req.destroy(new Error("timeout")));
        req.on("error", reject);
        req.end();
    });
}

const isShortGoogleLink = (host: string) => host === "maps.app.goo.gl" || host === "goo.gl";
const isGoogleMapsUrl = (url: URL) => /(^|\.)google\.[a-z.]+$/.test(url.hostname) && url.pathname.startsWith("/maps");

/** Returns the full google.com/maps address for a Google short link, or the original link if it isn't one / can't be followed. */
export async function expandGoogleShortLink(link: string): Promise<string> {
    let current: URL;
    try {
        current = new URL(link);
    } catch {
        return link;
    }
    if (!isShortGoogleLink(current.hostname.toLowerCase())) return link;

    try {
        for (let hop = 0; hop < 5; hop++) {
            const { status, location } = await requestRedirect(current.toString());
            if (!location || status < 300 || status >= 400) break;
            current = new URL(location, current);
            if (current.protocol === "https:" && isGoogleMapsUrl(current)) return current.toString();
        }
    } catch (e) {
        console.warn("Couldn't expand Google short link; keeping it as-is:", (e as Error).message);
    }
    return link;
}
