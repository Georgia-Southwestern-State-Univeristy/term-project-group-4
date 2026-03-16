import { mkdirSync } from 'fs';

// Ensure the data/ directory exists so SQLite can create the DB file
mkdirSync('./data', { recursive: true });

/**
 * Knex configuration — SQLite for local development, PostgreSQL for production.
 * @see https://knexjs.org/guide/#configuration-options
 */
export default {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: './data/trips.db',
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
    pool: {
      afterCreate(conn, done) {
        conn.pragma('journal_mode = WAL');
        conn.pragma('foreign_keys = ON');
        done();
      },
    },
  },

  test: {
    client: 'better-sqlite3',
    connection: {
      filename: ':memory:',
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
    pool: {
      min: 1,
      max: 1,
      afterCreate(conn, done) {
        conn.pragma('foreign_keys = ON');
        done();
      },
    },
  },

  // PostgreSQL for production — requires `npm install pg` before use.
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};
