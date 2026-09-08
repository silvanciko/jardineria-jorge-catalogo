/**
 * api/data.js — público, sin autenticación.
 * Si Vercel KV no está configurado o falla, entrega los datos de
 * ejemplo (data/seed.json) — el catálogo nunca se cae por completo.
 */
let kv = null;
try {
  kv = require("@vercel/kv").kv;
} catch {
  kv = null;
}

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

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  if (!kv) {
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");
    return res.status(200).json(seed);
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
