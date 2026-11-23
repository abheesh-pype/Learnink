/* eslint-disable */
// One-time: puts gallery items that have no section into a "Campus & Events" section. Safe to re-run.
const { neon } = require('@neondatabase/serverless');
const { getDatabaseUrl } = require('./env');

(async () => {
    const sql = neon(getDatabaseUrl());
    const [{ n }] = await sql.query('SELECT count(*)::int AS n FROM gallery_photos WHERE section_id IS NULL');
    if (!n) return console.log('No unsorted gallery items.');
    const [section] = await sql.query(
        "INSERT INTO gallery_sections (title, \"order\") VALUES ('Campus & Events', 0) RETURNING id"
    );
    await sql.query('UPDATE gallery_photos SET section_id = $1 WHERE section_id IS NULL', [section.id]);
    console.log(`Moved ${n} item(s) into the "Campus & Events" section.`);
})().catch((e) => { console.error(e.message); process.exit(1); });
