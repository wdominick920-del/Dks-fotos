'use strict';
(() => {
  const select = document.querySelector('#contact-form #service');
  if (!select) return;
  const label = document.querySelector('label[for="service"]');
  const wrapper = document.createElement('div'); wrapper.className = 'contact-service-picker';
  const trigger = document.createElement('button'); trigger.type = 'button'; trigger.id = 'service-trigger'; trigger.className = 'service-picker-trigger';
  trigger.setAttribute('aria-controls', 'service-options'); trigger.setAttribute('aria-expanded', 'false');
  label.id = 'service-field-label'; label.htmlFor = trigger.id;
  const text = document.createElement('span'); text.id = 'service-selection-text';
  const chevron = document.createElement('span'); chevron.className = 'service-picker-chevron'; chevron.textContent = '⌄'; chevron.setAttribute('aria-hidden', 'true');
  trigger.append(text, chevron); trigger.setAttribute('aria-labelledby', label.id + ' ' + text.id);
  const panel = document.createElement('fieldset'); panel.id = 'service-options'; panel.className = 'service-picker-options'; panel.hidden = true;
  const legend = document.createElement('legend'); legend.className = 'sr-only'; legend.textContent = 'Choose a photography service'; panel.append(legend);
  const error = document.createElement('p'); error.id = 'service-choice-error'; error.className = 'field-error'; error.setAttribute('role', 'alert'); error.hidden = true;
  trigger.setAttribute('aria-describedby', error.id);
  const help = document.createElement('p'); help.className = 'service-picker-help'; help.textContent = 'Select the service that best fits your plans.';
  const descriptions = ['Gatherings, awards and community occasions', 'Milestones, celebrations and candid moments', 'Services and special ceremonies', 'A relaxed session for your next chapter', 'Coverage for your wedding day', 'Personal portraits and graduation memories', 'Photography for your brand and products', 'Tell us what you have in mind'];
  const radios = [];
  function close(restore = false) { panel.hidden = true; trigger.setAttribute('aria-expanded', 'false'); if (restore) trigger.focus(); }
  function open() {
    if (trigger.disabled) return;
    panel.hidden = false; trigger.setAttribute('aria-expanded', 'true');
    if (window.matchMedia('(min-width:651px)').matches) {
      const rect = trigger.getBoundingClientRect(), below = innerHeight - rect.bottom - 16, above = rect.top - 16;
      const flip = below < 240 && above > below;
      panel.style.top = flip ? 'auto' : '62px'; panel.style.bottom = flip ? 'calc(100% + 8px)' : 'auto';
      panel.style.maxHeight = Math.max(150, Math.min(350, flip ? above : below)) + 'px';
    } else { panel.style.top = ''; panel.style.bottom = ''; panel.style.maxHeight = ''; }
    (radios.find(r => r.checked) || radios[0]).focus();
  }
  function sync() {
    text.textContent = select.value || 'Choose a service'; trigger.classList.toggle('has-selection', Boolean(select.value));
    trigger.disabled = select.disabled;
    radios.forEach(radio => { radio.checked = radio.value === select.value; radio.disabled = select.disabled; });
    if (select.disabled) help.textContent = 'Selected with your package. Use “Edit package or extras” above to change it.';
    if (select.value) { error.hidden = true; trigger.removeAttribute('aria-invalid'); }
  }
  [...select.options].filter(option => option.value).forEach((option, index) => {
    const item = document.createElement('label'); item.className = 'service-picker-option';
    const radio = document.createElement('input'); radio.type = 'radio'; radio.name = 'contact-service-choice'; radio.value = option.value; radio.required = select.required;
    const copy = document.createElement('span'); copy.className = 'service-option-copy';
    const name = document.createElement('strong'); name.textContent = option.textContent;
    const description = document.createElement('small'); description.textContent = descriptions[index]; copy.append(name, description);
    item.append(radio, copy); panel.append(item); radios.push(radio);
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      select.value = radio.value; sync(); select.dispatchEvent(new Event('input', { bubbles: true })); select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    radio.addEventListener('click', () => {
      select.value = radio.value; sync();
      select.dispatchEvent(new Event('input', { bubbles: true })); select.dispatchEvent(new Event('change', { bubbles: true }));
      close(true);
    });
    radio.addEventListener('invalid', event => {
      event.preventDefault(); error.textContent = 'Please choose a photography service.'; error.hidden = false; trigger.setAttribute('aria-invalid', 'true'); open();
    });
  });
  // Keep native select as the submitted value; radio controls handle enhanced validation.
  select.hidden = true; select.required = false;
  select.after(wrapper); wrapper.append(trigger, panel, help, error);
  trigger.addEventListener('click', () => panel.hidden ? open() : close());
  trigger.addEventListener('keydown', event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(); } });
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); } else if (event.key === 'Enter') { event.preventDefault(); close(true); } });
  document.addEventListener('click', event => { if (!wrapper.contains(event.target)) close(); });
  wrapper.addEventListener('focusout', event => { if (event.relatedTarget && !wrapper.contains(event.relatedTarget)) close(); });
  select.addEventListener('change', sync);
  select.form.addEventListener('reset', () => { setTimeout(() => { sync(); close(); }, 0); });
  window.addEventListener('pageshow', sync);
  sync();
})();
