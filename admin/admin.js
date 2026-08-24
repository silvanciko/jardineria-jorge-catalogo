/**
 * admin.js — Login del panel privado (Fase 2: conectado al backend real)
 * ------------------------------------------------------------------
 * La contraseña viaja por HTTPS a /api/login, donde el servidor la
 * compara contra ADMIN_PASSWORD_HASH (una variable de entorno, nunca
 * un archivo). Si es correcta, el servidor entrega una cookie de
 * sesión httpOnly + secure — este script nunca la lee ni la maneja
 * directamente, solo confía en que el navegador la envíe sola en
 * cada pedido siguiente.
 * ------------------------------------------------------------------
 */

const form = document.getElementById("loginForm");
const errorBox = document.getElementById("loginError");
const submitBtn = document.getElementById("loginSubmit");

// Si ya hay una sesión activa (por ejemplo, volviste a /admin), saltar directo al panel.
(async () => {
  try {
    const res = await fetch("/api/session");
    const { authenticated } = await res.json();
    if (authenticated) window.location.href = "dashboard.html";
  } catch {
    // Si /api/session no responde (ej. viendo esto fuera de Vercel), no pasa nada:
    // el formulario simplemente se queda visible.
  }
})();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.remove("show");
  submitBtn.disabled = true;
  submitBtn.textContent = "Verificando...";

  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = "dashboard.html";
      return;
    }

    if (res.status === 401) {
      const body = await res.json().catch(() => ({}));
errorBox.textContent = "Contraseña incorrecta. (longitud recibida: " + body.debug_receivedLength + ", esperado: 11)";
    } else if (res.status === 500) {
      errorBox.textContent = "El servidor todavía no está configurado (falta ADMIN_PASSWORD_HASH en Vercel).";
    } else {
      errorBox.textContent = "No se pudo verificar la contraseña. Intenta de nuevo.";
    }
    errorBox.classList.add("show");
  } catch {
    errorBox.textContent = "No hay conexión con el servidor. ¿Estás viendo esto fuera de Vercel?";
    errorBox.classList.add("show");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Ingresar";
  }
});
