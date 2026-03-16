/**
 * Create the trips and checklist_items tables.
 * Schema is portable across SQLite and PostgreSQL.
 */
export function up(knex) {
  return knex.schema
    .createTable('trips', (table) => {
      table.text('id').primary();
      table.text('name').notNullable();
      table.text('destination_type').notNullable();
      table.integer('duration').notNullable();
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
  return knex.schema.dropTableIfExists('checklist_items').dropTableIfExists('trips');
}
