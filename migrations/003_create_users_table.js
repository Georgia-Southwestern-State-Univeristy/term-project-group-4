/**
 * Create the users table for Google-authenticated users.
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
  });
}

export async function down(knex) {
  const exists = await knex.schema.hasTable('users');
  if (!exists) return;

  await knex.schema.dropTable('users');
}