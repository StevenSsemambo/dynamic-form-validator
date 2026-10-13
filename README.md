# Dynamic Form Validator

A modular, config-driven form validation system in plain JavaScript (ES modules, no framework, no build step).
The form itself is **generated from a config object**, and the same object drives validation.

## Video walkthrough

**Video URL:** `PASTE_YOUR_PUBLIC_VIDEO_LINK_HERE`

## Run it

```bash
npm start          # serves the folder (any static server works, e.g. VS Code Live Server)
npm test           # 10 unit tests for the validation engine (Node 18+)
```

ES modules need to be served over HTTP, so opening `index.html` by double-click will not work. Use `npm start` or Live Server.

## Architecture

| File | Responsibility |
|---|---|
| `src/validator.js` | Pure validation engine. No DOM. `validateField` and `validateForm` |
| `src/config.js` | The only file you edit to change the form: fields, labels, rules, messages |
| `src/form.js` | DOM layer: builds inputs from config, shows errors, live validation, submit handling |
| `src/main.js` | Wires config + form together |
| `test/validator.test.js` | Unit tests for every rule |

## Supported rules

```js
rules: {
  required:  true | "custom message",
  minLength: 8 | { value: 8, message: "..." },
  maxLength: 20 | { value: 20, message: "..." },
  pattern:   /regex/ | { regex, message } | [ { regex, message }, ... ],  // list = one message per requirement
  matches:   "otherField" | { field, message },                           // e.g. confirm password
  custom:    (value, allValues) => "error message" | null,
}
```

Rules run in the order above and stop at the first failure, so the user sees one clear message at a time.
Optional (non-required) empty fields skip all other rules.

## Behaviour

- Errors appear **without page reload** (`preventDefault` on submit).
- Validates on blur, then live while typing once a field has been visited.
- The password rule is a list of regexes (lowercase, uppercase, number, symbol), each with its own message, so the user knows exactly what is missing.
- Changing the password re-validates the confirm field automatically.
- On submit with errors, every field shows its error and focus jumps to the first invalid one.
- Accessible: labels, `aria-describedby`, `role="alert"`, `aria-invalid`. Responsive, dark mode, show/hide password.

## Add a new field

Add one entry to `src/config.js`. No other file changes:

```js
age: { label: "Age", type: "number", rules: { required: true, pattern: { regex: /^\d{1,3}$/, message: "Enter a valid age." } } },
```

Phone numbers accept international (`+256700123456`) or local Ugandan (`0700123456`) format.
