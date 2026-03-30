/**
 * Backfill compatibility migration for older local databases created before
 * trip ownership was added. Fresh databases created from migration 001 already
 * include trips.user_id, so this migration safely no-ops in that case.
 */
export async function up(knex) {
  const hasColumn = await knex.schema.hasColumn('trips', 'user_id');
  if (hasColumn) return;

  await knex.schema.alterTable('trips', (table) => {
    table.text('user_id').notNullable().defaultTo('seed-user').index();
  });
}

export async function down(knex) {
  const hasColumn = await knex.schema.hasColumn('trips', 'user_id');
  if (!hasColumn) return;

  await knex.schema.alterTable('trips', (table) => {
    table.dropColumn('user_id');
  });
}