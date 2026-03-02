import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');
const FILE = path.join(DATA_DIR, 'trips.json');

const seedData = {
  trips: [
    {
      id: 'trip-001',
      name: 'Summer Beach Vacation - Hawaii',
      destinationType: 'beach',
      duration: 5,
      checklist: [
        {
          id: 'item-0',
          name: 'Toothbrush',
          category: 'Essentials',
          packed: false
        },
        {
          id: 'item-1',
          name: 'Phone charger',
          category: 'Essentials',
          packed: false
        },
        {
          id: 'item-2',
          name: 'Medications',
          category: 'Essentials',
          packed: false
        },
        {
          id: 'item-3',
          name: 'ID / Wallet',
          category: 'Essentials',
          packed: false
        },
        {
          id: 'item-4',
          name: 'T-shirts / tops (5)',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-5',
          name: 'Underwear (5)',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-6',
          name: 'Socks (5)',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-7',
          name: 'Pants / shorts (2-3)',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-8',
          name: 'Pajamas',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-9',
          name: 'Swimsuit',
          category: 'Beach',
          packed: false
        },
        {
          id: 'item-10',
          name: 'Sunscreen',
          category: 'Beach',
          packed: false
        },
        {
          id: 'item-11',
          name: 'Sunglasses',
          category: 'Beach',
          packed: false
        },
        {
          id: 'item-12',
          name: 'Towel',
          category: 'Beach',
          packed: false
        },
        {
          id: 'item-13',
          name: 'Flip-flops',
          category: 'Beach',
          packed: false
        }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'trip-002',
      name: 'Weekend Hiking Adventure - Rocky Mountains',
      destinationType: 'outdoors',
      duration: 3,
      checklist: [
        {
          id: 'item-0',
          name: 'Toothbrush',
          category: 'Essentials',
          packed: false
        },
        {
          id: 'item-1',
          name: 'Phone charger',
          category: 'Essentials',
          packed: false
        },
        {
          id: 'item-2',
          name: 'Medications',
          category: 'Essentials',
          packed: false
        },
        {
          id: 'item-3',
          name: 'ID / Wallet',
          category: 'Essentials',
          packed: false
        },
        {
          id: 'item-4',
          name: 'T-shirts / tops (3)',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-5',
          name: 'Underwear (3)',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-6',
          name: 'Socks (3)',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-7',
          name: 'Pants / shorts (2-3)',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-8',
          name: 'Pajamas',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-9',
          name: 'Hiking boots',
          category: 'Outdoors',
          packed: false
        },
        {
          id: 'item-10',
          name: 'Rain jacket',
          category: 'Outdoors',
          packed: false
        },
        {
          id: 'item-11',
          name: 'Flashlight / headlamp',
          category: 'Outdoors',
          packed: false
        },
        {
          id: 'item-12',
          name: 'Water bottle',
          category: 'Outdoors',
          packed: false
        },
        {
          id: 'item-13',
          name: 'Insect repellent',
          category: 'Outdoors',
          packed: false
        }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'trip-003',
      name: 'City Exploration - New York Week',
      destinationType: 'city',
      duration: 7,
      checklist: [
        {
          id: 'item-0',
          name: 'Toothbrush',
          category: 'Essentials',
          packed: false
        },
        {
          id: 'item-1',
          name: 'Phone charger',
          category: 'Essentials',
          packed: false
        },
        {
          id: 'item-2',
          name: 'Medications',
          category: 'Essentials',
          packed: false
        },
        {
          id: 'item-3',
          name: 'ID / Wallet',
          category: 'Essentials',
          packed: false
        },
        {
          id: 'item-4',
          name: 'T-shirts / tops (7)',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-5',
          name: 'Underwear (7)',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-6',
          name: 'Socks (7)',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-7',
          name: 'Pants / shorts (2-3)',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-8',
          name: 'Pajamas',
          category: 'Clothing',
          packed: false
        },
        {
          id: 'item-9',
          name: 'Comfortable walking shoes',
          category: 'City',
          packed: false
        },
        {
          id: 'item-10',
          name: 'Day bag / backpack',
          category: 'City',
          packed: false
        },
        {
          id: 'item-11',
          name: 'Umbrella',
          category: 'City',
          packed: false
        },
        {
          id: 'item-12',
          name: 'Laundry bag',
          category: 'Extended Trip',
          packed: false
        },
        {
          id: 'item-13',
          name: 'Travel-size detergent',
          category: 'Extended Trip',
          packed: false
        }
      ],
      createdAt: new Date().toISOString()
    }
  ]
};

async function seed() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Write seed data to trips.json
    await fs.writeFile(FILE, JSON.stringify(seedData, null, 2), 'utf8');

    console.log('✓ Seed data created successfully at data/trips.json');
    console.log(`✓ Created ${seedData.trips.length} sample trips with checklists`);
  } catch (error) {
    console.error('✗ Error seeding database:', error.message);
    process.exit(1);
  }
}

seed();
