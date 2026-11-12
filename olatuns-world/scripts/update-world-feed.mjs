import { writeFile } from 'node:fs/promises';

const feeds = [
  { url: 'https://guardian.ng/category/entertainment/music/feed/', source: 'The Guardian Nigeria Music' },
  { url: 'https://guardian.ng/category/entertainment/feed/', source: 'The Guardian Nigeria Entertainment' },
  { url: 'https://punchng.com/topics/entertainment/feed/', source: 'Punch Entertainment' },
  { url: 'https://www.musicinafrica.net/rss.xml', source: 'Music In Africa' }
];

function clean(value = '') {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}
function tag(xml, name) {
  const escaped = name.replace(':', '\\:');
  const match = xml.match(new RegExp('<' + escaped + '\\b[^>]*>([\\s\\S]*?)<\\/' + escaped + '>', 'i'));
  return match ? clean(match[1]) : '';
}
function category(title, description) {
  const s = (title + ' ' + description).toLowerCase();
  if (/\bdj\b|deejay|disc jockey|turntab|mixtape|nightclub/.test(s)) return 'DJ';
  if (/concert|festival|show|gig|party|event|tour|tickets/.test(s)) return 'Events';
  if (/music|song|album|singer|artist|afrobeats|afropop|spotify|audiomack/.test(s)) return 'Music';
  return null;
}

const cutoff = Date.now() - 10 * 24 * 60 * 60 * 1000;
const results = [];
for (const feed of feeds) {
  try {
    const response = await fetch(feed.url, {
      headers: { 'user-agent': 'OlatunsWorldNewsBot/1.0' },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const xml = await response.text();
    const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(match => match[1]);
    for (const item of items) {
      const title = tag(item, 'title');
      const url = tag(item, 'link');
      const description = tag(item, 'description') || tag(item, 'content:encoded');
      const rawDate = tag(item, 'pubDate') || tag(item, 'dc:date');
      const timestamp = Date.parse(rawDate);
      if (!title || !url || !/^https?:\/\//i.test(url) || (Number.isFinite(timestamp) && timestamp < cutoff)) continue;
      const storyCategory = category(title, description);
      if (!storyCategory) continue;
      results.push({
        category: storyCategory,
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
  .slice(0, 24);
if (!unique.length) throw new Error('No recent feed items retrieved; existing app content will be kept.');
await writeFile('olatuns-world/data/updates.json', JSON.stringify({
  updatedAt: new Date().toISOString(),
  count: unique.length,
  items: unique
}, null, 2) + '\n');
console.log('Wrote ' + unique.length + ' DJ and music items.');
