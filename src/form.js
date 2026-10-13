// ---------------------------------------------------------------------------
// DOM layer. Builds the form from a config object and wires up live validation.
// All the actual checking is delegated to validator.js.
// ---------------------------------------------------------------------------
import { validateField, validateForm } from "./validator.js";

/** Creates a labelled input + empty error element for one field. */
function buildField(name, field) {
  const wrapper = document.createElement("div");
  wrapper.className = "field";

  const label = document.createElement("label");
  label.htmlFor = name;
  label.textContent = field.label;
  if (field.rules.required) {
    const star = document.createElement("span");
    star.className = "req";
    star.textContent = " *";
    label.appendChild(star);
  }

  const input = document.createElement("input");
  input.id = name;
  input.name = name;
  input.type = field.type || "text";
  input.placeholder = field.placeholder || "";
  input.autocomplete = field.autocomplete || "off";
  input.setAttribute("aria-describedby", `${name}-error`);

  // Password fields get a show/hide toggle.
  let control = input;
  if (field.type === "password") {
    control = document.createElement("div");
    control.className = "password-wrap";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "toggle";
    toggle.textContent = "Show";
    toggle.addEventListener("click", () => {
      const hidden = input.type === "password";
      input.type = hidden ? "text" : "password";
      toggle.textContent = hidden ? "Hide" : "Show";
    });
    control.append(input, toggle);
  }

  const error = document.createElement("p");
  error.className = "error";
  error.id = `${name}-error`;
  error.setAttribute("role", "alert");

  wrapper.append(label, control, error);
  return { wrapper, input, error };
}

/**
 * Builds the form inside `container`.
 * @param {HTMLElement} container where to render
 * @param {Object} config field config (see config.js)
 * @param {Function} onValid called with the values when the form passes validation
 */
export function createForm(container, config, onValid) {
  const form = document.createElement("form");
  form.noValidate = true; // we show our own messages instead of the browser's
  const parts = {}; // name -> { input, error }

  for (const [name, field] of Object.entries(config)) {
    const part = buildField(name, field);
    parts[name] = part;
    form.appendChild(part.wrapper);
  }

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "submit";
  submit.textContent = "Create account";
  form.appendChild(submit);
  container.appendChild(form);

  const values = () => Object.fromEntries(Object.entries(parts).map(([n, p]) => [n, p.input.value]));

  /** Shows or clears the error under one field. */
  function show(name, message) {
    const { input, error, wrapper } = parts[name];
    error.textContent = message || "";
    input.classList.toggle("invalid", Boolean(message));
    input.classList.toggle("valid", !message && input.value !== "");
    input.setAttribute("aria-invalid", message ? "true" : "false");
    wrapper.classList.toggle("has-error", Boolean(message));
  }

  const touched = new Set(); // only show errors for fields the user has visited

  for (const [name, { input }] of Object.entries(parts)) {
    // Validate when leaving a field...
    input.addEventListener("blur", () => {
      touched.add(name);
      show(name, validateField(input.value, config[name].rules, values()));
    });
    // ...and live while typing, once the field has been touched.
    input.addEventListener("input", () => {
      if (touched.has(name)) show(name, validateField(input.value, config[name].rules, values()));
      // If the password changes, re-check the confirm field that depends on it.
      for (const [other, cfg] of Object.entries(config)) {
        const dependsOn = cfg.rules.matches && (cfg.rules.matches.field || cfg.rules.matches) === name;
        if (dependsOn && touched.has(other)) {
          show(other, validateField(parts[other].input.value, cfg.rules, values()));
        }
      }
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // no page reload
    const result = validateForm(values(), config);
    Object.keys(config).forEach((name) => {
      touched.add(name);
      show(name, result.errors[name]);
    });
    if (result.valid) {
      onValid(values());
      form.reset();
      touched.clear();
      Object.keys(config).forEach((name) => show(name, ""));
      Object.values(parts).forEach((p) => p.input.classList.remove("valid"));
    } else {
      parts[Object.keys(result.errors)[0]].input.focus(); // jump to the first problem
    }
  });

  return form;
}
