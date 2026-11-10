'use strict';
document.body.classList.add('has-js');
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('primary-nav');
function closeMenu() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('header')) closeMenu(); });
document.querySelectorAll('[data-travel-policy]').forEach(el => el.textContent = DKS_CONFIG.travelText);
window.DKS_MESSAGES = {
  enquiryDraft: 'Thank you for considering DKs Photography! Your enquiry is ready—please press Send in your email app or WhatsApp so I can receive it.',
  enquirySuccess: 'Thank you for your enquiry! I appreciate you considering DKs Photography to capture your story. I’ll review your details and get back to you to discuss availability and the next steps. Your booking is confirmed only after the quotation and booking requirements have been agreed.',
  reviewDraft: 'Your review is ready. Please press Send in your email app or WhatsApp to share it with DKs Photography.',
  reviewSuccess: 'Thank you for sharing your experience with DKs Photography. Your feedback helps me grow and helps future clients book with confidence.'
};
const DKS_EMAIL = 'dksphotography1@gmail.com';
window.dksDraftLinks = (email, whatsapp, subject, body) => {
  email.href = 'https://mail.google.com/mail/?' + new URLSearchParams({ view: 'cm', fs: '1', to: DKS_EMAIL, su: subject, body });
  email.target = '_blank'; email.rel = 'noopener noreferrer';
  let fallback = document.getElementById(email.id + '-mailto');
  if (!fallback) {
    fallback = document.createElement('a'); fallback.id = email.id + '-mailto'; fallback.className = 'email-app-fallback';
    fallback.textContent = 'Use my email app instead'; fallback.setAttribute('aria-label', 'Open the same draft in your default email app');
    email.after(fallback);
  }
  fallback.href = 'mailto:' + DKS_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  whatsapp.href = 'https://wa.me/27711833906?text=' + encodeURIComponent(body);
};
async function copyText(text, status) {
  try { await navigator.clipboard.writeText(text); status.textContent = 'Copied. Paste it into your email app or WhatsApp, then press Send.'; }
  catch { status.textContent = 'Copy is unavailable. Use an email or WhatsApp draft instead; your details remain in the form.'; }
}
function setupForm(kind) {
  const review = kind === 'review';
  const form = document.getElementById(review ? 'review-form' : 'contact-form');
  if (!form) return;
  const status = document.getElementById(review ? 'review-status' : 'form-status');
  const drafts = document.getElementById(review ? 'review-drafts' : 'enquiry-drafts');
  let last = '';
  const copy = document.getElementById(review ? 'copy-review' : 'copy-enquiry');
  copy.addEventListener('click', () => copyText(last, status));
  if (review) {
    const permission = document.getElementById('publish-permission');
    const display = document.getElementById('display-name');
    permission.addEventListener('change', () => { display.disabled = !permission.checked; display.required = permission.checked; });
  } else {
    const params = new URLSearchParams(location.search);
    const service = document.getElementById('service');
    if ([...service.options].some(o => o.value === params.get('service'))) service.value = params.get('service');
    const selectedEstimate = document.getElementById('selected-estimate');
    if (params.get('estimate')) {
      selectedEstimate.value = params.get('estimate').slice(0, 6000);
      document.getElementById('enquiry-estimate').hidden = false;
      const serviceValue = document.createElement('input');
      serviceValue.type = 'hidden'; serviceValue.name = 'service'; serviceValue.value = service.value;
      form.append(serviceValue); service.disabled = true;
      service.setAttribute('aria-describedby', 'selected-estimate');
      const selection = new URLSearchParams(params.get('selection') || '');
      const safeSelection = new URLSearchParams();
      ['category', 'packageIndex', 'qextra', 'qportrait', 'qlocations', 'qdistance', 'qportraits', 'qevents', 'qpriority'].forEach(key => { if (selection.has(key)) safeSelection.set(key, selection.get(key).slice(0, 20)); });
      document.getElementById('edit-package').href = 'quote.html?' + safeSelection.toString() + '#calculator';
    }
    if (params.has('package')) document.getElementById('message').value = `I’m interested in ${params.get('service') || 'photography'} — ${params.get('package')} (${params.get('price') || 'price to confirm'}). Please confirm availability and final pricing.`;
  }
  form.addEventListener('input', () => { drafts.hidden = true; status.textContent = ''; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const read = name => String(data.get(name) || '').trim();
    if (!read('name') || (review ? read('review') : read('message')).length < 10 || (review && data.has('publishPermission') && !read('displayName'))) {
      status.textContent = review ? 'Please enter your name, at least 10 characters of feedback, and a display name if you permit publication.' : 'Please enter your name and at least 10 characters about your occasion.';
      return;
    }
    const fields = review ? [['Client name', 'name'], ['Service', 'service'], ['Event date', 'date'], ['Rating (out of 5)', 'rating'], ['Written review', 'review']] : [['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Service', 'service'], ['Preferred date', 'date'], ['Location', 'location'], ['Selected package estimate', 'estimate'], ['Message', 'message']];
    last = 'Hello DKs Photography,\n\n' + fields.map(([label, name]) => `${label}: ${read(name) || 'Not specified'}`).join('\n');
    if (!review && !last.includes(DKS_CONFIG.travelText)) last += '\nTravel policy: ' + DKS_CONFIG.travelText;
    if (review) last += '\nPermission to publish: ' + (data.has('publishPermission') ? 'Yes\nChosen display name: ' + read('displayName') : 'No — private feedback only');
    const subject = review ? 'DKs Photography — Client feedback' : 'Photography enquiry — ' + read('service');
    dksDraftLinks(document.getElementById(review ? 'review-email' : 'email-fallback'), document.getElementById(review ? 'review-whatsapp' : 'enquiry-whatsapp'), subject, last);
    const endpoint = review ? DKS_CONFIG.reviewEndpoint : DKS_CONFIG.enquiryEndpoint;
    const submit = form.querySelector('[type=submit]');
    if (endpoint) {
      submit.disabled = true;
      status.textContent = 'Submitting…';
      try {
        if (!/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint)) throw new Error('Unsupported endpoint');
        data.set('subject', subject);
        if (review) {
          data.set('publication_permission', data.has('publishPermission') ? 'yes' : 'no');
          if (!data.has('publishPermission')) data.delete('displayName');
        }
        const response = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw new Error('Submission was not confirmed');
        status.textContent = DKS_MESSAGES[kind + 'Success'];
        drafts.hidden = true;
      } catch {
        status.textContent = 'Direct submission could not be confirmed. Your details are preserved. ' + DKS_MESSAGES[kind + 'Draft'];
        drafts.hidden = false;
      } finally { submit.disabled = false; }
    } else {
      drafts.hidden = false;
      status.textContent = DKS_MESSAGES[kind + 'Draft'];
    }
  });
}
setupForm('enquiry');
setupForm('review');
// A native modal dialog provides focus containment and Escape handling.
const photos = [...document.querySelectorAll('.photo img')];
if (photos.length) {
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-viewer';
  dialog.setAttribute('aria-label', 'Photograph viewer');
  dialog.innerHTML = '<button type="button" class="viewer-close">Close ×</button><img alt=""><p aria-live="polite"></p><div class="action-row"><button type="button" class="viewer-prev">Previous photo</button><button type="button" class="viewer-next">Next photo</button></div>';
  document.body.append(dialog);
  let index = 0, opener;
  function show(i) { index = (i + photos.length) % photos.length; const img = photos[index]; dialog.querySelector('img').src = img.dataset.full || img.src; dialog.querySelector('img').alt = img.alt; dialog.querySelector('p').textContent = `${index + 1} of ${photos.length} · ${img.alt}`; }
  photos.forEach((img, i) => {
    const button = document.createElement('button'); button.className = 'photo-open'; button.type = 'button'; button.setAttribute('aria-label', 'View larger: ' + img.alt);
    img.replaceWith(button); button.append(img);
    button.addEventListener('click', () => { opener = button; show(i); dialog.showModal(); });
  });
  dialog.querySelector('.viewer-close').onclick = () => dialog.close();
  dialog.querySelector('.viewer-prev').onclick = () => show(index - 1);
  dialog.querySelector('.viewer-next').onclick = () => show(index + 1);
  dialog.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); show(index + (event.key === 'ArrowRight' ? 1 : -1)); } });
  dialog.addEventListener('close', () => opener?.focus());
}
// Keep the floating shortcut clear of forms and the footer at every scroll position.
const floating = document.querySelector('.floating-whatsapp');
if (floating && 'IntersectionObserver' in window) {
  const blocking = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) blocking.add(entry.target); else blocking.delete(entry.target); });
    floating.hidden = blocking.size > 0;
  });
  document.querySelectorAll('form, footer, .quote-summary').forEach(el => observer.observe(el));
}
