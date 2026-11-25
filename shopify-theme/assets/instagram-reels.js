(() => {
  const refreshInterval = 30_000;
  let embedScript;

  function renderInstagramEmbed() {
    if (window.instgrm?.Embeds) return window.instgrm.Embeds.process();
    if (embedScript) return;
    embedScript = document.createElement('script');
    embedScript.src = 'https://www.instagram.com/embed.js';
    embedScript.async = true;
    embedScript.addEventListener('load', () => window.instgrm?.Embeds?.process(), { once: true });
    document.head.append(embedScript);
  }

  function connect(section) {
    const endpoint = section.dataset.instagramReels;
    if (!endpoint || section.dataset.instagramConnected) return;
    section.dataset.instagramConnected = 'true';
    const slot = section.querySelector('[data-instagram-reel]');
    if (!slot) return;
    let current;
    let timer;
    let checking = false;

    async function refresh() {
      clearTimeout(timer);
      if (checking || document.hidden || !section.isConnected) return;
      checking = true;
      try {
        const response = await fetch(endpoint, {
          cache: 'no-store',
          credentials: 'omit',
          signal: AbortSignal.timeout(30_000),
        });
        if (!response.ok) return;
        const { reel } = await response.json();
        const url = reel?.permalink;
        if (reel === null) {
          slot.hidden = true;
          slot.replaceChildren();
          current = undefined;
          return;
        }
        if (typeof url !== 'string' || url === current ||
            !/^https:\/\/(?:www\.)?instagram\.com\/(?:reel|p)\/[\w-]+\/$/.test(url)) return;

        const embed = document.createElement('blockquote');
        embed.className = 'instagram-media';
        embed.dataset.instgrmPermalink = url;
        embed.dataset.instgrmVersion = '14';
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'text-link';
        link.textContent = 'Watch the latest reel on Instagram';
        embed.append(link);
        slot.replaceChildren(embed);
        slot.hidden = false;
        current = url;
        renderInstagramEmbed();
      } catch {
        // Keep the existing reel when a refresh fails.
      } finally {
        checking = false;
        if (section.isConnected && !document.hidden) timer = setTimeout(refresh, refreshInterval);
      }
    }

    const visibilityChanged = () => document.hidden ? clearTimeout(timer) : refresh();
    const unload = event => {
      if (!event.target.contains(section)) return;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', visibilityChanged);
      document.removeEventListener('shopify:section:unload', unload);
    };
    document.addEventListener('visibilitychange', visibilityChanged);
    document.addEventListener('shopify:section:unload', unload);
    refresh();
  }

  const connectAll = () => document.querySelectorAll('[data-instagram-reels]').forEach(connect);
  connectAll();
  document.addEventListener('shopify:section:load', connectAll);
})();
