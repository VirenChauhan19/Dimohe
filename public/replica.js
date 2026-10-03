(() => {
  const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  // Preserve native theme interactions while implementing local cart quantity controls.
  document.addEventListener('click', async event => {
    const control = event.target.closest('[data-cart-quantity]');
    if (!control) return;
    event.preventDefault(); event.stopImmediatePropagation(); control.disabled = true;
    try {
      const response = await fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: control.dataset.variant, quantity: Number(control.dataset.cartQuantity), sections: 'cart-drawer' }) });
      const cart = await response.json();
      if (!response.ok) throw new Error(cart.description || 'Unable to update your bag.');
      if (location.pathname === '/cart') { location.reload(); return; }
      document.querySelector('cart-drawer')?.renderContents(cart);
    } catch (error) { announce(error.message); }
    finally { control.disabled = false; }
  }, true);
  function announce(message) {
    let status = document.getElementById('replica-status');
    if (!status) { status = document.createElement('div'); status.id = 'replica-status'; status.setAttribute('role', 'status'); document.body.append(status); }
    status.innerHTML = escape(message); status.hidden = false;
    setTimeout(() => { status.hidden = true; }, 7000);
  }
  document.addEventListener('submit', event => {
    const form = event.target;
    if (form.matches('form[action^="/contact"]')) {
      event.preventDefault(); event.stopImmediatePropagation();
      announce('Your message has not been sent. Contact delivery requires an email service connection.');
    }
  }, true);
  // Give the theme's custom search trigger a keyboard-accessible name.
  document.querySelectorAll('search-drawer-trigger').forEach(el => { el.setAttribute('role', 'button'); el.setAttribute('aria-label', 'Search'); });
  const renderPayments = () => document.querySelectorAll('shopify-accelerated-checkout').forEach(el => {
    el.replaceWith(Object.assign(document.createElement('div'), { innerHTML: '<a class="replica-shop-button" href="/checkout">Buy with <strong>shop</strong></a><a class="replica-payment-options" href="/checkout">More payment options</a>' }));
  });
  renderPayments();
  const quickView = document.querySelector('quick-view');
  if (quickView) new MutationObserver(renderPayments).observe(quickView, { childList: true, subtree: true });
  // Keep the URL aligned with the selected variant after the theme's asynchronous update.
  document.querySelectorAll('#MainContent variant-selector').forEach(picker => {
    if (picker.dataset.updateUrl === 'false') return;
    new MutationObserver(() => {
      const input = picker.querySelector('input[type="radio"]:checked');
      const script = picker.querySelector('script[data-name="main-product"]');
      if (!input || !script) return;
      try {
        const variant = JSON.parse(script.textContent);
        if (!variant.id || input.dataset.variantId !== String(variant.id)) return;
        const url = new URL(location.href);
        url.searchParams.set('variant', variant.id);
        history.replaceState({}, '', url);
      } catch {}
    }).observe(picker, { childList: true, subtree: true });
  });
})();
