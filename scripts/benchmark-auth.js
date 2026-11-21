/* eslint-disable */
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { getDatabaseUrl } = require('./env');

async function benchmark() {
    try {
        console.log('--- Starting Benchmark ---');
        const sql = neon(getDatabaseUrl());

        // 1. Measure first query (includes connection setup)
        console.log('1. Pinging Neon Postgres...');
        const t0 = performance.now();
        await sql.query('SELECT 1');
        const t1 = performance.now();
        console.log(`   > Connected in: ${(t1 - t0).toFixed(2)}ms`);

        // 2. Measure user lookup
        console.log('2. Finding Admin User...');
        const t2 = performance.now();
        const [user] = await sql.query('SELECT password FROM users WHERE username = $1', ['admin']);
        const t3 = performance.now();
        console.log(`   > Found user in: ${(t3 - t2).toFixed(2)}ms`);

        if (!user) {
            console.error('Admin user not found!');
            process.exit(1);
        }

        // 3. Measure bcrypt compare
        console.log('3. Verifying Password (bcryptjs)...');
        const t4 = performance.now();
        await bcrypt.compare('LearninkAdmin@2025', user.password);
        const t5 = performance.now();
        console.log(`   > Compared hash in: ${(t5 - t4).toFixed(2)}ms`);

        console.log('--- Benchmark Complete ---');
        console.log(`Total Critical Path: ${(t1 - t0) + (t3 - t2) + (t5 - t4)}ms`);
    } catch (e) {
        console.error(e);
    }
}

benchmark();
