// Снимок просмотров и лайков по открытым RSS YouTube: без ключей и входа.
// RSS отдаёт последние 15 роликов канала. Запуск: node collect.mjs
import { readFile, writeFile } from 'node:fs/promises';

const dir = new URL('.', import.meta.url);
const channels = JSON.parse(await readFile(new URL('channels.json', dir), 'utf8'));
const histUrl = new URL('data/history.json', dir);

let hist = { videos: {}, snaps: [] };
try { hist = JSON.parse(await readFile(histUrl, 'utf8')); } catch {}

const unxml = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const snap = { t: new Date().toISOString(), v: {}, failed: [] };
for (const ch of channels) {
  let xml;
  try {
    const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`, { signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw new Error(r.status);
    xml = await r.text();
  } catch (e) {
    snap.failed.push(ch.id);
    console.error(`${ch.name}: ${e.message}`);
    continue;
  }
  for (const entry of xml.split('<entry>').slice(1)) {
    const vid = entry.match(/<yt:videoId>([^<]+)/)?.[1];
    if (!vid) continue;
    const views = +(entry.match(/<media:statistics views="(\d+)"/)?.[1] ?? 0);
    const likes = +(entry.match(/<media:starRating count="(\d+)"/)?.[1] ?? 0);
    hist.videos[vid] = {
      ch: ch.id,
      title: unxml(entry.match(/<title>([^<]*)/)?.[1] ?? ''),
      published: entry.match(/<published>([^<]+)/)?.[1],
    };
    snap.v[vid] = [views, likes];
  }
  console.log(`${ch.name}: ok`);
}
if (!snap.failed.length) delete snap.failed;
hist.snaps.push(snap);
await writeFile(histUrl, JSON.stringify(hist));
console.log(`Снимок ${snap.t}: роликов ${Object.keys(snap.v).length}`);
