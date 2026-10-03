window.Shopify = {
  locale: 'en', country: 'US', currency: { active: 'USD', rate: '1.0' },
  routes: { root: '/' }, designMode: false,
  theme: { name: 'Dimohe local replica', role: 'main' },
  PaymentButton: { init() {} },
  loadFeatures(features, callback) { if (callback) callback(); }
};
