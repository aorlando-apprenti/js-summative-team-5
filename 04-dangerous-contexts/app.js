// app.js — HARDENED solution.
//
// renderCard() builds a user-profile card from a `profile` object. Three of its
// fields are untrusted (they come from other users) and each lands in a
// different dangerous context:
//
//   (1) profile.website       -> the link's href      (URL context)
//   (2) profile.avatar        -> an <img> src          (attribute context)
//   (3) profile.contactAction -> the button's onclick  (event-handler context)
//
// All three holes inside renderCard() are closed so the harness reports PASS
// while the card still renders correctly for a benign profile:
//   - URL context:    parsed with the URL API, allowing only safe schemes (https:, http:, mailto:).
//   - Attribute:      built the <img> with createElement + setAttribute("src", ...) after URL scheme validation.
//   - Event handler:  used addEventListener instead of an inline onclick, passing untrusted value as data.

// The legitimate behavior the Contact button should perform with benign data.
function showContact(value) {
  console.log("Contact action requested:", value);
}

// Helper function to validate URL schemes.
function isSafeUrl(urlInput) {
  try {
    const parsed = new URL(urlInput, document.baseURI);
    return ["https:", "http:", "mailto:"].includes(parsed.protocol);
  } catch (e) {
    return false;
  }
}

function renderCard(profile) {
  const root = document.querySelector("#card");
  root.textContent = ""; // clear any previous render

  // (1) URL context.
  const link = document.createElement("a");
  link.textContent = profile.displayName; // text context — already safe
  if (isSafeUrl(profile.website)) {
    link.href = profile.website;
  } else {
    console.warn("Unsafe website scheme rejected:", profile.website);
  }

  // (2) Attribute context.
  const avatarWrap = document.createElement("div");
  const img = document.createElement("img");
  if (isSafeUrl(profile.avatar)) {
    img.setAttribute("src", profile.avatar);
  } else {
    console.warn("Unsafe avatar scheme rejected:", profile.avatar);
  }
  avatarWrap.appendChild(img);

  // (3) Event-handler context.
  const btn = document.createElement("button");
  btn.textContent = "Contact";
  btn.addEventListener("click", () => {
    showContact(profile.contactAction);
  });

  root.append(link, avatarWrap, btn);
}

window.renderCard = renderCard;