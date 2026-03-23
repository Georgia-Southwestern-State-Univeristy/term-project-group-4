/**
 * Seed the database with the same 3 demo trips from scripts/seed.js.
 */
export async function seed(knex) {
  // Clear existing data (checklist_items first due to FK)
  await knex('checklist_items').del();
  await knex('trips').del();
  await knex('users').del();

  const now = new Date().toISOString();

  // Create a demo user
  const demoUserId = 'demo-user-123';
  await knex('users').insert({
    id: demoUserId,
    google_id: 'demo-google-id',
    email: 'demo@example.com',
    name: 'Demo User',
    picture: null,
    created_at: now,
  });

  const trips = [
    {
      id: 'trip-001',
      name: 'Summer Beach Vacation - Hawaii',
      destination_type: 'beach',
      duration: 5,
      user_id: demoUserId,
      created_at: now,
    },
    {
      id: 'trip-002',
      name: 'Weekend Hiking Adventure - Rocky Mountains',
      destination_type: 'outdoors',
      duration: 3,
      user_id: demoUserId,
      created_at: now,
    },
    {
      id: 'trip-003',
      name: 'City Exploration - New York Week',
      destination_type: 'city',
      duration: 7,
      user_id: demoUserId,
      created_at: now,
    },
  ];

  await knex('trips').insert(trips);

  const items = [
    // Trip 001 — Beach
    ...makeItems('trip-001', [
      ['Toothbrush', 'Essentials'],
      ['Phone charger', 'Essentials'],
      ['Medications', 'Essentials'],
      ['ID / Wallet', 'Essentials'],
      ['T-shirts / tops (5)', 'Clothing'],
      ['Underwear (5)', 'Clothing'],
      ['Socks (5)', 'Clothing'],
      ['Pants / shorts (2-3)', 'Clothing'],
      ['Pajamas', 'Clothing'],
      ['Swimsuit', 'Beach'],
      ['Sunscreen', 'Beach'],
      ['Sunglasses', 'Beach'],
      ['Towel', 'Beach'],
      ['Flip-flops', 'Beach'],
    ]),
    // Trip 002 — Outdoors
    ...makeItems('trip-002', [
      ['Toothbrush', 'Essentials'],
      ['Phone charger', 'Essentials'],
      ['Medications', 'Essentials'],
      ['ID / Wallet', 'Essentials'],
      ['T-shirts / tops (3)', 'Clothing'],
      ['Underwear (3)', 'Clothing'],
      ['Socks (3)', 'Clothing'],
      ['Pants / shorts (2-3)', 'Clothing'],
      ['Pajamas', 'Clothing'],
      ['Hiking boots', 'Outdoors'],
      ['Rain jacket', 'Outdoors'],
      ['Flashlight / headlamp', 'Outdoors'],
      ['Water bottle', 'Outdoors'],
      ['Insect repellent', 'Outdoors'],
    ]),
    // Trip 003 — City
    ...makeItems('trip-003', [
      ['Toothbrush', 'Essentials'],
      ['Phone charger', 'Essentials'],
      ['Medications', 'Essentials'],
      ['ID / Wallet', 'Essentials'],
      ['T-shirts / tops (7)', 'Clothing'],
      ['Underwear (7)', 'Clothing'],
      ['Socks (7)', 'Clothing'],
      ['Pants / shorts (2-3)', 'Clothing'],
      ['Pajamas', 'Clothing'],
      ['Comfortable walking shoes', 'City'],
      ['Day bag / backpack', 'City'],
      ['Umbrella', 'City'],
      ['Laundry bag', 'Extended Trip'],
      ['Travel-size detergent', 'Extended Trip'],
    ]),
  ];

  await knex('checklist_items').insert(items);
}

function makeItems(tripId, pairs) {
  return pairs.map(([name, category], i) => ({
    id: `item-${i}`,
    trip_id: tripId,
    name,
    category,
    packed: false,
    sort_order: i,
  }));
}
