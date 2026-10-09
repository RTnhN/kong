'use strict';

// A small Markdown subset. Build DOM nodes rather than interpreting user HTML.
function renderMarkdown(source, target) {
  function inline(text, parent, depth = 0) {
    if (depth > 16) {
      parent.append(document.createTextNode(text));
      return;
    }
    const tokens = /\\([\\`*_[\]~])|`([^`\n]+)`|\[([^\]\n]+)\]\(([^\s)]+)\)|\*\*(.+?)\*\*|__(.+?)__|~~(.+?)~~|\*([^*\n]+)\*|_([^_\n]+)_/g;
    let offset = 0;
    for (const match of text.matchAll(tokens)) {
      parent.append(document.createTextNode(text.slice(offset, match.index)));
      if (match[1]) {
        parent.append(document.createTextNode(match[1]));
      } else if (match[2]) {
        const code = document.createElement('code');
        code.textContent = match[2];
        parent.append(code);
      } else if (match[3]) {
        const url = match[4];
        // Permit web, email, and relative links; reject script/data schemes.
        if (/^(?:https?:|mailto:)/i.test(url) || !/^[a-z][a-z\d+.-]*:/i.test(url)) {
          const link = document.createElement('a');
          link.setAttribute('href', url);
          inline(match[3], link, depth + 1);
          parent.append(link);
        } else {
          parent.append(document.createTextNode(match[0]));
        }
      } else {
        const tag = match[5] || match[6] ? 'strong' : match[7] ? 'del' : 'em';
        const element = document.createElement(tag);
        inline(match[5] || match[6] || match[7] || match[8] || match[9], element, depth + 1);
        parent.append(element);
      }
      offset = match.index + match[0].length;
    }
    parent.append(document.createTextNode(text.slice(offset)));
  }

  function blocks(text, parent, depth = 0) {
    if (depth > 16) {
      parent.append(document.createTextNode(text));
      return;
    }
    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    const fencePattern = /^ {0,3}(`{3,}|~{3,})(.*)$/;
    const headingPattern = /^ {0,3}(#{1,6})\s+(.+)$/;
    const listPattern = /^\s*([-+*]|\d+[.)])\s+(.+)$/;
    const rulePattern = /^ {0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/;
    const quotePattern = /^ {0,3}> ?/;
    const startsBlock = line => !line.trim() || fencePattern.test(line) ||
      headingPattern.test(line) || listPattern.test(line) || rulePattern.test(line) || quotePattern.test(line);

    for (let i = 0; i < lines.length;) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      const fence = line.match(fencePattern);
      const heading = line.match(headingPattern);
      const list = line.match(listPattern);
      if (fence) {
        const content = [];
        const close = new RegExp('^ {0,3}' + fence[1][0] + '{' + fence[1].length + ',}\\s*$');
        i++;
        while (i < lines.length && !close.test(lines[i])) content.push(lines[i++]);
        if (i < lines.length) i++;
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = content.join('\n');
        pre.append(code);
        parent.append(pre);
      } else if (heading) {
        const element = document.createElement('h' + heading[1].length);
        inline(heading[2].replace(/\s+#+\s*$/, ''), element);
        parent.append(element);
        i++;
      } else if (rulePattern.test(line)) {
        parent.append(document.createElement('hr'));
        i++;
      } else if (quotePattern.test(line)) {
        const content = [];
        while (i < lines.length && quotePattern.test(lines[i])) {
          content.push(lines[i++].replace(quotePattern, ''));
        }
        const quote = document.createElement('blockquote');
        blocks(content.join('\n'), quote, depth + 1);
        parent.append(quote);
      } else if (list) {
        const ordered = /^\d/.test(list[1]);
        const element = document.createElement(ordered ? 'ol' : 'ul');
        if (ordered) element.setAttribute('start', parseInt(list[1], 10));
        while (i < lines.length) {
          const item = lines[i].match(listPattern);
          if (!item || /^\d/.test(item[1]) !== ordered || rulePattern.test(lines[i])) break;
          const li = document.createElement('li');
          inline(item[2], li);
          element.append(li);
          i++;
        }
        parent.append(element);
      } else {
        const content = [line];
        i++;
        while (i < lines.length && !startsBlock(lines[i])) content.push(lines[i++]);
        const paragraph = document.createElement('p');
        inline(content.join('\n'), paragraph);
        parent.append(paragraph);
      }
    }
  }

  const fragment = document.createDocumentFragment();
  blocks(source, fragment);
  target.replaceChildren(fragment);
}
