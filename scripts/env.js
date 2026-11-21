/* eslint-disable */
// Minimal .env.local loader shared by the scripts in this folder.
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return;
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (!match || process.env[match[1]]) continue;
        process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
}

function getDatabaseUrl() {
    loadEnv();
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error('DATABASE_URL is not set. Add it to .env.local.');
        process.exit(1);
    }
    return url;
}

module.exports = { loadEnv, getDatabaseUrl };
