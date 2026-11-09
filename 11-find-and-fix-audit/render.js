// render.js — the view layer (VULNERABLE STARTER).
//
// This module writes values to the DOM. It contains the app's RENDER flaws
// (XSS). Audit each function by tracing the untrusted value to the sink it
// reaches: a markup sink (innerHTML / insertAdjacentHTML), a URL sink (href),
// or a code sink (an inline on* attribute).
//
// Entry points (driven by app.js and by verify.js):
//   renderSearch(term, el)      -> echoes the search term
//   renderMembers(members, el)  -> renders the team-member list
//
// A member looks like: { name, bio, website }
//   name    -> shown as the heading and used by the "say hi" button
//   bio     -> a short blurb that may contain light formatting
//   website -> the member's profile link

// Echo the search term into the results banner.
function renderSearch(term, el) {
  // SOURCE: location.search ?q=  (see app.js).  SINK: innerHTML.
  // The untrusted term is concatenated into markup and parsed as HTML.
  el.replaceChildren();
  el.append("Showing results for: ");
  const strong = document.createElement("strong");
  strong.textContent = term;           // literal text, never parsed
  el.appendChild(strong);
}

function safeUrl(raw) {
  try {
    const u = new URL(raw, location.origin);
    return (u.protocol === "https:" || u.protocol === "http:") ? u.href : null;
  } catch { return null; }
}

// Render one member card and append it to the list container.
function renderMember(member, listEl) {
  const card = document.createElement("div");
  card.className = "member";

  const h = document.createElement("h3");
  h.textContent = member.name;
  card.appendChild(h);

  // Bio genuinely carries light HTML, so sanitize with a tight allow-list.
  const p = document.createElement("p");
  p.innerHTML = DOMPurify.sanitize(String(member.bio ?? ""), {
    ALLOWED_TAGS: ["em", "strong", "b", "i", "br"],
    ALLOWED_ATTR: [],
  });
  card.appendChild(p);

  // Link: only written if the scheme is allow-listed.
  const href = safeUrl(member.website);
  if (href) {
    const link = document.createElement("a");
    link.href = href;
    link.rel = "noopener noreferrer";
    link.textContent = "Profile";
    card.appendChild(link);
  }

  // Button: no inline handler; the name is only ever data.
  const btn = document.createElement("button");
  btn.textContent = "Say hi";
  btn.addEventListener("click", () => alert("hi " + member.name));
  card.appendChild(btn);

  listEl.appendChild(card);
}

// Render the whole member list.
function renderMembers(members, el) {
  el.replaceChildren();
  for (const m of members) renderMember(m, el);
}

// Expose entry points for app.js and the harness.
window.renderSearch = renderSearch;
window.renderMembers = renderMembers;
