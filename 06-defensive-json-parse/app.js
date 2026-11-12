// app.js — the profile handler under test.
//
// A profile page fetches a user record and renders it. A resolved fetch only
// tells you bytes arrived; it tells you nothing about whether those bytes form
// the object this code expects. This starter trusts the parsed shape completely:
// it parses the body and reaches straight into `data.user.name` and
// `data.user.roles` without a single check.
//
// That works the first hundred times, while the API returns the shape you
// assumed. It breaks the moment the API returns an error envelope, a proxy
// truncates the stream, or a field comes back as the wrong type — the handler
// throws inside the render path and the page goes blank, or it mis-uses a
// wrongly typed value and feeds corrupt data downstream toward a DOM write.
//
// `verify.js` runs a well-formed body plus three bad ones through loadProfile().
// In this starter the bad bodies make it throw or return a corrupt profile —
// the harness reports the vulnerability as REPRODUCED.

// A tiny stand-in for a fetch Response, so this lab stays framework- and
// network-free. `text()` returns the raw body; `json()` parses it (and throws
// on malformed JSON, exactly like the real thing).
export function makeResponse(body) {
  return {
    text: async () => body,
    json: async () => JSON.parse(body),
  };
}

const ALLOWED_ROLES = new Set(["admin", "editor", "viewer", "user"]);

function safeParse(raw) {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { ok: false, reason: "empty-non-string-body" };
  }
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, reason: "malformed-json" };
  }
}

function isPlainObject(val) {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

// The hardened handler: safeParse - shape validation - type and bounds checks.
export async function loadProfile(response) {
 // 1. Read the body as text and wrap JSON.parse to catch SyntaxError instead
  // of throwing on a truncated or malformed body.
  let rawText;
  try {
    rawText = await response.text();
  } catch {
    return { ok: false, reason: "response-read-failed" };
  }

  const parsed = safeParse(rawText);
  if (!parsed.ok) {
    return parsed;
  }

  const data = parsed.value;

  // 2. Shape validation: confirm `data` is a plain object, `data.user` exists
  // and is a plain object, and `id`, `name`, and `roles` exist on `user`.
  if (!isPlainObject(data) || !Object.hasOwn(data, "user") || !isPlainObject(data.user)) {
    return { ok: false, reason: "invalid-shape-missing-user" };
  }

  const { user } = data;

  if (
    !Object.hasOwn(user, "id") ||
    !Object.hasOwn(user, "name") ||
    !Object.hasOwn(user, "roles")
  ) {
    return { ok: false, reason: "invalid-shape-missing-fields" };
  }

  // 3. Type checks: confirm `id` is a finite number, `name` is a string, and
  // `roles` is an array of strings.
  if (typeof user.id !== "number" || !Number.isFinite(user.id)) {
    return { ok: false, reason: "invalid-type-id" };
  }

  if (typeof user.name !== "string") {
    return { ok: false, reason: "invalid-type-name" };
  }

  if (!Array.isArray(user.roles) || !user.roles.every((r) => typeof r === "string")) {
    return { ok: false, reason: "invalid-type-roles" };
  }

  // 4. Bounds checks: enforce `name.length <= 100` and confirm every role is
  // in the allowed Set, rejecting rather than clamping or truncating.
  if (user.name.length > 100) {
    return { ok: false, reason: "bounds-name-too-long" };
  }

  if (!user.roles.every((r) => ALLOWED_ROLES.has(r))) {
    return { ok: false, reason: "bounds-disallowed-role" };
  }

  const profile = {
    id: user.id,
    name: user.name,
    roles: user.roles.map((r) => r),
  };

  return { ok: true, profile };
}

