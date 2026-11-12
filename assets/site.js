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
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
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
window.dksDraftLinks = (email, whatsapp, subject, body, exact = false) => {
  const prepared = exact ? {subject, body} : DKS_REFERENCE.message(subject, body);
  subject = prepared.subject; body = prepared.body;
  email.href = 'mailto:' + DKS_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  email.removeAttribute('target'); email.setAttribute('aria-label', 'Open email draft in your email app');
  email.textContent = 'Open email draft'; email.classList.remove('gmail-link');
  let gmail = document.getElementById(email.id + '-gmail');
  if (!gmail) {
    gmail = document.createElement('a'); gmail.id = email.id + '-gmail'; gmail.className = 'email-app-fallback';
    gmail.textContent = 'Open in Gmail'; gmail.target = '_blank'; gmail.rel = 'noopener noreferrer'; email.after(gmail);
  }
  gmail.href = 'https://mail.google.com/mail/?' + new URLSearchParams({view:'cm', fs:'1', to:DKS_EMAIL, su:subject, body});
  whatsapp.href = 'https://wa.me/27711833906?text=' + encodeURIComponent(body);
};
async function copyText(text, status) {
  try { await navigator.clipboard.writeText(text); status.textContent = text === DKS_EMAIL ? 'Email address copied.' : 'Copied. Paste it into your email app or WhatsApp, then press Send.'; }
  catch { status.textContent = 'Copy is unavailable. Use an email or WhatsApp draft instead; your details remain in the form.'; }
}
function setupForm(kind) {
  const review = kind === 'review';
  const form = document.getElementById(review ? 'review-form' : 'contact-form');
  if (!form) return;
  const status = document.getElementById(review ? 'review-status' : 'form-status');
  const drafts = document.getElementById(review ? 'review-drafts' : 'enquiry-drafts');
  let last = '', opening = '';
  const copy = document.getElementById(review ? 'copy-review' : 'copy-enquiry');
  copy.addEventListener('click', () => copyText(review ? last : opening, status));
  document.getElementById('copy-full-enquiry')?.addEventListener('click', () => copyText(last, status));
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
      ['distanceMode', 'category', 'packageIndex', 'qextra', 'qportrait', 'qlocations', 'qdistance', 'qportraits', 'qevents', 'qpriority'].forEach(key => { if (selection.has(key)) safeSelection.set(key, selection.get(key).slice(0, 20)); });
      document.getElementById('edit-package').href = 'quote.html?' + safeSelection.toString() + '#calculator';
    }
    if (params.has('package')) document.getElementById('message').value = 'Please confirm availability for my selected package.';
    // History state keeps entered details through calculator edits without placing them in URLs or persistent storage.
    const fields = ['name','email','phone','date','location','message'];
    const saved = history.state?.enquiryFields;
    if (saved) { fields.forEach(name => { if (saved[name] !== undefined) form.elements[name].value = saved[name]; }); form.elements.consent.checked = saved.replyConsent === true; }
    form.addEventListener('input', () => {
      const values = Object.fromEntries(fields.map(name => [name, form.elements[name].value]));
      values.replyConsent = form.elements.consent.checked; history.replaceState({...history.state, enquiryFields:values}, '');
    });
    document.getElementById('edit-package').addEventListener('click', event => {
      // Return to this history entry after editing so the browser retains the private form state.
      event.preventDefault(); history.replaceState({...history.state, editingQuote:true}, '');
      const target = new URL(event.currentTarget.href); target.searchParams.set('returnToEnquiry','1'); location.href = target.href;
    });
    const email = form.elements.email, phone = form.elements.phone;
    const validateReply = () => {
      const usablePhone = /^\+?[\d\s().-]+$/.test(phone.value.trim()) && phone.value.replace(/\D/g,'').length >= 7;
      email.setCustomValidity(!email.value.trim() && !usablePhone ? 'Provide a valid email address or phone number with at least seven digits.' : '');
      phone.setCustomValidity(phone.value.trim() && !usablePhone ? 'Enter a usable phone number, or clear it and provide an email address.' : '');
      email.setAttribute('aria-invalid', String(!email.validity.valid)); phone.setAttribute('aria-invalid', String(!phone.validity.valid));
    };
    email.addEventListener('input', validateReply); phone.addEventListener('input', validateReply);
    form.addEventListener('click', event => { if (event.target.closest('[type=submit]')) validateReply(); });
    validateReply();
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
    const info = pairs => pairs.map(([label, name]) => label + ': ' + (read(name) || 'Not supplied')).join('\n');
    let subject;
    if (review) {
      subject = 'DKs Photography | Client feedback | ' + read('service');
      last = DKS_REFERENCE.compose('CLIENT FEEDBACK', [
        { heading: 'Client & session', text: info([['Client', 'name'], ['Service', 'service'], ['Event date', 'date']]) },
        { heading: 'Rating', text: read('rating') + ' / 5 stars' },
        { heading: 'Written review', text: read('review') },
        { heading: 'Review publication choice', text: data.has('publishPermission') ? 'Permission: Yes, subject to review.\nDisplay name: ' + read('displayName') : 'Permission: No — private feedback only.' },
        { heading: 'Next step', text: 'Review this feedback privately. Do not publish automatically. Review permission is separate from permission to use client photographs.' }
      ]);
    } else {
      subject = 'DKs Photography | Enquiry | ' + read('service');
      last = DKS_REFERENCE.compose('PHOTOGRAPHY ENQUIRY', [
        { heading: 'Client details', text: info([['Name', 'name'], ['Email', 'email'], ['Phone', 'phone']]) },
        { heading: 'Session details', text: info([['Service', 'service'], ['Preferred date', 'date'], ['Venue / location', 'location']]) },
        { heading: 'Client message', text: read('message') },
        { heading: 'Selected package & estimate', text: read('estimate') ? DKS_REFERENCE.details(read('estimate')) : '' },
        { heading: 'Travel policy', text: read('estimate') ? '' : DKS_CONFIG.travelText },
        { heading: 'Next step', text: 'Please confirm availability, final quotation and booking requirements. This enquiry does not confirm a booking.' }
      ]);
    }
    const prepared = DKS_REFERENCE.message(subject, last); subject = prepared.subject; last = prepared.body;
    if (!review) {
      const estimate = read('estimate') ? DKS_REFERENCE.details(read('estimate')) : '';
      const useful = estimate.split('\n').filter(line => /^(Package:|Travel fee:|Estimated total|Additional photography|Extra portrait|Additional locations|- )/.test(line));
      opening = 'Hi DKs Photography! I’d like to enquire about a photography booking.\n\n' +
        [['Name','name'],['Email','email'],['Phone','phone'],['Service','service'],['Date','date'],['Venue','location']].filter(([,name]) => read(name)).map(([label,name]) => label + ': ' + read(name)).join('\n') +
        '\n\n' + read('message') + (useful.length ? '\n\n' + useful.join('\n') : '') +
        '\n\nReference: ' + prepared.reference + '\nPlease confirm availability and final pricing.';
      document.getElementById('enquiry-record').value = last;
    }
    dksDraftLinks(document.getElementById(review ? 'review-email' : 'email-fallback'), document.getElementById(review ? 'review-whatsapp' : 'enquiry-whatsapp'), subject, review ? last : opening, !review);
    const endpoint = review ? DKS_CONFIG.reviewEndpoint : DKS_CONFIG.enquiryEndpoint;
    const submit = form.querySelector('[type=submit]');
    if (endpoint) {
      submit.disabled = true;
      status.textContent = 'Submitting…';
      try {
        if (!/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint)) throw new Error('Unsupported endpoint');
        data.set('subject', subject); data.set('clientReference', prepared.reference); data.set('formattedMessage', last);
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

document.getElementById('copy-email')?.addEventListener('click', () => copyText(DKS_EMAIL, document.getElementById('copy-email-status')));

window.addEventListener('pageshow', () => {
  if (!document.getElementById('contact-form')) return;
  try {
    const pending = sessionStorage.getItem('dks.updated-public-quote');
    if (!pending) return;
    sessionStorage.removeItem('dks.updated-public-quote');
    const url = new URL(pending, location.href);
    if (url.origin !== location.origin || !url.pathname.endsWith('/contact.html')) return;
    history.replaceState(history.state, '', url); location.reload();
  } catch { /* Back navigation still preserves the original form. */ }
});
