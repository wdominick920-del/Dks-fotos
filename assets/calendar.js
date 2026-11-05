'use strict';
// Progressive enhancement: the native date input remains available without JavaScript.
(() => {
  const input = document.querySelector('#contact-form input[name="date"]');
  if (!input || typeof HTMLDialogElement === 'undefined') return;
  const parse = value => { const [y, m, d] = value.split('-').map(Number); return new Date(y, m - 1, d); };
  const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const label = document.querySelector('label[for="date"]');
  label.id = 'date-label'; label.htmlFor = 'date-trigger';
  input.type = 'hidden';
  const trigger = document.createElement('button');
  trigger.type = 'button'; trigger.id = 'date-trigger'; trigger.className = 'date-trigger';
  trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-controls', 'contact-calendar');
  input.after(trigger);
  function refreshTrigger() {
    trigger.replaceChildren();
    const text = document.createElement('span');
    text.textContent = input.value ? parse(input.value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Choose your preferred date';
    const icon = document.createElement('span'); icon.setAttribute('aria-hidden', 'true'); icon.textContent = '▦';
    trigger.append(text, icon); trigger.setAttribute('aria-label', 'Preferred date: ' + text.textContent);
  }
  const dialog = document.createElement('dialog'); dialog.id = 'contact-calendar'; dialog.className = 'calendar-dialog';
  dialog.setAttribute('aria-labelledby', 'calendar-title'); dialog.setAttribute('aria-describedby', 'calendar-help');
  dialog.innerHTML = '<div class="calendar-top"><div><span class="eyebrow">PLAN YOUR OCCASION</span><h2 id="calendar-title">Choose a date</h2></div><button type="button" class="calendar-close" aria-label="Close calendar">×</button></div><div class="calendar-nav"><button type="button" data-month="-1" aria-label="Previous month">‹</button><p id="calendar-month" aria-live="polite"></p><button type="button" data-month="1" aria-label="Next month">›</button></div><div class="calendar-grid" role="grid" aria-labelledby="calendar-month"></div><p id="calendar-help">Choose a day, or use arrow keys to move and Page Up / Page Down to change months. Availability is confirmed after enquiry.</p><div class="calendar-actions"><button type="button" class="calendar-today">Today</button><button type="button" class="calendar-clear">Clear date</button><button type="button" class="calendar-cancel">Cancel</button></div>';
  document.body.append(dialog);
  const grid = dialog.querySelector('.calendar-grid');
  let cursor = new Date(today), month = today.getMonth(), year = today.getFullYear();
  function render(focusDay = false) {
    dialog.querySelector('#calendar-month').textContent = new Date(year, month, 1).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
    grid.replaceChildren();
    const headings = document.createElement('div'); headings.className = 'calendar-row'; headings.setAttribute('role', 'row');
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => { const cell = document.createElement('span'); cell.setAttribute('role', 'columnheader'); cell.textContent = day; headings.append(cell); });
    grid.append(headings);
    const offset = (new Date(year, month, 1).getDay() + 6) % 7, days = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < Math.ceil((offset + days) / 7) * 7; i += 7) {
      const row = document.createElement('div'); row.className = 'calendar-row'; row.setAttribute('role', 'row');
      for (let j = 0; j < 7; j++) {
        const day = i + j - offset + 1, cell = document.createElement('div'); cell.setAttribute('role', 'gridcell');
        if (day > 0 && day <= days) {
          const date = new Date(year, month, day), value = iso(date), button = document.createElement('button');
          button.type = 'button'; button.dataset.date = value; button.textContent = String(day);
          button.setAttribute('aria-label', date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
          button.tabIndex = value === iso(cursor) ? 0 : -1;
          cell.setAttribute('aria-selected', String(value === input.value));
          if (value === input.value) button.classList.add('is-selected');
          if (value === iso(today)) { button.classList.add('is-today'); button.setAttribute('aria-current', 'date'); }
          button.addEventListener('click', () => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); refreshTrigger(); dialog.close(); });
          cell.append(button);
        } else cell.setAttribute('aria-disabled', 'true');
        row.append(cell);
      }
      grid.append(row);
    }
    if (focusDay) grid.querySelector(`[data-date="${iso(cursor)}"]`)?.focus();
  }
  function moveMonth(delta, focusDay = false) {
    const day = cursor.getDate(), target = new Date(year, month + delta, 1);
    year = target.getFullYear(); month = target.getMonth();
    cursor = new Date(year, month, Math.min(day, new Date(year, month + 1, 0).getDate())); render(focusDay);
  }
  trigger.addEventListener('click', () => { cursor = input.value ? parse(input.value) : new Date(today); month = cursor.getMonth(); year = cursor.getFullYear(); render(); dialog.showModal(); trigger.setAttribute('aria-expanded', 'true'); grid.querySelector('[tabindex="0"]')?.focus(); });
  dialog.querySelectorAll('[data-month]').forEach(button => button.addEventListener('click', () => moveMonth(Number(button.dataset.month))));
  grid.addEventListener('keydown', event => {
    const button = event.target.closest('[data-date]'); if (!button) return;
    cursor = parse(button.dataset.date);
    const deltas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key in deltas) cursor.setDate(cursor.getDate() + deltas[event.key]);
    else if (event.key === 'Home') cursor.setDate(cursor.getDate() - (cursor.getDay() + 6) % 7);
    else if (event.key === 'End') cursor.setDate(cursor.getDate() + 6 - (cursor.getDay() + 6) % 7);
    else if (event.key === 'PageUp' || event.key === 'PageDown') { event.preventDefault(); moveMonth((event.key === 'PageDown' ? 1 : -1) * (event.shiftKey ? 12 : 1), true); return; }
    else return;
    event.preventDefault(); month = cursor.getMonth(); year = cursor.getFullYear(); render(true);
  });
  dialog.querySelector('.calendar-today').onclick = () => { cursor = new Date(today); month = cursor.getMonth(); year = cursor.getFullYear(); render(true); };
  dialog.querySelector('.calendar-clear').onclick = () => { input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); refreshTrigger(); dialog.close(); };
  ['.calendar-close', '.calendar-cancel'].forEach(selector => dialog.querySelector(selector).onclick = () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not([disabled])')].filter(button => button.tabIndex >= 0);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  dialog.addEventListener('close', () => { trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); });
  window.addEventListener('pageshow', refreshTrigger);
  refreshTrigger();
})();
