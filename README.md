# Dimohe storefront replica

A local replica of the public storefront at https://dimohe.com/, captured on October 3, 2026. The original page markup, theme CSS, theme JavaScript, fonts, photographs, and video are stored in this repository.

## Run

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`. The server listens on the local computer by default. `PORT` and `HOST` can configure its address.

## Included

- Home page with the original animated slides, collection panels, product tabs, and footer.
- All 88 public product detail pages, their galleries, descriptions, variants, and prices.
- All 46 collections listed in the reference sitemap, plus the all-products collection and collection pagination.
- Story, founder, contact, shipping and returns, other informational pages, blog pages, and published policies.
- Original desktop and mobile navigation, menus, search drawer, quick views, and image zoom.
- Local predictive search, full search results, collection sorting, and price filtering.
- A local cart with native theme drawer behavior, add/remove actions, quantity controls, and calculated totals. Carts survive page navigation and reloads; the preview server keeps cart sessions in memory and resets them when restarted.

The inventory in `data/routes.json` contains 164 complete pages and 88 product quick-view sections. Product data is in `data/products.json`.

## Service connections

This is a public storefront snapshot with a local preview backend. The original store's private Shopify theme source, admin data, and hosted services cannot be retrieved from its public website. Customer authentication, checkout/payment processing, contact email delivery, live inventory, currency conversion, and review submission require actual service connections. Account and checkout routes explain that connection requirement. Contact forms report that messages have not been sent. The preview never creates orders or submits messages to the original store.

The source currently returns 404 for `/policies/terms-of-service` and `/collections/luxury-handbag`; local requests also return a branded 404. The functioning handbag collection is `/collections/hand-bags`. A decorative arrow that was missing on the original asset host has a local SVG replacement.

## Verify and refresh

With the development server running:

```sh
npm run check
```

Checks all captured pages and local assets, and exercises cart totals, add/change/remove actions, invalid variants, search, sorting, price filtering, and variant prices. Desktop and mobile layouts, the native cart drawer, predictive search, and native sorting were also checked in the browser.

Run `npm run compare-source` to compare representative homepage, collection, product, and story-page headings, image filenames, and internal destination links with the live original. This requires internet access and intentionally excludes fragment-only controls and live hosted-service widgets.

The October 3 audit corrected catalog image URL mapping in cart/search, zero and excessive cart quantities, direct sold-out variant purchase controls, price-slider values after filtering, and mobile submenu close behavior. Regression checks cover all 88 product cart images. Browser checks covered desktop search, size selection, cart totals and removal, mobile navigation, quick-view add-to-cart, and price filtering. See `QA.md` for the verification scope and service limitations.

To recapture the current public site and its assets:

```sh
npm run sync
```

The sync script downloads public pages and assets. It does not access Shopify admin or modify the original store. The download report is written to `data/sync-report.json`. Restart the preview server after recapturing pages.
