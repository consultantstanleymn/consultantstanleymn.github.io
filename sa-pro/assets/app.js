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

// --- Reading tools: theme toggle, font-size scale, scroll progress ---
const THEME_KEY = 'sapro_theme';
const SCALE_KEY = 'sapro_reading_scale';
const SCALE_STEPS = [90, 100, 110, 120, 130];

function getTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch (e) { return 'dark'; }
}
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
}
function toggleTheme() {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

function getScale() {
  try {
    const v = parseInt(localStorage.getItem(SCALE_KEY), 10);
    if (SCALE_STEPS.includes(v)) return v;
  } catch (e) {}
  return 100;
}
function applyScale(v) {
  document.documentElement.style.setProperty('--reading-scale', v + '%');
  try { localStorage.setItem(SCALE_KEY, String(v)); } catch (e) {}
}
function stepScale(dir) {
  const cur = getScale();
  const idx = SCALE_STEPS.indexOf(cur);
  const next = SCALE_STEPS[Math.min(Math.max(idx + dir, 0), SCALE_STEPS.length - 1)];
  applyScale(next);
}

function initReadingTools() {
  applyTheme(getTheme());
  applyScale(getScale());
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.id = 'readingProgressBar';
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
  }, { passive: true });

  const widget = document.createElement('div');
  widget.className = 'reading-tools';
  widget.innerHTML = `
    <button type="button" id="fontDownBtn" title="Smaller text" aria-label="Decrease text size">A&minus;</button>
    <button type="button" id="fontUpBtn" title="Larger text" aria-label="Increase text size">A&plus;</button>
    <span class="divider"></span>
    <button type="button" id="themeToggleBtn" title="Toggle light/dark" aria-label="Toggle theme">&#9788;</button>
  `;
  document.body.appendChild(widget);
  document.getElementById('fontDownBtn').addEventListener('click', () => stepScale(-1));
  document.getElementById('fontUpBtn').addEventListener('click', () => stepScale(1));
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReadingTools);
} else {
  initReadingTools();
}
