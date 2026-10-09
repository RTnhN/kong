# Kong (空)

A browser-local Markdown editor and reader. Open `index.html` in Read
mode. Hold Ctrl to edit or paste with Ctrl+V; release Ctrl to return to Read.
Double-tap Ctrl within half a second to stay in Edit after releasing it. A single
Ctrl tap returns to Read. Shortcuts and Ctrl+wheel do not count as taps.
The upper-right button toggles editing on or off without holding a key. The next
Ctrl press takes over, and releasing it resets the button to Read.
The button shows the current mode. Text saves automatically under
`kong.text` in localStorage for the current browser and site address.

No dependencies or build step. To serve locally, run:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000 in Chrome. For GitHub Pages, serve this directory
directly. Browser storage must be available for persistence across reloads.

Read mode renders headings, bold, italic, strikethrough, links, flat numbered and
bulleted lists, blockquotes, horizontal rules, inline code, and fenced code blocks.
Edit mode retains the original Markdown source, which is also what gets saved.
The small renderer in `markdown.js` uses ordinary DOM text nodes. Embedded HTML
is displayed literally. Images, tables, nested lists, and full CommonMark syntax
are not supported.

## Manual browser checks

- Paste `你好世界。今天天气很好。` and several lines with spaces.
- Hold Ctrl to edit and release it to read; verify text and line breaks
  remain intact, reading prevents edits, and editing restores focus.
- Click the button to toggle modes, then tap Ctrl; the final mode should be Read.
- Try Ctrl+C, Ctrl+V, Ctrl+A, and Ctrl+Z; verify each shortcut works while Ctrl
  is held and releasing Ctrl returns to Read.
- Paste formatted web content; only text should appear. HTML pasted as text
  should remain literal and must not execute.
- Reload and verify the saved text returns.
- Try Markdown headings, lists, links, bold, and fenced code; verify Read mode
  renders them and returning to Edit preserves the original source.
- Try `[bad](javascript:alert(1))` and `<script>alert(1)</script>`; neither should
  execute. Confirm Chinese text in rendered paragraphs still works with Zhongwen.
- Check narrow mobile layouts and button operation.

## Zhongwen compatibility check

Enable Zhongwen in desktop Chrome and grant it access to localhost. Hover over
the sample Chinese characters in both Edit and Read modes. For a static-text
baseline, use Chrome DevTools to append an ordinary element:

```js
const sample = document.createElement('p');
sample.textContent = '你好世界。今天天气很好。';
document.body.append(sample);
```

Compare translation popups in all three cases. Editing uses a plain-text
contenteditable element; reading uses a separate ordinary DOM element containing
rendered Markdown. Zhongwen compatibility needs verification with the actual
extension. Do not rely on extension access to `file://`.
