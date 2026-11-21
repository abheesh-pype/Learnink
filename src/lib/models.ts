/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PostgreSQL (Neon) data models.
 *
 * Each model maps to a table in db/schema.sql. The API mirrors the subset of
 * Mongoose the app already used (find / findOne / findById / create /
 * findByIdAndUpdate / findOneAndUpdate / findByIdAndDelete, with chained
 * .sort() / .select() / .populate() / .lean()), and rows come back with `_id`
 * plus camelCase fields, so pages, API routes and the admin UI work unchanged.
 */
import { query } from './db';

type FieldType = 'text' | 'int' | 'bool' | 'text[]' | 'uuid[]' | 'json';
type Doc = any;
type Filter = Record<string, unknown>;
type SortSpec = Record<string, 1 | -1 | 'asc' | 'desc'>;

interface FindOptions {
    sort?: SortSpec;
    select?: string[];
    limit?: number;
    populate?: string[];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SYSTEM_FIELDS = ['_id', 'createdAt', 'updatedAt'];

const toColumn = (field: string) =>
    field === '_id' ? 'id' : field.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());

class Query<T> implements PromiseLike<T> {
    private opts: FindOptions = {};

    constructor(
        private model: Model,
        private run: (opts: FindOptions) => Promise<Doc[]>,
        private single: boolean,
    ) { }

    sort(spec: SortSpec) { this.opts.sort = spec; return this; }
    select(fields: string) { this.opts.select = fields.split(/\s+/).filter(Boolean); return this; }
    limit(n: number) { this.opts.limit = n; return this; }
    populate(field: string) { this.opts.populate = [...(this.opts.populate ?? []), field]; return this; }
    /** Rows are already plain objects; kept for Mongoose-style call sites. */
    lean() { return this; }

    async exec(): Promise<T> {
        let rows = await this.run(this.opts);
        for (const field of this.opts.populate ?? []) {
            rows = await this.model.populateField(rows, field);
        }
        return (this.single ? rows[0] ?? null : rows) as T;
    }

    then<R1 = T, R2 = never>(
        onFulfilled?: ((value: T) => R1 | PromiseLike<R1>) | null,
        onRejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
    ): PromiseLike<R1 | R2> {
        return this.exec().then(onFulfilled, onRejected);
    }
}

class Model {
    private readonly allFields: string[];

    constructor(
        readonly table: string,
        private readonly fields: Record<string, FieldType>,
        private readonly refs: Record<string, () => Model> = {},
    ) {
        this.allFields = [...SYSTEM_FIELDS, ...Object.keys(fields)];
    }

    // --- SQL helpers -------------------------------------------------------

    private column(field: string) {
        if (!this.allFields.includes(field)) {
            throw new Error(`Unknown field "${field}" on ${this.table}`);
        }
        return `"${toColumn(field)}"`;
    }

    private selectList(fields: string[] = this.allFields) {
        return fields.map((f) => `${this.column(f)} AS "${f}"`).join(', ');
    }

    private where(filter: Filter, params: unknown[]) {
        const clauses: string[] = [];
        for (const [field, value] of Object.entries(filter)) {
            if (value === undefined) continue;
            if (field === '_id' && !(typeof value === 'string' && UUID_RE.test(value))) {
                return 'WHERE FALSE'; // not a valid id, so nothing can match
            }
            if (value === null) {
                clauses.push(`${this.column(field)} IS NULL`);
            } else {
                params.push(value);
                clauses.push(`${this.column(field)} = $${params.length}`);
            }
        }
        return clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    }

    /** Known, writable fields from `data`, converted for Postgres. Unknown keys are ignored. */
    private writable(data: Record<string, unknown>) {
        const out: [string, unknown][] = [];
        for (const [field, raw] of Object.entries(data ?? {})) {
            const type = this.fields[field];
            if (!type || raw === undefined) continue;
            let value = raw;
            if (type === 'json') value = raw === null ? {} : JSON.stringify(raw);
            if (type === 'int' && (raw === '' || raw === null)) continue;
            if ((type === 'text[]' || type === 'uuid[]') && raw === null) value = [];
            out.push([field, value]);
        }
        return out;
    }

    private selectRows(filter: Filter, opts: FindOptions = {}) {
        const params: unknown[] = [];
        const fields = opts.select ? ['_id', ...opts.select.filter((f) => f !== '_id')] : undefined;
        let text = `SELECT ${this.selectList(fields)} FROM ${this.table} ${this.where(filter, params)}`;
        if (opts.sort && Object.keys(opts.sort).length) {
            const order = Object.entries(opts.sort).map(([f, dir]) =>
                `${this.column(f)} ${dir === -1 || dir === 'desc' ? 'DESC' : 'ASC'}`);
            text += ` ORDER BY ${order.join(', ')}`;
        }
        if (opts.limit) text += ` LIMIT ${Math.floor(opts.limit)}`;
        return query(text, params);
    }

    private async insert(data: Record<string, unknown>): Promise<Doc> {
        const entries = this.writable(data);
        const cols = entries.map(([f]) => this.column(f));
        const text = entries.length
            ? `INSERT INTO ${this.table} (${cols.join(', ')}) VALUES (${entries.map((_, i) => `$${i + 1}`).join(', ')})`
            : `INSERT INTO ${this.table} DEFAULT VALUES`;
        const rows = await query(`${text} RETURNING ${this.selectList()}`, entries.map(([, v]) => v));
        return rows[0];
    }

    private update(filter: Filter, data: Record<string, unknown>) {
        const entries = this.writable(data);
        const params: unknown[] = entries.map(([, v]) => v);
        const sets = [...entries.map(([f], i) => `${this.column(f)} = $${i + 1}`), `"updated_at" = now()`];
        return query(
            `UPDATE ${this.table} SET ${sets.join(', ')} ${this.where(filter, params)} RETURNING ${this.selectList()}`,
            params,
        );
    }

    async populateField(rows: Doc[], field: string): Promise<Doc[]> {
        const ref = this.refs[field]?.();
        if (!ref) throw new Error(`Cannot populate "${field}" on ${this.table}`);
        const ids = [...new Set(rows.flatMap((r) => r[field] ?? []))];
        const found: Doc[] = ids.length
            ? await query(`SELECT ${ref.selectList()} FROM ${ref.table} WHERE id = ANY($1::uuid[])`, [ids])
            : [];
        const byId = new Map(found.map((d) => [d._id, d]));
        return rows.map((r) => ({
            ...r,
            [field]: (r[field] ?? []).map((id: string) => byId.get(id)).filter(Boolean),
        }));
    }

    // --- Public API --------------------------------------------------------

    find(filter: Filter = {}) {
        return new Query<Doc[]>(this, (opts) => this.selectRows(filter, opts), false);
    }

    findOne(filter: Filter = {}) {
        return new Query<Doc | null>(this, (opts) => this.selectRows(filter, { ...opts, limit: 1 }), true);
    }

    findById(id: string) {
        return this.findOne({ _id: id });
    }

    create(data: Record<string, unknown> = {}): Promise<Doc> {
        return this.insert(data);
    }

    // Accepts Mongoose-style options ({ new: true }); the updated row is always returned.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    findByIdAndUpdate(id: string, data: Record<string, unknown>, _opts?: { new?: boolean }) {
        return new Query<Doc | null>(this, () => this.update({ _id: id }, data), true);
    }

    findOneAndUpdate(filter: Filter, data: Record<string, unknown>, opts: { new?: boolean; upsert?: boolean } = {}) {
        return new Query<Doc | null>(this, async () => {
            const rows = await this.update(filter, data);
            if (rows.length || !opts.upsert) return rows;
            return [await this.insert({ ...filter, ...data })];
        }, true);
    }

    findByIdAndDelete(id: string) {
        return new Query<Doc | null>(this, () => {
            const params: unknown[] = [];
            return query(`DELETE FROM ${this.table} ${this.where({ _id: id }, params)} RETURNING ${this.selectList()}`, params);
        }, true);
    }

    async countDocuments(filter: Filter = {}): Promise<number> {
        const params: unknown[] = [];
        const rows = await query(`SELECT count(*)::int AS n FROM ${this.table} ${this.where(filter, params)}`, params);
        return rows[0].n;
    }
}

// --- Models (see db/schema.sql) ---------------------------------------------

export const Program = new Model('programs', {
    title: 'text',
    description: 'text',
    category: 'text', // 'Degree Breaking' | 'Fast Track' | 'Credit Transfer' | 'Online Degree' | 'Secondary (10th)' | 'Senior Secondary (12th)' | 'Diploma' | 'Attestation'
    icon: 'text', // Lucide icon name or image
    content: 'text', // Detailed rich text
    slug: 'text',
    metaTitle: 'text',
    metaDescription: 'text',
    keywords: 'text[]',
});

export const Partner = new Model('partners', {
    name: 'text',
    slug: 'text',
    logo: 'text', // Image URL
    description: 'text',
    programs: 'uuid[]', // Program ids
    enrollLink: 'text',
    order: 'int',
}, { programs: () => Program });

// Global SEO singleton (key = 'global-seo')
export const SiteConfig = new Model('site_configs', {
    key: 'text',
    title: 'text',
    description: 'text',
    keywords: 'text[]',
    favicon: 'text',
    ogImage: 'text',
    robotsTxt: 'text',
    googleAnalyticsId: 'text',
    socialLinks: 'json', // { facebook, twitter, instagram, linkedin, youtube }
    googleVerification: 'text',
    twitterHandle: 'text',
    images: 'json', // { logo, heroBg, aboutImage }
});

export const Enquiry = new Model('enquiries', {
    name: 'text',
    email: 'text',
    phone: 'text',
    interest: 'text',
    message: 'text',
    status: 'text', // 'new' | 'contacted' | 'resolved'
});

export const Subscriber = new Model('subscribers', {
    email: 'text',
    status: 'text', // 'active' | 'unsubscribed'
});

// Per-page SEO settings; pageKey e.g. 'about', 'contact', 'partners', 'programs'
export const PageSEO = new Model('page_seos', {
    pageKey: 'text',
    title: 'text',
    description: 'text',
    keywords: 'text[]',
    ogImage: 'text',
    enabled: 'bool',
});

export const GalleryPhoto = new Model('gallery_photos', {
    imageUrl: 'text',
    caption: 'text',
    order: 'int',
});

export const Testimonial = new Model('testimonials', {
    name: 'text',
    content: 'text',
    role: 'text',
    imageUrl: 'text',
    rating: 'int',
    order: 'int',
});

// Private admin CRM settings singleton (key = 'crm-integration')
export const IntegrationConfig = new Model('integration_configs', {
    key: 'text',
    crmWebhookUrl: 'text',
    crmAuthToken: 'text',
    enabled: 'bool',
});

// Contact page details singleton (key = 'contact'), edited in Admin → Contact
export const ContactSettings = new Model('contact_settings', {
    key: 'text',
    phone: 'text',
    phoneHours: 'text',
    email: 'text',
    emailNote: 'text',
    visitLocation: 'text',
    visitNote: 'text',
    mapUrl: 'text',
    hqName: 'text',
    hqAddress: 'text',
    hqHours: 'text',
    admissionsTitle: 'text',
    admissionsText: 'text',
    studentsCount: 'text',
    universitiesCount: 'text',
    coursesCount: 'text',
    yearsCount: 'text',
});

// Admin auth users
export const User = new Model('users', {
    username: 'text',
    password: 'text',
    role: 'text', // 'admin' | 'editor'
});
