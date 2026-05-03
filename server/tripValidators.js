/**
 * Shared validators for trip-payload fields.
 *
 * Used by `POST /api/saveTrip` and `PUT /api/trips/:tripId` to keep validation
 * logic in one place (issue #129) and to add type guards before `.trim()` so
 * non-string inputs return 400 instead of throwing 500 (deferred Copilot review
 * item from PR #67).
 *
 * Each validator throws `ValidationError` on a problem and returns the
 * normalized value on success. Routes catch `ValidationError` and translate it
 * to a 400 response.
 */

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Returns the trimmed string for `value` if it is a non-empty string, or
 * `undefined` otherwise. Used by `findMissingRequiredFields` to detect "not
 * provided / not a string / blank after trim" as a single missing case.
 *
 * @param {unknown} value
 * @returns {string | undefined}
 */
function safeTrim(value) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

/**
 * Detects which required string fields on a create-trip payload are missing.
 *
 * For `POST /api/saveTrip`, these fields are required: `name`, `destinationType`,
 * `duration`. The string fields are considered missing if absent, non-string,
 * or blank after trim — matching the pre-refactor "Missing required fields"
 * combined-error UX.
 *
 * @param {object} payload — the request body
 * @returns {string[]} field names that are missing; empty array means all present
 */
export function findMissingRequiredFields(payload) {
  const missing = [];
  if (safeTrim(payload.name) === undefined) missing.push('name');
  if (safeTrim(payload.destinationType) === undefined) missing.push('destinationType');
  if (payload.duration === undefined || payload.duration === null) missing.push('duration');
  return missing;
}

/**
 * Validates and normalizes a trip name field that has already been confirmed
 * present (use `findMissingRequiredFields` for required-field detection on POST).
 *
 * On PUT, callers should only invoke this when `name !== undefined`.
 *
 * @param {unknown} value
 * @returns {string} the trimmed name
 * @throws {ValidationError} if value is not a string or trims to blank
 */
export function validateAndNormalizeTripName(value) {
  if (typeof value !== 'string') {
    throw new ValidationError('name must be a string');
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ValidationError('name must not be blank');
  }
  return trimmed;
}

/**
 * Validates and normalizes a destinationType field that has already been
 * confirmed present.
 *
 * @param {unknown} value
 * @returns {string} the trimmed destinationType
 * @throws {ValidationError} if value is not a string or trims to blank
 */
export function validateAndNormalizeDestinationType(value) {
  if (typeof value !== 'string') {
    throw new ValidationError('destinationType must be a string');
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ValidationError('destinationType must not be blank');
  }
  return trimmed;
}

/**
 * Validates that duration is a positive integer.
 *
 * @param {unknown} value
 * @returns {number} the validated duration
 * @throws {ValidationError} if not a positive integer
 */
export function validateDuration(value) {
  if (!Number.isInteger(value) || value < 1) {
    throw new ValidationError('duration must be a positive integer');
  }
  return value;
}

/**
 * Validates the shape of a checklist payload. Each item must have
 * string `id`, `name`, `category`, and boolean `packed`.
 *
 * Caller should check `Array.isArray(checklist)` before calling.
 *
 * @param {Array<object>} checklist
 * @throws {ValidationError} on the first malformed item
 */
export function validateChecklistShape(checklist) {
  for (const item of checklist) {
    if (!Object.prototype.hasOwnProperty.call(item, 'id') || typeof item.id !== 'string') {
      throw new ValidationError('Each checklist item must have an "id" string field');
    }
    if (!Object.prototype.hasOwnProperty.call(item, 'name') || typeof item.name !== 'string') {
      throw new ValidationError('Each checklist item must have a "name" string field');
    }
    if (!Object.prototype.hasOwnProperty.call(item, 'category') || typeof item.category !== 'string') {
      throw new ValidationError('Each checklist item must have a "category" string field');
    }
    if (!Object.prototype.hasOwnProperty.call(item, 'packed') || typeof item.packed !== 'boolean') {
      throw new ValidationError('Each checklist item must have a "packed" boolean field');
    }
  }
}
