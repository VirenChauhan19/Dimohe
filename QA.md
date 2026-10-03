# Storefront audit — October 3, 2026

## Fixed

- Shopify catalog image paths now resolve to downloaded local images in carts and predictive search. All 88 product cart images respond successfully.
- Zero quantities are rejected instead of adding one item. Missing quantities default to one for batch additions. Requests exceeding 99 units per variant are rejected before changing the cart.
- Direct links to unavailable variants disable purchase controls and show “Sold out.”
- Filtering keeps the selected price limit in the slider after a response or reload.
- Closing a mobile submenu no longer references an undefined variable. Submenu arrows now have accessible names and keyboard controls.

## Verified

`node scripts/check.mjs` passed: 252 page/section responses, 725 local asset references, all product cart thumbnails, cart quantities/totals/add/change/remove, invalid and unavailable variants, search, price sorting/filtering, selected variant prices and IDs, sold-out buttons, and retained slider values.

`node scripts/compare-source.mjs` passed for the homepage, home-furnishing collection, Boy Dhola Maru product, and Our Story page. Headings, image filenames, and internal destinations match the original public markup, with fragment controls excluded. This is a content comparison, not a complete pixel comparison.

Browser checks covered desktop and mobile layouts, predictive/full search, size changes, a direct selected-size URL, quick-view add-to-cart, cart image loading, increases and totals, removal and empty state, mobile submenus, sorting, and mobile price filtering. No JavaScript errors were observed during these flows. The copied carousel code can emit warnings about insufficient slides for looping.

Screenshots are saved locally under the ignored `reference/qa/` directory.

## Remaining differences

The preview uses the original public theme assets and snapshots, with a local cart/search backend. Filled cart and search content use local templates. Authentication, payments, contact delivery, live inventory, currency conversion, and review submission still require the original Shopify/service connections. Checkout and account routes explain that requirement. Carts currently reset on server restart.

An audit cannot establish that every possible interaction is bug-free. Exact production parity requires the store's theme source, service configuration, and authenticated test access; these checks cover the public local replica.
