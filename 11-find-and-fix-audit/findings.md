| Rank | Finding (class) | Untrusted source | Dangerous sink | Source-to-sink trace | Payload | Exploitability | Impact | Priority |
|---|---|---|---|---|---|---|---|---|
| 1 | Stored XSS | Stored member `bio` | `insertAdjacentHTML` in `renderMember` | `init()` → `renderMembers` → `renderMember` → bio concatenated into `<p>…</p>` → parsed as HTML | `<img src=x onerror=alert(2)>` | High | High | **Critical** |
| 2 | Prototype pollution | Fetched settings blob | `deepMerge` write to `target[key]` in `applySettings` | `init()` → `applySettings` → `JSON.parse` creates own `__proto__` key → `for...in` enumerates it → `target["__proto__"]` is `Object.prototype` → merge writes onto it | `{"theme":"dark","__proto__":{"isAdmin":true}}` | High | High | **Critical** |
| 3 | DOM-based XSS | `?q=` URL parameter | `innerHTML` in `renderSearch` | `init()` reads `location.search` → `renderSearch` → concatenated into markup → `innerHTML` | `<img src=x onerror=alert(1)>` | High | High | **High** |
| 4 | Inline handler injection | Stored member `name` | Inline `onclick` attribute in `renderMember` | `renderMembers` → `renderMember` → name spliced into JS string in attribute → quote-paren breakout injects code on click | `x') ; alert(4) ; ('` | Medium | High | **High** |
| 5 | `javascript:` URL | Stored member `website` | `link.href` in `renderMember` | `renderMembers` → `renderMember` → value assigned to `href` with no scheme check → runs on click | `javascript:alert(3)` | Medium | High | **Medium** |
| 6 | Unsafe parse / crash | Fetched config body | `JSON.parse` in `parseConfig` | config text → bare `JSON.parse` with no `try/catch` → malformed body throws; fields used with no type checks | `{"title":"oops` (truncated) | Medium | Low | **Low** |
 

 
## Non-finding
 
### `h.textContent = member.name` (heading)
 
- **Source:** `member.name`. **Sink:** `textContent` on the `<h3>`.
- **Why it is safe:** `textContent` assigns literal text and never parses markup, so the name cannot create nodes or attributes here.
