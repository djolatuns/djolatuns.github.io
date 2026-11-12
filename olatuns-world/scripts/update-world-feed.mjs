import { writeFile } from 'node:fs/promises';

const feeds = [
  { url: 'https://guardian.ng/feed/', source: 'The Guardian Nigeria' },
  { url: 'https://punchng.com/feed/', source: 'Punch Nigeria' },
  { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', source: 'BBC News Africa' }
];

function clean(value = '') {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}
function tag(xml, name) {
  const m = xml.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + name + '>', 'i'));
  return m ? clean(m[1]) : '';
}
function category(title, description) {
  const s = (title + ' ' + description).toLowerCase();
  if (/dj |deejay|disc jockey|turntab|mix( |tape)|nightclub/.test(s)) return 'DJ';
  if (/concert|festival|show|gig|party|event|tour|tickets/.test(s)) return 'Events';
  if (/music|song|album|singer|artist|afrobeats|afropop|spotify|audiomack/.test(s)) return 'Music';
  return 'News';
}
const cutoff = Date.now() - 10 * 24 * 60 * 60 * 1000;
const results = [];
for (const feed of feeds) {
  try {
    const response = await fetch(feed.url, { headers: { 'user-agent': 'OlatunsWorldNewsBot/1.0' }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const xml = await response.text();
    const items = [...xml.matchAll(/<item(?:\\s[^>]*)?>([\\s\\S]*?)<\\/item>/gi)].map(m => m[1]);
    for (const item of items) {
      const title = tag(item, 'title');
      const url = tag(item, 'link') || (item.match(/<link[^>]*href=["']([^"']+)/i) || [])[1] || '';
      const description = tag(item, 'description') || tag(item, 'content:encoded');
      const rawDate = tag(item, 'pubDate') || tag(item, 'dc:date');
      const timestamp = Date.parse(rawDate);
      if (!title || !url || !/^https?:\\/\\//i.test(url) || (Number.isFinite(timestamp) && timestamp < cutoff)) continue;
      results.push({
        category: category(title, description),
        title: title.slice(0, 180),
        summary: (description || 'Open the original report for details.').slice(0, 360),
        date: (Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : 'Recently published') + ' · ' + feed.source,
        url
      });
    }
  } catch (error) {
    console.warn('Feed unavailable:', feed.source, error.message);
  }
}
const unique = [...new Map(results.map(item => [item.url, item])).values()]
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 24);
if (!unique.length) throw new Error('No feed items retrieved; keeping the existing app feed unchanged.');
await writeFile('olatuns-world/data/updates.json', JSON.stringify({
  updatedAt: new Date().toISOString(),
  count: unique.length,
  items: unique
}, null, 2) + '\n');
console.log('Wrote ' + unique.length + ' attributed news items.');
