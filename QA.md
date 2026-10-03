# Dimohe redesign verification — October 3, 2026

## Design and merchandising

The new storefront uses original photography with ivory, olive, and terracotta, local Inter and Playfair fonts, an editorial homepage, four primary departments, 23 product types, collection filters, and redesigned product, search, quick-view, cart, contact, and information pages.

All 88 products belong to one primary department: Home & Living 47, Bags 22, Wellness 10, Kids 9. Tote bags are grouped with bags. Shapes and print styles are relabeled from misleading source “Size” fields. Fabric specifications take precedence over marketing prose, packaging is excluded, and unknown materials are omitted. Cotton and silk subtypes share useful material filters. Color families simplify discovery while exact source colors appear in product details.

The captured source has some inconsistent wellness labels (for example, a 150gm title with a 150ml variant). Original variant identifiers and labels are preserved so purchase selections remain consistent with the captured catalog. These source inconsistencies need merchant review before production.

## Automated checks

`node scripts/check.mjs` verifies:

- 252 captured page/section responses and 725 original local asset references.
- Cart images for all 88 products; quantities, totals, add/change/remove, and atomic rejection of invalid requests.
- Search, price sorting/filtering, and retained filter values.
- Selected variant prices/IDs and unavailable variant purchase controls.
- Complete, non-overlapping department membership, all 23 product type collections, material/color/size filters, and specific material/shape classification regressions.

## Browser checks

Reviewed desktop at 1440 × 900 and mobile at 390 × 844. Verified homepage composition, collection layout, linen filtering, product size/price changes, quick-view addition, cart increases/totals/removal, mobile navigation to everyday totes, predictive search and full potli search results, and mobile filters/sorting. No JavaScript errors observed in these flows. Checked for horizontal overflow and broken loaded images.

Screenshots are saved under the ignored `reference/redesign/` directory.

## Preview limits

Live inventory, customer accounts, payments, and checkout require Shopify connections. The preview cart resets on server restart. Contact uses the published email address. The earlier source comparison applies to retained snapshots, not to the new visual design. These checks cover the listed flows; they do not establish that every possible interaction is bug-free.

## GitHub Pages build

`npm run build:pages` exports 160 redesigned pages, 598 assets, and all 88 products under the repository base path. `npm run check:pages` passed: all 160 generated routes, 2,655 asset references, base-prefixed links and actions, static cart persistence, totals, quantity validation, unavailable variants, and rejection without mutating the cart. The deployment workflow runs these build checks before publishing. Browser testing of this build was blocked by the in-app browser’s local URL access restriction; the earlier browser checks cover the shared redesign components.
