/* eslint-disable */
// One-time: replaces saved Google short review links (maps.app.goo.gl) with the full google.com/maps address,
// looked up through public DNS. Same logic as src/lib/googleLink.ts. Safe to re-run.
const https = require('https');
const dns = require('dns');
const { neon } = require('@neondatabase/serverless');
const { getDatabaseUrl } = require('./env');

const resolver = new dns.promises.Resolver({ timeout: 3000, tries: 1 });
resolver.setServers(['8.8.8.8', '1.1.1.1']);
const lookup = (host, opts, cb) => resolver.resolve4(host).then(
    (a) => (opts && opts.all ? cb(null, a.map((address) => ({ address, family: 4 }))) : cb(null, a[0], 4)), cb);
const get = (url) => new Promise((resolve, reject) => {
    const req = https.request(url, { lookup, timeout: 6000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        res.resume(); resolve({ status: res.statusCode, location: res.headers.location });
    });
    req.on('timeout', () => req.destroy(new Error('timeout'))); req.on('error', reject); req.end();
});
async function expand(link) {
    let url = new URL(link);
    for (let i = 0; i < 5; i++) {
        const r = await get(url.toString());
        if (!r.location || r.status < 300 || r.status >= 400) break;
        url = new URL(r.location, url);
        if (/(^|\.)google\.[a-z.]+$/.test(url.hostname) && url.pathname.startsWith('/maps')) return url.toString();
    }
    return null;
}

(async () => {
    const sql = neon(getDatabaseUrl());
    const rows = await sql.query("SELECT id, name, source_url FROM testimonials WHERE source_url ~* '^https://(maps\.app\.)?goo\.gl/'");
    if (!rows.length) return console.log('No short Google review links to fix.');
    for (const row of rows) {
        const full = await expand(row.source_url).catch(() => null);
        if (!full) { console.log(`- ${row.name}: couldn't follow ${row.source_url}, left as-is`); continue; }
        await sql.query('UPDATE testimonials SET source_url = $1, updated_at = now() WHERE id = $2', [full, row.id]);
        console.log(`✓ ${row.name}: ${row.source_url} → ${full.slice(0, 60)}…`);
    }
})().catch((e) => { console.error(e.message); process.exit(1); });
