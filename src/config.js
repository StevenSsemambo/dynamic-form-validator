// ---------------------------------------------------------------------------
// The ONLY file you edit to change the form. Each key is a field; the form is
// generated from this object, and validation uses the same object.
// ---------------------------------------------------------------------------
export const formConfig = {
  fullName: {
    label: "Full name",
    type: "text",
    placeholder: "Jane Doe",
    autocomplete: "name",
    rules: {
      required: "Please enter your full name.",
      minLength: { value: 3, message: "Name must be at least 3 characters." },
      pattern: { regex: /^[A-Za-z][A-Za-z .'-]*$/, message: "Name can contain letters, spaces, . ' and - only." },
    },
  },

  email: {
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    autocomplete: "email",
    rules: {
      required: "Email is required.",
      pattern: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message: "Enter a valid email like name@example.com." },
    },
  },

  phone: {
    label: "Phone number",
    type: "tel",
    placeholder: "+256700123456 or 0700123456",
    autocomplete: "tel",
    rules: {
      required: "Phone number is required.",
      // International (+ then 10-14 digits) or local Ugandan (07XXXXXXXX).
      pattern: {
        regex: /^(\+\d{10,14}|07\d{8})$/,
        message: "Use +256700123456 or 0700123456 (no spaces).",
      },
    },
  },

  password: {
    label: "Password",
    type: "password",
    autocomplete: "new-password",
    rules: {
      required: "Password is required.",
      minLength: { value: 8, message: "Password must be at least 8 characters." },
      // Each regex has its own message so the user knows exactly what is missing.
      pattern: [
        { regex: /[a-z]/, message: "Add at least one lowercase letter." },
        { regex: /[A-Z]/, message: "Add at least one uppercase letter." },
        { regex: /\d/, message: "Add at least one number." },
        { regex: /[^A-Za-z0-9\s]/, message: "Add at least one symbol (e.g. ! @ # $ %)." },
      ],
    },
  },

  confirmPassword: {
    label: "Confirm password",
    type: "password",
    autocomplete: "new-password",
    rules: {
      required: "Please confirm your password.",
      matches: { field: "password", message: "Passwords do not match." },
    },
  },
};
