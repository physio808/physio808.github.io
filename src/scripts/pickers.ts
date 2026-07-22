/**
 * Popups de sélection pour les formulaires de réservation :
 *  - agence  : [data-pk-open="loc"]   + popup [data-pk-popup="loc"]
 *              (liste à gauche, fiche détail à droite — style agence)
 *  - période : [data-pk-open="range"]  + popup [data-pk-popup="range"]
 *              (calendrier 3 mois, sélection départ → retour)
 */

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
const DOW_FR = ['lu', 'ma', 'me', 'je', 've', 'sa', 'di'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function iso(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function todayISO(): string {
  const t = new Date();
  return iso(t.getFullYear(), t.getMonth(), t.getDate());
}

function fmtD(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

interface RangeContext {
  startInput: HTMLInputElement;
  endInput: HTMLInputElement;
  startLabel: HTMLElement;
  endLabel: HTMLElement;
  startTrigger: HTMLElement;
  endTrigger: HTMLElement;
  min: string;
  selStart: string | null;
  selEnd: string | null;
  viewY: number;
  viewM: number;
}

export function setupPickers(rootId: string): void {
  const root = document.getElementById(rootId);
  if (!root) return;

  const overlay = root.querySelector<HTMLElement>('[data-pk-overlay]');
  const locPopup = root.querySelector<HTMLElement>('[data-pk-popup="loc"]');
  const rangePopup = root.querySelector<HTMLElement>('[data-pk-popup="range"]');
  if (!overlay) return;

  let activePopup: HTMLElement | null = null;
  let locTarget: { input: HTMLInputElement; label: HTMLElement } | null = null;
  let rc: RangeContext | null = null;

  function close(): void {
    activePopup?.setAttribute('hidden', '');
    overlay!.setAttribute('hidden', '');
    activePopup = null;
  }

  function open(popup: HTMLElement, trigger: HTMLElement): void {
    if (activePopup) close();
    activePopup = popup;
    overlay!.removeAttribute('hidden');
    popup.removeAttribute('hidden');

    const isSheet = window.matchMedia('(max-width: 720px)').matches;
    popup.classList.toggle('pk-sheet', isSheet);
    if (!isSheet) {
      const r = trigger.getBoundingClientRect();
      const h = popup.offsetHeight;
      const w = popup.offsetWidth;
      let top = r.bottom + 8;
      if (top + h > window.innerHeight - 12) top = Math.max(12, window.innerHeight - h - 12);
      let left = r.left;
      if (left + w > window.innerWidth - 12) left = window.innerWidth - 12 - w;
      popup.style.top = `${top}px`;
      popup.style.left = `${Math.max(12, left)}px`;
    } else {
      popup.style.top = '';
      popup.style.left = '';
    }
  }

  overlay.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  window.addEventListener('resize', () => { if (activePopup) close(); });
  window.addEventListener('scroll', () => {
    if (activePopup && !activePopup.classList.contains('pk-sheet')) close();
  }, { passive: true });

  root.querySelectorAll<HTMLElement>('[data-pk-close]').forEach((btn) => {
    btn.addEventListener('click', close);
  });

  /* ── Sélecteur d'agence (liste + fiche détail) ──────── */

  const locDetail = locPopup?.querySelector<HTMLElement>('[data-pk-loc-detail]');

  function fillDetail(item: HTMLElement): void {
    if (!locDetail) return;
    const name = item.getAttribute('data-loc-name') || '';
    const address = item.getAttribute('data-loc-address') || '';
    const hours = item.getAttribute('data-loc-hours') || '';
    const is247 = hours.includes('24h/24');
    const isAirport = item.getAttribute('data-loc-icon') === 'plane';
    const iconSvg = isAirport
      ? '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>'
      : '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    locDetail.innerHTML = `
      <div class="pk-loc-detail-top">
        <div class="pk-loc-detail-icon">${iconSvg}</div>
        ${is247 ? `<span class="pk-loc-detail-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          Retour 24 heures sur 24</span>` : ''}
      </div>
      <h4 class="pk-loc-detail-name">${name}</h4>
      <p class="pk-loc-detail-address">${address}</p>
      <div class="pk-loc-detail-hours">
        <span class="pk-loc-detail-hours-label">Heures d'ouverture</span>
        <span class="pk-loc-detail-hours-row"><span>Lundi - Dimanche :</span><span>${hours}</span></span>
        <span class="pk-loc-detail-hours-row"><span>Jours fériés :</span><span>${hours}</span></span>
      </div>
      <a class="pk-loc-detail-link" href="/nos-agences">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="11" x2="12" y2="16" stroke="white" stroke-width="2"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="white" stroke-width="2"/></svg>
        Détails de la station
      </a>
    `;
  }

  root.querySelectorAll<HTMLElement>('[data-pk-open="loc"]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (!locPopup) return;
      const input = document.getElementById(trigger.getAttribute('data-pk-input') || '') as HTMLInputElement | null;
      const label = trigger.querySelector<HTMLElement>('[data-pk-label]');
      if (!input || !label) return;
      locTarget = { input, label };
      let current: HTMLElement | null = null;
      locPopup.querySelectorAll<HTMLElement>('[data-loc-id]').forEach((b) => {
        const active = b.getAttribute('data-loc-id') === input.value;
        b.classList.toggle('is-selected', active);
        if (active) current = b;
      });
      if (current) fillDetail(current);
      else {
        const first = locPopup.querySelector<HTMLElement>('[data-loc-id]');
        if (first) fillDetail(first);
      }
      open(locPopup, trigger);
    });
  });

  locPopup?.querySelectorAll<HTMLElement>('[data-loc-id]').forEach((item) => {
    item.addEventListener('mouseenter', () => fillDetail(item));
    item.addEventListener('focus', () => fillDetail(item));
  });

  locPopup?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-loc-id]');
    if (!btn || !locTarget) return;
    locTarget.input.value = btn.getAttribute('data-loc-id') || '';
    locTarget.label.textContent = btn.getAttribute('data-loc-name') || '';
    // Icône du déclencheur : avion pour l'aéroport, pin sinon (style Sixt)
    const triggerEl = locTarget.label.closest<HTMLElement>('.pk-trigger');
    const iconEl = triggerEl?.querySelector<HTMLElement>('[data-pk-icon]');
    if (iconEl) {
      iconEl.innerHTML = btn.getAttribute('data-loc-icon') === 'plane'
        ? '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'
        : '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" stroke-width="2"/>';
      iconEl.setAttribute('fill', btn.getAttribute('data-loc-icon') === 'plane' ? 'currentColor' : 'none');
    }
    locTarget.input.dispatchEvent(new Event('change', { bubbles: true }));
    close();
  });

  /* ── Calendrier de période (3 mois, plage) ──────────── */

  const monthsHost = rangePopup?.querySelector<HTMLElement>('[data-pk-cal]');
  const prevBtn = rangePopup?.querySelector<HTMLButtonElement>('[data-pk-prev]');
  const nextBtn = rangePopup?.querySelector<HTMLButtonElement>('[data-pk-next]');

  function monthsCount(): number {
    if (window.matchMedia('(min-width: 1080px)').matches) return 3;
    if (window.matchMedia('(min-width: 720px)').matches) return 2;
    return 1;
  }

  function renderMonth(y: number, m: number): string {
    if (!rc) return '';
    const first = new Date(y, m, 1);
    const startCol = (first.getDay() + 6) % 7; // lundi = 0
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    let cells = DOW_FR.map((d) => `<span class="pk-cal-dow">${d}</span>`).join('');
    for (let i = 0; i < startCol; i++) cells += '<span></span>';
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = iso(y, m, d);
      const disabled = dateStr < rc.min;
      const classes = ['pk-cal-day'];
      if (dateStr === todayISO()) classes.push('is-today');
      if (rc.selStart && dateStr === rc.selStart) classes.push('is-start');
      if (rc.selEnd && dateStr === rc.selEnd) classes.push('is-end');
      if (rc.selStart && rc.selEnd && dateStr > rc.selStart && dateStr < rc.selEnd) classes.push('in-range');
      cells += `<button type="button" class="${classes.join(' ')}" data-day="${dateStr}"${disabled ? ' disabled' : ''}>${d}</button>`;
    }

    return `
      <div class="pk-month">
        <div class="pk-month-title" data-pk-month-title>${MONTHS_FR[m]} ${y}</div>
        <div class="pk-month-grid">${cells}</div>
      </div>
    `;
  }

  function renderRange(): void {
    if (!rc || !monthsHost) return;
    const count = monthsCount();
    let html = '';
    let y = rc.viewY;
    let m = rc.viewM;
    for (let i = 0; i < count; i++) {
      html += renderMonth(y, m);
      m++;
      if (m > 11) { m = 0; y++; }
    }
    monthsHost.innerHTML = html;

    if (prevBtn) {
      const minD = new Date(rc.min + 'T00:00:00');
      prevBtn.disabled = rc.viewY * 12 + rc.viewM <= minD.getFullYear() * 12 + minD.getMonth();
    }
  }

  function commitRange(): void {
    if (!rc || !rc.selStart || !rc.selEnd) return;
    rc.startInput.value = rc.selStart;
    rc.endInput.value = rc.selEnd;
    rc.startLabel.textContent = fmtD(rc.selStart);
    rc.endLabel.textContent = fmtD(rc.selEnd);
    rc.startTrigger.classList.add('has-value');
    rc.endTrigger.classList.add('has-value');
    rc.startInput.dispatchEvent(new Event('change', { bubbles: true }));
    rc.endInput.dispatchEvent(new Event('change', { bubbles: true }));
    setTimeout(close, 220);
  }

  monthsHost?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-day]');
    if (!btn || btn.disabled || !rc) return;
    const day = btn.getAttribute('data-day')!;

    if (!rc.selStart || (rc.selStart && rc.selEnd)) {
      rc.selStart = day;
      rc.selEnd = null;
    } else if (day < rc.selStart) {
      rc.selStart = day;
    } else if (day === rc.selStart) {
      rc.selEnd = null;
    } else {
      rc.selEnd = day;
    }

    renderRange();
    if (rc.selStart && rc.selEnd) commitRange();
  });

  prevBtn?.addEventListener('click', () => {
    if (!rc) return;
    rc.viewM--;
    if (rc.viewM < 0) { rc.viewM = 11; rc.viewY--; }
    renderRange();
  });

  nextBtn?.addEventListener('click', () => {
    if (!rc) return;
    rc.viewM++;
    if (rc.viewM > 11) { rc.viewM = 0; rc.viewY++; }
    renderRange();
  });

  const rangeTriggers = Array.from(root.querySelectorAll<HTMLElement>('[data-pk-open="range"]'));
  rangeTriggers.forEach((trigger) => {
    const startInput = document.getElementById(trigger.getAttribute('data-pk-start') || '') as HTMLInputElement | null;
    const endInput = document.getElementById(trigger.getAttribute('data-pk-end') || '') as HTMLInputElement | null;
    const label = trigger.querySelector<HTMLElement>('[data-pk-label]');
    if (!startInput || !endInput || !label) return;

    const isStartTrigger = trigger.getAttribute('data-pk-role') !== 'end';
    const ownValue = isStartTrigger ? startInput.value : endInput.value;
    if (ownValue) {
      label.textContent = fmtD(ownValue);
      trigger.classList.add('has-value');
    }

    trigger.addEventListener('click', () => {
      if (!rangePopup) return;
      const startTrigger = rangeTriggers.find((t) => t.getAttribute('data-pk-role') !== 'end') || trigger;
      const endTrigger = rangeTriggers.find((t) => t.getAttribute('data-pk-role') === 'end') || trigger;
      const startLabel = startTrigger.querySelector<HTMLElement>('[data-pk-label]')!;
      const endLabel = endTrigger.querySelector<HTMLElement>('[data-pk-label]')!;
      const min = todayISO();
      const hasFullRange = Boolean(startInput.value && endInput.value && startInput.value >= min && endInput.value > startInput.value);
      const selStart = hasFullRange ? startInput.value : null;
      const selEnd = hasFullRange ? endInput.value : null;
      const base = selStart || (startInput.value && startInput.value >= min ? startInput.value : min);
      const baseD = new Date(base + 'T00:00:00');
      rc = {
        startInput,
        endInput,
        startLabel,
        endLabel,
        startTrigger,
        endTrigger,
        min,
        selStart,
        selEnd,
        viewY: baseD.getFullYear(),
        viewM: baseD.getMonth(),
      };
      renderRange();
      open(rangePopup, startTrigger);
    });
  });
}
