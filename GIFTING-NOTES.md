# Gifts: November 13, 2026

## Completed page and previous requirements

- A single Gifts accordion/dropdown contains all gifts, gifts under $100 and the gift categories. Existing `/pages/gifting/` URLs still work.
- Eight bundles are grouped into hosting, bathing, hair care and living-room sections. The previous colours, typography, craft content and overall storefront formats are retained.
- Real product photography only. Larger sets show a selection of the included products; exact contents, quantities and sizes are listed. Cushion inserts are explicitly excluded.
- The Rose Ritual and Unwind display their last recorded $59.50 selling prices and Dimohe fulfilment. Etsy links and checkout text remain removed. Jewellery sets are priced separately from the bundle ladder.

## Order ladder

The owner's November 13 examples specified 25% up to $250 and 35% around $350–$550, while asking for an appropriate higher-value ladder. A clarification was sent for the missing bands. Pending a different instruction, the review configuration completes those examples as follows:

| Eligible gift-list merchandise total | Discount |
| --- | ---: |
| Below $250 | 25% |
| $250–$349.99 | 30% |
| $350–$549.99 | 35% |
| $550 and above | 40% |

The page shows explicit, non-overlapping thresholds. The ladder replaces the previous 10% bundle offer. It does not stack with welcome codes. Jewellery/care collaborations are excluded. Shipping and tax are excluded from both the threshold and estimate.

`giftOrderPrice` applies exactly one rate to the sum of current eligible component prices, using integer cents and rounding the final payable amount once. A card shows the estimate for that set alone. The enquiry list sums undiscounted selected-set totals before selecting the order rate; it does not add up already-discounted card prices. Volume selection and quantity controls are capped at 20 of each configuration; larger requests go to Dimohe. The list persists for the browser session and validates saved keys/quantities against the current catalogue.

Whole-order percentage tiers have normal threshold price drops: reaching a larger discount can reduce the payable total. No progressive/marginal discount scheme is substituted for the requested order-value promotion.

## Price and product evidence

Official source: `https://dimohe.com/products.json?limit=250`, retrieved November 13. The previous 15% component promotion has ended: body/hair oils and conditioner are $28, coconut shampoo $30, ubtan $29, throws $159 and the selected cushion covers $109. Seventeen relevant component product records have been refreshed in `data/products.json`. Original titles, product content and layouts remain intact.

Napkin variants are $30/$55/$79 for two/four/six. The local six-piece product URLs retain the verified six-piece variant IDs. Sage Blossom's four-placemat/four-napkin pack is $129; the local product entry uses that exact four-person pack rather than the two-person variant. The Imperial Garden tablecloth in the bundle is the $149 60 × 90 inch variant.

| Set | Separate items total | Set-alone rate | Set-alone estimate |
| --- | ---: | ---: | ---: |
| The Willow Table: runner, 4 placemats + 4 dinner napkins, 2/4/6 cocktail napkins | $258 / $283 / $307 | 30% | $180.60 / $198.10 / $214.90 |
| The Dinner Table: tablecloth, runner, setting for four, 6 cocktail napkins | $456 | 35% | $296.40 |
| Rose & Raspberry: body oil + 2/4/6 cocktail napkins | $58 / $83 / $107 | 25% | $43.50 / $62.25 / $80.25 |
| The Bathing Set: oil, shampoo, ubtan, bath towel | $166 | 25% | $124.50 |
| Ubtan & Waffle Cotton: ubtan + 4 face towels | $108 | 25% | $81 |
| The Wash Day Set: oil, shampoo, conditioner | $86 | 25% | $64.50 |
| Blush & Terracotta: throw + 2 cushion covers | $377 | 35% | $245.05 |
| The Living Room Collection: 2 throws + 3 cushion covers | $645 | 40% | $387 |

## Functional order enquiry and checkout limitation

Each bundle can be added to a separate gift enquiry list. Shoppers can increase/decrease quantities, remove sets, view exact totals and savings, see the next tier, and open a prefilled email with the list and estimate. Opening the email does not send it. Dimohe confirms stock, payment and delivery before placing an order.

No real Shopify bundle product links, SKUs or configured checkout discount have been supplied. No fake cart items, discount codes, successful-payment states or automatic orders are created. Direct Shopify bundle checkout remains an integration step requiring those actual records. The existing retail shopping bag is not altered by the enquiry list.

## Homepage offers

The original 10% welcome signup offer remains first. The follow-up is still queued one second after dismissal, once per session and deferred during other dialogs, menus, typing or background tabs. Its copy now introduces the gift-order ladder and states that welcome codes do not stack. The signup-provider endpoint still needs separate configuration.

## Validation

`check-gifting.mjs` verifies all eight bundle calculations, threshold boundaries, invalid totals, rounding, the combined-order rule, component price consistency, menu hierarchy, jewellery prices, enquiry markup, local photography and absence of Etsy checkout. Browser checks cover quantity changes, removal, selected napkin packs, persistence, mobile/tablet/desktop layouts and enquiry-link totals. Existing storefront/cart, welcome/offer-sequence and Pages asset checks remain applicable.
