const refreshInterval = 30_000;
const maxMediaPages = 5;

async function readLatestReel({ userId, accessToken, apiVersion }, fetchMedia) {
  const url = new URL(`https://graph.facebook.com/${apiVersion}/${userId}/media`);
  url.searchParams.set('fields', 'id,media_product_type,permalink,timestamp');
  url.searchParams.set('limit', '50');

  for (let page = 0; page < maxMediaPages; page++) {
    const response = await fetchMedia(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      redirect: 'error',
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error(`Meta returned HTTP ${response.status}`);
    const { data, paging } = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid Instagram media response');

    // The media edge starts with the most recent posts. A page can include non-reels.
    const reel = data.filter(item => item?.media_product_type === 'REELS' &&
      Number.isFinite(Date.parse(item.timestamp)) &&
      /^https:\/\/(?:www\.)?instagram\.com\/(?:reel|p)\/[\w-]+\/?(?:\?.*)?$/.test(item.permalink))
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0];
    if (reel) return {
      id: reel.id,
      permalink: reel.permalink.split('?')[0].replace(/\/?$/, '/'),
      timestamp: reel.timestamp,
    };
    if (!paging?.next || !paging.cursors?.after) return null;
    // Reuse the fixed Meta endpoint. Only the pagination cursor carries over.
    url.searchParams.set('after', paging.cursors.after);
  }

  return null;
}

export function createInstagramReelsFeed(env = process.env, { fetchMedia = fetch, now = Date.now } = {}) {
  const config = {
    userId: env.INSTAGRAM_USER_ID?.trim(),
    accessToken: env.INSTAGRAM_ACCESS_TOKEN?.trim(),
    apiVersion: env.INSTAGRAM_GRAPH_VERSION?.trim() || 'v27.0',
  };
  const enabled = /^\d+$/.test(config.userId) && Boolean(config.accessToken) && /^v\d+\.\d+$/.test(config.apiVersion);
  const fetchLatest = () => readLatestReel(config, fetchMedia);
  let reel = null;
  let freshUntil = 0;
  let retryAt = 0;
  let pending;

  async function refresh() {
    try {
      reel = await fetchLatest();
      freshUntil = now() + refreshInterval;
    } catch (error) {
      retryAt = now() + refreshInterval;
      // Fetch errors can include request details. Log only the HTTP status we construct.
      const status = /^Meta returned HTTP \d+$/.test(error.message) ? error.message : 'request failed';
      console.warn(`Instagram reel refresh: ${status}`);
    } finally {
      pending = undefined;
    }
  }

  return {
    enabled,
    fetchLatest,
    async respond(req, res) {
      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
      };
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { ...headers, Allow: 'GET, HEAD' });
        return res.end();
      }
      if (enabled && now() >= Math.max(freshUntil, retryAt)) {
        pending ??= refresh();
        await pending;
      }
      const unavailable = enabled && retryAt > freshUntil && !reel;
      res.writeHead(unavailable ? 503 : 200, headers);
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ reel }));
    },
  };
}
