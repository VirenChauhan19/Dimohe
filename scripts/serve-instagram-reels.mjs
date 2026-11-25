import http from 'node:http';
import { createInstagramReelsFeed } from '../lib/instagram-reels.mjs';

const feed = createInstagramReelsFeed();
if (!feed.enabled) throw new Error('Configure INSTAGRAM_USER_ID, INSTAGRAM_ACCESS_TOKEN, and a valid Graph API version.');

const port = Number(process.env.PORT || 3002);
http.createServer((req, res) => {
  if (req.url?.split('?')[0] === '/api/instagram-reels') return feed.respond(req, res);
  res.writeHead(404);
  res.end();
}).listen(port, process.env.HOST || '0.0.0.0', () => {
  console.log(`Instagram reels feed listening on port ${port}`);
});
