/**
 * Knex configuration — SQLite for local development and Beta production hosting.
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
  production: {
    client: 'better-sqlite3',
    connection: {
      filename: process.env.SQLITE_PATH || '/data/trips.db',
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
};
