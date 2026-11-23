-- Learnink database schema (PostgreSQL / Neon)
-- Apply with: npm run db:setup   (safe to re-run)

CREATE TABLE IF NOT EXISTS programs (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title            text NOT NULL,
    description      text NOT NULL,
    category         text NOT NULL CHECK (category IN (
                         'Degree Breaking', 'Fast Track', 'Credit Transfer', 'Online Degree',
                         'Secondary (10th)', 'Senior Secondary (12th)', 'Diploma', 'Attestation')),
    icon             text,
    content          text,
    slug             text UNIQUE,
    meta_title       text,
    meta_description text,
    keywords         text[] NOT NULL DEFAULT '{}',
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partners (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name         text NOT NULL,
    slug         text UNIQUE,
    logo         text NOT NULL,
    description  text,
    programs     uuid[] NOT NULL DEFAULT '{}',  -- program ids, in display order
    enroll_link  text,
    "order"      integer NOT NULL DEFAULT 0,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_configs (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key                 text NOT NULL UNIQUE DEFAULT 'global-seo',
    title               text DEFAULT 'Learnink Education',
    description         text DEFAULT 'Linking Learning, Skills & Careers',
    keywords            text[] NOT NULL DEFAULT '{}',
    favicon             text,
    og_image            text,
    robots_txt          text DEFAULT E'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/',
    google_analytics_id text,
    social_links        jsonb NOT NULL DEFAULT '{}',
    google_verification text,
    twitter_handle      text,
    images              jsonb NOT NULL DEFAULT '{}',
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enquiries (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text NOT NULL,
    email      text NOT NULL,
    phone      text NOT NULL,
    interest   text,
    message    text,
    status     text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscribers (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email      text NOT NULL UNIQUE,
    status     text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS page_seos (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key    text NOT NULL UNIQUE,
    title       text,
    description text,
    keywords    text[] NOT NULL DEFAULT '{}',
    og_image    text,
    enabled     boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_photos (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url  text NOT NULL,
    caption    text,
    "order"    integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text NOT NULL,
    content    text NOT NULL,
    role       text,
    image_url  text,
    rating     integer NOT NULL DEFAULT 5,
    "order"    integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integration_configs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key             text NOT NULL UNIQUE DEFAULT 'crm-integration',
    crm_webhook_url text,
    crm_auth_token  text,
    enabled         boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username   text NOT NULL UNIQUE,
    password   text NOT NULL,
    role       text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Contact details shown on the Contact page (singleton row, key = 'contact').
-- Edited in Admin → Contact. Missing values fall back to the defaults in src/lib/contact.ts.
CREATE TABLE IF NOT EXISTS contact_settings (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key                text NOT NULL UNIQUE DEFAULT 'contact',
    phone              text,
    phone_hours        text,
    email              text,
    email_note         text,
    visit_location     text,
    visit_note         text,
    map_url            text,
    hq_name            text,
    hq_address         text,
    hq_hours           text,
    admissions_title   text,
    admissions_text    text,
    students_count     text,
    universities_count text,
    courses_count      text,
    years_count        text,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);

-- Upgrades for databases created before these columns existed.
ALTER TABLE contact_settings ADD COLUMN IF NOT EXISTS courses_count text;
ALTER TABLE contact_settings ADD COLUMN IF NOT EXISTS years_count text;

-- Quick enquiries from the homepage hero form and the 10-second popup.
CREATE TABLE IF NOT EXISTS hero_enquiries (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text NOT NULL,
    email      text NOT NULL,
    phone      text NOT NULL,
    course     text NOT NULL,
    session    text NOT NULL,
    source     text NOT NULL DEFAULT 'hero' CHECK (source IN ('hero', 'popup')),
    status     text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hero_enquiries_created_at_idx ON hero_enquiries (created_at DESC);

-- Gallery items can be photos or videos.
ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image';

-- Gallery sections (e.g. "Annual Day 2026"): each has a heading and its own photos / videos.
CREATE TABLE IF NOT EXISTS gallery_sections (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text NOT NULL,
    description text,
    "order"     integer NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Deleting a section deletes its photos / videos too.
ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES gallery_sections(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS gallery_photos_section_idx ON gallery_photos (section_id);
