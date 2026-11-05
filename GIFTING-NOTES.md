# Gifting page: product evidence and launch settings

Page: `/pages/gifting/`. The layout and product content live in `lib/gifting.mjs`; photography lives in `public/media/gifting-rose.svg` and `public/media/gifting-amethyst.svg`. Images are locally hosted, compressed copies of the supplied collaboration listings, not hotlinks or generated product photos.

## Sources checked November 2; component prices rechecked November 4, 2026

- [Rose Ritual listing](https://www.etsy.com/listing/4604070017/rose-quartz-necklace-gift-set-for-her): rose-quartz heart necklace, Nava Body Oil (100 ml), keepsake box and intention card. Seller: HeartsLinked by Exorti. Observed sale price $59.50; stated original price $70.00.
- [Unwind listing](https://www.etsy.com/listing/4608107804/amethyst-gift-set-for-her-relaxation): amethyst heart necklace, Lavender Smoothening Conditioner (150 g), keepsake box and intention card. The listing title says hair mask, but its detailed contents and photographed jar specify conditioner. The page uses conditioner. Observed sale price $59.50; stated original price $70.00.
- Both Etsy promotions stated that the sale ends in six days. The storefront deliberately says **Current price on Etsy** rather than presenting a temporary price as an evergreen offer. `observedPrice` records the research; `priceApprovedForDisplay` defaults to false.
- Official Dimohe product data: `https://dimohe.com/products.json?limit=250`, plus individual `/products/{handle}.js` endpoints. Current prices already include the site's 15% promotion. Existing captured storefront prices were not used as current research values.
- Nava Body Oil and Mystic Hair Oil: $23.80 each, currently available.
- Snanamrit Ubtan: $24.65, currently available.
- Crimson Botanica Waffle Face Towels, set of four: $67.15, currently available.
- Raspberry Bloom Cocktail Napkins Large and Olive Willow Cocktail Napkins Large: current handles are `raspberry-bloom-cocktail-napkins` and `olive-willow-cocktail-napkins`. Their old `-set-of-6` URLs return 404 on the official store. Both now have **8x8 / Set of 2**, **8x8 / Set of 4**, and **8x8 / Set of 6** variants at $25.50, $46.75 and $67.15. The six-piece formats are 8 × 8 inches. We do not use the separate smaller 6/12-piece napkin line. Product descriptions still contain an inconsistent “4 Units” line; explicit variant titles establish the configurations. Confirm the physical packout before launch.

## Approved bundle pricing, November 4

The user approved a 15% reduction from the sum of the current individual selling prices. Calculations use integer cents: `round((wellness + textile pack) × 0.85)`. Savings are the separate-item total minus that rounded price. These component prices already reflect the original site's current promotion; the bundle calculation applies the requested further reduction to their sum. No welcome-code stacking terms are promised.

| Bundle | Textile quantity | Individual items total | Bundle price | Saving |
| --- | --- | ---: | ---: | ---: |
| Ubtan & Waffle Cotton | 4 face towels | $91.80 | $78.03 | $13.77 |
| Rose & Raspberry | 2 napkins | $49.30 | $41.91 | $7.39 |
| Rose & Raspberry | 4 napkins | $70.55 | $59.97 | $10.58 |
| Rose & Raspberry | 6 napkins | $90.95 | $77.31 | $13.64 |
| Willow & Hair Oil | 2 napkins | $49.30 | $41.91 | $7.39 |
| Willow & Hair Oil | 4 napkins | $70.55 | $59.97 | $10.58 |
| Willow & Hair Oil | 6 napkins | $90.95 | $77.31 | $13.64 |

Pricing is now visible and selectors update contents, totals and savings together. All combinations remain below $100. The three bundles are explicitly labelled as previews / available at launch. Price approval does not create real Shopify SKUs, so preview controls still do not create purchasable cart items.

## Updating or launching

- Edit verified `componentPrices` in `lib/gifting.mjs` when individual selling prices change. `bundlePrice` derives the 15% price and exact cent-rounded saving; do not enter an unrelated price by hand.
- Confirm actual packout, physical stock and packaging, then create the real Shopify bundle products and their 2/4/6 variants. SKU creation has not been performed by this GitHub Pages change.
- Enable purchase links only when their real products, availability and prices match these bundle calculations. No fictional SKU or unconfigured checkout endpoint is presented.
- Current imagery shows the actual individual products. The collaboration photos show their existing packaging. No free wrapping, personalisation or gift-note service is promised for Dimohe bundles.

## Homepage offer sequence

- Existing 10% welcome signup stays first, with its existing confirmed-subscriber suppression.
- A visitor's close button, backdrop dismissal or Escape dismissal queues the 15% bundle preview offer after 1,000 ms.
- The follow-up is shown at most once per browser session and only on the homepage. It is not triggered by programmatic closes or by skipping the welcome offer for a subscriber.
- Opening is deferred while another dialog/menu is open, a field is being edited, or the tab is hidden. Its CTA goes directly to the bundle section; no code redemption or discount stacking is implied.
- The static welcome signup still needs the email provider endpoint configured separately. This change does not claim an email has been registered without a successful response.

The original task document ends at “Functional Requirements / Implement:”.
