/* eslint-disable */
// Seeds the starter programs (formerly hard-coded in the enquiry form dropdown).
// Safe to re-run: programs whose slug already exists are skipped.
const { neon } = require('@neondatabase/serverless');
const { getDatabaseUrl } = require('./env');

const PROGRAMS = [
    {
        title: 'Degree Breaking Study',
        category: 'Degree Breaking',
        slug: 'degree-breaking-study',
        description: 'Resume and complete a degree you had to discontinue, with credit for the studies you already finished.',
    },
    {
        title: 'Fast Track Program',
        category: 'Fast Track',
        slug: 'fast-track-program',
        description: 'Complete your degree in a shorter time through an accelerated study schedule.',
    },
    {
        title: 'Credit Transfer',
        category: 'Credit Transfer',
        slug: 'credit-transfer',
        description: 'Transfer credits earned at another institution and continue your degree without starting over.',
    },
    {
        title: 'Online Degree',
        category: 'Online Degree',
        slug: 'online-degree',
        description: 'Earn a recognised degree online, studying at your own pace from anywhere.',
    },
    {
        title: 'Secondary (10th)',
        category: 'Secondary (10th)',
        slug: 'secondary-10th',
        description: 'Complete your secondary (10th) education through a flexible, recognised board programme.',
    },
    {
        title: 'Senior Secondary (12th)',
        category: 'Senior Secondary (12th)',
        slug: 'senior-secondary-12th',
        description: 'Complete your senior secondary (12th) education and become eligible for higher studies.',
    },
    {
        title: 'Diploma',
        category: 'Diploma',
        slug: 'diploma',
        description: 'Gain practical, job-ready skills with a diploma programme in your chosen field.',
    },
];

async function main() {
    const sql = neon(getDatabaseUrl());
    for (const p of PROGRAMS) {
        const rows = await sql.query(
            `INSERT INTO programs (title, category, slug, description)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (slug) DO NOTHING
             RETURNING id`,
            [p.title, p.category, p.slug, p.description],
        );
        console.log(rows.length ? '✓ created' : '- exists ', p.title);
        // Distinct created_at values keep the original dropdown order.
        await new Promise((r) => setTimeout(r, 20));
    }
}

main().catch((err) => {
    console.error('Seeding programs failed:', err.message);
    process.exit(1);
});
