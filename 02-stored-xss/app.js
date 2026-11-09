// Stored XSS lab — vulnerable starter.
//
// A comment board. The write step (saveComment) persists the raw comment to
// localStorage. The danger is at the READ step: both render paths build feed
// markup by concatenating untrusted author/body into an HTML string and
// assigning it with innerHTML, so a persisted <img src=x onerror=...> payload
// executes for every viewer on render.
//
// SOURCE: the persisted comments in localStorage.
// SINK:   innerHTML in renderAll() and addComment().

const STORAGE_KEY = "comments";

function loadComments() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveComment(author, body) {
  const comments = loadComments();
  comments.push({ author, body });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

// Safe DOM Node Builder Helper
function renderComment(comment) {
  // 1. Create the container <li> element
  const li = document.createElement("li");
  li.setAttribute("class", "comment-row");

  // 2. Create the author <span> element
  const authorSpan = document.createElement("span");
  authorSpan.setAttribute("class", "author");
  authorSpan.textContent = comment.author; // Safe: treats text strictly as text

  // 3. Assemble: append author span, colon separator, and comment body
  li.append(authorSpan, ": ", comment.body);

  return li;
}

// Render path 1: full re-render on load.
function renderAll() {
  const feed = document.getElementById("feed");
  const comments = loadComments();

  // TODONE: This is a defense point. Each comment's author and body are untrusted
  // and are being parsed as HTML by innerHTML. Replace this string-built render
  // so every comment node is built with createElement and its fields are set
  // with textContent (see addComment's TODO too — both paths must be fixed).
  //
  //   Hint: write one safe helper renderComment(comment) that uses
  //   createElement + textContent + setAttribute("class", ...) + append, then
  //   clear the feed with feed.replaceChildren() and append each node.

  // Clear existing nodes safely
  feed.replaceChildren();

  // Append each comment node built by our safe helper
  comments.forEach((comment) => {
    feed.append(renderComment(comment));
  });
}

// Render path 2: append a single comment after submit.
function addComment(author, body) {
  saveComment(author, body);
  const feed = document.getElementById("feed");

  // TODONE: Same defense point on the add path. A fix that only changes
  // renderAll() leaves this path open — the payload fires again when a comment
  // is added. Route this through the SAME safe renderComment helper.

  // Safely build and append the single new comment node
  feed.append(renderComment({ author, body }));
}

// Wire up the form and initial render.
function init() {
  const form = document.getElementById("comment-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const author = document.getElementById("author").value || "guest";
      const body = document.getElementById("body").value || "";
      addComment(author, body);
      document.getElementById("body").value = "";
    });
  }
  renderAll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Expose entry points so the attack harness can drive both render paths.
window.renderAll = renderAll;
window.addComment = addComment;
window.loadComments = loadComments;
