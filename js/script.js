/**
 * js/script.js — Sitio público de Jardinería Jorge
 * -----------------------------------------------------------------------
 * No existe ninguna función de edición, guardado, contraseña ni
 * referencia al panel de administración: ese código vive en un
 * proyecto aparte (admin/) que nunca se sirve a esta página.
 * -----------------------------------------------------------------------
 */
import {
  SITE_TEXT, FOOTER_INFO, LOGO_URL, CATEGORIES, PRODUCTS, TIPS, SERVICES,
  SERVICE_ICONS, DIFFICULTY_MAP, TAG_OPTIONS, INFO_FIELDS, WHATSAPP_NUMBER,
} from "./productos.js";

const PAGE_SIZE = 16;
const TIP_INTERVAL = 4;
let pageState = {};
let searchQuery = "";
let liveLogoUrl = LOGO_URL;
let liveWhatsapp = WHATSAPP_NUMBER;

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

function catIds() { return CATEGORIES.map((c) => c.id); }

function makeCard(className, innerHTML, onClick) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = className;
  card.setAttribute("aria-haspopup", "dialog");
  card.innerHTML = innerHTML;
  card.addEventListener("click", onClick);
  observeReveal(card);
  return card;
}

function matchesQuery(prod, q) {
  return (prod.name || "").toLowerCase().includes(q) || (prod.desc || "").toLowerCase().includes(q);
}

function getWhatsAppDigits() {
  return (liveWhatsapp || FOOTER_INFO.whatsapp || "").replace(/\D/g, "");
}

const iconSVG = `<svg class="placeholder-icon" width="46" height="46" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3C12 3 7 8 7 13C7 16 9 18 12 18C15 18 17 16 17 13C17 8 12 3 12 3Z" stroke="currentColor" stroke-width="1.4"/><path d="M12 18V21" stroke="currentColor" stroke-width="1.4"/></svg>`;

/* =========================================================
   NAV / TEXTOS ESTÁTICOS
========================================================= */
function navItemsList() {
  const items = [{ href: "#destacados", label: "⭐ Destacados" }];
  CATEGORIES.forEach((c) => items.push({ href: "#" + c.id, label: `${c.emoji} ${c.name}` }));
  items.push({ href: "#servicios", label: "✂️ Servicios" });
  return items;
}

function renderNav() {
  const items = navItemsList();
  const navLinks = document.getElementById("navLinks");
  const mobileMenu = document.getElementById("mobileMenu");
  const footerLinks = document.getElementById("footerCategoryLinks");
  if (navLinks) navLinks.innerHTML = items.map((i) => `<li><a href="${i.href}">${i.label}</a></li>`).join("");
  if (mobileMenu) mobileMenu.innerHTML = items.map((i) => `<a href="${i.href}">${i.label}</a>`).join("");
  if (footerLinks) {
    footerLinks.innerHTML = items
      .filter((i) => i.href !== "#destacados")
      .map((i) => `<a href="${i.href}">${i.label.replace(/^\S+\s/, "")}</a>`).join("");
  }
}

function renderStaticText() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("navBrandNameEl", SITE_TEXT.brandName);
  set("heroMainEl", SITE_TEXT.heroMain);
  set("heroAccentEl", SITE_TEXT.heroAccent);
  set("heroSubtitleEl", SITE_TEXT.heroSubtitle);
  set("servicesEyebrowEl", SITE_TEXT.servicesEyebrow);
  set("servicesTitleEl", SITE_TEXT.servicesTitle);
  set("servicesDescEl", SITE_TEXT.servicesDesc);
  set("footerBrandNameEl", SITE_TEXT.brandName);
  set("footerTaglineEl", SITE_TEXT.footerTagline);
  set("footerCopyrightEl", SITE_TEXT.copyrightText);
  set("footerLocation", FOOTER_INFO.location || "[ Tu distrito / ciudad ]");
  set("footerWhatsapp", FOOTER_INFO.whatsapp || "[ Tu número de WhatsApp ]");
  set("footerHours", FOOTER_INFO.hours || "[ Ej: Lun–Sáb, 8am–6pm ]");

  const ig = document.getElementById("footerInstagram");
  const fb = document.getElementById("footerFacebook");
  const tk = document.getElementById("footerTiktok");
  if (ig) ig.href = FOOTER_INFO.instagram || "#";
  if (fb) fb.href = FOOTER_INFO.facebook || "#";
  if (tk) tk.href = FOOTER_INFO.tiktok || "#";

  document.querySelectorAll(".logo-badge img, .hero-logo img, .footer-logo-badge img").forEach((img) => {
    img.src = liveLogoUrl;
  });
}

/* =========================================================
   SECCIONES DE CATEGORÍAS
========================================================= */
function renderCategorySections() {
  const container = document.getElementById("categorySections");
  if (!container) return;
  container.innerHTML = CATEGORIES.map((cat, idx) => `
    <section class="section ${idx % 2 === 1 ? "alt-bg" : ""}" id="${cat.id}" aria-labelledby="${cat.id}-title">
      <div class="wrap">
        <div class="section-head reveal">
          <p class="eyebrow">${escapeHtml(cat.eyebrow)}</p>
          <h2 id="${cat.id}-title">${cat.emoji} ${escapeHtml(cat.name)}</h2>
          <p>${escapeHtml(cat.desc)}</p>
        </div>
        <div class="prod-grid" data-category="${cat.id}"></div>
      </div>
    </section>
  `).join("");
  container.querySelectorAll(".section-head.reveal").forEach(observeReveal);
  CATEGORIES.forEach((cat) => renderCategory(cat.id));
}

function tagsHtml(prod) {
  if (!prod.tags || !prod.tags.length) return "";
  const chips = prod.tags.map((key) => {
    const opt = TAG_OPTIONS.find((t) => t.key === key);
    return opt ? `<span class="tag-pill">${opt.emoji} ${opt.label}</span>` : "";
  }).join("");
  return chips ? `<div class="tag-list">${chips}</div>` : "";
}

function infoRowHtml(prod) {
  const items = INFO_FIELDS.filter((f) => prod[f.key]).map((f) =>
    `<span class="info-item">${f.icon} ${escapeHtml(prod[f.key])}</span>`
  );
  return items.length ? `<div class="info-row">${items.join("")}</div>` : "";
}

function productCardHtml(prod) {
  const tags = tagsHtml(prod);
  const diff = prod.difficulty && DIFFICULTY_MAP[prod.difficulty]
    ? `<div class="diff-pill">${DIFFICULTY_MAP[prod.difficulty].emoji} ${DIFFICULTY_MAP[prod.difficulty].label}</div>`
    : "";
  return `
    <div class="prod-img">${prod.img ? `<img src="${prod.img}" alt="${escapeHtml(prod.name)}" loading="lazy" decoding="async">` : iconSVG}</div>
    ${tags}
    ${diff}
    <div class="prod-body">
      <h4>${escapeHtml(prod.name)}</h4>
      <span class="prod-price">${escapeHtml(prod.price)}</span>
      ${infoRowHtml(prod)}
    </div>
  `;
}

function buildTipCard(cat) {
  const tips = TIPS[cat];
  if (!tips || !tips.length) return null;
  const text = tips[Math.floor(Math.random() * tips.length)];
  const card = document.createElement("div");
  card.className = "tip-card reveal";
  card.innerHTML = `<span class="tip-icon">💡</span><p>${escapeHtml(text)}</p>`;
  observeReveal(card);
  return card;
}

function renderCategory(cat) {
  const grid = document.querySelector(`.prod-grid[data-category="${cat}"]`);
  const section = document.getElementById(cat);
  if (!grid) return;
  grid.innerHTML = "";
  const all = PRODUCTS[cat] || [];

  const q = searchQuery.trim().toLowerCase();
  const isSearching = q.length > 0;
  const matched = isSearching ? all.filter((p) => matchesQuery(p, q)) : all;

  if (section) section.style.display = (isSearching && matched.length === 0) ? "none" : "";

  if (!pageState[cat]) pageState[cat] = PAGE_SIZE;
  const visibleCount = isSearching ? matched.length : Math.min(pageState[cat], matched.length);
  const visible = matched.slice(0, visibleCount);

  visible.forEach((prod, i) => {
    const card = makeCard("prod-card reveal", productCardHtml(prod), () => openProductModal(cat, prod.id));
    grid.appendChild(card);

    if (!isSearching && (i + 1) % TIP_INTERVAL === 0 && i !== visible.length - 1) {
      const tipCard = buildTipCard(cat);
      if (tipCard) grid.appendChild(tipCard);
    }
  });

  if (!isSearching && matched.length > visibleCount) {
    const more = document.createElement("button");
    more.type = "button";
    more.className = "load-more-btn reveal in";
    more.textContent = `Ver más (${matched.length - visibleCount} restantes)`;
    more.addEventListener("click", () => { pageState[cat] += PAGE_SIZE; renderCategory(cat); });
    grid.appendChild(more);
  }
}

/* =========================================================
   DESTACADOS
========================================================= */
function renderFeatured() {
  const featSection = document.getElementById("destacados");
  if (featSection) featSection.style.display = searchQuery.trim() ? "none" : "";
  const wrap = document.getElementById("featuredScroll");
  if (!wrap) return;
  const items = [];
  CATEGORIES.forEach((c) => {
    (PRODUCTS[c.id] || []).forEach((p) => { if (p.featured) items.push({ cat: c.id, prod: p }); });
  });
  if (!items.length) {
    wrap.innerHTML = `<p class="featured-empty">Todavía no hay productos destacados.</p>`;
    return;
  }
  wrap.innerHTML = "";
  items.forEach(({ cat, prod }) => {
    const card = makeCard("prod-card reveal", productCardHtml(prod), () => openProductModal(cat, prod.id));
    wrap.appendChild(card);
  });
}

/* =========================================================
   SERVICIOS
========================================================= */
function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;
  grid.innerHTML = "";
  SERVICES.forEach((svc) => {
    const html = `
      ${svc.img
        ? `<div class="tag-img"><img src="${svc.img}" alt="${escapeHtml(svc.name)}" loading="lazy" decoding="async"></div>`
        : `<div class="tag-stake">${SERVICE_ICONS[svc.iconKey] || ""}</div>`
      }
      <div class="tag-body">
        <h3>${escapeHtml(svc.name)}</h3>
        <p>${escapeHtml(svc.desc)}</p>
      </div>
    `;
    const card = makeCard("tag-card reveal" + (svc.img ? " has-img" : ""), html, () => openServiceModal(svc.id));
    grid.appendChild(card);
  });
}

/* =========================================================
   MODAL (genérico)
========================================================= */
function openModal(backdrop) {
  backdrop.classList.add("open");
  document.getElementById("closeModal")?.addEventListener("click", closeModal);
  backdrop.addEventListener("click", backdropClickHandler);
  document.addEventListener("keydown", escCloseHandler);
}
function backdropClickHandler(e) { if (e.target === e.currentTarget) closeModal(); }
function escCloseHandler(e) { if (e.key === "Escape") closeModal(); }
function closeModal() {
  const backdrop = document.getElementById("modalBackdrop");
  backdrop.classList.remove("open");
  backdrop.removeEventListener("click", backdropClickHandler);
  document.removeEventListener("keydown", escCloseHandler);
}

const WA_ICON = `<svg viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.6.9-.8 1-.1.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5C11.4 9.1 11 8 10.8 7.6c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.3-.1-.1-.3-.2-.6-.3z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5-1.3c1.4.8 3.1 1.2 4.9 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.3c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3C4.2 15 3.7 13.5 3.7 12 3.7 7.4 7.4 3.7 12 3.7S20.3 7.4 20.3 12 16.6 20.3 12 20.3Z"/></svg>`;

function whatsappButtonHtml(id) {
  return `<button class="wa-btn" id="${id}" type="button">${WA_ICON}Consultar por WhatsApp</button>`;
}

function wireWhatsAppButton(id, message) {
  document.getElementById(id)?.addEventListener("click", () => {
    const waNumber = getWhatsAppDigits();
    if (!waNumber) {
      alert('Falta configurar tu número de WhatsApp. Ve al pie de página → "Contacto" → ✎ y agrégalo ahí.');
      return;
    }
    const msg = encodeURIComponent(message);
    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
  });
}

/* ---------- Modal de producto ---------- */
function renderComments(comments) {
  if (!comments || !comments.length) {
    return `<p style="color:var(--ink-soft);font-size:0.88rem;">Todavía no hay comentarios.</p>`;
  }
  return comments.map((c) => `
    <div class="comment">
      <span class="author">${escapeHtml(c.author)}</span>
      <span class="txt">${escapeHtml(c.text)}</span>
    </div>
  `).join("");
}

function openProductModal(catId, prodId) {
  const prod = (PRODUCTS[catId] || []).find((p) => p.id === prodId);
  if (!prod) return;
  const backdrop = document.getElementById("modalBackdrop");
  const content = document.getElementById("modalContent");
  content.style.gridTemplateColumns = "";

  const diff = prod.difficulty && DIFFICULTY_MAP[prod.difficulty]
    ? `<div class="modal-diff">${DIFFICULTY_MAP[prod.difficulty].emoji} ${DIFFICULTY_MAP[prod.difficulty].label}</div>` : "";
  const tags = prod.tags && prod.tags.length
    ? `<div class="modal-tags">${prod.tags.map((k) => {
        const opt = TAG_OPTIONS.find((t) => t.key === k);
        return opt ? `<span class="tag-pill">${opt.emoji} ${opt.label}</span>` : "";
      }).join("")}</div>` : "";

  content.innerHTML = `
    <div class="modal-img">
      ${prod.img ? `<img src="${prod.img}" alt="${escapeHtml(prod.name)}" decoding="async">` : `<div style="color:var(--foliage);opacity:0.5;">${iconSVG}</div>`}
      <div class="modal-close" id="closeModal">✕</div>
    </div>
    <div class="modal-body">
      ${tags}
      <h3>${escapeHtml(prod.name)}</h3>
      <span class="modal-price">${escapeHtml(prod.price)}</span>
      ${diff}
      <p class="modal-desc">${escapeHtml(prod.desc)}</p>
      ${infoRowHtml(prod)}
      ${whatsappButtonHtml("waBtn")}
      <div class="comments-title">Comentarios de clientes</div>
      <div id="commentsList">${renderComments(prod.comments)}</div>
    </div>
  `;
  openModal(backdrop);
  wireWhatsAppButton("waBtn", `Hola, quiero consultar sobre: ${prod.name}`);
}

/* ---------- Modal de servicio ---------- */
function openServiceModal(svcId) {
  const svc = SERVICES.find((s) => s.id === svcId);
  if (!svc) return;
  const backdrop = document.getElementById("modalBackdrop");
  const content = document.getElementById("modalContent");
  content.style.gridTemplateColumns = "";
  content.innerHTML = `
    <div class="modal-img">
      ${svc.img ? `<img src="${svc.img}" alt="${escapeHtml(svc.name)}" decoding="async">` : `<div style="color:var(--foliage);opacity:0.5;">${iconSVG}</div>`}
      <div class="modal-close" id="closeModal">✕</div>
    </div>
    <div class="modal-body">
      <h3>${escapeHtml(svc.name)}</h3>
      <p class="modal-desc">${escapeHtml(svc.desc)}</p>
      ${whatsappButtonHtml("waBtnSvc")}
    </div>
  `;
  openModal(backdrop);
  wireWhatsAppButton("waBtnSvc", `Hola, quiero consultar sobre el servicio: ${svc.name}`);
}

/* =========================================================
   BÚSQUEDA
========================================================= */
function initSearch() {
  const searchInput = document.getElementById("globalSearch");
  const searchHint = document.getElementById("searchHint");
  if (!searchInput) return;
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    catIds().forEach(renderCategory);
    renderFeatured();
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const total = catIds().reduce((sum, cat) =>
        sum + (PRODUCTS[cat] || []).filter((p) => matchesQuery(p, q)).length, 0);
      searchHint.textContent = total === 0
        ? "No encontramos productos con ese nombre."
        : `${total} resultado${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}.`;
    } else {
      searchHint.textContent = "";
    }
  });
}

/* =========================================================
   MENÚ MÓVIL
========================================================= */
function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (!menuToggle || !mobileMenu) return;
  menuToggle.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mobileMenu.addEventListener("click", (e) => {
    if (e.target.tagName === "A") { mobileMenu.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); }
  });
}

/* =========================================================
   REVEAL AL HACER SCROLL
========================================================= */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
function observeReveal(el) { io.observe(el); }

/* =========================================================
   DATOS EN VIVO (/api/data) — con respaldo a productos.js
========================================================= */
async function loadCatalogData() {
  try {
    const res = await fetch("/api/data", { cache: "no-store" });
    if (!res.ok) throw new Error("respuesta no válida de /api/data (" + res.status + ")");
    const data = await res.json();
    if (!data || typeof data !== "object") throw new Error("/api/data no devolvió un catálogo válido");
    applyRemoteData(data);
  } catch (err) {
    console.info("Usando el catálogo local (productos.js): no se pudo leer /api/data.", err.message);
  }
}

function applyRemoteData(data) {
  if (data.siteText) Object.assign(SITE_TEXT, data.siteText);
  if (data.footerInfo) Object.assign(FOOTER_INFO, data.footerInfo);
  if (Array.isArray(data.categories)) { CATEGORIES.length = 0; CATEGORIES.push(...data.categories); }
  if (data.products) { Object.keys(PRODUCTS).forEach((k) => delete PRODUCTS[k]); Object.assign(PRODUCTS, data.products); }
  if (data.tips) { Object.keys(TIPS).forEach((k) => delete TIPS[k]); Object.assign(TIPS, data.tips); }
  if (Array.isArray(data.services)) { SERVICES.length = 0; SERVICES.push(...data.services); }
  if (data.logo) liveLogoUrl = data.logo;
  if (data.footerInfo && data.footerInfo.whatsapp) liveWhatsapp = data.footerInfo.whatsapp;
}

/* =========================================================
   INIT
========================================================= */
async function init() {
  try {
    await loadCatalogData();
    renderNav();
    renderStaticText();
    renderCategorySections();
    renderFeatured();
    renderServices();
    initSearch();
    initMobileMenu();
    document.querySelectorAll(".reveal").forEach(observeReveal);
  } catch (err) {
    console.error("Error inicializando el catálogo:", err);
  } finally {
    const banner = document.getElementById("loadingBanner");
    if (banner) banner.classList.add("hide");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
