/**
 * Compatibility migration for older local databases created before the users
 * table existed. Fresh databases created from migration 001 already include
 * users, so this migration safely no-ops in that case.
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable('users');
  if (exists) return;

  await knex.schema.createTable('users', (table) => {
    table.text('id').primary();
    table.text('google_id').notNullable().unique();
    table.text('email').notNullable();
    table.text('name').notNullable();
    table.text('picture');
    table.text('created_at').notNullable();
  });
}

export async function down(knex) {
  const exists = await knex.schema.hasTable('users');
  if (!exists) return;

  await knex.schema.dropTable('users');
}