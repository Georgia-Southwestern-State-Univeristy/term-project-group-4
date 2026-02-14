/**
 * Generates a packing checklist based on trip parameters.
 * @param {{ destinationType: string, duration: number }} tripParams
 * @returns {Array<{ id: string, name: string, category: string, packed: boolean }>}
 */
export function generateChecklist({ destinationType, duration }) {
  const items = [];
  let id = 0;

  const addItem = (name, category) => {
    items.push({ id: `item-${id++}`, name, category, packed: false });
  };

  // Essentials - always included
  addItem('Toothbrush', 'Essentials');
  addItem('Phone charger', 'Essentials');
  addItem('Medications', 'Essentials');
  addItem('ID / Wallet', 'Essentials');

  // Clothing - quantity scales with duration
  const numOutfits = Math.min(duration, 7);
  addItem(`T-shirts / tops (${numOutfits})`, 'Clothing');
  addItem(`Underwear (${numOutfits})`, 'Clothing');
  addItem(`Socks (${numOutfits})`, 'Clothing');
  addItem('Pants / shorts (2-3)', 'Clothing');
  addItem('Pajamas', 'Clothing');

  // Destination-specific items
  if (destinationType === 'beach') {
    addItem('Swimsuit', 'Beach');
    addItem('Sunscreen', 'Beach');
    addItem('Sunglasses', 'Beach');
    addItem('Towel', 'Beach');
    addItem('Flip-flops', 'Beach');
  }

  if (destinationType === 'outdoors') {
    addItem('Hiking boots', 'Outdoors');
    addItem('Rain jacket', 'Outdoors');
    addItem('Flashlight / headlamp', 'Outdoors');
    addItem('Water bottle', 'Outdoors');
    addItem('Insect repellent', 'Outdoors');
  }

  if (destinationType === 'city') {
    addItem('Comfortable walking shoes', 'City');
    addItem('Day bag / backpack', 'City');
    addItem('Umbrella', 'City');
  }

  // Long trip extras
  if (duration > 5) {
    addItem('Laundry bag', 'Extended Trip');
    addItem('Travel-size detergent', 'Extended Trip');
  }

  return items;
}
