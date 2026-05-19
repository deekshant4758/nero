//! Database schema and migrations.
//!
//! Migrations are forward-only, numbered, and embedded as strings in the
//! binary. There is no "down" migration — if you need to undo a schema
//! change you add a new migration that corrects it. This matches the
//! append-only philosophy of the whole system.
//!
//! Each migration runs inside a single transaction. If it fails, the
//! database is left unchanged and the error surfaces to the caller.
//! The schema_version table tracks which migrations have been applied.

use rusqlite::{Connection, Result};

/// All migrations in order. Index 0 = migration 1.
/// Never remove or reorder entries — only append new ones.
const MIGRATIONS: &[(&str, &str)] = &[
    (
        "001_initial",
        "
        -- Core event log. Append-only forever.
        CREATE TABLE IF NOT EXISTS events (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp_ms INTEGER NOT NULL,
            sequence     INTEGER NOT NULL,
            session_id   TEXT    NOT NULL,
            kind         TEXT    NOT NULL,
            payload      TEXT    NOT NULL,
            created_at   INTEGER NOT NULL
        ) STRICT;

        -- Time-range scans: the most common query pattern.
        CREATE INDEX IF NOT EXISTS idx_events_timestamp
            ON events(timestamp_ms);

        -- Session reconstruction: all events for one process run.
        CREATE INDEX IF NOT EXISTS idx_events_session
            ON events(session_id, timestamp_ms);

        -- Analytics filters: 'give me all window_focus events today'.
        CREATE INDEX IF NOT EXISTS idx_events_kind_timestamp
            ON events(kind, timestamp_ms);

        -- Schema version tracking.
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT    NOT NULL UNIQUE,
            applied_at INTEGER NOT NULL
        ) STRICT;
        ",
    ),
    (
        "002_meta",
        "
        -- Key/value store for tracker metadata (settings, last run time, etc).
        -- Kept separate from events so schema changes here never touch the
        -- hot event table.
        CREATE TABLE IF NOT EXISTS meta (
            key        TEXT PRIMARY KEY,
            value      TEXT NOT NULL,
            updated_at INTEGER NOT NULL
        ) STRICT;

        INSERT OR IGNORE INTO meta VALUES
            ('schema_version', '2', strftime('%s','now') * 1000),
            ('created_at',     strftime('%s','now') * 1000, strftime('%s','now') * 1000);
        ",
    ),
];

/// Run all pending migrations on an open connection.
/// Safe to call on every startup — already-applied migrations are skipped.
pub fn run_migrations(conn: &Connection) -> Result<()> {
    // Bootstrap: create the migrations table if it doesn't exist yet.
    // This is the only DDL we run outside a migration.
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT    NOT NULL UNIQUE,
            applied_at INTEGER NOT NULL
        ) STRICT;",
    )?;

    for (name, sql) in MIGRATIONS {
        let already_applied: bool = conn.query_row(
            "SELECT COUNT(*) > 0 FROM schema_migrations WHERE name = ?1",
            [name],
            |row| row.get(0),
        )?;

        if already_applied {
            continue;
        }

        // Run the migration SQL + record it, all in one transaction.
        conn.execute_batch(&format!(
            "BEGIN;
            {sql}
            INSERT INTO schema_migrations (name, applied_at)
                VALUES ('{name}', strftime('%s','now') * 1000);
            COMMIT;"
        ))?;
    }

    Ok(())
}

/// Configure connection pragmas. Call immediately after opening any connection.
///
/// These settings are per-connection, not persistent — they must be set
/// every time a connection is opened.
pub fn configure_connection(conn: &Connection) -> Result<()> {
    conn.execute_batch("
        -- WAL mode: writers don't block readers, readers don't block writers.
        -- Critical for a background tracker writing while CLI reads.
        PRAGMA journal_mode = WAL;

        -- NORMAL is safe with WAL and much faster than FULL.
        -- Data is durable after each WAL frame flush (every ~1000ms by default).
        PRAGMA synchronous = NORMAL;

        -- Catch bugs early.
        PRAGMA foreign_keys = ON;

        -- Keep temp tables in memory — we only use them for analytics queries.
        PRAGMA temp_store = MEMORY;

        -- 256MB memory-mapped I/O. Reduces syscall overhead on large scans.
        PRAGMA mmap_size = 268435456;

        -- 8MB page cache (negative = KiB). Fits most daily event sets in RAM.
        PRAGMA cache_size = -8000;

        -- Busy timeout: if another process holds a write lock, wait up to
        -- 5 seconds before returning SQLITE_BUSY. Prevents spurious errors
        -- when the CLI and tracker overlap briefly.
        PRAGMA busy_timeout = 5000;
    ")?;
    Ok(())
}