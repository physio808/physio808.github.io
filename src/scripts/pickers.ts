/**
 * Popups de sélection (agence + date & heure) pour les formulaires de réservation.
 * S'active sur tout conteneur possédant :
 *  - des déclencheurs [data-pk-open="loc"|"dt"]
 *  - un overlay [data-pk-overlay]
 *  - des popups [data-pk-popup="loc"] et [data-pk-popup="dt"]
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

function fmtDT(dateStr: string, timeStr: string): string {
  return `${fmtD(dateStr)} · ${timeStr}`;
}

interface DtContext {
  dateInput: HTMLInputElement;
  timeInput: HTMLInputElement;
  label: HTMLElement;
  trigger: HTMLElement;
  min: string;
  sel: string;
  viewY: number;
  viewM: number;
  chain?: string;
}

export function setupPickers(rootId: string): void {
  const root = document.getElementById(rootId);
  if (!root) return;

  const overlay = root.querySelector<HTMLElement>('[data-pk-overlay]');
  const locPopup = root.querySelector<HTMLElement>('[data-pk-popup="loc"]');
  const dtPopup = root.querySelector<HTMLElement>('[data-pk-popup="dt"]');
  if (!overlay) return;

  let activePopup: HTMLElement | null = null;
  let locTarget: { input: HTMLInputElement; label: HTMLElement } | null = null;
  let dt: DtContext | null = null;

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

    const isSheet = window.matchMedia('(max-width: 640px)').matches;
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

  /* ── Sélecteur d'agence ─────────────────────────────── */

  root.querySelectorAll<HTMLElement>('[data-pk-open="loc"]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (!locPopup) return;
      const input = document.getElementById(trigger.getAttribute('data-pk-input') || '') as HTMLInputElement | null;
      const label = trigger.querySelector<HTMLElement>('[data-pk-label]');
      if (!input || !label) return;
      locTarget = { input, label };
      locPopup.querySelectorAll<HTMLElement>('[data-loc-id]').forEach((b) => {
        b.classList.toggle('is-selected', b.getAttribute('data-loc-id') === input.value);
      });
      open(locPopup, trigger);
    });
  });

  locPopup?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-loc-id]');
    if (!btn || !locTarget) return;
    locTarget.input.value = btn.getAttribute('data-loc-id') || '';
    locTarget.label.textContent = btn.getAttribute('data-loc-name') || '';
    locTarget.input.dispatchEvent(new Event('change', { bubbles: true }));
    close();
  });

  /* ── Sélecteur date & heure ─────────────────────────── */

  const calGrid = dtPopup?.querySelector<HTMLElement>('[data-pk-cal]');
  const calTitle = dtPopup?.querySelector<HTMLElement>('[data-pk-cal-title]');
  const prevBtn = dtPopup?.querySelector<HTMLButtonElement>('[data-pk-prev]');
  const nextBtn = dtPopup?.querySelector<HTMLButtonElement>('[data-pk-next]');

  function renderCal(): void {
    if (!dt || !calGrid || !calTitle) return;
    calTitle.textContent = `${MONTHS_FR[dt.viewM]} ${dt.viewY}`;

    const first = new Date(dt.viewY, dt.viewM, 1);
    const startCol = (first.getDay() + 6) % 7; // lundi = 0
    const daysInMonth = new Date(dt.viewY, dt.viewM + 1, 0).getDate();

    let html = DOW_FR.map((d) => `<span class="pk-cal-dow">${d}</span>`).join('');
    for (let i = 0; i < startCol; i++) html += '<span></span>';
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = iso(dt.viewY, dt.viewM, d);
      const disabled = dateStr < dt.min;
      const selected = dateStr === dt.sel;
      html += `<button type="button" class="pk-cal-day${selected ? ' is-selected' : ''}" data-day="${dateStr}"${disabled ? ' disabled' : ''}>${d}</button>`;
    }
    calGrid.innerHTML = html;

    if (prevBtn && dt) {
      const minD = new Date(dt.min + 'T00:00:00');
      prevBtn.disabled = dt.viewY * 12 + dt.viewM <= minD.getFullYear() * 12 + minD.getMonth();
    }
  }

  const hasTimes = Boolean(dtPopup?.querySelector('[data-pk-times]'));

  function commitDt(time: string): void {
    if (!dt) return;
    dt.dateInput.value = dt.sel;
    dt.timeInput.value = time;
    dt.label.textContent = hasTimes ? fmtDT(dt.sel, time) : fmtD(dt.sel);
    dt.trigger.classList.add('has-value');
    dt.dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    dt.timeInput.dispatchEvent(new Event('change', { bubbles: true }));
    const chain = dt.chain;
    close();
    if (chain) {
      const chainDate = document.getElementById(chain) as HTMLInputElement | null;
      const chainTrigger = root!.querySelector<HTMLElement>(`[data-pk-date="${chain}"]`);
      if (chainTrigger && chainDate && !chainDate.value) {
        setTimeout(() => chainTrigger.click(), 140);
      }
    }
  }

  calGrid?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-day]');
    if (!btn || btn.disabled || !dt) return;
    dt.sel = btn.getAttribute('data-day') || dt.sel;
    if (!hasTimes) {
      // Pas de liste de créneaux dans le popup : la date se valide au clic,
      // l'heure est choisie via une liste déroulante à côté du champ.
      commitDt(dt.timeInput.value || dt.trigger.getAttribute('data-pk-default-time') || '09:00');
      return;
    }
    renderCal();
  });

  prevBtn?.addEventListener('click', () => {
    if (!dt) return;
    dt.viewM--;
    if (dt.viewM < 0) { dt.viewM = 11; dt.viewY--; }
    renderCal();
  });

  nextBtn?.addEventListener('click', () => {
    if (!dt) return;
    dt.viewM++;
    if (dt.viewM > 11) { dt.viewM = 0; dt.viewY++; }
    renderCal();
  });

  dtPopup?.querySelector('[data-pk-times]')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-time]');
    if (!btn || !dt) return;
    commitDt(btn.getAttribute('data-time') || '09:00');
  });

  root.querySelectorAll<HTMLElement>('[data-pk-open="dt"]').forEach((trigger) => {
    const dateInput = document.getElementById(trigger.getAttribute('data-pk-date') || '') as HTMLInputElement | null;
    const timeInput = document.getElementById(trigger.getAttribute('data-pk-time') || '') as HTMLInputElement | null;
    const label = trigger.querySelector<HTMLElement>('[data-pk-label]');
    if (!dateInput || !timeInput || !label) return;

    // Libellé initial si une date est déjà renseignée
    if (dateInput.value) {
      label.textContent = hasTimes
        ? fmtDT(dateInput.value, timeInput.value || trigger.getAttribute('data-pk-default-time') || '09:00')
        : fmtD(dateInput.value);
      trigger.classList.add('has-value');
    }

    trigger.addEventListener('click', () => {
      if (!dtPopup) return;
      const minFrom = trigger.getAttribute('data-pk-min-from');
      let min = todayISO();
      if (minFrom) {
        const mfVal = (document.getElementById(minFrom) as HTMLInputElement | null)?.value;
        if (mfVal && mfVal > min) min = mfVal;
      }
      const sel = dateInput.value && dateInput.value >= min ? dateInput.value : min;
      const selD = new Date(sel + 'T00:00:00');
      dt = {
        dateInput,
        timeInput,
        label,
        trigger,
        min,
        sel,
        viewY: selD.getFullYear(),
        viewM: selD.getMonth(),
        chain: trigger.getAttribute('data-pk-chain') || undefined,
      };
      renderCal();
      const currentTime = timeInput.value || trigger.getAttribute('data-pk-default-time') || '09:00';
      dtPopup.querySelectorAll<HTMLElement>('[data-time]').forEach((b) => {
        b.classList.toggle('is-selected', b.getAttribute('data-time') === currentTime);
      });
      open(dtPopup, trigger);
    });
  });
}
