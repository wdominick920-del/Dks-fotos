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
  function sections(items) {
    return items.filter(item => item.text && String(item.text).trim()).map(item => item.heading.toUpperCase() + '\n' + String(item.text).trim()).join('\n\n');
  }
  function message(subject, body, reference = get()) {
    const existing = body.match(/^Client reference: ([^\r\n]+)(?:\r?\n|$)/);
    if (existing) reference = existing[1];
    else body = 'Client reference: ' + reference + '\nDKs Photography | GENERAL ENQUIRY\nStatus: Prepared message; receipt and booking not confirmed.\n\nMESSAGE\n' + body.trim();
    const consentRecord = /DKs Photography \| (PHOTO-USE CHOICE|PERMISSION CHANGE)/.test(body);
    if (!consentRecord && valid(reference) && !body.includes(consentUrl(reference))) body += '\n\nPHOTO-USE CHOICE (OPTIONAL)\n' + consentUrl(reference) + '\nSeparate from your booking; declining does not affect service or price.';
    if (!subject.includes(reference)) subject = '[' + reference + '] ' + subject;
    return { reference, subject, body };
  }
  function compose(kind, items, reference = get()) {
    const type = kind.toUpperCase();
    const status = type === 'PHOTO-USE CHOICE' ? 'Client-prepared choice; verify identity and authority before use.' : type === 'PERMISSION CHANGE' ? 'Client-prepared request; verification and manual action required.' : type === 'CLIENT FEEDBACK' ? 'Client-prepared feedback; review before any publication.' : 'Request only; availability, quotation and booking require confirmation.';
    const body = 'Client reference: ' + reference + '\nDKs Photography | ' + type + '\nStatus: ' + status + '\n\n' + sections(items);
    return message('DKs Photography | ' + kind, body, reference).body;
  }
  function details(body) {
    if (!body.startsWith('Client reference: ')) return body;
    if (!/^Client reference: [^\n]+\nDKs Photography \| /.test(body)) {
      return body.replace(/^Client reference: [^\n]+\n/, '').split('\n\nOptional photo-use choice for this reference:')[0].trim();
    }
    const start = body.indexOf('\n\n');
    let content = start >= 0 ? body.slice(start + 2) : body;
    for (const heading of ['\n\nPHOTO-USE CHOICE (OPTIONAL)\n', '\n\nNEXT STEP\n']) {
      const end = content.indexOf(heading); if (end >= 0) content = content.slice(0, end);
    }
    return content.trim();
  }
  window.DKS_REFERENCE = { get, valid, message, compose, details, consentUrl, fresh: () => save(create()) };
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
