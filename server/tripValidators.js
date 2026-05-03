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
 * to a 400 response. The `kind` property on `ValidationError` lets routes
 * distinguish checklist-shape errors (which return `{error, message}`) from
 * field-level errors (which return `{error}` only) without depending on
 * message-text string matching.
 */

export const MAX_TRIP_NAME_LENGTH = 100;
export const MAX_DESTINATION_TYPE_LENGTH = 50;

export class ValidationError extends Error {
  /**
   * @param {string} message
   * @param {'field' | 'checklist'} [kind] — discriminator for the route to choose response shape.
   */
  constructor(message, kind = 'field') {
    super(message);
    this.name = 'ValidationError';
    this.kind = kind;
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
 * @throws {ValidationError} if value is not a string, trims to blank, or exceeds the max length
 */
export function validateAndNormalizeTripName(value) {
  if (typeof value !== 'string') {
    throw new ValidationError('name must be a string');
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ValidationError('name must not be blank');
  }
  if (trimmed.length > MAX_TRIP_NAME_LENGTH) {
    throw new ValidationError(`name must be ${MAX_TRIP_NAME_LENGTH} characters or fewer`);
  }
  return trimmed;
}

/**
 * Validates and normalizes a destinationType field that has already been
 * confirmed present.
 *
 * @param {unknown} value
 * @returns {string} the trimmed destinationType
 * @throws {ValidationError} if value is not a string, trims to blank, or exceeds the max length
 */
export function validateAndNormalizeDestinationType(value) {
  if (typeof value !== 'string') {
    throw new ValidationError('destinationType must be a string');
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ValidationError('destinationType must not be blank');
  }
  if (trimmed.length > MAX_DESTINATION_TYPE_LENGTH) {
    throw new ValidationError(`destinationType must be ${MAX_DESTINATION_TYPE_LENGTH} characters or fewer`);
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
 * Validates the shape of a checklist payload. Each item must be a non-null
 * object with string `id`, `name`, `category`, and boolean `packed`.
 *
 * Caller should check `Array.isArray(checklist)` before calling.
 *
 * @param {Array<unknown>} checklist
 * @throws {ValidationError} on the first malformed item, with `kind = 'checklist'`
 */
export function validateChecklistShape(checklist) {
  for (const item of checklist) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      throw new ValidationError('Each checklist item must be an object', 'checklist');
    }
    if (!Object.prototype.hasOwnProperty.call(item, 'id') || typeof item.id !== 'string') {
      throw new ValidationError('Each checklist item must have an "id" string field', 'checklist');
    }
    if (!Object.prototype.hasOwnProperty.call(item, 'name') || typeof item.name !== 'string') {
      throw new ValidationError('Each checklist item must have a "name" string field', 'checklist');
    }
    if (!Object.prototype.hasOwnProperty.call(item, 'category') || typeof item.category !== 'string') {
      throw new ValidationError('Each checklist item must have a "category" string field', 'checklist');
    }
    if (!Object.prototype.hasOwnProperty.call(item, 'packed') || typeof item.packed !== 'boolean') {
      throw new ValidationError('Each checklist item must have a "packed" boolean field', 'checklist');
    }
  }
}
