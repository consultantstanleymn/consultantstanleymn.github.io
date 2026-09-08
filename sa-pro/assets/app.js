// Shared client-side logic: quiz reveal, nav search filter, day tracker (localStorage only, per-browser).
const TOTAL_DAYS = 70;
const DEFAULT_CURRENT_DAY = 56;
const STORAGE_KEY = 'sapro_current_day';

function getCurrentDay() {
  try {
    const v = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (v && v >= 1 && v <= TOTAL_DAYS) return v;
  } catch (e) {}
  return DEFAULT_CURRENT_DAY;
}

function setCurrentDay(n) {
  try {
    n = Math.min(Math.max(1, n), TOTAL_DAYS);
    localStorage.setItem(STORAGE_KEY, String(n));
  } catch (e) {}
  return n;
}

function dayHref(n) {
  return (window.SAPRO_BASE || '') + 'days/day-' + String(n).padStart(3, '0') + '.html';
}

function revealAnswer(id, correctIdx) {
  const exp = document.getElementById('exp-' + id);
  if (exp) exp.classList.add('shown');
  document.querySelectorAll('#opts-' + id + ' .scenario-option').forEach((el, i) => {
    if (i === correctIdx) el.classList.add('correct-answer');
  });
}

function filterNav() {
  const input = document.getElementById('navSearch');
  if (!input) return;
  const q = input.value.toLowerCase();
  document.querySelectorAll('.nav-link').forEach(link => {
    const text = link.textContent.toLowerCase();
    link.parentElement && link.parentElement.classList.contains('nav-section')
      ? null : null;
    link.style.display = text.includes(q) ? '' : 'none';
  });
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
function toggleTopLinks() {
  document.querySelector('.top-links').classList.toggle('open');
}

function renderTracker(containerId, currentPageDay) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const day = getCurrentDay();
  const pct = Math.round((day / TOTAL_DAYS) * 100);
  el.innerHTML = `
    <div class="tracker-progress">
      <strong>Day ${day} of ${TOTAL_DAYS}</strong> — ${pct}% through the 14-week plan
      <div class="tracker-bar"><div class="tracker-bar-fill" style="width:${pct}%"></div></div>
    </div>
    <a class="btn" href="${dayHref(day)}">Continue Studying &rarr;</a>
    <button class="btn btn-outline" id="jumpBtn" type="button">Jump to day&hellip;</button>
  `;
  document.getElementById('jumpBtn').addEventListener('click', () => {
    const n = prompt('Jump to which day? (1-' + TOTAL_DAYS + ')', String(day));
    if (n && !isNaN(parseInt(n, 10))) {
      const d = setCurrentDay(parseInt(n, 10));
      window.location.href = dayHref(d);
    }
  });
  if (typeof currentPageDay === 'number') {
    document.querySelectorAll('.nav-link[data-day]').forEach(l => {
      if (parseInt(l.dataset.day, 10) === currentPageDay) l.classList.add('current');
    });
  }
}

function markComplete(dayNum, nextHref) {
  setCurrentDay(dayNum + 1);
  window.location.href = nextHref;
}
