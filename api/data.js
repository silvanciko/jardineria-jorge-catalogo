const { kv } = require("@vercel/kv");

// Respaldo mínimo por si, por cualquier motivo, no se puede leer data/seed.json
// (por ejemplo, un problema de empaquetado). Así el endpoint nunca revienta.
const MINIMAL_FALLBACK = {
  siteText: { brandName: "Jardinería Jorge", heroMain: "Todo para tu jardín, en", heroAccent: "un solo lugar.",
    heroSubtitle: "", servicesEyebrow: "Lo que hacemos", servicesTitle: "Servicios", servicesDesc: "",
    footerTagline: "", copyrightText: "© 2026 Jardinería Jorge." },
  footerInfo: { location: "", whatsapp: "", hours: "", instagram: "", facebook: "", tiktok: "" },
  logo: "/assets/images/logo.png",
  categories: [], products: {}, tips: {}, services: [],
};

let seed;
try {
  seed = require("../data/seed.json");
} catch (err) {
  console.error("No se pudo cargar data/seed.json, usando respaldo mínimo:", err);
  seed = MINIMAL_FALLBACK;
}

/**
 * GET /api/data — público, sin autenticación.
 * Es lo mismo que hoy sirve js/productos.js de forma estática, pero
 * ahora viene de una base de datos real: cuando el admin guarda
 * cambios (POST /api/save), este endpoint los refleja al instante.
 *
 * Si Vercel KV todavía no tiene nada guardado (primer deploy) o si
 * por algún motivo falla, el catálogo sigue funcionando mostrando
 * los datos de ejemplo — nunca se cae por completo.
 */
module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const data = await kv.get("catalog");
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");
    return res.status(200).json(data || seed);
  } catch (err) {
    console.error("Error leyendo de Vercel KV, usando datos de ejemplo:", err);
    return res.status(200).json(seed);
  }
};
