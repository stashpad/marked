import { defaults } from './defaults.js';
import {
  cleanUrl,
  escape
} from './helpers.js';

/**
 * Renderer
 */
export class Renderer {
  constructor(options) {
    this.options = { ...defaults, ...options };
  }

  generateDataAttributes(origin) {
    if (!origin || !this.options.includeOrigin) {
      return '';
    }
    return ` data-origin-start="${origin.start}" data-origin-end="${origin.end}" `;
  }

  code(code, infostring, escaped, origin) {
    const lang = (infostring || '').match(/\S*/)[0];
    if (this.options.highlight) {
      const out = this.options.highlight(code, lang);
      if (out != null && out !== code) {
        escaped = true;
        code = out;
      }
    }

    code = code.replace(/\n$/, '') + '\n';

    if (!lang) {
      return `<pre${this.generateDataAttributes(origin)}><code>`
        + (escaped ? code : escape(code, true))
        + '</code></pre>\n';
    }

    return `<pre${this.generateDataAttributes(origin)}><code class="`
      + this.options.langPrefix
      + escape(lang, true)
      + '">'
      + (escaped ? code : escape(code, true))
      + '</code></pre>\n';
  }

  /**
   * @param {string} quote
   */
  blockquote(quote, origin) {
    return `<blockquote${this.generateDataAttributes(origin)}>\n${quote}</blockquote>\n`;
  }

  html(html) {
    return html;
  }

  /**
   * @param {string} text
   * @param {string} level
   * @param {string} raw
   * @param {any} slugger
   */
  heading(text, level, raw, slugger, origin) {
    // is header from 2 lines or 1
    const expectedHashLength = Array(level).fill('#').join('') + ' ' + text;
    const expectedLength = expectedHashLength.length;
    const actualLength = origin.end - origin.start - '\n'.length;
    let hashHeader = true;
    if (expectedLength !== actualLength) hashHeader = false;

    if (this.options.headerIds) {
      const id = this.options.headerPrefix + slugger.slug(raw);
      return `<h${level} data-hash-header=${hashHeader} id="${id}"${this.generateDataAttributes(origin)}>${text}</h${level}>\n`;
    }

    // ignore IDs
    return `<h${level}${this.generateDataAttributes(origin)} data-hash-header=${hashHeader}>${text}</h${level}>\n`;
  }

  hr(origin) {
    return this.options.xhtml ? `<hr${this.generateDataAttributes(origin)} />\n` : `<hr${this.generateDataAttributes(origin)}>\n`;
  }

  list(body, ordered, start, origin) {
    const type = ordered ? 'ol' : 'ul',
      startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
    return '<' + type + startatt + `${this.generateDataAttributes(origin)}>\n` + body + '</' + type + '>\n';
  }

  /**
   * @param {string} text
   */
  listitem(text, task, checked, origin) {
    return `<li${this.generateDataAttributes(origin)}>${text}</li>\n`;
  }

  checkbox(checked, origin) {
    return `<input${this.generateDataAttributes(origin)} `
      + (checked ? 'checked="" ' : '')
      + 'disabled="" type="checkbox"'
      + (this.options.xhtml ? ' /' : '')
      + '> ';
  }

  /**
   * @param {string} text
   */
  paragraph(text, origin) {
    return `<p${this.generateDataAttributes(origin)}>${text}</p>\n`;
  }

  /**
   * @param {string} header
   * @param {string} body
   */
  table(header, body) {
    if (body) body = `<tbody>${body}</tbody>`;

    return '<table>\n'
      + '<thead>\n'
      + header
      + '</thead>\n'
      + body
      + '</table>\n';
  }

  /**
   * @param {string} content
   */
  tablerow(content) {
    return `<tr>\n${content}</tr>\n`;
  }

  tablecell(content, flags) {
    const type = flags.header ? 'th' : 'td';
    const tag = flags.align
      ? `<${type} align="${flags.align}">`
      : `<${type}>`;
    return tag + content + `</${type}>\n`;
  }

  /**
   * span level renderer
   * @param {string} text
   */
  strong(text, origin) {
    return `<strong${this.generateDataAttributes(origin)}>${text}</strong>`;
  }

  /**
   * @param {string} text
   */
  em(text, origin) {
    return `<em${this.generateDataAttributes(origin)}>${text}</em>`;
  }

  /**
   * @param {string} text
   */
  codespan(text, origin) {
    return `<code ${this.generateDataAttributes(origin)}>${text}</code>`;
  }

  br() {
    return this.options.xhtml ? '<br/>' : '<br>';
  }

  /**
   * @param {string} text
   */
  del(text, origin) {
    return `<del${this.generateDataAttributes(origin)}>${text}</del>`;
  }

  /**
   * @param {string} href
   * @param {string} title
   * @param {string} text
   */
  link(href, title, text) {
    href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
    if (href === null) {
      return text;
    }

    let out = '<a target="_blank" href="' + escape(href) + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += '>' + text + '</a>';
    return out;
  }

  /**
   * @param {string} href
   * @param {string} title
   * @param {string} text
   */
  image(href, title, text) {
    href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
    if (href === null) {
      return text;
    }

    let out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += this.options.xhtml ? '/>' : '>';
    return out;
  }

  text(text, origin) {
    return `<span${this.generateDataAttributes(origin)}>${text}</span>`;
  }
}
