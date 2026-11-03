# Gifting page: product evidence and launch settings

Page: `/pages/gifting/`. The layout and product content live in `lib/gifting.mjs`; photography lives in `public/media/gifting-rose.svg` and `public/media/gifting-amethyst.svg`. Images are locally hosted, compressed copies of the supplied collaboration listings, not hotlinks or generated product photos.

## Verified on November 2, 2026

- [Rose Ritual listing](https://www.etsy.com/listing/4604070017/rose-quartz-necklace-gift-set-for-her): rose-quartz heart necklace, Nava Body Oil (100 ml), keepsake box and intention card. Seller: HeartsLinked by Exorti. Observed sale price $59.50; stated original price $70.00.
- [Unwind listing](https://www.etsy.com/listing/4608107804/amethyst-gift-set-for-her-relaxation): amethyst heart necklace, Lavender Smoothening Conditioner (150 g), keepsake box and intention card. The listing title says hair mask, but its detailed contents and photographed jar specify conditioner. The page uses conditioner. Observed sale price $59.50; stated original price $70.00.
- Both Etsy promotions stated that the sale ends in six days. The storefront deliberately says **Current price on Etsy** rather than presenting a temporary price as an evergreen offer. `observedPrice` records the research; `priceApprovedForDisplay` defaults to false.
- Official Dimohe product data: `https://dimohe.com/products.json?limit=250`, plus individual `/products/{handle}.js` endpoints. Current prices already include the site's 15% promotion. Existing captured storefront prices were not used as current research values.
- Nava Body Oil and Mystic Hair Oil: $23.80 each, currently available.
- Snanamrit Ubtan: $24.65, currently available.
- Crimson Botanica Waffle Face Towels, set of four: $67.15, currently available.
- Raspberry Bloom Cocktail Napkins Large and Olive Willow Cocktail Napkins Large: current handles are `raspberry-bloom-cocktail-napkins` and `olive-willow-cocktail-napkins`. Their old `-set-of-6` URLs return 404 on the official store. Both now have **8x8 / Set of 2**, **8x8 / Set of 4**, and **8x8 / Set of 6** variants at $25.50, $46.75 and $67.15. The six-piece formats are 8 × 8 inches. We do not use the separate smaller 6/12-piece napkin line. Product descriptions still contain an inconsistent “4 Units” line; explicit variant titles establish the configurations. Confirm the physical packout before launch.

## Proposed prices, not approved offers

All three concepts include one wellness product and an existing home textile. These are merchandising proposals. Costs, fulfilment labour, break-pack inventory, packaging cost, collaborator terms and target margins have not been supplied. No proposed price or savings figure is displayed publicly. No bundle SKU exists in the captured catalog, and preview options never add products to the cart.

| Pairing | Contents | Current separate-item total | Proposed bundle price | Proposed saving |
| --- | --- | ---: | ---: | ---: |
| The Daily Pause | Ubtan + Crimson Botanica face towels, set of 4 | $91.80 | $84.00 | $7.80 |
| The Rose Table | Nava + 2 Raspberry Bloom 8 × 8-inch napkins | $49.30 | $44.00 | $5.30 |
| The Rose Table | Nava + 4 Raspberry Bloom 8 × 8-inch napkins | $70.55 | $64.00 | $6.55 |
| The Rose Table | Nava + 6 Raspberry Bloom 8 × 8-inch napkins | $90.95 | $82.00 | $8.95 |
| The Host’s Thank-you | Mystic Hair Oil + 2 Olive Willow 8 × 8-inch napkins | $49.30 | $44.00 | $5.30 |
| The Host’s Thank-you | Mystic Hair Oil + 4 Olive Willow 8 × 8-inch napkins | $70.55 | $64.00 | $6.55 |
| The Host’s Thank-you | Mystic Hair Oil + 6 Olive Willow 8 × 8-inch napkins | $90.95 | $82.00 | $8.95 |

These discounts use actual current pack prices, not an exact fraction of the six-piece list price. All proposals remain below $100. Recalculate against current prices and real costs before approval. Promotions can change, so these numbers do not establish margin viability.

## Before selling the three Dimohe bundles

1. Confirm the pairings, actual stock, napkin dimensions/counts, break-pack process and final packaging.
2. Approve prices using costs and desired margins; create real Shopify bundle products and 2/4/6 variants where applicable.
3. Set the bundle's `approved`, `sku`, `price` and `purchaseURL` only after the real product exists. `price` must be positive and under $100. Current defaults are false/null; cards are Coming soon. For napkin bundles, set these fields separately on each 2/4/6 entry in `configurations`, with its real variant URL, and approve the bundle as a whole. The selector can then show only the selected approved configuration’s price and purchase link.
4. Replace pairing previews with final bundle photographs when available. Do not promise complimentary packaging, personalised notes or customisation before operations support them.
5. Keep checkout on the real product page, where its variants and live availability are authoritative. The prototype napkin buttons only preview contents.

The requested document ends at “Functional Requirements / Implement:”. All explicit preceding requirements are covered; no missing feature list was inferred.
