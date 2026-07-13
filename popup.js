/* Tabento popup.js */
const $ = id => document.getElementById(id);
const esc = s => !s ? '' : String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const favUrl = u => { try { return `https://www.google.com/s2/favicons?domain=${new URL(u).hostname}&sz=32`; } catch { return ''; } };
const dispUrl = u => { try { return new URL(u).hostname; } catch { return u; } };
const isProto = u => !u || u.startsWith('chrome') || u.startsWith('edge') || u.startsWith('about');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const SUPPORTED_LOCALES = ['en','zh-TW','zh-CN','es','ja','fr'];
const normalizeLanguage = value => {
  const lang = String(value || 'en').trim();
  if (/^zh(?:[-_](?:tw|hk|mo|hant))$/i.test(lang)) return 'zh-TW';
  if (/^zh(?:[-_]|$)/i.test(lang)) return 'zh-CN';
  return SUPPORTED_LOCALES.find(locale => locale.toLowerCase() === lang.toLowerCase()) || 'en';
};
const browserLanguage = () => {
  const lang = navigator.languages?.[0] || navigator.language || 'en';
  return normalizeLanguage(lang);
};
const appLocale = () => normalizeLanguage(state?.settings?.language || browserLanguage());

const POPUP_I18N = {
  en: { openFull:'Open full workspace',saveCurrent:'Save current',saveAll:'Save all ·',hibernateTabs:'Hibernate tabs',saveTo:'Save to',back:'← back',hibernateNote:'Suspend tabs to free memory — they reload when opened. The tab you are viewing stays awake.',scope:'Scope',thisWindow:'This window',allWindows:'All windows',keepPinned:'Keep pinned tabs',keepAudio:'Keep tabs playing audio',searchTabs:'Search open tabs…',openTabs:'Open tabs' },
  'zh-TW': { openFull:'開啟完整工作空間',saveCurrent:'儲存目前分頁',saveAll:'全部儲存 ·',hibernateTabs:'休眠分頁',saveTo:'儲存至',back:'← 返回',hibernateNote:'休眠分頁以釋放記憶體；開啟時會重新載入。目前檢視的分頁會保持喚醒。',scope:'範圍',thisWindow:'此視窗',allWindows:'所有視窗',keepPinned:'保留固定分頁',keepAudio:'保留播放音訊的分頁',searchTabs:'搜尋開啟的分頁…',openTabs:'開啟的分頁' },
  'zh-CN': { openFull:'打开完整工作区',saveCurrent:'保存当前标签页',saveAll:'全部保存 ·',hibernateTabs:'休眠标签页',saveTo:'保存到',back:'← 返回',hibernateNote:'休眠标签页以释放内存；打开时会重新加载。当前查看的标签页会保持唤醒。',scope:'范围',thisWindow:'此窗口',allWindows:'所有窗口',keepPinned:'保留固定标签页',keepAudio:'保留播放音频的标签页',searchTabs:'搜索已打开的标签页…',openTabs:'已打开的标签页' },
  es: { openFull:'Abrir el espacio completo',saveCurrent:'Guardar actual',saveAll:'Guardar todo ·',hibernateTabs:'Poner pestañas en reposo',saveTo:'Guardar en',back:'← volver',hibernateNote:'Pon las pestañas en reposo para liberar memoria; se recargan al abrirlas. La pestaña visible permanece activa.',scope:'Ámbito',thisWindow:'Esta ventana',allWindows:'Todas las ventanas',keepPinned:'Conservar pestañas fijadas',keepAudio:'Conservar pestañas con audio',searchTabs:'Buscar pestañas abiertas…',openTabs:'Pestañas abiertas' },
  ja: { openFull:'ワークスペース全体を開く',saveCurrent:'現在のタブを保存',saveAll:'すべて保存 ·',hibernateTabs:'タブを休止',saveTo:'保存先',back:'← 戻る',hibernateNote:'タブを休止してメモリを解放します。開くと再読み込みされ、表示中のタブは休止しません。',scope:'範囲',thisWindow:'このウィンドウ',allWindows:'すべてのウィンドウ',keepPinned:'固定タブを保持',keepAudio:'音声再生中のタブを保持',searchTabs:'開いているタブを検索…',openTabs:'開いているタブ' },
  fr: { openFull:'Ouvrir tout l’espace',saveCurrent:'Enregistrer l’onglet',saveAll:'Tout enregistrer ·',hibernateTabs:'Mettre les onglets en veille',saveTo:'Enregistrer dans',back:'← retour',hibernateNote:'Mettez les onglets en veille pour libérer de la mémoire ; ils se rechargent à l’ouverture. L’onglet affiché reste actif.',scope:'Portée',thisWindow:'Cette fenêtre',allWindows:'Toutes les fenêtres',keepPinned:'Conserver les onglets épinglés',keepAudio:'Conserver les onglets avec audio',searchTabs:'Rechercher dans les onglets…',openTabs:'Onglets ouverts' }
};

function applyLocale() {
  const locale = appLocale();
  const table = POPUP_I18N[locale] || POPUP_I18N.en;
  document.documentElement.lang = locale;
  document.querySelectorAll('[data-popup-i18n]').forEach(el => {
    const text = table[el.dataset.popupI18n] || POPUP_I18N.en[el.dataset.popupI18n];
    if (el.dataset.popupI18n === 'saveAll' && el.querySelector('b')) el.firstChild.textContent = `${text} `;
    else el.textContent = text;
  });
  document.querySelectorAll('[data-popup-i18n-placeholder]').forEach(el => { el.placeholder = table[el.dataset.popupI18nPlaceholder] || POPUP_I18N.en[el.dataset.popupI18nPlaceholder]; });
  document.querySelectorAll('[data-popup-i18n-title]').forEach(el => { const text = table[el.dataset.popupI18nTitle] || POPUP_I18N.en[el.dataset.popupI18nTitle]; el.title = text; el.setAttribute('aria-label', text); });
}

// Every surface reads its palette from the shared themes.css, so applying the
// same [data-theme] the workspace uses keeps the popup on-theme.
const THEME_IDS = new Set(['tabento','tabento-dark','dark','aurora','light','dracula','nord','rose-pine','tokyo-night','solarized-dark','solarized-light','gruvbox','catppuccin','sepia','mono']);
function applyTheme() {
  let theme = state?.settings?.theme || 'light';
  if (theme === 'auto') theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  if (!THEME_IDS.has(theme)) theme = 'light';
  document.documentElement.dataset.theme = theme;
}

// ── Hibernation (mirrors newtab.js: a lightweight suspended.html placeholder
// that only loads the real URL when the tab is focused + clicked, so a
// backgrounded tab uses near-zero memory). ──
const SUSPEND_PREFIX = chrome.runtime.getURL('suspended.html');
function buildSuspendedUrl({ url, title, fav }) {
  const p = new URLSearchParams();
  if (url) p.set('url', url);
  if (title) p.set('title', title);
  if (fav) p.set('fav', fav);
  return SUSPEND_PREFIX + '#' + p.toString();
}

let all = [], state = null, pendingTab = null, activeTabId = null;

async function loadState() {
  const d = await chrome.storage.local.get('te');
  state = d.te || null;
}
async function load() {
  await loadState();
  applyLocale();
  applyTheme();
  const [cur, tabs] = await Promise.all([
    chrome.tabs.query({ active: true, currentWindow: true }),
    chrome.tabs.query({ currentWindow: true })
  ]);
  activeTabId = cur[0]?.id ?? null;
  all = tabs.filter(t => !isProto(t.url));
  $('qs-count').textContent = all.length;
  render(activeTabId);
  refreshHibernateHint();
}

function render(activeId) {
  $('ptabs').innerHTML = '';
  if (!all.length) { $('ptabs').innerHTML = `<div class="empty-hint">No saveable tabs in this window.</div>`; return; }
  all.forEach(t => {
    const row = document.createElement('div');
    const isActive = t.id === activeId;
    row.className = 'pti' + (isActive ? ' active-tab' : '');
    const fav = t.favIconUrl || favUrl(t.url);
    // The tab you're viewing can't be usefully hibernated (it would reload the
    // instant you look at it), so it gets a status badge instead of a button.
    const actions = isActive
      ? `<span class="pti-badge" title="The tab you're viewing stays awake">viewing</span>`
      : `<div class="pti-acts">
           <button class="pti-hib" title="Hibernate this tab" aria-label="Hibernate this tab">
             <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M11.5 8.2A4.6 4.6 0 015.8 2.5a4.6 4.6 0 105.7 5.7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
           </button>
           <button class="pti-save" title="Save…">Save</button>
         </div>`;
    row.innerHTML = `
      <img src="${esc(fav)}" alt="" onerror="this.style.visibility='hidden'">
      <div class="pti-info">
        <div class="pti-title">${esc(t.title || t.url)}</div>
        <div class="pti-url">${esc(dispUrl(t.url))}</div>
      </div>
      ${actions}`;
    row.onclick = e => {
      if (e.target.closest('.pti-save')) { openSavePicker(t); return; }
      if (e.target.closest('.pti-hib')) { hibernateSingle(t); return; }
      chrome.tabs.update(t.id, { active: true });
      window.close();
    };
    $('ptabs').appendChild(row);
  });
}

// ═══ Save-to picker ═══
function openSavePicker(tab) {
  pendingTab = tab;
  const stg = $('stg-list'); stg.innerHTML = '';
  if (!state?.workspaces?.length) { stg.innerHTML = '<div class="empty-hint">No workspaces yet. Open the full workspace to get started.</div>'; }
  else {
    state.workspaces.forEach(ws => {
      ws.categories.forEach(cat => {
        const lbl = document.createElement('div');
        lbl.className = 'stg-cat-lbl';
        lbl.textContent = `${ws.symbol || '🏠'} ${ws.name} — ${cat.name}`;
        stg.appendChild(lbl);
        if (!cat.groups.length) {
          const em = document.createElement('div');
          em.className = 'empty-hint';
          em.style.cssText = 'padding:6px 14px;text-align:left;';
          em.textContent = 'No groups yet.';
          stg.appendChild(em);
        }
        cat.groups.forEach(g => {
          const row = document.createElement('div');
          row.className = 'stg-row';
          row.innerHTML = `<span class="sym">${esc(g.symbol || '📁')}</span><span class="nm">${esc(g.name)}</span><span class="cnt">${g.items.length}</span>`;
          row.onclick = () => doSave(ws, cat, g, tab);
          stg.appendChild(row);
        });
      });
    });
  }
  showSection('save-to-section');
}
$('stg-back').onclick = () => { showSection('main-section'); pendingTab = null; };

async function doSave(ws, cat, g, t) {
  if (g.items.find(it => it.type === 'tab' && it.url === t.url)) {
    $('stg-list').innerHTML = `<div class="empty-hint">Already saved in this group.</div>`;
    return;
  }
  g.items.push({ id: uid(), type:'tab', title: t.title || 'Untitled', url: t.url, fav: t.favIconUrl || '' });
  await chrome.storage.local.set({ te: state });
  if (state.settings?.closeTabOnSave !== false) {
    try { await chrome.tabs.remove(t.id); } catch {}
  }
  const row = [...document.querySelectorAll('.stg-row')].find(r => r.querySelector('.nm')?.textContent === g.name);
  if (row) { row.style.background = 'var(--green)'; row.querySelector('.nm').textContent = 'Saved!'; }
  setTimeout(() => window.close(), 400);
}

// ═══ Hibernate ═══
async function getHibernateCandidates() {
  const allWindows = $('hib-scope').querySelector('.active')?.dataset.val === 'all';
  const keepPinned = $('hib-keep-pinned').checked;
  const keepAudio = $('hib-keep-audio').checked;
  // Only the focused window's active tab would auto-wake, so it's the single
  // tab we always keep awake — every other real tab is fair game.
  const focused = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const keepAwakeId = focused[0]?.id ?? activeTabId;
  const q = allWindows ? {} : { currentWindow: true };
  let tabs = await chrome.tabs.query(q);
  tabs = tabs.filter(t => !isProto(t.url) && t.id !== keepAwakeId);
  if (keepPinned) tabs = tabs.filter(t => !t.pinned);
  if (keepAudio) tabs = tabs.filter(t => !t.audible);
  return tabs;
}

async function updateHibernateCount() {
  const targets = await getHibernateCandidates();
  const n = targets.length;
  $('hib-count').textContent = n;
  $('hib-go').disabled = n === 0;
}

async function refreshHibernateHint() {
  // Count background tabs (this window, keeping pinned/audio) for the main button.
  const focused = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const keepAwakeId = focused[0]?.id ?? activeTabId;
  const tabs = (await chrome.tabs.query({ currentWindow: true }))
    .filter(t => !isProto(t.url) && t.id !== keepAwakeId && !t.pinned && !t.audible);
  const hint = $('hib-open-hint');
  if (hint) hint.textContent = tabs.length ? `${tabs.length} idle` : '';
}

async function hibernateSingle(t) {
  try {
    await chrome.tabs.update(t.id, { url: buildSuspendedUrl({ url: t.url, title: t.title, fav: t.favIconUrl }) });
    toast('Tab hibernated');
    await load();
  } catch { toast('Could not hibernate tab'); }
}

$('hib-open').onclick = async () => { await updateHibernateCount(); showSection('hibernate-section'); };
$('hib-back').onclick = () => showSection('main-section');
$('hib-scope').querySelectorAll('button').forEach(b => b.onclick = () => {
  $('hib-scope').querySelectorAll('button').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  updateHibernateCount();
});
$('hib-keep-pinned').onchange = updateHibernateCount;
$('hib-keep-audio').onchange = updateHibernateCount;
$('hib-go').onclick = async () => {
  const targets = await getHibernateCandidates();
  if (!targets.length) return;
  $('hib-go').disabled = true;
  let n = 0;
  for (const t of targets) {
    try { await chrome.tabs.update(t.id, { url: buildSuspendedUrl({ url: t.url, title: t.title, fav: t.favIconUrl }) }); n++; } catch {}
  }
  toast(n === 1 ? 'Hibernated 1 tab' : `Hibernated ${n} tabs`);
  await load();
  showSection('main-section');
};

// ═══ Section switching (single visible section at a time) ═══
function showSection(id) {
  ['main-section', 'save-to-section', 'hibernate-section'].forEach(s => {
    $(s).classList.toggle('hidden', s !== id);
  });
}

// ═══ Search ═══
$('ps').oninput = () => {
  const q = $('ps').value.toLowerCase();
  const rows = $('ptabs').querySelectorAll('.pti');
  let i = 0;
  rows.forEach(el => {
    const t = all[i++]; if (!t) return;
    const m = !q || (t.title||'').toLowerCase().includes(q) || (t.url||'').toLowerCase().includes(q);
    el.classList.toggle('hidden', !m);
  });
};

// ═══ Primary actions ═══
$('open-full').onclick = () => { chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') }); window.close(); };
$('qs-current').onclick = async () => {
  const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (t && !isProto(t.url)) openSavePicker(t);
  else toast('This tab can’t be saved');
};
$('qs-all').onclick = async () => {
  if (!state?.workspaces?.length) { toast('Open the full workspace first'); return; }
  const ws = state.workspaces.find(w => w.id === state.activeWsId) || state.workspaces[0];
  const cat = ws.categories.find(c => c.id === ws.activeCatId) || ws.categories[0];
  if (!cat) return;
  const now = new Date();
  cat.groups.push({
    id: uid(), symbol:'💾', color:'#06b6d4', collapsed:false,
    name:`Session ${now.toLocaleDateString(appLocale(), { month:'short', day:'numeric' })} ${now.toLocaleTimeString(appLocale(), { hour:'2-digit', minute:'2-digit' })}`,
    items: all.map(t => ({ id: uid(), type:'tab', title:t.title||'Untitled', url:t.url, fav:t.favIconUrl||'' }))
  });
  await chrome.storage.local.set({ te: state });
  if (state.settings?.closeTabOnSave !== false) {
    const others = all.slice(1);
    for (const t of others) { try { await chrome.tabs.remove(t.id); } catch {} }
  }
  toast(`Saved ${all.length} tabs`);
  setTimeout(() => window.close(), 650);
};

// ═══ Toast ═══
let toastTimer = null;
function toast(msg) {
  let el = $('pop-toast');
  if (!el) { el = document.createElement('div'); el.id = 'pop-toast'; document.body.appendChild(el); }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
}

load();
