# Stored XSS Lab — Comment Feed

A comment board saves submitted comments to `localStorage` (standing in for a
backend database) and renders them into a feed. Both render paths build the feed
by concatenating each comment's author and body into an HTML string and
assigning it with `innerHTML` — so a payload posted **once** executes for every
viewer, every time the feed renders.

## How to run

Open `index.html` in a browser (or serve the folder with any static file
server). It loads `app.js` (the feature) and `verify.js` (the attack harness),
which runs automatically and writes its verdict into `#result` and the console.

## Reproduce the attack

1. In the comment form, post a comment with this body:
   `<img src=x onerror=alert(document.cookie)>`
2. **Reload the page.** The payload is still there (it was persisted) and fires
   on render — that persistence across reloads is what makes it *stored* XSS.
3. Post another comment of any kind: the add path renders with `innerHTML` too,
   so the payload fires again.

The source is the persisted comment in `localStorage`; the sink is `innerHTML`
in **both** `renderAll()` and `addComment()`.

## Your task

Open `app.js`. There are two `// TODO:` markers — one in `renderAll()` and one
in `addComment()`. The fix is encode-on-output discipline applied to *every*
render path:

1. Write **one** safe helper, `renderComment(comment)`, that builds the row with
   `createElement`, sets the row class with `setAttribute("class", ...)`, and
   sets the author and body with `textContent`, then `append`s the parts and
   returns the node.
2. Call that **same** helper from both `renderAll()` (clear the feed with
   `feed.replaceChildren()` first, then append each node) and `addComment()`.

A fix that only changes `renderAll()` leaves the add path open — one unsafe
field or one unsafe path reopens the hole. Store the raw comment; encode at
output.

## Pass condition

Reload. The harness should report **PASS**: the payload renders as inert literal
text on both the load path and the add path, no `<img>` element reaches the
feed, and no handler executes.

Sink Map Note: Harden Comment Feed against Stored XSS

• Source: Persisted user-supplied comment objects (author and body) retrieved from localStorage via loadComments()

• Sink (Vulnerable): Unsanitized string concatenation assigned directly to element.innerHTML in both renderAll() and addComment()

• Safe Replacement: Eliminated innerHTML parsing across both render paths[cite: 1, 3]. Implemented encode-on-output using standard DOM APIs: programmatically building elements with document.createElement(), setting untrusted input directly via textContent, and mounting nodes to the document tree via append() and replaceChildren()