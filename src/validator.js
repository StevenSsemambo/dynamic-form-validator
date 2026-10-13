// ---------------------------------------------------------------------------
// Pure validation engine. No DOM code here, so it is easy to test and reuse.
//
// A "rules" object describes one field. Supported rules:
//   required   : true | "custom message"
//   minLength  : number | { value, message }
//   maxLength  : number | { value, message }
//   pattern    : RegExp | { regex, message } | [ { regex, message }, ... ]
//   matches    : "otherFieldName" | { field, message }   (e.g. confirm password)
//   custom     : (value, allValues) => string | null      (your own function)
//
// Validation stops at the first failing rule, so the user sees one clear error.
// ---------------------------------------------------------------------------

/** Normalises "5" or { value: 5, message: "..." } into { value, message }. */
function normalise(rule, defaultMessage) {
  if (rule !== null && typeof rule === "object" && !(rule instanceof RegExp) && !Array.isArray(rule)) {
    return { ...rule, message: rule.message || defaultMessage };
  }
  return { value: rule, message: defaultMessage };
}

const isEmpty = (v) => v === undefined || v === null || String(v).trim() === "";

/**
 * Validate one value against one rules object.
 * @returns {string|null} the first error message, or null if valid.
 */
export function validateField(value, rules = {}, allValues = {}) {
  const text = value === undefined || value === null ? "" : String(value);

  if (rules.required) {
    const message = typeof rules.required === "string" ? rules.required : "This field is required.";
    if (isEmpty(text)) return message;
  }

  // Optional empty fields skip the remaining rules.
  if (isEmpty(text)) return null;

  if (rules.minLength !== undefined) {
    const { value: min, message } = normalise(rules.minLength, `Must be at least ${rules.minLength?.value ?? rules.minLength} characters.`);
    if (text.length < min) return message;
  }

  if (rules.maxLength !== undefined) {
    const { value: max, message } = normalise(rules.maxLength, `Must be at most ${rules.maxLength?.value ?? rules.maxLength} characters.`);
    if (text.length > max) return message;
  }

  if (rules.pattern) {
    const list = Array.isArray(rules.pattern) ? rules.pattern : [rules.pattern];
    for (const item of list) {
      const { regex, message } = item instanceof RegExp ? { regex: item, message: "Invalid format." } : item;
      regex.lastIndex = 0; // protects against /g regexes keeping state between calls
      if (!regex.test(text)) return message || "Invalid format.";
    }
  }

  if (rules.matches) {
    const { field, message } =
      typeof rules.matches === "string" ? { field: rules.matches, message: "Values do not match." } : rules.matches;
    if (text !== (allValues[field] ?? "")) return message || "Values do not match.";
  }

  if (typeof rules.custom === "function") {
    const result = rules.custom(text, allValues);
    if (result) return result;
  }

  return null;
}

/**
 * Validate a whole form.
 * @param {Object} values  { fieldName: value }
 * @param {Object} config  { fieldName: rules }
 * @returns {{ valid: boolean, errors: Object }} errors maps fieldName -> message
 */
export function validateForm(values, config) {
  const errors = {};
  for (const name of Object.keys(config)) {
    const error = validateField(values[name], config[name].rules, values);
    if (error) errors[name] = error;
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
