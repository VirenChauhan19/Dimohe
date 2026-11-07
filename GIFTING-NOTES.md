# Gifts: November 7, 2026

## Navigation and layout

One **Gifts** dropdown/accordion in both desktop and mobile navigation contains all gifts, gifts under $100, hosting, bath and body, hair care, home, and jewellery sets. The footer links to the same gift destination. `/pages/gifting/` is retained so previously shared links continue to work.

The page groups six bundles into four sections. Two-column hosting and bathing cards become one column on phones. The single hair and home bundles use an image/copy split on larger screens and stack on mobile. Category links wrap rather than causing horizontal page overflow.

## Fulfilment and jewellery sets

Etsy links, external checkout and Etsy price text have been removed. The Rose Ritual and Unwind are presented as fulfilled by Dimohe. Both display the last recorded $59.50 selling price. A question was sent to the owner to confirm these are the intended Dimohe prices; update `priceCents` in `gifting.collaborations` if needed. No additional 10% reduction is applied to these fixed-price collaboration sets, because a separate-item necklace price is not established.

Real Shopify gift products have not been supplied. All eight cards currently offer **Enquire with Dimohe**, opening a pre-addressed email with the selected set's name. This is not a checkout integration or an automatic order. When actual Shopify product URLs and variants are supplied, replace `purchaseURL: null` with verified product paths and wire variant selection to those products before enabling online bundle purchases. Never create fictitious variant IDs or imply that an unconfigured discount will be honoured in Shopify checkout.

## Component and bundle prices

Official source: `https://dimohe.com/products.json?limit=250`, read November 7, 2026. Current promotional component prices were verified by product and variant. The 11 components used on the page have also been refreshed in `data/products.json` so individual product prices match the bundle arithmetic. Titles, imagery, original content, and page formats are preserved.

The older local napkin product URLs refer to six-piece packs. Their variant IDs were corrected to the official six-piece variants, rather than the old variant IDs that now represent two napkins. The bundle selectors separately offer verified two/four/six pack prices ($25.50/$46.75/$67.15). They do not manufacture cart variants.

Every Dimohe bundle is `round(sum(current component prices in cents) * 90 / 100)`. The displayed saving is the combined total minus the rounded bundle price. This is 10% below current promotional prices, as requested. No welcome-offer stacking promise is made.

| Bundle | Contents / quantity | Combined current price | Bundle price |
| --- | --- | ---: | ---: |
| The Willow Table | Sage Vine runner + 2 / 4 / 6 Olive Willow napkins | $109.65 / $130.90 / $151.30 | $98.69 / $117.81 / $136.17 |
| Rose & Raspberry | Nava oil + 2 / 4 / 6 Raspberry Bloom napkins | $49.30 / $70.55 / $90.95 | $44.37 / $63.50 / $81.86 |
| The Bathing Set | Nava oil + Coconut Milk Shampoo + Ubtan | $73.95 | $66.56 |
| Ubtan & Waffle Cotton | Ubtan + 4 Crimson Botanica face towels | $91.80 | $82.62 |
| The Wash Day Set | Mystic oil + Coconut Milk Shampoo + Lavender Conditioner | $73.10 | $65.79 |
| Blush & Terracotta | Blush Garden throw + Terracotta Bloom cushion cover | $227.80 | $205.02 |

Cushion inserts are explicitly excluded. Real product photography is used; no generated bundle packaging or invented gift-note/wrapping service is shown. The generic catalogue note says packaging may vary. Collaboration sets retain their documented keepsake box and intention card.

## Homepage offers

The existing 10% welcome signup offer remains first. After a visitor dismisses it, the **10% bundle offer** is queued for 1,000 ms later. It shows once per session, waits for other dialogs/menus/typing/background tabs, and links to the gift bundles. The static welcome signup still needs an email-provider endpoint configured separately; no successful subscription is claimed without a confirmed response.

## Validation

`node scripts/check-gifting.mjs` checks exact 10% arithmetic, all napkin configurations, current component price agreement, the single Gifts navigation hierarchy, local image existence, displayed collaboration prices and the absence of Etsy checkout. Existing popup sequence, welcome persistence, storefront and static Pages checks remain applicable.
