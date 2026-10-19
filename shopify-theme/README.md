# Dimohe Shopify theme

This is the editable source for the current Shopify redesign. The older Node storefront and GitHub Pages build at the repository root are a separate implementation.

Only assets, config, layout, locales, sections, snippets and templates are included in the Shopify upload ZIP. Run `python3 scripts/package-shopify-theme.py` from the repository root to build and validate `artifacts/Dimohe-Shopify-October18-Refined.zip` under 50 MB.

See `artifacts/Dimohe-Feedback-Audit-October18.md` for completed changes, required merchant data and Shopify setup that cannot be supplied by a theme ZIP.

`snippets/product-facts-*.liquid` preserve product-specific care and wellness information from the saved original Dimohe product pages. Native product metafields take precedence. Prices and stock always come from Shopify. No craft durations are invented.

The 69 bundled craft-time estimates come from `DIMOHE_Time_to_Craft_69_Products.xlsx`, matched by exact Shopify handle. They are labeled as estimates because the workbook describes them as proposed, not supplier-verified. Nine woven totes and ten wellness products are intentionally excluded. Native craft-time metafields override the estimates.

The supplied workshop and Ayurveda videos have been reviewed and integrated. The homepage shares a 23-second needlework film with the embroidery story. The workroom section also offers the pattern-drawing film. The Ayurveda story features coconut shampoo, hibiscus hair oil and ubtan. Five wellness product pages use exact product footage; other relevant products retain clearly labeled collection films. Ubtan is labeled as an application video. Full frames, native controls, lazy loading and a single active video keep playback quiet and optional. A paused homepage film stays paused when scrolling away and back. Native `custom.making_video` video references can override bundled product footage.

`artifacts/oct18-curated-film-manifest.json` records the selected sources and placement. Hair & Scalp Cleanser was not assigned to a different product because no exact matching product exists in the current catalogue. The finished-bag fashion reel was replaced by closer views of the actual handwork. Supplied originals have been preserved separately in the temporary working folder; the upload ZIP contains only web versions.
