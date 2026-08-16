/**
 * productos.js
 * ------------------------------------------------------------------
 * Contenido de ejemplo del catálogo: categorías, productos, servicios
 * y textos.
 *
 * Este archivo es el RESPALDO del sitio, no la fuente principal:
 * apenas carga la página, script.js intenta traer los datos reales
 * desde /api/data (el backend, conectado a Vercel KV). Si el backend
 * no responde por cualquier motivo, el catálogo sigue funcionando
 * mostrando lo que hay acá — así el sitio público nunca se rompe.
 *
 * La FORMA de los datos (los nombres de cada campo) es exactamente
 * la misma que devuelve /api/data, a propósito.
 * ------------------------------------------------------------------
 */

export const SITE_TEXT = {
  brandName: "Jardinería Jorge",
  heroMain: "Todo para tu jardín, en",
  heroAccent: "un solo lugar.",
  heroSubtitle: "Fertilizantes, plantas, grass, maceteros, decoración y los servicios de poda y mantenimiento que ya conoces. Haz clic en cualquier producto para ver detalles, precio y opiniones.",
  servicesEyebrow: "Lo que hacemos",
  servicesTitle: "✂️ Servicios de poda y mantenimiento",
  servicesDesc: "Además de productos, cuidamos tu jardín directamente en tu casa.",
  footerTagline: "Transformando espacios con la belleza de la naturaleza.",
  copyrightText: "© 2026 Jardinería Jorge. Todos los derechos reservados."
};

/** whatsapp es el único lugar de donde sale el número real (sin él, los botones "Consultar" avisan que falta configurarlo). */
export const FOOTER_INFO = {
  location: "",
  whatsapp: "",
  hours: "",
  instagram: "",
  facebook: "",
  tiktok: ""
};

export const CATEGORIES = [
  { id: "fertilizantes", emoji: "🌱", name: "Fertilizantes", eyebrow: "Nutrición para tu jardín", desc: "Abonos y fertilizantes para que tus plantas, césped y árboles crezcan sanos." },
  { id: "plantas",       emoji: "🪴", name: "Plantas",       eyebrow: "Elige tu favorita",        desc: "Plantas de interior y exterior, listas para llevar a tu casa o jardín." },
  { id: "grass",         emoji: "🌾", name: "Grass",         eyebrow: "Para tu área verde",        desc: "Champa lista o semilla, según cómo quieras sembrar tu jardín." },
  { id: "maceteros",     emoji: "🏺", name: "Maceteros",     eyebrow: "Para cada rincón",          desc: "Maceteros de distintos tamaños y materiales para tus plantas." },
  { id: "decoracion",    emoji: "✨", name: "Decoración",    eyebrow: "Dale estilo a tu jardín",   desc: "Detalles decorativos para complementar tus áreas verdes." }
];

/** Productos por categoría. La clave debe coincidir con CATEGORIES[].id */
export const PRODUCTS = {
  fertilizantes: [
    { id: "f1", name: "Fertilizante orgánico 1kg", price: "S/ 25.00", desc: "Abono orgánico de uso general, ideal para plantas de jardín y macetas. Aplicar cada 3-4 semanas.", img: "", light: "", watering: "", size: "", potSize: "", location: "", difficulty: "", tags: [], featured: true, comments: [{ author: "María G.", text: "Mis plantas se ven mucho más verdes desde que lo uso." }] },
    { id: "f2", name: "Abono foliar líquido 500ml", price: "S/ 18.00", desc: "Fertilizante líquido de aplicación directa sobre las hojas, absorción rápida.", img: "", light: "", watering: "", size: "", potSize: "", location: "", difficulty: "", tags: [], featured: false, comments: [] }
  ],
  plantas: [
    { id: "p1", name: "Potus (Epipremnum aureum)", price: "S/ 20.00", desc: "Planta de interior, resistente y de bajo mantenimiento. Ideal para espacios con luz indirecta.", img: "", light: "Semisombra", watering: "Cada 6-7 días", size: "30-40 cm", potSize: "15 cm", location: "Interior", difficulty: "facil", tags: ["vendido", "interior"], featured: true, comments: [{ author: "Carlos R.", text: "Llegó sana y bien cuidada." }] },
    { id: "p2", name: "Suculenta mini", price: "S/ 12.00", desc: "Suculenta pequeña ideal para escritorios o repisas, requiere poco riego.", img: "", light: "Sol", watering: "Cada 12-15 días", size: "8-10 cm", potSize: "7 cm", location: "Interior/Exterior", difficulty: "facil", tags: ["nuevo"], featured: false, comments: [] }
  ],
  grass: [
    { id: "g1", name: "Grass en champa (m²)", price: "S/ 15.00 / m²", desc: "Champa de grass lista para instalar, precio por metro cuadrado.", img: "", light: "", watering: "", size: "", potSize: "", location: "", difficulty: "", tags: [], featured: false, comments: [] },
    { id: "g2", name: "Semilla de grass (kg)", price: "S/ 35.00", desc: "Semilla para siembra de césped nuevo, rendimiento aproximado 25m² por kg.", img: "", light: "", watering: "", size: "", potSize: "", location: "", difficulty: "", tags: [], featured: false, comments: [] }
  ],
  maceteros: [
    { id: "m1", name: "Macetero de barro 20cm", price: "S/ 22.00", desc: "Macetero de barro cocido, buen drenaje, ideal para plantas de interior o exterior.", img: "", light: "", watering: "", size: "", potSize: "", location: "", difficulty: "", tags: [], featured: false, comments: [] },
    { id: "m2", name: "Macetero cerámico decorativo", price: "S/ 30.00", desc: "Macetero de cerámica esmaltada, distintos colores disponibles.", img: "", light: "", watering: "", size: "", potSize: "", location: "", difficulty: "", tags: [], featured: false, comments: [] }
  ],
  decoracion: [
    { id: "d1", name: "Piedras decorativas (bolsa)", price: "S/ 15.00", desc: "Piedras decorativas para cubrir base de plantas o senderos pequeños.", img: "", light: "", watering: "", size: "", potSize: "", location: "", difficulty: "", tags: [], featured: false, comments: [] },
    { id: "d2", name: "Cerco vivo artificial (m)", price: "S/ 28.00 / m", desc: "Panel de cerco vivo artificial, ideal para dar privacidad y verde instantáneo.", img: "", light: "", watering: "", size: "", potSize: "", location: "", difficulty: "", tags: ["exterior"], featured: false, comments: [] }
  ]
};

export const SERVICE_ICONS = {
  poda_cesped:   `<svg viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M9 6H6V9M15 18H18V15" stroke-linecap="round" stroke-width="1.6"/></svg>`,
  poda_arboles:  `<svg viewBox="0 0 24 24" fill="none"><path d="M12 21V13M12 13C8 13 6 10 6 6C9 6 12 8 12 13ZM12 13C16 13 18 10 18 6C15 6 12 8 12 13Z" stroke-linecap="round" stroke-width="1.5"/></svg>`,
  mantenimiento: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3C12 3 7 8 7 13C7 16 9 18 12 18C15 18 17 16 17 13C17 8 12 3 12 3Z" stroke-linecap="round" stroke-width="1.5"/><path d="M12 18V21" stroke-linecap="round" stroke-width="1.5"/></svg>`,
  modelacion:    `<svg viewBox="0 0 24 24" fill="none"><path d="M3 21H21M6 21V10L12 4L18 10V21M9 21V15H15V21" stroke-linecap="round" stroke-width="1.5"/></svg>`,
  siembra:       `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="2.4" stroke-width="1.5"/><path d="M12 11.5V17M8 21H16" stroke-linecap="round" stroke-width="1.5"/></svg>`,
  fumigacion:    `<svg viewBox="0 0 24 24" fill="none"><path d="M4 14L10 8M14 4L20 10M13 15L19 9M5 19C7 17 9 15 13 15" stroke-linecap="round" stroke-width="1.5"/></svg>`
};

export const SERVICES = [
  { id: "s1", iconKey: "poda_cesped",   name: "Poda de césped",           desc: "Corte parejo y perfilado de bordes, dejando líneas limpias.", img: "" },
  { id: "s2", iconKey: "poda_arboles",  name: "Poda de árboles",          desc: "Control de altura y ramas, despejando techos y cables.", img: "" },
  { id: "s3", iconKey: "mantenimiento", name: "Mantenimiento de plantas", desc: "Riego, abono y control de plagas todo el año.", img: "" },
  { id: "s4", iconKey: "modelacion",    name: "Modelación de jardines",   desc: "Diseño y remodelación de espacios verdes, desde cero.", img: "" },
  { id: "s5", iconKey: "siembra",       name: "Siembra de jardines",      desc: "Sembramos césped, arbustos y flores según el espacio.", img: "" },
  { id: "s6", iconKey: "fumigacion",    name: "Fumigación",               desc: "Control de plagas e insectos en césped, plantas y árboles.", img: "" }
];

export const TIPS = {
  fertilizantes: ["Aplica fertilizante después de regar, nunca en tierra seca, para evitar quemar las raíces."],
  plantas: ["Las suculentas necesitan menos agua de la que la mayoría cree: riega solo cuando la tierra esté completamente seca.", "Gira tus plantas de interior cada semana para que crezcan parejas hacia la luz."],
  grass: ["Corta el césped con la cuchilla afilada: un corte limpio cicatriza más rápido y evita plagas."],
  maceteros: ["Elige un macetero con al menos un agujero de drenaje para evitar raíces ahogadas."],
  decoracion: ["Combina texturas (piedra, madera, planta) para un jardín con más profundidad visual."]
};

/** Iconos usados en la ficha de cada producto */
export const INFO_FIELDS = [
  { key: "light",    icon: "☀️", label: "Luz" },
  { key: "watering", icon: "💧", label: "Riego" },
  { key: "size",     icon: "📏", label: "Tamaño" },
  { key: "potSize",  icon: "🪴", label: "Maceta" },
  { key: "location", icon: "🏡", label: "Ambiente" }
];

export const DIFFICULTY_MAP = {
  facil:      { emoji: "🟢", label: "Fácil" },
  intermedio: { emoji: "🟡", label: "Intermedio" },
  experto:    { emoji: "🔴", label: "Experto" }
};

export const TAG_OPTIONS = [
  { key: "nuevo",    emoji: "🌿", label: "Nuevo" },
  { key: "vendido",  emoji: "🔥", label: "Más vendido" },
  { key: "florece",  emoji: "🌸", label: "Florece" },
  { key: "interior", emoji: "🏡", label: "Interior" },
  { key: "exterior", emoji: "🌞", label: "Exterior" }
];

export const LOGO_URL = "assets/images/logo.png";
