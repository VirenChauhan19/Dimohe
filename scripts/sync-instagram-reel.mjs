import fs from 'node:fs/promises';
import { createInstagramReelsFeed } from '../lib/instagram-reels.mjs';

const snapshot = process.env.INSTAGRAM_REELS_SNAPSHOT;
const site = process.env.PAGES_BASE_URL;
const scheduled = process.env.GITHUB_EVENT_NAME === 'schedule';
const feed = createInstagramReelsFeed();

if (!snapshot || !site) throw new Error('Set INSTAGRAM_REELS_SNAPSHOT and PAGES_BASE_URL to sync the Pages feed.');
if (process.env.INSTAGRAM_REELS_ENDPOINT || (scheduled && !feed.enabled)) {
  // A hosted feed serves fresh reels directly. A scheduled check requires Meta credentials.
  process.exit(0);
}

let previous = JSON.parse(await fs.readFile('data/instagram-reel.json', 'utf8')).reel;
try {
  const url = new URL(site.replace(/\/$/, '') + '/api/instagram-reels.json');
  url.searchParams.set('check', Date.now());
  const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
  if (response.ok) {
    const { reel } = await response.json();
    if (reel === null || typeof reel?.permalink === 'string') previous = reel;
  }
} catch {
  // On the first deployment there might not be a published feed yet.
}

let reel = previous;
if (feed.enabled) {
  try {
    reel = await feed.fetchLatest();
  } catch {
    console.warn('Meta could not refresh the Instagram reel. Keeping the last published reel.');
  }
}

await fs.writeFile(snapshot, JSON.stringify({ reel }) + '\n');
if (process.env.GITHUB_OUTPUT) {
  await fs.appendFile(process.env.GITHUB_OUTPUT, `changed=${previous?.permalink !== reel?.permalink}\n`);
}
