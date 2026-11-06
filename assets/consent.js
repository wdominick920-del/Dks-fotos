'use strict';
(() => {
  const form = document.getElementById('photo-consent-form');
  if (!form) return;
  const version = '2026-11-06';
  const $ = id => document.getElementById(id);
  const channels = $('consent-channels'), child = $('child-authority');
  let downloadUrl;
  const recordDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  function invalidate() {
    $('consent-record').hidden = true; $('consent-status').textContent = ''; $('consent-error').textContent = ''; $('consent-copy-status').textContent = '';
    if (downloadUrl) { URL.revokeObjectURL(downloadUrl); downloadUrl = undefined; }
    $('consent-record-text').value = ''; $('consent-email').removeAttribute('href'); $('consent-whatsapp').removeAttribute('href'); $('consent-download').removeAttribute('href');
  }
  form.addEventListener('input', invalidate);
  form.addEventListener('change', () => {
    const choice = form.querySelector('[name=promotion]:checked')?.value;
    const yes = choice === 'Yes, for the channels I select';
    channels.hidden = !yes; channels.disabled = !yes;
    if (!yes) channels.querySelectorAll('input').forEach(input => input.checked = false);
    const isChild = form.querySelector('[name=representedPerson]:checked')?.value === 'A child I am legally authorised to represent';
    child.hidden = !isChild; child.disabled = !isChild;
    child.querySelectorAll('input').forEach(input => { input.required = isChild; if (!isChild) input.value = ''; });
  });
  form.addEventListener('submit', async event => {
    event.preventDefault(); invalidate();
    if (!form.reportValidity()) return;
    const data = new FormData(form), read = name => String(data.get(name) || '').trim();
    const fail = (message, focusId) => { $('consent-error').textContent = message; $(focusId).focus(); };
    if (!read('clientName')) return fail('Enter your name.', 'consent-name');
    if (!read('bookingReference') && !read('eventDate')) return fail('Enter a booking reference or event date to identify your booking.', 'consent-booking');
    const yes = read('promotion') === 'Yes, for the channels I select';
    const selectedChannels = yes ? data.getAll('channel') : [];
    if (yes && !selectedChannels.length) { $('consent-error').textContent = 'Select at least one channel, or choose No or Please ask me first.'; channels.querySelector('input').focus(); return; }
    const isChild = read('representedPerson') === 'A child I am legally authorised to represent';
    if (isChild && (!read('childIdentifier') || !read('adultAuthority'))) return fail('Identify the child and explain your legal authority.', 'child-name');
    const statement = yes ? 'Limited permission for the checked channels only, subject to restrictions and verification.' : read('promotion') === 'No' ? 'No promotional use is authorised.' : 'No publication is authorised until separate approval of specific photographs is recorded.';
    const allChannels = [...channels.querySelectorAll('input')].map(input => `${input.value}: ${selectedChannels.includes(input.value) ? 'AUTHORISED for this choice, subject to restrictions' : 'NOT authorised'}`);
    const record = [
      'DKs Photography — Photo-use choice',
      'Notice version: ' + version,
      'Notice: https://wdominick920-del.github.io/Dks-fotos/privacy.html',
      'Record date (Africa/Johannesburg): ' + recordDate(),
      'Prepared at (UTC): ' + new Date().toISOString(),
      'Client name (private booking record only): ' + read('clientName'),
      'Booking reference: ' + (read('bookingReference') || 'Not supplied; use event date'),
      'Event date: ' + (read('eventDate') || 'Not supplied; use booking reference'),
      'Explicit choice: ' + read('promotion'), statement,
      'Choice is for: ' + read('representedPerson'),
      ...(isChild ? ['Child identifier: ' + read('childIdentifier'), 'Adult relationship and legal authority: ' + read('adultAuthority')] : []),
      'Channel choices:', ...allChannels,
      'Restrictions / excluded photographs: ' + (read('restrictions') || 'None specified; channel and verification limits still apply'),
      'Permission end date: ' + (read('permissionEndDate') || 'Not specified') + (yes ? '; permission can be withdrawn' : '; does not grant permission — no current publication authority'),
      'Acknowledgement: ' + read('acknowledgement'),
      'This does not permit publishing names or tagging clients. Other guests are not automatically covered.',
      'Declining promotion does not affect the agreed service or price.',
      'DKs Photography must verify the person, authority and relevant photographs before promotional use.',
      'This record is a prepared choice, not proof of receipt. Please retain it privately with the booking.'
    ].join('\n');
    $('consent-record-text').value = record; $('consent-record').hidden = false;
    dksDraftLinks($('consent-email'), $('consent-whatsapp'), 'DKs Photography — Photo-use choice — ' + (read('bookingReference') || read('eventDate')), record);
    downloadUrl = URL.createObjectURL(new Blob([record], { type: 'text/plain;charset=utf-8' })); $('consent-download').href = downloadUrl;
    $('consent-status').textContent = 'Your photo-use choice is ready. Please press Send in your email app or WhatsApp so DKs Photography can receive it.';
    const channel = event.submitter?.dataset.channel || 'email';
    if (channel === 'copy') {
      try { await navigator.clipboard.writeText(record); $('consent-copy-status').textContent = 'Choice copied. Keep a private copy, and send it to DKs Photography to record your choice with the booking.'; }
      catch { $('consent-copy-status').textContent = 'Automatic copying is unavailable. Select and copy the record below, or use Download my record.'; $('consent-record-text').focus(); $('consent-record-text').select(); }
    } else $(channel === 'whatsapp' ? 'consent-whatsapp' : 'consent-email').focus();
  });
  const withdraw = $('withdraw-form');
  withdraw.addEventListener('input', () => { $('withdraw-drafts').hidden = true; $('withdraw-status').textContent = ''; });
  withdraw.addEventListener('submit', event => {
    event.preventDefault(); if (!withdraw.reportValidity()) return;
    const data = new FormData(withdraw), read = name => String(data.get(name) || '').trim();
    if (!read('name') || !read('booking') || read('request').length < 10) { $('withdraw-status').textContent = 'Enter your name, booking reference or date, and at least 10 characters describing the requested change.'; return; }
    const body = ['DKs Photography — Change or withdrawal of photo-use permission', 'Notice version: ' + version, 'Request date (Africa/Johannesburg): ' + recordDate(), 'Name: ' + read('name'), 'Booking reference or event date: ' + read('booking'), 'Requested change: ' + read('request'), 'Please verify this request, confirm receipt and discuss removal from channels you control. I understand this message does not automatically remove published photos or recover third-party copies and distributed print.'].join('\n');
    dksDraftLinks($('withdraw-email'), $('withdraw-whatsapp'), 'DKs Photography — Change or withdraw photo permission', body);
    $('withdraw-drafts').hidden = false;
    $('withdraw-status').textContent = 'Your change or withdrawal request is ready. Please press Send in your email app or WhatsApp. This contacts DKs Photography; it does not automatically remove published photographs.';
  });
})();
