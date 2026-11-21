/* eslint-disable */
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { getDatabaseUrl } = require('./env');

function log(message) {
    console.log(message);
    fs.appendFileSync('seed.log', `[${new Date().toISOString()}] ${message}\n`);
}

function logError(message, error) {
    console.error(message, error);
    fs.appendFileSync('seed.log', `[${new Date().toISOString()}] ERROR: ${message}\n${error?.stack || error}\n`);
}

async function seedAdmin() {
    try {
        fs.writeFileSync('seed.log', 'Starting seed script...\n');

        const sql = neon(getDatabaseUrl());
        log('Connecting to Neon Postgres...');

        const username = 'admin';
        const password = 'LearninkAdmin@2025';

        log(`Checking for user: ${username}`);
        const existing = await sql.query('SELECT id FROM users WHERE username = $1', [username]);
        if (existing.length) {
            log(`User '${username}' already exists.`);
        } else {
            log(`Creating user: ${username}`);
            const hashedPassword = await bcrypt.hash(password, 10);
            await sql.query(
                'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
                [username, hashedPassword, 'admin'],
            );
            log(`User '${username}' created successfully.`);
        }

        log('Done.');
    } catch (error) {
        logError('Seeding failed with error:', error);
        process.exit(1);
    }
}

seedAdmin();
