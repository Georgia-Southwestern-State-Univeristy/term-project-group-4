import { describe, it, expect } from 'vitest';
import {
  ValidationError,
  findMissingRequiredFields,
  validateAndNormalizeTripName,
  validateAndNormalizeDestinationType,
  validateDuration,
  validateChecklistShape,
} from '../server/tripValidators.js';

describe('findMissingRequiredFields', () => {
  it('returns empty when all required fields are present and non-blank', () => {
    expect(findMissingRequiredFields({ name: 'Trip', destinationType: 'beach', duration: 3 })).toEqual([]);
  });

  it('reports missing name when omitted', () => {
    expect(findMissingRequiredFields({ destinationType: 'beach', duration: 3 })).toEqual(['name']);
  });

  it('reports missing name when null', () => {
    expect(findMissingRequiredFields({ name: null, destinationType: 'beach', duration: 3 })).toEqual(['name']);
  });

  it('reports missing name when blank after trim', () => {
    expect(findMissingRequiredFields({ name: '   ', destinationType: 'beach', duration: 3 })).toEqual(['name']);
  });

  it('reports missing name when non-string', () => {
    expect(findMissingRequiredFields({ name: 123, destinationType: 'beach', duration: 3 })).toEqual(['name']);
  });

  it('reports missing duration when undefined', () => {
    expect(findMissingRequiredFields({ name: 'Trip', destinationType: 'beach' })).toEqual(['duration']);
  });

  it('reports missing duration when null', () => {
    expect(findMissingRequiredFields({ name: 'Trip', destinationType: 'beach', duration: null })).toEqual(['duration']);
  });

  it('reports multiple missing fields together', () => {
    expect(findMissingRequiredFields({ name: '   ' })).toEqual(['name', 'destinationType', 'duration']);
  });

  it('does not flag duration value 0 as missing (validateDuration handles range)', () => {
    expect(findMissingRequiredFields({ name: 'Trip', destinationType: 'beach', duration: 0 })).toEqual([]);
  });
});

describe('validateAndNormalizeTripName', () => {
  it('returns trimmed name on valid input', () => {
    expect(validateAndNormalizeTripName('  Beach Trip  ')).toBe('Beach Trip');
  });

  it('throws ValidationError for non-string input (number)', () => {
    expect(() => validateAndNormalizeTripName(123)).toThrowError(ValidationError);
    expect(() => validateAndNormalizeTripName(123)).toThrow('name must be a string');
  });

  it('throws ValidationError for non-string input (null)', () => {
    expect(() => validateAndNormalizeTripName(null)).toThrowError(ValidationError);
    expect(() => validateAndNormalizeTripName(null)).toThrow('name must be a string');
  });

  it('throws ValidationError for non-string input (object)', () => {
    expect(() => validateAndNormalizeTripName({ malicious: true })).toThrowError('name must be a string');
  });

  it('throws ValidationError for blank string', () => {
    expect(() => validateAndNormalizeTripName('   ')).toThrowError('name must not be blank');
  });
});

describe('validateAndNormalizeDestinationType', () => {
  it('returns trimmed value on valid input', () => {
    expect(validateAndNormalizeDestinationType('  beach  ')).toBe('beach');
  });

  it('throws ValidationError for non-string input', () => {
    expect(() => validateAndNormalizeDestinationType(42)).toThrow('destinationType must be a string');
  });

  it('throws ValidationError for blank string', () => {
    expect(() => validateAndNormalizeDestinationType('   ')).toThrow('destinationType must not be blank');
  });
});

describe('validateDuration', () => {
  it('returns the value on positive integer', () => {
    expect(validateDuration(3)).toBe(3);
  });

  it('throws ValidationError for zero', () => {
    expect(() => validateDuration(0)).toThrow('duration must be a positive integer');
  });

  it('throws ValidationError for negative integer', () => {
    expect(() => validateDuration(-1)).toThrow('duration must be a positive integer');
  });

  it('throws ValidationError for non-integer (float)', () => {
    expect(() => validateDuration(1.5)).toThrow('duration must be a positive integer');
  });

  it('throws ValidationError for non-number string', () => {
    expect(() => validateDuration('3')).toThrow('duration must be a positive integer');
  });

  it('throws ValidationError for null', () => {
    expect(() => validateDuration(null)).toThrow('duration must be a positive integer');
  });
});

describe('validateChecklistShape', () => {
  const validItem = { id: 'a', name: 'Sunscreen', category: 'Essentials', packed: false };

  it('passes for valid checklist', () => {
    expect(() => validateChecklistShape([validItem])).not.toThrow();
  });

  it('passes for empty array', () => {
    expect(() => validateChecklistShape([])).not.toThrow();
  });

  it('throws when item missing id', () => {
    const item = { ...validItem };
    delete item.id;
    expect(() => validateChecklistShape([item])).toThrow(/id.*string/);
  });

  it('throws when id is not a string', () => {
    expect(() => validateChecklistShape([{ ...validItem, id: 1 }])).toThrow(/id.*string/);
  });

  it('throws when item missing name', () => {
    const item = { ...validItem };
    delete item.name;
    expect(() => validateChecklistShape([item])).toThrow(/name.*string/);
  });

  it('throws when item missing category', () => {
    const item = { ...validItem };
    delete item.category;
    expect(() => validateChecklistShape([item])).toThrow(/category.*string/);
  });

  it('throws when item missing packed', () => {
    const item = { ...validItem };
    delete item.packed;
    expect(() => validateChecklistShape([item])).toThrow(/packed.*boolean/);
  });

  it('throws when packed is not a boolean', () => {
    expect(() => validateChecklistShape([{ ...validItem, packed: 'yes' }])).toThrow(/packed.*boolean/);
  });
});
