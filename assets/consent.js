'use strict';
(() => {
  const form = document.getElementById('photo-consent-form');
  if (!form) return;
  const version = '2026-11-10';
  const $ = id => document.getElementById(id);
  const channels = $('consent-channels'), child = $('child-authority');
  let downloadUrl;
  const recordDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  function invalidate() {
    $('consent-record').hidden = true; $('consent-status').textContent = ''; $('consent-error').textContent = ''; $('consent-copy-status').textContent = '';
    if (downloadUrl) { URL.revokeObjectURL(downloadUrl); downloadUrl = undefined; }
    $('consent-record-text').value = ''; $('consent-email').removeAttribute('href'); document.getElementById('consent-email-mailto')?.removeAttribute('href'); $('consent-whatsapp').removeAttribute('href'); $('consent-download').removeAttribute('href');
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
    const given = read('bookingReference');
    const record = DKS_REFERENCE.compose('PHOTO-USE CHOICE', [
      { heading: 'Client & booking', text: 'Client: ' + read('clientName') + '\nBooking reference: ' + (given || 'Not supplied; identify by event date') + '\nEvent date: ' + (read('eventDate') || 'Not supplied; identify by booking reference') + '\nChoice is for: ' + read('representedPerson') },
      { heading: 'Explicit photo-use choice', text: read('promotion') + '\n' + statement },
      { heading: 'Channel permissions', text: allChannels.map(line => '- ' + line).join('\n') },
      { heading: 'Restrictions & expiry', text: 'Restrictions / excluded photographs: ' + (read('restrictions') || 'None specified; channel and verification limits still apply') + '\nPermission end date: ' + (read('permissionEndDate') || 'Not specified') + (yes ? '; permission can be withdrawn' : '; no current publication authority') },
      { heading: 'Child & adult authority', text: isChild ? 'Child identifier: ' + read('childIdentifier') + '\nAdult relationship and legal authority: ' + read('adultAuthority') : '' },
      { heading: 'Notice & acknowledgement', text: 'Notice version: ' + version + '\nNotice: https://wdominick920-del.github.io/Dks-fotos/privacy.html\nRecord date (Africa/Johannesburg): ' + recordDate() + '\nPrepared at (UTC): ' + new Date().toISOString() + '\nAcknowledgement: ' + read('acknowledgement') },
      { heading: 'Owner action', text: 'Verify the person, booking, relevant photographs and any child authority before promotional use. A reference alone is not authorisation.\nUnchecked channels, publishing names, tagging and other guests are not authorised.\nDeclining promotion does not affect the agreed service or price. Keep this record privately; it is not proof of receipt.' }
    ], given || DKS_REFERENCE.get());
    $('consent-record-text').value = record; $('consent-record').hidden = false;
    dksDraftLinks($('consent-email'), $('consent-whatsapp'), 'DKs Photography | Photo-use choice', record);
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
    const body = DKS_REFERENCE.compose('PERMISSION CHANGE', [
      { heading: 'Client & booking', text: 'Client: ' + read('name') + '\nBooking reference or event date: ' + read('booking') },
      { heading: 'Requested change or withdrawal', text: read('request') },
      { heading: 'Notice & request date', text: 'Notice version: ' + version + '\nRequest date (Africa/Johannesburg): ' + recordDate() },
      { heading: 'Owner action', text: 'Verify the request and confirm receipt. Discuss removal from channels you control. This message does not automatically remove photographs or recover third-party copies and distributed print.' }
    ], read('booking'));
    dksDraftLinks($('withdraw-email'), $('withdraw-whatsapp'), 'DKs Photography | Permission change', body);
    $('withdraw-drafts').hidden = false;
    $('withdraw-status').textContent = 'Your change or withdrawal request is ready. Please press Send in your email app or WhatsApp. This contacts DKs Photography; it does not automatically remove published photographs.';
  });
})();
