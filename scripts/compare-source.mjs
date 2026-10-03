import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { load } from 'cheerio';

// Compare stable public content, avoiding live inventory, carousel order, and payment widgets.
const routes = JSON.parse(await fs.readFile('data/routes.json', 'utf8'));
const examples = ['/', '/collections/home-furnishing', '/products/boy-dhola-maru-embroidery-bundy-set-beige', '/pages/our-story'];
const normalize = text => text.replace(/\s+/g, ' ').trim();
const summarize = (html, route) => {
  const $ = load(html);
  const main = $('#MainContent');
  return {
    headings: main.find('h1,h2,h3,h4,h5,h6').map((i, e) => normalize($(e).text())).get(),
    images: [...new Set(main.find('img').map((i, e) => {
      const src = $(e).attr('src');
      return src ? new URL(src, 'https://dimohe.com').pathname.split('/').at(-1) : '';
    }).get())].sort(),
    links: [...new Set(main.find('a[href]').map((i, e) => {
      const href = $(e).attr('href');
      if (!href || href.startsWith('#') || $(e).is('[data-close-drawer]')) return '';
      const u = new URL(href, 'https://dimohe.com');
      if (u.pathname === route) return '';
      return u.hostname === 'dimohe.com' && /^\/(products|collections|pages)\//.test(u.pathname) ? u.pathname : '';
    }).get().filter(Boolean))].sort(),
  };
};
for (const route of examples) {
  const response = await fetch('https://dimohe.com' + route, { signal: AbortSignal.timeout(30000) });
  assert.ok(response.ok, route);
  const original = summarize(await response.text(), route);
  const record = routes.find(r => r.route === route);
  const local = summarize(await fs.readFile('public' + record.file, 'utf8'), route);
  assert.deepEqual(local, original, `Public content changed at ${route}`);
  console.log(`Matched original headings, image filenames, and internal links: ${route}`);
}
