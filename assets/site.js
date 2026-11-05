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
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const read = name => String(values.get(name) || '').trim();
    if (!read('name') || read('message').length < 10) {
      document.getElementById('form-status').textContent = 'Please enter your name and at least 10 characters about your occasion.';
      return;
    }
    const body = ['Hello DKs Photography,', '', ...[['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Service', 'service'], ['Preferred date', 'date'], ['Location', 'location']].map(([label, name]) => `${label}: ${read(name) || 'Not specified'}`), '', read('message')].join('\n');
    const url = `mailto:wdominick920@gmail.com?subject=${encodeURIComponent('Photography enquiry — ' + read('service'))}&body=${encodeURIComponent(body)}`;
    const fallback = document.getElementById('email-fallback');
    fallback.href = url;
    fallback.hidden = false;
    document.getElementById('form-status').textContent = 'Your enquiry is ready. Use the link below to open your email app, then press Send. You can also email wdominick920@gmail.com directly.';
    fallback.focus();
  });
}
