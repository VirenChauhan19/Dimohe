export const holidaySaleHandle = 'holiday-sale';
export const holidaySalePath = '/collections/all?sort_by=created-descending';
export const holidaySaleTiers = [
  { minimum: 0, percent: 25 },
  { minimum: 20000, percent: 30 },
  { minimum: 35000, percent: 35 },
  { minimum: 55000, percent: 40 },
];

export const holidayItemPrice = (price,percent) => price - Math.round(price * percent / 100);

export function holidaySaleTotals(subtotal) {
  if (!Number.isSafeInteger(subtotal) || subtotal < 0) throw new RangeError('Invalid cart subtotal');

  const tierIndex = holidaySaleTiers.findLastIndex(tier => tier.minimum <= subtotal);
  const nextTier = holidaySaleTiers[tierIndex + 1];
  const percent = subtotal ? holidaySaleTiers[tierIndex].percent : 0;
  const total = holidayItemPrice(subtotal,percent);
  const savings = subtotal - total;

  return {
    original_total_price: subtotal,
    items_subtotal_price: subtotal,
    total_price: total,
    total_discount: savings,
    cart_level_discount_applications: savings ? [{
      title: 'Holiday Sale',
      total_allocated_amount: savings,
      type: 'automatic',
      value_type: 'percentage',
      value: String(percent),
    }] : [],
    holiday_sale: {
      percent,
      next: nextTier ? { percent: nextTier.percent, amount: nextTier.minimum - subtotal } : null,
    },
  };
}
