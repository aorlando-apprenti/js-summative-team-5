// parse.js — the data layer (VULNERABLE STARTER).
//
// This module turns server-style JSON into application values. It contains the
// app's DATA flaws (insecure parsing / object handling). Audit each function by
// tracing where the untrusted text comes from and what is done with the result.
//
// Entry points (driven by app.js and by verify.js):
//   parseConfig(text)         -> reads a fetched config blob
//   applySettings(text)       -> merges a fetched settings blob into defaults
//
// NOTE: there are no // TODO markers in this lab. Finding the flaws is the work.
// Trace each untrusted value to where it lands; the flaw is the unbroken path.

// App defaults that the fetched settings are merged on top of.
const DEFAULT_SETTINGS = { theme: "light", pageSize: 10 };
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// Read a fetched config blob and hand back its fields.
// Fails closed on malformed JSON and validates shape and types.
function parseConfig(text) {
  let cfg;
  try { cfg = JSON.parse(text); }
  catch { return { ok: false, error: "malformed config" }; }   // fail closed

  if (!isPlainObject(cfg)) return { ok: false, error: "config must be an object" };

  const title = typeof cfg.title === "string" ? cfg.title : null;
  const maxItems = Number.isInteger(cfg.maxItems) ? cfg.maxItems : null;
  return { ok: true, title, maxItems };
}


// Recursively deep-merge `source` onto `target` (so nested settings objects are
// combined rather than replaced). Keys that could reach Object.prototype
// ("__proto__", "constructor", "prototype") are skipped BEFORE target is read
// or written, so the merge cannot pollute it.
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (FORBIDDEN_KEYS.has(key)) continue;          // guard BEFORE touching target
    const val = source[key];
    if (isPlainObject(val)) {
      if (!isPlainObject(target[key]) || !Object.hasOwn(target, key)) target[key] = {};
      deepMerge(target[key], val);
    } else {
      target[key] = val;
    }
  }
  return target;
}

// Merge a fetched settings blob on top of the app defaults.
function applySettings(text) {
  let parsed;
  try { parsed = JSON.parse(text); }
  catch { return { ...DEFAULT_SETTINGS }; }
  if (!isPlainObject(parsed)) return { ...DEFAULT_SETTINGS };
  return deepMerge({ ...DEFAULT_SETTINGS }, parsed);
}

// Expose entry points for app.js and the harness.
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
window.parseConfig = parseConfig;
window.applySettings = applySettings;
