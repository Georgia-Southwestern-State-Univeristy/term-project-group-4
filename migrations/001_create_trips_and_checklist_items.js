/**
 * Baseline schema for the authenticated multi-user version of the app.
 * Creates users, trips, and checklist_items tables for fresh databases.
 */
export function up(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.text('id').primary();
      table.text('google_id').unique().notNullable();
      table.text('email').notNullable();
      table.text('name').notNullable();
      table.text('picture').nullable();
      table.text('created_at').notNullable();
    })
    .createTable('trips', (table) => {
      table.text('id').primary();
      table.text('name').notNullable();
      table.text('destination_type').notNullable();
      table.integer('duration').notNullable();
      table.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.text('created_at').notNullable();
    })
    .createTable('checklist_items', (table) => {
      table.text('id').notNullable();
      table.text('trip_id').notNullable().references('id').inTable('trips').onDelete('CASCADE');
      table.text('name').notNullable();
      table.text('category').notNullable();
      table.boolean('packed').notNullable().defaultTo(false);
      table.integer('sort_order').notNullable().defaultTo(0);
      table.primary(['trip_id', 'id']);
    });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('checklist_items').dropTableIfExists('trips').dropTableIfExists('users');
}
