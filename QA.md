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

## Craft and copy iteration — October 5, 2026

Updated brand messaging, department copy, product introductions, selected display names, craft stories, and category-first navigation with a parallel craft path. Colors are retained. Source catalog records, variant IDs, prices, and option values are unchanged.

The regression suite passed its existing checks plus all three craft collections, distinct Chikankari/Zardozi assignments, the new craft story page, and consistent display names in cart responses. The GitHub Pages build produced 165 pages and 594 assets. Browser review covered the revised homepage, mobile menu, Chikankari collection count, craft story page, and mobile overflow/image loading. Publishing has not been performed for this iteration.

## Minimal copy iteration, October 5, 2026

Shortened the homepage to four sections, removed repeated slogans and labels, and simplified department, craft, product, search, and contact copy. Kept the palette and original photography. Long dashes are removed from display names and retained prose without changing source catalog data or variant values.

The regression suite passed. A rendered-text audit of all captured ordinary page routes found no em dashes, en dashes, or double hyphens. The Pages build produced 165 pages and 594 assets. Desktop and 390px mobile review confirmed no horizontal overflow; the mobile craft menu led to the 10-product Chikankari collection. This revision is available in the local preview and has not been published.

## Competitor reference iteration, October 5, 2026

Retained the four-section homepage and palette. Replaced the mixed product selection with four complementary cushion covers, added shorter card names with explicit type/colour subtitles, grouped home navigation by sofa/table/bath, and used close-up gallery photography in the craft section. Added ten individual product notes, five selected cushion pairing lists, specific product-type introductions, and shorter About/founder copy.

The existing regression suite passed. The static build produced 165 pages and 594 assets. A rendered-text audit found no long dashes. Browser review verified desktop room navigation, loaded craft images, the selected cushion pairings, and mobile navigation to Tablecloths. At 390px, product and collection pages had no horizontal overflow. Added Gulnaar to the local bag, verified its full title and $118 total, then removed the test item. This revision has not been published.

## Supplied commerce brief, October 5, 2026

Applied the six-section homepage, eight-piece edit, four chapter pages, six curated collections, product Craft Passports, context filters, browser-local wishlist, and mobile purchase bar. Preserved the palette, original photography, source prices, IDs, option values, and source records.

Regression checks passed for all 88 products, existing cart and variant behavior, chapter membership, curated collections, schema prices, passports, wellness claim removal, bag description correction, selected-filter chips, and the wishlist route. Static Pages build produced 176 pages and 594 assets. Rendered-text audit returned no long dashes. Browser review verified wishlist persistence, 390px product layout without overflow, and sticky Add to Bag at the correct $549 price. Fixed a fast-scroll case that could skip the purchase bar. Removed the test bag item afterward. Desktop viewport was restored and the homepage left open.

This revision is local only. Shipping/returns reconciliation, verified labels and maker details, founder imagery, and live service connections remain listed in IMPLEMENTATION.md.

## Our Picks navigation refinement

Renamed the selected collection to Our Picks, removed it from the main and mobile navigation, moved shopping category tiles before the homepage picks, and added working category buttons to show one department at a time. Our Stories groups crafts and collection chapters in separate columns. Founder Story is a separate navigation link. Existing collection URLs remain compatible.

Regression checks and the 176-page build passed. Browser review confirmed the Bags button displays only three bag picks, desktop story groups are clearly separated, and the 390px mobile menu has no horizontal overflow. This revision remains local.

## Subtle scroll motion

Added eased scroll-linked image scale (up to 4% on desktop and 3% on mobile), small vertical image movement inside existing frames, and one-time 12px section/product reveals. Only nearby images are updated; animation frames stop after settling and while the document is hidden. Reduced-motion preferences disable the new movement and reveal effects. Content stays readable without animation, and focus restores full opacity immediately.

Browser review confirmed photo scale changes in both scroll directions, mobile image movement, category switching with fully visible products, and no overflow at 390px. JavaScript syntax, diff checks, and the 176-page static build passed. The reduced-motion branch is implemented but was not tested by changing the user's system preference. Local preview only.

## Product motion refinement

Product cards now rise with a short stagger, gently scale towards full size as they pass through the viewing area, and have a small photo lift on pointer hover. Changing the homepage picks animates the newly selected products. Added restrained scroll depth to the main product photograph. Reduced-motion preferences disable these additions; keyboard focus restores steady card scale.

Browser review verified changing card scale and vertical position during scrolling, fully visible category selections, quick-view interaction, and 390px mobile layout without overflow. No browser errors were captured. JavaScript syntax and diff checks passed. Viewport restored after review. Local only.

## Original brand film and homepage refinement

Added the original 96-second, 606-by-1080 Dimohe film between Our Picks and the craft chapters. Preserved its complete portrait framing, provided native playback/fullscreen controls, and used the existing local MP4 asset. Playback is user-initiated and pauses when the video leaves the viewport. Added byte-range streaming to the local preview server for efficient loading and seeking.

Simplified hero, chapter, and founder headlines; removed repetitive editorial labels; added the original journal to Our Stories; and made selected product grids fill their category layout. Preserved colours, original images, craft details, product data, and navigation hierarchy.

Live-source comparison found the same homepage sections/media and the same 88 product records, without new products or changed descriptions, images, variant prices, or availability. Existing original-site shopping groups and journal content remain represented in the redesign.

Regression checks passed, including original video source, native controls, no autoplay, placement, video HEAD metadata, first-byte and suffix range requests, invalid-range responses, and no cart cookie on video requests. Browser review confirmed local playback, automatic pause after scrolling away, 390px layout with no overflow, and complete 320px-by-570px portrait framing. Rendered-text audit found no long dashes. Static build produced 176 pages and 595 assets, including the MP4. This revision has not been published.

## Muted viewport autoplay

The film now starts muted as it comes into view, with a visible Pause film control. Browser checks confirmed manual pause persists across scrolling away and back, while playback paused automatically offscreen resumes on return. The 390px mobile layout has no horizontal overflow and the caption controls fit within the 320px film width. Reduced-motion preferences disable automatic playback. Regression checks passed, including video streaming and storefront commerce. Static build produced 176 pages and 595 assets. This revision remains local.

## Craft clarity and wellness detail restoration

Verified all ten wellness pages against their captured source: every usage step, ingredient highlight, benefit, FAQ question and answer, and original information accordion is retained. All restored media files exist locally. Browser review confirmed ingredient and FAQ accordions work, and the homepage and wellness pages fit the 390px viewport without horizontal overflow. Craft labels appear on product cards and product pages. Complete storefront checks passed. Static Pages build produced 176 pages and 624 assets. These changes remain local.
