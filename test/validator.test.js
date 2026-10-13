import { test } from "node:test";
import assert from "node:assert/strict";
import { validateField, validateForm } from "../src/validator.js";
import { formConfig } from "../src/config.js";

const rules = (name) => formConfig[name].rules;

test("required rejects empty and whitespace", () => {
  assert.ok(validateField("", rules("email")));
  assert.ok(validateField("   ", rules("email")));
  assert.equal(validateField("a@b.co", rules("email")), null);
});

test("optional empty field skips other rules", () => {
  assert.equal(validateField("", { minLength: 5 }), null);
});

test("minLength and maxLength", () => {
  assert.match(validateField("ab", { minLength: 3 }), /at least 3/);
  assert.match(validateField("abcd", { maxLength: 3 }), /at most 3/);
  assert.equal(validateField("abc", { minLength: 3, maxLength: 3 }), null);
});

test("email regex", () => {
  for (const ok of ["a@b.co", "john.doe+x@mail.example.org"]) assert.equal(validateField(ok, rules("email")), null);
  for (const bad of ["abc", "a@b", "a b@c.com", "@x.com"]) assert.ok(validateField(bad, rules("email")), bad);
});

test("phone regex (international and local Ugandan)", () => {
  for (const ok of ["+256700123456", "0700123456", "+14155552671"]) assert.equal(validateField(ok, rules("phone")), null, ok);
  for (const bad of ["12345", "0800123456", "+25670012", "07001234567", "abc"]) assert.ok(validateField(bad, rules("phone")), bad);
});

test("password reports the specific missing requirement", () => {
  assert.match(validateField("Ab1!", rules("password")), /at least 8/);
  assert.match(validateField("ABCDEFG1!", rules("password")), /lowercase/);
  assert.match(validateField("abcdefg1!", rules("password")), /uppercase/);
  assert.match(validateField("Abcdefgh!", rules("password")), /number/);
  assert.match(validateField("Abcdefg1", rules("password")), /symbol/);
  assert.equal(validateField("Abcdef1!", rules("password")), null);
});

test("matches rule compares with another field", () => {
  assert.equal(validateField("x", { matches: "p" }, { p: "x" }), null);
  assert.ok(validateField("x", { matches: "p" }, { p: "y" }));
});

test("custom rule", () => {
  const custom = (v) => (v === "bad" ? "nope" : null);
  assert.equal(validateField("bad", { custom }), "nope");
  assert.equal(validateField("good", { custom }), null);
});

test("validateForm collects errors for all fields", () => {
  const bad = validateForm({ fullName: "A", email: "x", phone: "1", password: "a", confirmPassword: "b" }, formConfig);
  assert.equal(bad.valid, false);
  assert.deepEqual(Object.keys(bad.errors).sort(), Object.keys(formConfig).sort());

  const good = validateForm(
    { fullName: "Jane Doe", email: "jane@x.com", phone: "0700123456", password: "Abcdef1!", confirmPassword: "Abcdef1!" },
    formConfig
  );
  assert.deepEqual(good, { valid: true, errors: {} });
});

test("global regex does not leak state between calls", () => {
  const r = { pattern: { regex: /a/g, message: "no a" } };
  assert.equal(validateField("a", r), null);
  assert.equal(validateField("a", r), null);
});
