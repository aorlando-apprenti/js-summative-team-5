// Insecure object handling lab — vulnerable starter.
//
// Feature: take a parsed profile object from an untrusted source and apply it to
// the in-memory user.
//
// This one handler does three unsafe things at once:
//   (a) mass assignment   — bulk-copies every field from the untrusted parsed
//                            object onto the trusted user, so the payload decides
//                            which fields it sets (including isAdmin).
//   (b) unsafe dynamic read — reads settings[parsed.preferredKey] with an
//                            untrusted key, which can reach the prototype chain.
//   (c) loose-equality gate — `parsed.tier == 1` lets coerced values (e.g. the
//                            string "1") satisfy a check meant for the number 1.
//
// The harness (verify.js) applies a hostile profile and checks whether the
// privileged field isAdmin got assigned onto the user.

// The trusted in-memory user. isAdmin gates admin-only UI; the payload should
// never be able to set it.
export function makeUser() {
  return { id: 42, displayName: "Ada", theme: "dark", tier: 0, isAdmin: false };
}

// A settings lookup table (plain object — so untrusted keys can reach inherited
// properties like "constructor").
const settings = new Map([
  ["dark", "#111"],
  ["light", "#fff"],
]);

// Fields a profile is allowed to set. Anything not listed is ignored by default.
const ALLOWED_FIELDS = ["displayName", "theme", "tier"];

export function applyProfile(user, parsed) {
  // COMPLETE: This is the defense point. The three lines below are all unsafe:
  //
  //   1. Object.assign bulk-copies every key from the untrusted `parsed` onto
  //      `user`, so a payload carrying isAdmin:true sets it. Replace this with an
  //      allow-list copy: iterate a fixed list of permitted keys
  //      (["displayName", "theme", "tier"]) and copy each only if
  //      Object.hasOwn(parsed, key) is true. Never read keys off `parsed` directly.
  //
  //   2. settings[parsed.preferredKey] reads with an untrusted key and can return
  //      an inherited value (settings["constructor"] is the Object constructor).
  //      Read through a Map, or guard with Object.hasOwn, so unknown keys yield
  //      undefined instead of a prototype-chain value.
  //
  //   3. `parsed.tier == 1` is loose equality. Use a type check plus strict
  //      equality: typeof parsed.tier === "number" && parsed.tier === 1.
  // (a) Allow-list copy: iterate OUR list, never the payload's keys.
  for (const key of ALLOWED_FIELDS) {
    if (Object.hasOwn(parsed, key)) {
      user[key] = parsed[key];
    }
  }

  // (b) Guarded dynamic read: Map.get only sees keys we stored.
  const chosen = settings.get(parsed.preferredKey);

  // (c) Strict gate: type check plus strict equality.
  const isTierOne = typeof parsed.tier === "number" && parsed.tier === 1;

  return { user, chosen, isTierOne };
}
