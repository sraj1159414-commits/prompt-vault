/* ==================================================
   THEME TOGGLE
   ================================================== */
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('pv-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pv-theme', next);
  });
}

/* ==================================================
   MOBILE MENU
   ================================================== */
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => nav.classList.toggle('open'));
}

/* ==================================================
   TOAST
   ================================================== */
function showToast(msg, success = false) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.toggle('success', success);
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

/* ==================================================
   COPY PROMPT
   ================================================== */
function copyPrompt(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = '✓ Copied';
    btn.classList.add('copied');
    showToast('Prompt copied to clipboard', true);
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('copied');
    }, 1800);
  }).catch(() => {
    showToast('Copy failed — please copy manually');
  });
}

/* ==================================================
   RENDER PROMPT CARD
   ================================================== */
function renderPromptCard(p) {
  return `
    <article class="prompt-card reveal">
      <div class="thumb">
        <img src="${p.image}" alt="${p.title}" loading="lazy">
        <span class="tool-badge">${p.tool}</span>
      </div>
      <div class="body">
        <h3>${p.title}</h3>
        <div class="prompt-snippet">${p.prompt}</div>
        <div class="actions">
          <button class="copy-btn" onclick='copyPrompt(${JSON.stringify(p.prompt)}, this)'>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy Prompt
          </button>
          <a class="view-btn" href="#" title="View details" aria-label="View details">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </a>
        </div>
      </div>
    </article>
  `;
}

/* ==================================================
   PAGE — HOMEPAGE: FEATURED GRID + STAT COUNTERS
   ================================================== */
const featuredGrid = document.getElementById('featuredGrid');
if (featuredGrid && typeof PROMPTS !== 'undefined') {
  const featured = PROMPTS.slice(0, 6);
  featuredGrid.innerHTML = featured.map(renderPromptCard).join('');

  // Animate stat counters
  const statPrompts = document.getElementById('statPrompts');
  const statCategories = document.getElementById('statCategories');
  if (statPrompts) animateCount(statPrompts, PROMPTS.length);
  if (statCategories) animateCount(statCategories, 10);
}

function animateCount(el, target) {
  let n = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const int = setInterval(() => {
    n += step;
    if (n >= target) { n = target; clearInterval(int); }
    el.textContent = n;
  }, 30);
}

/* ==================================================
   PAGE — PROMPTS: SEARCH + FILTER
   ================================================== */
const allPromptsGrid = document.getElementById('allPromptsGrid');
const searchInput = document.getElementById('searchInput');
const filterPills = document.getElementById('filterPills');

if (allPromptsGrid && typeof PROMPTS !== 'undefined') {
  let activeFilter = 'all';
  let searchTerm = '';

  // Read URL params (?cat= or ?type=)
  const params = new URLSearchParams(window.location.search);
  if (params.get('cat')) activeFilter = params.get('cat');
  if (params.get('type')) activeFilter = params.get('type');

  function renderFiltered() {
    const filtered = PROMPTS.filter(p => {
      const matchFilter = activeFilter === 'all'
        || p.category === activeFilter
        || p.type === activeFilter;
      const matchSearch = !searchTerm
        || p.title.toLowerCase().includes(searchTerm)
        || p.prompt.toLowerCase().includes(searchTerm)
        || p.tool.toLowerCase().includes(searchTerm)
        || p.category.toLowerCase().includes(searchTerm);
      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      allPromptsGrid.innerHTML = `
        <div class="empty-state">
          <h3>No prompts found</h3>
          <p>Try a different keyword or filter.</p>
        </div>`;
    } else {
      allPromptsGrid.innerHTML = filtered.map(renderPromptCard).join('');
    }
    observeReveals();
  }

  // Set active pill from URL
  document.querySelectorAll('.pill').forEach(pill => {
    if (pill.dataset.filter === activeFilter) {
      document.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
      pill.classList.add('active');
    }
  });

  // Filter click
  filterPills?.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    document.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
    pill.classList.add('active');
    activeFilter = pill.dataset.filter;
    renderFiltered();
  });

  // Search input
  searchInput?.addEventListener('input', e => {
    searchTerm = e.target.value.toLowerCase().trim();
    renderFiltered();
  });

  renderFiltered();
}

/* ==================================================
   PAGE — PDFS
   ================================================== */
const pdfGrid = document.getElementById('pdfGrid');
if (pdfGrid && typeof PDFS !== 'undefined') {
  pdfGrid.innerHTML = PDFS.map(pdf => `
    <div class="pdf-card reveal">
      <div class="pdf-meta">
        <span class="badge">${pdf.badge}</span>
        <span>${pdf.pages} pages</span>
        <span>· Updated ${pdf.updated}</span>
      </div>
      <h3>${pdf.title}</h3>
      <p>${pdf.description}</p>
      <a href="${pdf.link}" class="btn btn-primary" download>
        Download PDF
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </a>
    </div>
  `).join('');
}

/* ==================================================
   SCROLL TOP
   ================================================== */
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  if (scrollTopBtn) {
    scrollTopBtn.classList.toggle('show', window.scrollY > 400);
  }
});
scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ==================================================
   SCROLL REVEAL
   ================================================== */
function observeReveals() {
  const els = document.querySelectorAll('.reveal:not(.in)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}
observeReveals();

/* ==================================================
   NEWSLETTER (placeholder)
   ================================================== */
function handleNewsletter(e) {
  e.preventDefault();
  showToast('Thanks! You\'re on the list.', true);
  e.target.reset();
}
