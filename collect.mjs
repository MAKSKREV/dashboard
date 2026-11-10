// Снимок просмотров и лайков по открытым RSS YouTube и открытому API Rutube: без ключей и входа.
// RSS отдаёт последние 15 роликов канала. Запуск: node collect.mjs
import { readFile, writeFile } from 'node:fs/promises';

const dir = new URL('.', import.meta.url);
const channels = JSON.parse(await readFile(new URL('channels.json', dir), 'utf8'));
const histUrl = new URL('data/history.json', dir);

let hist = { videos: {}, snaps: [] };
try { hist = JSON.parse(await readFile(histUrl, 'utf8')); } catch {}

const unxml = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const snap = { t: new Date().toISOString(), v: {}, s: {}, failed: [] };
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
  // Подписчики: со страницы канала, RSS их не отдаёт. Сбой загрузки — пропуск.
  try {
    const r = await fetch(`https://www.youtube.com/channel/${ch.id}?hl=en`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/130 Safari/537.36', 'Accept-Language': 'en', Cookie: 'CONSENT=YES+1; SOCS=CAI' },
      signal: AbortSignal.timeout(30000),
    });
    const html = await r.text();
    const m = html.match(/"content":"([\d.,]+)([KM]?) subscribers?"/);
    if (m) snap.s[ch.id] = Math.round(parseFloat(m[1].replace(/,/g, '')) * ({ K: 1e3, M: 1e6 }[m[2]] ?? 1));
    else if (/"content":"\d+ videos?"/.test(html)) snap.s[ch.id] = 0; // страница пришла, строки нет — 0 подписчиков
  } catch {}
  console.log(`${ch.name}: ok, подписчиков ${snap.s[ch.id] ?? '?'}`);
}
// Rutube: открытый API, просмотры каждого ролика (hits) и подписчики. Время публикации Rutube отдаёт по Москве без пояса
hist.rt ??= {};
snap.rv = {}; snap.rs = {};
const rtGet = async (u) => { const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/130' }, signal: AbortSignal.timeout(20000) }); if (!r.ok) throw new Error(r.status); return r.json(); };
for (const ch of channels.filter((c) => c.rutube)) {
  try {
    snap.rs[ch.id] = (await rtGet(`https://rutube.ru/api/profile/user/${ch.rutube}/?format=json`)).subscribers_count ?? 0;
    for (let page = 1; page <= 20; page++) {
      const j = await rtGet(`https://rutube.ru/api/video/person/${ch.rutube}/?format=json&page=${page}`);
      for (const v of j.results ?? []) {
        hist.rt[v.id] = { ch: ch.id, title: v.title, published: (v.publication_ts || v.created_ts) + '+03:00' };
        snap.rv[v.id] = v.hits ?? 0;
      }
      if (!j.has_next) break;
    }
    console.log(`Rutube ${ch.name}: ok`);
  } catch (e) {
    (snap.rtFailed ??= []).push(ch.id);
    console.error(`Rutube ${ch.name}: ${e.message}`);
  }
}
if (!snap.failed.length) delete snap.failed;
hist.snaps.push(snap);
await writeFile(histUrl, JSON.stringify(hist));
console.log(`Снимок ${snap.t}: роликов ${Object.keys(snap.v).length}`);
