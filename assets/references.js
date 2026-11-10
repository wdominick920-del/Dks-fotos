'use strict';
(() => {
  const key = 'dks.enquiry.reference.v1';
  const valid = value => /^DKS-\d{8}-[A-F0-9]{16}$/.test(value || '');
  let current;
  function create() {
    const bytes = new Uint8Array(8); crypto.getRandomValues(bytes);
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).replaceAll('-', '');
    return 'DKS-' + date + '-' + [...bytes].map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  function save(value) { current = value; try { sessionStorage.setItem(key, value); } catch { /* In-memory use still works. */ } return value; }
  function get() {
    if (current) return current;
    const incoming = new URLSearchParams(location.search).get('reference');
    if (valid(incoming)) return save(incoming);
    try { const stored = sessionStorage.getItem(key); if (valid(stored)) return current = stored; } catch { /* Storage is optional. */ }
    return save(create());
  }
  const consentUrl = reference => 'https://wdominick920-del.github.io/Dks-fotos/privacy.html?reference=' + encodeURIComponent(reference) + '#photo-consent';
  function message(subject, body, reference = get()) {
    const existing = body.match(/^Client reference: ([^\r\n]+)(?:\r?\n|$)/);
    if (existing) reference = existing[1];
    if (!existing) body = 'Client reference: ' + reference + '\n' + body;
    if (valid(reference) && !body.includes(consentUrl(reference))) body += '\n\nOptional photo-use choice for this reference: ' + consentUrl(reference) + '\nPromotional permission is optional and does not affect the agreed service or price.';
    if (!subject.includes(reference)) subject = '[' + reference + '] ' + subject;
    return { reference, subject, body };
  }
  window.DKS_REFERENCE = { get, valid, message, consentUrl, fresh: () => save(create()) };
  const quickLinks = [...document.querySelectorAll('a[href]')].filter(link => {
    try { const url = new URL(link.href); return url.hostname === 'mail.google.com' || url.hostname === 'wa.me'; } catch { return false; }
  }).map(link => ({ link, original: link.href }));
  function updateQuickLinks() {
    quickLinks.forEach(({link, original}) => {
      const url = new URL(original);
      const prepared = message(url.searchParams.get('su') || 'DKs Photography enquiry', url.searchParams.get(url.hostname === 'wa.me' ? 'text' : 'body') || 'Hello DKs Photography, I would like to enquire about a photography booking.');
      if (url.hostname === 'wa.me') url.searchParams.set('text', prepared.body);
      else { url.searchParams.set('su', prepared.subject); url.searchParams.set('body', prepared.body); }
      link.href = url.toString();
    });
  }
  updateQuickLinks();
  const panel = document.getElementById('enquiry-reference');
  if (panel) {
    const refresh = () => { panel.querySelector('output').textContent = get(); panel.querySelector('a').href = consentUrl(get()); };
    refresh();
    document.getElementById('new-enquiry-reference').addEventListener('click', () => {
      const previous = get(); save(create()); refresh(); updateQuickLinks();
      const estimate = document.getElementById('selected-estimate');
      if (estimate?.value) estimate.value = estimate.value.replaceAll(previous, get());
      document.getElementById('enquiry-drafts').hidden = true;
      document.getElementById('form-status').textContent = 'New enquiry reference created. Prepare a new draft to use it. Nothing has been sent.';
    });
  }
  const incoming = new URLSearchParams(location.search).get('reference');
  if (valid(incoming)) {
    const field = document.getElementById('consent-booking'); if (field) field.value = incoming;
    const withdraw = document.getElementById('withdraw-booking'); if (withdraw) withdraw.value = incoming;
  }
  const lookup = document.getElementById('reference-consent-form');
  if (lookup) lookup.addEventListener('submit', event => {
    event.preventDefault();
    const field = document.getElementById('given-reference'), value = field.value.trim();
    if (!value) { field.setCustomValidity('Enter the reference you were given.'); field.reportValidity(); return; }
    document.getElementById('consent-booking').value = value;
    document.getElementById('consent-booking').dispatchEvent(new Event('input', { bubbles: true }));
    document.getElementById('reference-consent-status').textContent = 'Reference entered. Complete your own photo-use choice below. This does not verify a booking or authorise any photographs.';
    document.getElementById('photo-consent').scrollIntoView({ behavior: 'smooth' }); document.getElementById('consent-name').focus();
  });
  document.getElementById('given-reference')?.addEventListener('input', event => event.target.setCustomValidity(''));
})();
