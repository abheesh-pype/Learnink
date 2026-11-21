/* eslint-disable */
// Creates the tables from db/schema.sql in the Neon database. Safe to re-run.
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
const { getDatabaseUrl } = require('./env');

async function main() {
    const sql = neon(getDatabaseUrl());
    const schema = fs.readFileSync(path.resolve(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    const statements = schema
        .split(/;\s*$/m)
        .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
        .filter(Boolean);

    for (const statement of statements) {
        await sql.query(statement);
        console.log('✓', statement.split('\n')[0]);
    }
    console.log(`Schema applied (${statements.length} statements).`);
}

main().catch((err) => {
    console.error('Schema setup failed:', err.message);
    process.exit(1);
});
