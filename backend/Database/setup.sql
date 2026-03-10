-- ============================================================
-- GeoSocial Database Setup
-- Run this once against your PostgreSQL instance.
-- ============================================================

-- 1. Create the database (run this from psql as a superuser)
CREATE DATABASE geosocial;

-- 2. Connect to the new database before running the rest:
--    \c geosocial

-- 3. Enable the PostGIS extension (provides geography types and ST_ functions)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE users (
    id            UUID PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP    NOT NULL
);

-- ── Posts ────────────────────────────────────────────────────
-- `location` is a PostGIS geography column.
-- It stores the point as a proper geographic type (not just two floats)
-- which enables accurate distance queries in metres.
--
-- We also keep latitude/longitude as plain doubles so the application
-- can read them back without invoking PostGIS functions.
CREATE TABLE posts (
    id         UUID PRIMARY KEY,
    user_id    UUID             NOT NULL REFERENCES users(id),
    content    TEXT             NOT NULL,
    latitude   DOUBLE PRECISION NOT NULL,
    longitude  DOUBLE PRECISION NOT NULL,
    location   GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at TIMESTAMP        NOT NULL
);

-- ── Spatial Index ─────────────────────────────────────────────
-- GIST index on the geography column.
-- Without this, ST_DWithin scans every row.
-- With this, PostgreSQL uses a geographic tree to eliminate
-- irrelevant rows immediately — queries stay fast at scale.
CREATE INDEX idx_posts_location ON posts USING GIST(location);
