(()=>{
const groups=[
['General events & functions',[['Essential',650,'1 hour','Approx. 25+ photos'],['Signature',1200,'2 hours','Approx. 60+ photos'],['Premium',2200,'4 hours','Approx. 120+ photos'],['Full Event',3200,'6 hours','Approx. 180+ photos']]],
['Birthdays & private parties',[['Mini Celebration',600,'1 hour','Approx. 25+ photos'],['Birthday Memories',1100,'2 hours','Approx. 55+ photos'],['Deluxe Celebration',1650,'3 hours','Approx. 90+ photos'],['Complete Celebration',2700,'5 hours','Approx. 150+ photos']]],
['Church events & ceremonies',[['Service Highlights',550,'1 hour','Approx. 25+ photos'],['Ceremony Coverage',1000,'2 hours','Approx. 55+ photos'],['Special Service',1500,'3 hours','Approx. 85+ photos'],['Full Programme',2500,'5 hours','Approx. 140+ photos']]],
['Engagement photography',[['Simple Engagement',750,'45 minutes','Approx. 20+ photos'],['Signature Engagement',1300,'90 minutes','Approx. 45+ photos'],['Premium Engagement',1750,'2 hours','Approx. 65+ photos']]],
['Wedding photography',[['Intimate Wedding',2200,'2 hours','Approx. 70+ photos'],['Classic Wedding',4000,'4 hours','Approx. 150+ photos'],['Signature Wedding',6000,'6 hours','Approx. 250+ photos'],['Full-Day Wedding',8000,'8 hours','Approx. 350+ photos']]],
['Portraits & graduations',[['Quick Portrait',400,'30 minutes','8 photos'],['Personal Portrait',650,'1 hour','20 photos'],['Graduation Memories',750,'1 hour','25 photos'],['Group Graduation',1200,'90 minutes','40 photos']]],
['Business, product & promotional',[['Business Starter',800,'1 hour','15 photos'],['Brand Essentials',1500,'2 hours','35 photos'],['Business Premium',2800,'4 hours','70 photos'],['Product Mini',650,'Up to 5 products','10 photos'],['Product Standard',1200,'Up to 10 products','25 photos']]]];
const $ = id => document.getElementById(id);
const cat = $('qcategory'), pkg = $('qpackage');
const serviceNames = ['Events & Functions', 'Birthdays & Private Parties', 'Church Events & Ceremonies', 'Engagement Photography', 'Wedding Photography', 'Portraits & Graduations', 'Business, Product & Promotional'];
const descriptions = ['Community gatherings, school functions, awards and celebrations.', 'Birthday portraits, cake-cutting, groups and candid moments.', 'Services, choirs and ceremonies, subject to venue permissions.', 'A relaxed, planned session with posing guidance.', 'One photographer, a planning consultation and a private digital gallery.', 'Personal portraits and graduation memories with basic retouching.', 'Brand and product imagery with agreed commercial usage rights.'];
const money = n => 'R' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const number = id => { const value = Number($(id).value); return Number.isFinite(value) ? Math.min(10000, Math.max(0, value)) : 0; };
const selectionControls = [];
let last = '';
groups.forEach((group, i) => cat.add(new Option(serviceNames[i], String(i))));
const description = document.createElement('p');
description.className = 'service-description';
cat.after(description);
function resetExtras() {
  ['qextra', 'qportrait', 'qlocations', 'qdistance'].forEach(id => $(id).value = '0');
  ['qportraits', 'qevents', 'qpriority'].forEach(id => $(id).checked = false);
}
function populate(selected = 0) {
  const gi = Number(cat.value), group = groups[gi];
  pkg.replaceChildren();
  group[1].forEach((p, i) => pkg.add(new Option(p[0] + ' — ' + money(p[1]), String(i))));
  pkg.value = String(selected);
  description.textContent = descriptions[gi];
  const cards = group[1].map((p, i) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'package-option'; button.dataset.package = String(i);
    const label = document.createElement('span'); label.className = 'package-name'; label.textContent = p[0];
    const price = document.createElement('strong'); price.className = 'package-price'; price.textContent = money(p[1]);
    const detail = document.createElement('span'); detail.className = 'package-coverage'; detail.textContent = p[2] + ' · ' + p[3];
    const action = document.createElement('span'); action.className = 'package-select-label'; action.textContent = 'Choose package';
    button.append(label, price, detail, action);
    button.addEventListener('click', () => { pkg.value = String(i); update(); });
    return button;
  });
  $('package-picker').replaceChildren(...cards);
  update();
}
function selectionParams() {
  const params = new URLSearchParams({ category: cat.value, packageIndex: pkg.value });
  ['qextra', 'qportrait', 'qlocations'].forEach(id => params.set(id, String(number(id))));
  params.set('qdistance', $('qdistance').value);
  ['qportraits', 'qevents', 'qpriority'].forEach(id => params.set(id, $(id).checked ? '1' : '0'));
  return params;
}
function update() {
  $('quote-drafts').hidden = true; $('quote-status').textContent = '';
  const gi = Number(cat.value), p = groups[gi][1][Number(pkg.value) || 0];
  const portrait = gi === 5, wedding = gi === 4, commercial = gi === 6;
  const distance = $('qdistance'), rawDistance = distance.value.trim(), blankDistance = rawDistance === '' && !distance.validity.badInput;
  const km = blankDistance ? 0 : Number(rawDistance), invalidDistance = distance.validity.badInput || !Number.isFinite(km) || km < 0 || !Number.isFinite(km * DKS_CONFIG.travel.ratePerKm);
  const hours = number('qextra'), blocks = number('qportrait'), locations = number('qlocations');
  [...$('qextra').options].forEach((option, index) => { option.textContent = index ? `${index} extra ${index === 1 ? 'hour' : 'hours'} (+${money(index * (wedding ? 900 : 500))})` : 'No additional hours'; });
  $('extra-hours-wrap').hidden = portrait; $('portrait-time-wrap').hidden = !portrait;
  $('portraits-option').hidden = !portrait; $('events-option').hidden = portrait || commercial;
  $('qpackageinfo').textContent = p[2] + ' · ' + p[3] + ' · Professionally edited digital delivery';
  $('package-selection-status').textContent = p[0] + ' selected. Estimate updated.';
  document.querySelectorAll('.package-option').forEach(button => {
    const selected = button.dataset.package === pkg.value;
    button.setAttribute('aria-pressed', String(selected));
    button.querySelector('.package-select-label').textContent = selected ? '✓ Selected package' : 'Choose package';
  });
  syncSelectionControls();
  const lines = [[serviceNames[gi] + ' · ' + p[0], p[1]]];
  if (!portrait && hours) lines.push(['Additional photography · ' + hours + ' h', hours * (wedding ? 900 : 500)]);
  if (portrait && blocks) lines.push(['Extra portrait time · ' + blocks * 30 + ' min', blocks * 300]);
  if (locations) lines.push(['Additional locations · ' + locations, locations * 200]);
  if (portrait && $('qportraits').checked) lines.push(['5 additional edited portraits', 150]);
  if (!portrait && !commercial && $('qevents').checked) lines.push(['10 additional edited event photos', 200]);
  if ($('qpriority').checked) lines.push(['Priority delivery (subject to confirmation)', 350]);
  const rule = DKS_CONFIG.travel;
  const chargeable = Math.max(0, km - rule.freeReturnKm);
  const travel = Math.round((chargeable * rule.ratePerKm + Number.EPSILON) * 100) / 100;
  distance.setAttribute('aria-invalid', String(invalidDistance));
  $('distance-error').textContent = invalidDistance ? 'Enter a valid, non-negative return distance in kilometres.' : (blankDistance ? 'No distance entered. Travel is excluded from this estimate until a distance is provided.' : '');
  $('travel-distance').textContent = invalidDistance ? 'Invalid distance' : blankDistance ? 'Not supplied' : km + ' km';
  $('travel-allowance').textContent = rule.freeReturnKm + ' km';
  $('travel-chargeable').textContent = invalidDistance || blankDistance ? 'Not calculated' : Number(chargeable.toFixed(6)) + ' km';
  $('qemail').disabled = invalidDistance; $('qcopy').disabled = invalidDistance;
  $('qcontact').setAttribute('aria-disabled', String(invalidDistance));
  if (invalidDistance) {
    ['qtravel', 'qtotal', 'qdeposit', 'qbalance'].forEach(id => $(id).textContent = '—');
    $('qbreakdown').textContent = 'Correct the travel distance to calculate your estimate.';
    $('qcontact').removeAttribute('href'); last = ''; return;
  }
  lines.push([blankDistance ? 'Travel not entered — excluded pending confirmation' : 'Travel fee · ' + km + ' km return · ' + rule.freeReturnKm + ' km included · ' + Number(chargeable.toFixed(6)) + ' km chargeable', travel]);
  $('qtravel').textContent = blankDistance ? 'Not entered' : money(travel);
  const total = lines.reduce((sum, line) => sum + line[1], 0);
  $('qbreakdown').replaceChildren(...lines.map(([label, cost]) => {
    const row = document.createElement('div'); row.className = 'quote-line';
    const name = document.createElement('span'), price = document.createElement('strong');
    name.textContent = label; price.textContent = money(cost); row.append(name, price); return row;
  }));
  const deposit = Math.round((total * .3 + Number.EPSILON) * 100) / 100, balance = Math.round((total - deposit + Number.EPSILON) * 100) / 100;
  $('qtotal').textContent = money(total); $('qdeposit').textContent = money(deposit); $('qbalance').textContent = money(balance);
  last = 'DKs Photography — Quote request\n' + lines.map(([name, cost]) => name + ': ' + money(cost)).join('\n') + '\nTravel policy: ' + DKS_CONFIG.travelText + '\nTotal return distance: ' + (blankDistance ? 'Not supplied' : km + ' km') + '\nFree allowance: ' + rule.freeReturnKm + ' km\nChargeable kilometres: ' + (blankDistance ? 'Not calculated' : Number(chargeable.toFixed(6)) + ' km') + '\nEstimated total' + (blankDistance ? ' (excluding unconfirmed travel)' : '') + ': ' + money(total) + '\n30% booking fee: ' + money(deposit) + '\n70% remaining: ' + money(balance) + '\nPlease confirm availability and final pricing.';
  const params = new URLSearchParams({ service: serviceNames[gi], package: p[0], price: money(p[1]), estimate: last, selection: selectionParams().toString() });
  $('qcontact').href = 'contact.html?' + params.toString();
}
cat.addEventListener('change', () => { resetExtras(); populate(); });
document.querySelectorAll('#calculator input, #calculator select').forEach(el => { if (el !== cat) el.addEventListener('input', update); });
$('qreset').addEventListener('click', () => { cat.value = '0'; resetExtras(); populate(); });
$('qcontact').addEventListener('click', event => { if ($('qcontact').getAttribute('aria-disabled') === 'true') { event.preventDefault(); $('qdistance').focus(); } });
$('qemail').addEventListener('click', () => {
  dksDraftLinks($('quote-email'), $('quote-whatsapp'), 'DKs Photography — Custom quote request', last);
  $('quote-drafts').hidden = false; $('quote-status').textContent = DKS_MESSAGES.enquiryDraft;
});
$('qcopy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(last); $('quote-status').textContent = 'Estimate copied. Paste it into your enquiry, then press Send.'; }
  catch { $('quote-status').textContent = 'Copy is unavailable. Use the enquiry form or prepare an email or WhatsApp draft.'; }
});
// Restore only known public selections; personal details never enter this URL.
const params = new URLSearchParams(location.search);
const category = Number(params.get('category'));
if (params.has('category') && Number.isInteger(category) && groups[category]) cat.value = String(category);
else if (/^#p[0-6]$/.test(location.hash)) cat.value = location.hash.slice(2);
const selected = Number(params.get('packageIndex'));
populate(Number.isInteger(selected) && groups[Number(cat.value)][1][selected] ? selected : 0);
['qextra', 'qportrait', 'qlocations', 'qdistance'].forEach(id => {
  if (!params.has(id)) return;
  if (id === 'qdistance' && params.get(id) === '') { $(id).value = ''; return; }
  const value = Number(params.get(id));
  if (!Number.isFinite(value) || value < 0 || (id !== 'qdistance' && value > 10000)) return;
  if ($(id).tagName === 'SELECT' && ![...$(id).options].some(o => o.value === String(value))) return;
  $(id).value = String(value);
});
['qportraits', 'qevents', 'qpriority'].forEach(id => $(id).checked = params.get(id) === '1');
update();

// Native radio groups provide card-like selections with built-in arrow-key support.

function createSelectionControl(select, title, shortLabels) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = select === cat ? 'choice-group service-choices' : 'choice-group extra-choices';
  const legend = document.createElement('legend'); legend.textContent = title; fieldset.append(legend);
  [...select.options].forEach((option, index) => {
    const label = document.createElement('label'); label.className = 'choice-pill';
    const input = document.createElement('input'); input.type = 'radio'; input.name = select.id + '-choice'; input.value = option.value;
    const text = document.createElement('span'); text.textContent = shortLabels ? shortLabels[index] : option.textContent;
    label.append(input, text); fieldset.append(label);
    input.addEventListener('change', () => {
      if (!input.checked) return;
      select.value = input.value;
      if (select === cat) { resetExtras(); populate(); } else update();
    });
  });
  select.hidden = true;
  document.querySelector('label[for="' + select.id + '"]')?.setAttribute('hidden', '');
  select.after(fieldset);
  selectionControls.push({ select, fieldset, shortLabels });
}
function syncSelectionControls() {
  selectionControls.forEach(({select, fieldset, shortLabels}) => {
    [...fieldset.querySelectorAll('input')].forEach((input, index) => {
      input.checked = input.value === select.value;
      input.closest('label').classList.toggle('is-selected', input.checked);
      input.nextElementSibling.textContent = shortLabels ? shortLabels[index] : (index === 0 && ['qextra', 'qportrait'].includes(select.id) ? 'No extra time' : select.options[index].textContent);
    });
  });
}
createSelectionControl(cat, 'Photography service', ['Events', 'Birthdays', 'Church & ceremonies', 'Engagements', 'Weddings', 'Portraits & graduations', 'Business & products']);
createSelectionControl($('qextra'), 'Additional photography hours');
createSelectionControl($('qportrait'), 'Additional portrait time');
createSelectionControl($('qlocations'), 'Extra locations');
syncSelectionControls();
})();
