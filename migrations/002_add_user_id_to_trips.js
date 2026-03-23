/**
 * Add user ownership to trips.
 * Existing rows are backfilled with a placeholder owner so the migration
 * can run safely on local/dev databases that already contain trips.
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