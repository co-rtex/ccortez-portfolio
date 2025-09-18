// --- Categories present (order in chips) ---
const CATEGORY_ORDER = [
    "food", "housing", "health", "mental", "substance", "legal", "financial", "immigrant", "seniors", "community", "government", "hotlines", "safety", "crisis"
];

const state = { query: "", active: new Set() };

// Elements
const q = document.getElementById('q');
const list = document.getElementById('list');
const empty = document.getElementById('empty');
const chipbar = document.getElementById('chipbar');
const count = document.getElementById('count');
const lastUpdated = document.getElementById('lastUpdated');

// Set last-updated stamp (change here when you update resources)
lastUpdated.textContent = "Sep 17, 2025";

// Build unique category set from resources (ensure slugs)
const ALL_CATS = Array.from(new Set(
    RESOURCES.flatMap(r => r.cats || [])
)).sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));

// i18n-aware chip rendering
window.renderChips = function renderChips() {
    chipbar.innerHTML = "";
    ALL_CATS.forEach(cat => {
        const b = document.createElement('button');
        b.className = 'chip';
        b.type = 'button';
        b.textContent = Lang.t(`categories.${cat}`) || cat;
        b.setAttribute('aria-pressed', state.active.has(cat) ? 'true' : 'false');
        if (state.active.has(cat)) b.classList.add('active');
        b.addEventListener('click', () => {
            if (state.active.has(cat)) {
                state.active.delete(cat);
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            } else {
                state.active.add(cat);
                b.classList.add('active');
                b.setAttribute('aria-pressed', 'true');
            }
            renderList();
        });
        chipbar.appendChild(b);
    });
};

// Search listeners
q.addEventListener('input', () => { state.query = q.value.trim().toLowerCase(); renderList(); });
document.getElementById('clearBtn').onclick = () => { q.value = ""; state.query = ""; renderList(); };
document.getElementById('resetBtn').onclick = () => {
    q.value = ""; state.query = ""; state.active.clear(); renderChips(); renderList();
};
document.getElementById('printBtn').onclick = () => window.print();

// Build card
function card(r) {
    const el = document.createElement('article'); el.className = 'card'; el.setAttribute('role', 'listitem');
    const cats = (r.cats || []).map(c => `<span class="cat">${Lang.t(`categories.${c}`) || c}</span>`).join("");
    const name = Lang.current === 'es' ? (r.name_es || r.name_en) : (r.name_en);
    const notes = Lang.current === 'es' ? (r.notes_es || r.notes_en) : (r.notes_en);
    const alt = r.alt ? ` &nbsp;•&nbsp; <strong>${escapeHtml(r.alt)}</strong>` : "";
    el.innerHTML = `
      <header>
        <h3>${escapeHtml(name)}</h3>
        <div class="cats">${cats}</div>
      </header>
      <div class="meta">
        <div>📞 <a href="tel:${tel(r.phone)}" aria-label="${Lang.t('call')} ${escapeHtml(name)}">${escapeHtml(r.phone)}</a>${alt}</div>
        <div>📍 <a href="${map(r.address)}" target="_blank" rel="noopener">${Lang.t('map')}</a></div>
        <div>🔗 <a href="${r.url}" target="_blank" rel="noopener">${Lang.t('website')}</a></div>
      </div>
      <div class="desc">${escapeHtml(notes)}</div>
      <div class="meta">🏠 ${escapeHtml(r.address)}</div>
      <div class="actions">
        <a class="pill primary" href="tel:${tel(r.phone)}">📞 ${Lang.t('call')}</a>
        <a class="pill" href="${r.url}" target="_blank" rel="noopener">🌐 ${Lang.t('website')}</a>
        <a class="pill" href="${map(r.address)}" target="_blank" rel="noopener">🗺️ ${Lang.t('map')}</a>
        <button class="pill" type="button">📤 ${Lang.t('share')}</button>
      </div>
    `;
    el.querySelector('button').onclick = async () => {
        const text = `${name}\n${r.phone}${r.alt ? `\n${r.alt}` : ""}\n${r.address}\n${r.url}`;
        try {
            if (navigator.share) await navigator.share({ title: name, text: text, url: r.url });
            else { await navigator.clipboard.writeText(text); toast(Lang.t('copied')); }
        } catch { }
    };
    return el;
}

// Render list (i18n-aware search + category filters)
window.renderList = function renderList() {
    const qx = state.query;
    const cats = state.active;
    const results = RESOURCES.filter(r => {
        // category match
        const matchCats = cats.size ? (r.cats || []).some(c => cats.has(c)) : true;
        if (!matchCats) return false;
        // query match
        if (!qx) return true;

        const hay = [
            r.name_en, r.name_es, r.notes_en, r.notes_es, r.address, r.phone, r.alt,
            ...(r.cats || []).map(c => Lang.t(`categories.${c}`)),
            ...(r.tags || [])
        ].join(" • ").toLowerCase();

        return hay.includes(qx);
    });

    list.innerHTML = "";
    results.forEach(r => list.appendChild(card(r)));
    empty.hidden = results.length > 0;
    count.textContent = results.length;
};

function toast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.position = 'fixed'; t.style.bottom = '18px'; t.style.left = '50%'; t.style.transform = 'translateX(-50%)';
    t.style.background = '#10214a'; t.style.border = '1px solid #2b3a78'; t.style.padding = '10px 14px'; t.style.borderRadius = '10px'; t.style.color = '#e7efff'; t.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
    document.body.appendChild(t); setTimeout(() => t.remove(), 1700);
}
const map = (addr) => `https://www.google.com/maps?q=${encodeURIComponent(addr)}`;
const tel = (p) => String(p || "").replace(/[^\d+]/g, "");
const escapeHtml = (s = '') => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

// Build UI
renderChips();
Lang.apply(); // sets placeholders + labels
renderList();
