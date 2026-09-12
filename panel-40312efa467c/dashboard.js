/**
 * dashboard.js — Panel privado
 * Cada formulario edita una parte del catálogo en memoria y guarda
 * el objeto COMPLETO en /api/save (así lo exige el backend).
 */

let catalogData = null;

/* ---------- Arranque (sin login: este link ya es privado) ---------- */
loadCatalog();

function setNotice(msg, isError) {
  const el = document.getElementById("statusNotice");
  el.textContent = msg;
  el.style.borderColor = isError ? "#B23A3A" : "";
}
function setStatus(elId, msg, isError) {
  const el = document.getElementById(elId);
  el.textContent = msg;
  el.classList.toggle("error", !!isError);
  if (!isError) setTimeout(() => { if (el.textContent === msg) el.textContent = ""; }, 3000);
}

/* ---------- Cargar / guardar catálogo ---------- */
async function loadCatalog() {
  try {
    const res = await fetch("/api/data", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo leer /api/data");
    catalogData = await res.json();
    fillForms();
    renderCategoriesAdmin();
    renderProductsAdmin();
    renderServicesAdmin();
    setNotice("Catálogo cargado. Los cambios que guardes acá se reflejan en el sitio público al instante.");
  } catch {
    setNotice("No se pudo cargar el catálogo desde el servidor (¿ya conectaste Vercel KV?).", true);
  }
}

async function saveCatalog() {
  const res = await fetch("/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(catalogData),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "save_failed");
  }
  return true;
}

function fillForms() {
  const st = catalogData.siteText || {};
  document.getElementById("txtBrand").value = st.brandName || "";
  document.getElementById("txtHeroMain").value = st.heroMain || "";
  document.getElementById("txtHeroAccent").value = st.heroAccent || "";
  document.getElementById("txtHeroSub").value = st.heroSubtitle || "";
  document.getElementById("txtSvcEyebrow").value = st.servicesEyebrow || "";
  document.getElementById("txtSvcTitle").value = st.servicesTitle || "";
  document.getElementById("txtSvcDesc").value = st.servicesDesc || "";
  document.getElementById("txtFooterTagline").value = st.footerTagline || "";
  document.getElementById("txtCopyright").value = st.copyrightText || "";

  const fi = catalogData.footerInfo || {};
  document.getElementById("fLocation").value = fi.location || "";
  document.getElementById("fWhatsapp").value = fi.whatsapp || "";
  document.getElementById("fHours").value = fi.hours || "";
  document.getElementById("fInstagram").value = fi.instagram || "";
  document.getElementById("fFacebook").value = fi.facebook || "";
  document.getElementById("fTiktok").value = fi.tiktok || "";

  document.getElementById("logoPreview").src = catalogData.logo || "../assets/images/logo.png";
}

document.getElementById("siteTextForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  catalogData.siteText = {
    brandName: form.brandName.value.trim(),
    heroMain: form.heroMain.value.trim(),
    heroAccent: form.heroAccent.value.trim(),
    heroSubtitle: form.heroSubtitle.value.trim(),
    servicesEyebrow: form.servicesEyebrow.value.trim(),
    servicesTitle: form.servicesTitle.value.trim(),
    servicesDesc: form.servicesDesc.value.trim(),
    footerTagline: form.footerTagline.value.trim(),
    copyrightText: form.copyrightText.value.trim(),
  };
  try {
    const ok = await saveCatalog();
    if (ok) setStatus("siteTextStatus", "✓ Guardado");
  } catch { setStatus("siteTextStatus", "No se pudo guardar. Intenta de nuevo.", true); }
});

document.getElementById("footerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  catalogData.footerInfo = {
    location: form.location.value.trim(),
    whatsapp: form.whatsapp.value.trim(),
    hours: form.hours.value.trim(),
    instagram: form.instagram.value.trim(),
    facebook: form.facebook.value.trim(),
    tiktok: form.tiktok.value.trim(),
  };
  try {
    const ok = await saveCatalog();
    if (ok) setStatus("footerStatus", "✓ Guardado");
  } catch { setStatus("footerStatus", "No se pudo guardar. Intenta de nuevo.", true); }
});

/* ---------- Compresión de imágenes: WebP con respaldo a JPEG ---------- */
let _webpSupported = null;
function canvasSupportsWebp() {
  if (_webpSupported !== null) return _webpSupported;
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  _webpSupported = c.toDataURL("image/webp").startsWith("data:image/webp");
  return _webpSupported;
}
function canvasToCompressedDataUrl(canvas, quality) {
  return canvasSupportsWebp() ? canvas.toDataURL("image/webp", quality) : canvas.toDataURL("image/jpeg", quality);
}
function resizeImageFile(file, cb, opts) {
  const maxW = (opts && opts.maxW) || 480;
  const quality = (opts && opts.quality) || 0.75;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      cb(canvasToCompressedDataUrl(canvas, quality));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
async function uploadImage(file, opts) {
  const dataUrl = await new Promise((resolve) => resizeImageFile(file, resolve, opts));
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, dataUrl }),
  });
  if (!res.ok) throw new Error("upload_failed");
  const { url } = await res.json();
  return url;
}

document.getElementById("logoFileInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const url = await uploadImage(file, { maxW: 420, quality: 0.85 });
    if (!url) return;
    catalogData.logo = url;
    await saveCatalog();
    document.getElementById("logoPreview").src = url;
    setNotice("Logo actualizado y guardado.");
  } catch {
    setNotice("No se pudo subir el logo. Intenta con una imagen más liviana (máx. 4MB).", true);
  }
});

/* ---------- Modal genérico ---------- */
function esc(str) { const d = document.createElement("div"); d.textContent = str || ""; return d.innerHTML; }
function openModal(html) {
  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("modalBackdrop").classList.add("open");
  document.getElementById("closeModal")?.addEventListener("click", closeModal);
}
function closeModal() { document.getElementById("modalBackdrop").classList.remove("open"); }
document.getElementById("modalBackdrop").addEventListener("click", (e) => {
  if (e.target.id === "modalBackdrop") closeModal();
});

/* ---------- Constantes de formulario ---------- */
const TAG_OPTIONS = [
  { key: "nuevo", emoji: "🌿", label: "Nuevo" },
  { key: "vendido", emoji: "🔥", label: "Más vendido" },
  { key: "florece", emoji: "🌸", label: "Florece" },
  { key: "interior", emoji: "🏡", label: "Interior" },
  { key: "exterior", emoji: "🌞", label: "Exterior" },
];
const DIFFICULTY_MAP = { facil: "🟢 Fácil", intermedio: "🟡 Intermedio", experto: "🔴 Experto" };
const INFO_FIELDS = [
  { key: "light", label: "Luz" }, { key: "watering", label: "Riego" },
  { key: "size", label: "Tamaño" }, { key: "potSize", label: "Maceta" },
  { key: "location", label: "Ambiente" },
];
const SERVICE_ICON_KEYS = ["poda_cesped", "poda_arboles", "mantenimiento", "modelacion", "siembra", "fumigacion"];

/* ---------- Categorías ---------- */
function renderCategoriesAdmin() {
  const wrap = document.getElementById("categoriesAdminList");
  wrap.className = "admin-grid";
  wrap.innerHTML = catalogData.categories.map((c) => `
    <div class="admin-mini-card">
      <h4>${c.emoji} ${esc(c.name)}</h4>
      <p>${esc(c.desc)}</p>
      <div class="mini-actions"><button data-edit-cat="${c.id}">Editar</button></div>
    </div>
  `).join("");
  wrap.querySelectorAll("[data-edit-cat]").forEach((b) => b.addEventListener("click", () => openCategoryModal(b.dataset.editCat)));
}

function openCategoryModal(catId) {
  const isNew = !catId;
  const cat = isNew ? { id: null, emoji: "🌿", name: "", eyebrow: "", desc: "" } : catalogData.categories.find((c) => c.id === catId);
  const count = isNew ? 0 : (catalogData.products[cat.id] || []).length;

  openModal(`
    <div class="modal-body">
      <div class="modal-close" id="closeModal">✕</div>
      <h3>${isNew ? "Nueva sección" : "Editar sección"}</h3>
      <div class="field"><label>Emoji</label><input id="mEmoji" value="${esc(cat.emoji)}" style="max-width:90px;"></div>
      <div class="field"><label>Nombre</label><input id="mName" value="${esc(cat.name)}"></div>
      <div class="field"><label>Frase corta</label><input id="mEyebrow" value="${esc(cat.eyebrow)}"></div>
      <div class="field"><label>Descripción</label><textarea id="mDesc">${esc(cat.desc)}</textarea></div>
      <div class="btn-row">
        <button class="btn-sm btn-save" id="mSave">Guardar</button>
        ${!isNew ? `<button class="btn-sm btn-del" id="mDel">Eliminar${count ? ` (${count} productos)` : ""}</button>` : ""}
        <button class="btn-sm btn-cancel" id="mCancel">Cancelar</button>
      </div>
    </div>
  `);
  document.getElementById("mCancel").addEventListener("click", closeModal);

  document.getElementById("mSave").addEventListener("click", async () => {
    const emoji = document.getElementById("mEmoji").value.trim() || "🌿";
    const name = document.getElementById("mName").value.trim();
    const eyebrow = document.getElementById("mEyebrow").value.trim();
    const desc = document.getElementById("mDesc").value.trim();
    if (!name) { alert("Ponle un nombre a la sección."); return; }

    if (isNew) {
      const id = "cat" + Date.now();
      catalogData.categories.push({ id, emoji, name, eyebrow, desc });
      catalogData.products[id] = [];
      catalogData.tips[id] = [];
    } else {
      Object.assign(cat, { emoji, name, eyebrow, desc });
    }
    if (await saveCatalog()) { renderCategoriesAdmin(); renderProductsAdmin(); closeModal(); }
  });

  if (!isNew) {
    document.getElementById("mDel").addEventListener("click", async () => {
      const msg = count > 0 ? `Esta sección tiene ${count} producto(s) que se borrarán también. ¿Continuar?` : `¿Eliminar "${cat.name}"?`;
      if (!confirm(msg)) return;
      catalogData.categories = catalogData.categories.filter((c) => c.id !== cat.id);
      delete catalogData.products[cat.id];
      delete catalogData.tips[cat.id];
      if (await saveCatalog()) { renderCategoriesAdmin(); renderProductsAdmin(); closeModal(); }
    });
  }
}

/* ---------- Productos ---------- */
function renderProductsAdmin() {
  const wrap = document.getElementById("productsAdminList");
  wrap.innerHTML = catalogData.categories.map((cat) => {
    const products = catalogData.products[cat.id] || [];
    return `
      <div class="admin-cat-group">
        <h3>${cat.emoji} ${esc(cat.name)}</h3>
        <div class="admin-grid">
          ${products.map((p) => `
            <div class="admin-mini-card">
              ${p.img ? `<img src="${p.img}" alt="">` : ""}
              <h4>${esc(p.name)}</h4>
              <p>${esc(p.price)}</p>
              <div class="mini-actions"><button data-edit-prod="${cat.id}|${p.id}">Editar</button></div>
            </div>
          `).join("")}
          <button type="button" class="add-mini" data-add-prod="${cat.id}">+ Agregar producto</button>
        </div>
      </div>
    `;
  }).join("");

  wrap.querySelectorAll("[data-edit-prod]").forEach((b) => {
    const [catId, prodId] = b.dataset.editProd.split("|");
    b.addEventListener("click", () => openProductModal(catId, prodId));
  });
  wrap.querySelectorAll("[data-add-prod]").forEach((b) => b.addEventListener("click", () => openProductModal(b.dataset.addProd, null)));
}

function openProductModal(catId, prodId) {
  const isNew = !prodId;
  const prod = isNew
    ? { id: null, name: "", price: "", desc: "", img: "", light: "", watering: "", size: "", potSize: "", location: "", difficulty: "", tags: [], featured: false, comments: [] }
    : catalogData.products[catId].find((p) => p.id === prodId);

  openModal(`
    <div class="modal-body" style="max-width:520px;">
      <div class="modal-close" id="closeModal">✕</div>
      <h3>${isNew ? "Nuevo producto" : "Editar producto"}</h3>
      <div class="field"><label>Nombre</label><input id="mName" value="${esc(prod.name)}"></div>
      <div class="field-row">
        <div class="field"><label>Precio</label><input id="mPrice" value="${esc(prod.price)}" placeholder="S/ 00.00"></div>
        <div class="field"><label>Dificultad</label>
          <select id="mDifficulty">
            <option value="">Sin especificar</option>
            ${Object.entries(DIFFICULTY_MAP).map(([k, l]) => `<option value="${k}" ${prod.difficulty === k ? "selected" : ""}>${l}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="field"><label>Descripción</label><textarea id="mDesc">${esc(prod.desc)}</textarea></div>
      <div class="field"><label>Foto</label><input type="file" id="mImg" accept="image/png,image/jpeg,image/webp"></div>
      <div class="field-row">
        ${INFO_FIELDS.map((f) => `<div class="field"><label>${f.label}</label><input id="m_${f.key}" value="${esc(prod[f.key])}"></div>`).join("")}
      </div>
      <label class="checkbox-chip" style="width:fit-content;margin-bottom:14px;">
        <input type="checkbox" id="mFeatured" ${prod.featured ? "checked" : ""}> ⭐ Mostrar en Más vendidos
      </label>
      <div class="section-title-sm">Etiquetas</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
        ${TAG_OPTIONS.map((t) => `
          <label class="checkbox-chip">
            <input type="checkbox" class="mTag" value="${t.key}" ${prod.tags.includes(t.key) ? "checked" : ""}> ${t.emoji} ${t.label}
          </label>
        `).join("")}
      </div>
      <div class="btn-row">
        <button class="btn-sm btn-save" id="mSave">Guardar</button>
        ${!isNew ? `<button class="btn-sm btn-del" id="mDel">Eliminar producto</button>` : ""}
        <button class="btn-sm btn-cancel" id="mCancel">Cancelar</button>
      </div>
    </div>
  `);
  document.getElementById("mCancel").addEventListener("click", closeModal);

  document.getElementById("mSave").addEventListener("click", async () => {
    const name = document.getElementById("mName").value.trim();
    if (!name) { alert("Ponle un nombre al producto."); return; }
    const data = {
      name, price: document.getElementById("mPrice").value.trim(),
      desc: document.getElementById("mDesc").value.trim(),
      difficulty: document.getElementById("mDifficulty").value,
      featured: document.getElementById("mFeatured").checked,
      tags: Array.from(document.querySelectorAll(".mTag:checked")).map((c) => c.value),
    };
    INFO_FIELDS.forEach((f) => { data[f.key] = document.getElementById(`m_${f.key}`).value.trim(); });

    const file = document.getElementById("mImg").files[0];
    try {
      if (file) {
        const url = await uploadImage(file, { maxW: 480, quality: 0.75 });
        if (!url) return;
        data.img = url;
      }
      if (isNew) {
        Object.assign(prod, data, { id: "p" + Date.now(), img: data.img || "", comments: [] });
        catalogData.products[catId].push(prod);
      } else {
        Object.assign(prod, data);
      }
      if (await saveCatalog()) { renderProductsAdmin(); closeModal(); }
    } catch { alert("No se pudo subir la foto."); }
  });

  if (!isNew) {
    document.getElementById("mDel").addEventListener("click", async () => {
      if (!confirm(`¿Eliminar "${prod.name}"?`)) return;
      catalogData.products[catId] = catalogData.products[catId].filter((p) => p.id !== prod.id);
      if (await saveCatalog()) { renderProductsAdmin(); closeModal(); }
    });
  }
}

/* ---------- Servicios ---------- */
function renderServicesAdmin() {
  const wrap = document.getElementById("servicesAdminList");
  wrap.innerHTML = catalogData.services.map((s) => `
    <div class="admin-mini-card">
      ${s.img ? `<img src="${s.img}" alt="">` : ""}
      <h4>${esc(s.name)}</h4>
      <p>${esc(s.desc)}</p>
      <div class="mini-actions"><button data-edit-svc="${s.id}">Editar</button></div>
    </div>
  `).join("");
  wrap.querySelectorAll("[data-edit-svc]").forEach((b) => b.addEventListener("click", () => openServiceModal(b.dataset.editSvc)));
}

function openServiceModal(svcId) {
  const isNew = !svcId;
  const svc = isNew ? { id: null, iconKey: "poda_cesped", name: "", desc: "", img: "" } : catalogData.services.find((s) => s.id === svcId);

  openModal(`
    <div class="modal-body">
      <div class="modal-close" id="closeModal">✕</div>
      <h3>${isNew ? "Nuevo servicio" : "Editar servicio"}</h3>
      <div class="field"><label>Nombre</label><input id="mName" value="${esc(svc.name)}"></div>
      <div class="field"><label>Descripción</label><textarea id="mDesc">${esc(svc.desc)}</textarea></div>
      <div class="field"><label>Ícono (si no hay foto)</label>
        <select id="mIcon">${SERVICE_ICON_KEYS.map((k) => `<option value="${k}" ${svc.iconKey === k ? "selected" : ""}>${k.replace("_", " ")}</option>`).join("")}</select>
      </div>
      <div class="field"><label>Foto (opcional — reemplaza al ícono)</label><input type="file" id="mImg" accept="image/png,image/jpeg,image/webp"></div>
      <div class="btn-row">
        <button class="btn-sm btn-save" id="mSave">Guardar</button>
        ${!isNew ? `<button class="btn-sm btn-del" id="mDel">Eliminar servicio</button>` : ""}
        <button class="btn-sm btn-cancel" id="mCancel">Cancelar</button>
      </div>
    </div>
  `);
  document.getElementById("mCancel").addEventListener("click", closeModal);

  document.getElementById("mSave").addEventListener("click", async () => {
    const name = document.getElementById("mName").value.trim();
    if (!name) { alert("Ponle un nombre al servicio."); return; }
    const data = { name, desc: document.getElementById("mDesc").value.trim(), iconKey: document.getElementById("mIcon").value };

    const file = document.getElementById("mImg").files[0];
    try {
      if (file) {
        const url = await uploadImage(file, { maxW: 480, quality: 0.75 });
        if (!url) return;
        data.img = url;
      }
      if (isNew) {
        Object.assign(svc, data, { id: "s" + Date.now(), img: data.img || "" });
        catalogData.services.push(svc);
      } else {
        Object.assign(svc, data);
      }
      if (await saveCatalog()) { renderServicesAdmin(); closeModal(); }
    } catch { alert("No se pudo subir la foto."); }
  });

  if (!isNew) {
    document.getElementById("mDel").addEventListener("click", async () => {
      if (!confirm(`¿Eliminar "${svc.name}"?`)) return;
      catalogData.services = catalogData.services.filter((s) => s.id !== svc.id);
      if (await saveCatalog()) { renderServicesAdmin(); closeModal(); }
    });
  }
}

document.getElementById("addCategoryBtn").addEventListener("click", () => openCategoryModal(null));
document.getElementById("addServiceBtn").addEventListener("click", () => openServiceModal(null));
