import { describe, it, expect } from 'vitest';
import { generateChecklist } from '../src/checklistGenerator.js';

describe('generateChecklist', () => {
  it('always includes essential items regardless of destination', () => {
    const result = generateChecklist({ destinationType: 'city', duration: 3 });
    const names = result.map((item) => item.name);
    expect(names).toContain('Toothbrush');
    expect(names).toContain('Phone charger');
    expect(names).toContain('ID / Wallet');
  });

  it('includes beach-specific items for beach destination', () => {
    const result = generateChecklist({ destinationType: 'beach', duration: 5 });
    const names = result.map((item) => item.name);
    expect(names).toContain('Swimsuit');
    expect(names).toContain('Sunscreen');
  });

  it('includes outdoors-specific items for outdoors destination', () => {
    const result = generateChecklist({ destinationType: 'outdoors', duration: 3 });
    const names = result.map((item) => item.name);
    expect(names).toContain('Hiking boots');
    expect(names).toContain('Rain jacket');
  });

  it('does not include beach items for city destination', () => {
    const result = generateChecklist({ destinationType: 'city', duration: 3 });
    const names = result.map((item) => item.name);
    expect(names).not.toContain('Swimsuit');
    expect(names).not.toContain('Sunscreen');
  });

  it('scales clothing quantity with duration', () => {
    const short = generateChecklist({ destinationType: 'city', duration: 2 });
    const long = generateChecklist({ destinationType: 'city', duration: 7 });
    const getOutfitCount = (list) => {
      const item = list.find((i) => i.name.startsWith('T-shirts'));
      const match = item.name.match(/\((\d+)\)/);
      return parseInt(match[1], 10);
    };
    expect(getOutfitCount(short)).toBe(2);
    expect(getOutfitCount(long)).toBe(7);
  });

  it('adds extended trip items for trips longer than 5 days', () => {
    const short = generateChecklist({ destinationType: 'city', duration: 3 });
    const long = generateChecklist({ destinationType: 'city', duration: 7 });
    const shortNames = short.map((i) => i.name);
    const longNames = long.map((i) => i.name);
    expect(shortNames).not.toContain('Laundry bag');
    expect(longNames).toContain('Laundry bag');
  });

  it('returns items with correct structure', () => {
    const result = generateChecklist({ destinationType: 'beach', duration: 3 });
    for (const item of result) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('packed', false);
    }
  });
});
