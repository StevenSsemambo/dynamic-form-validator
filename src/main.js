import { formConfig } from "./config.js";
import { createForm } from "./form.js";

const container = document.getElementById("form-container");
const success = document.getElementById("success");

createForm(container, formConfig, (values) => {
  // In a real app you would send this to a server. We just show a success message.
  console.log("Valid form submitted:", { ...values, password: "***", confirmPassword: "***" });
  success.hidden = false;
  success.textContent = `Welcome, ${values.fullName}! Your form passed validation.`;
  setTimeout(() => (success.hidden = true), 5000);
});
