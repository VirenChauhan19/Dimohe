# Dimohe — the art of everyday

A redesigned local storefront built around Dimohe’s botanical textiles, artisan bags, wellness rituals, and children’s occasionwear. The design uses ivory, deep olive, terracotta, editorial typography, and original product photography.

## Run

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. `PORT` and `HOST` configure the preview address. The default server listens only on this computer.

## Merchandising and navigation

All 88 captured products have one primary department and product type:

| Department | Products | Navigation |
|---|---:|---|
| Home & Living | 47 | Cushions, throws, table linens, bath textiles |
| Bags | 22 | Everyday totes, antique-handle bags, potlis, round evening bags, clutches |
| Wellness | 10 | Shampoo, conditioners and masks, hair oils, body oils, bathing powder |
| Kids | 9 | Boys’ and girls’ occasionwear |

The catalog has 23 product types. Everyday totes now belong with bags. Collection pages offer category, material, color family, size, stock, and price filters, plus sorting. Product pages include actual variants, prices, availability, image galleries, source descriptions, verified attributes, and related pieces. Quick view, predictive search, and the shopping bag work on desktop and mobile.

`lib/merchandising.mjs` derives attributes from `data/products.json`. Explicit fabric specifications take precedence over general marketing prose; packaging material is excluded. Material filters group cotton and silk variants together, while the product details retain specific fabrics. Color filters use practical color families and product details retain the source’s exact wording. Bag shapes and print styles are relabeled rather than presented as sizes. Unknown attributes are omitted. `data/merchandising.json` is a reviewable export of the resulting catalog.

`lib/storefront.mjs`, `public/storefront.css`, and `public/storefront.js` implement the redesign. The original 164 page snapshots and 88 quick-view sections remain stored for reference and compatible section endpoints. Original informational content is rendered inside the new design.

## Verification

With the preview running:

```sh
npm run check
```

Checks 252 captured routes, 725 original local asset references, all product cart images, variant prices and availability, cart validation/totals, search, sorting, price limits, complete department/type membership, and material/color/size filters. See `QA.md` for browser verification and limitations.

`npm run compare-source` compares the retained source snapshots with representative live original pages. It does not compare the redesigned interface, which intentionally differs from the original.

`npm run sync` refreshes public source snapshots and assets without changing the original store. Restart the server after refreshing and review the derived attributes when the catalog changes.

## Service connections

This is a local preview using captured public catalog data, with an in-memory session cart. Carts survive navigation and reloads but reset when the server restarts. Live inventory, account authentication, checkout, and payments require Shopify connections. The account and checkout pages explain that requirement. Contact links open an email to the published support address; the preview does not send messages or create orders.

## GitHub Pages

The repository includes `.github/workflows/pages.yml`. In GitHub **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. Pushing `main` then builds, checks, and publishes the website automatically.

```sh
npm run build:pages
npm run check:pages
npm run preview:pages
```

The default preview is http://localhost:3001/Dimohe/. `PAGES_BASE_PATH` sets the repository path; the workflow uses GitHub’s own Pages configuration. The generated `dist/` directory is ignored and uploaded as a deployment artifact rather than committed.

The public build preserves the redesigned pages, product options, search, filters, sorting, quick views, and bag totals. Its shopping bag is saved in the visitor’s browser rather than the local Node server. Checkout remains a preview until connected to Shopify. GitHub Pages does not run the Node server.
