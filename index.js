

function initSearch() {
  const nav = document.querySelector('nav ul');


  const searchLi = document.createElement('li');
  searchLi.className = 'nav-search-item';
  searchLi.innerHTML = `
    <div class="search-wrapper" id="searchWrapper">
      <button class="search-toggle" id="searchToggle" aria-label="Abrir pesquisa">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </button>
      <div class="search-panel" id="searchPanel" aria-hidden="true">
        <input type="text" id="searchInput" placeholder="Pesquisar..." autocomplete="off" spellcheck="false"/>
        <span class="search-clear" id="searchClear" aria-label="Limpar">✕</span>
      </div>
    </div>
  `;
  nav.appendChild(searchLi);

  const overlay = document.createElement('div');
  overlay.id = 'searchOverlay';
  overlay.className = 'search-overlay';
  overlay.setAttribute('aria-live', 'polite');
  document.body.appendChild(overlay);

  const toggle   = document.getElementById('searchToggle');
  const panel    = document.getElementById('searchPanel');
  const input    = document.getElementById('searchInput');
  const clear    = document.getElementById('searchClear');
  const wrapper  = document.getElementById('searchWrapper');

  let highlights = [];

 
  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    panel.setAttribute('aria-hidden', String(!open));
    if (open) { setTimeout(() => input.focus(), 50); }
    else       { resetSearch(); }
  });


  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target) && !overlay.contains(e.target)) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      resetSearch();
    }
  });

  clear.addEventListener('click', () => { input.value = ''; resetSearch(); input.focus(); });

  input.addEventListener('input', debounce(() => {
    const term = input.value.trim();
    if (term.length < 2) { resetSearch(); return; }
    performSearch(term);
  }, 250));

 
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { panel.classList.remove('open'); resetSearch(); }
  });

  function performSearch(term) {
    clearHighlights();
    const sections = document.querySelectorAll('section');
    const results  = [];
    const regex    = new RegExp(`(${escapeRegex(term)})`, 'gi');

    sections.forEach(sec => {
      const paragraphs = sec.querySelectorAll('p');
      paragraphs.forEach(p => {
        const text = p.textContent;
        if (regex.test(text)) {
          // Destaca no DOM
          highlightNode(p, regex);
          // Coleta resultado
          const snippet = getSnippet(text, term, 90);
          const sectionTitle = sec.querySelector('h1')?.textContent || sec.id;
          results.push({ sectionId: sec.id, sectionTitle, snippet, element: p });
        }
      });
    });

    renderResults(results, term);
  }

  function highlightNode(node, regex) {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const nodes  = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(textNode => {
      if (!regex.test(textNode.nodeValue)) return;
      const span = document.createElement('span');
      span.innerHTML = textNode.nodeValue.replace(regex, '<mark class="search-mark">$1</mark>');
      textNode.parentNode.replaceChild(span, textNode);
      highlights.push(span);
    });
  }

  function clearHighlights() {
    highlights.forEach(span => {
      const parent = span.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(span.textContent), span);
      parent.normalize();
    });
    highlights = [];
  }

  function renderResults(results, term) {
    overlay.innerHTML = '';
    if (!results.length) {
      overlay.innerHTML = `<div class="search-no-results">Nenhum resultado para <strong>"${escapeHtml(term)}"</strong></div>`;
      overlay.classList.add('visible');
      return;
    }

    const header = document.createElement('div');
    header.className = 'search-results-header';
    header.textContent = `${results.length} resultado${results.length > 1 ? 's' : ''} para "${term}"`;
    overlay.appendChild(header);

    results.forEach(r => {
      const item = document.createElement('button');
      item.className = 'search-result-item';
      item.innerHTML = `
        <span class="result-section">${escapeHtml(r.sectionTitle)}</span>
        <span class="result-snippet">…${escapeHtml(r.snippet)}…</span>
      `;
      item.addEventListener('click', () => {
        r.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        panel.classList.remove('open');
        resetSearch();
      });
      overlay.appendChild(item);
    });

    overlay.classList.add('visible');
  }

  function resetSearch() {
    clearHighlights();
    overlay.innerHTML = '';
    overlay.classList.remove('visible');
  }

  function getSnippet(text, term, len) {
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    const start = Math.max(0, idx - 30);
    return text.slice(start, start + len);
  }

  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function escapeHtml(s)  { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }
}



function initOfficialButton() {
  const oldBtn = document.querySelector('.btn-oficial-invincible');
  if (!oldBtn) return;

  const btn = document.createElement('a');
  btn.href   = oldBtn.href;
  btn.target = '_blank';
  btn.rel    = 'noopener noreferrer';
  btn.className = 'btn-oficial-invincible js-btn';
  btn.setAttribute('aria-label', 'Acessar site oficial de Invincible');


  btn.innerHTML = `
    <svg class="btn-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
    <span>Site Oficial de Invincible</span>
    <span class="btn-arrow">→</span>
  `;


  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    const rect = btn.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top  = `${e.clientY - rect.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  oldBtn.replaceWith(btn);
}


function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scrollProgress';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const total   = document.documentElement.scrollHeight - window.innerHeight;
    const current = window.scrollY;
    bar.style.width = `${(current / total) * 100}%`;
  }, { passive: true });
}



function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('nav a[href^="#"]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`nav a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
}



function initScrollReveal() {
  const targets = document.querySelectorAll('section, figure, h2');
  targets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(t => io.observe(t));
}



function initImageTooltips() {
  document.querySelectorAll('figure img[alt]').forEach(img => {
    const tip = document.createElement('div');
    tip.className = 'img-tooltip';
    tip.textContent = img.alt;
    img.parentElement.style.position = 'relative';
    img.parentElement.appendChild(tip);

    img.addEventListener('mouseenter', () => tip.classList.add('visible'));
    img.addEventListener('mouseleave', () => tip.classList.remove('visible'));
  });
}


function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.setAttribute('aria-label', 'Voltar ao topo');
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  `;
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


function initFooterYear() {
  // Garante que o ano do footer seja dinâmico
  const footer = document.querySelector('footer p');
  if (!footer) return;
  footer.innerHTML = footer.innerHTML.replace(/\d{4}/, new Date().getFullYear());
}



document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initSearch();
  initOfficialButton();
  initActiveNav();
  initScrollReveal();
  initImageTooltips();
  initBackToTop();
  initFooterYear();
});
