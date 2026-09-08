const form = document.getElementById("loginForm");
const errorBox = document.getElementById("loginError");
const submitBtn = document.getElementById("loginSubmit");

(async () => {
  try {
    const res = await fetch("/api/session");
    const { authenticated } = await res.json();
    if (authenticated) window.location.href = "dashboard.html";
  } catch { /* si no responde, se queda en el login */ }
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

    errorBox.textContent = res.status === 401
      ? "Contraseña incorrecta. Intenta de nuevo."
      : "No se pudo verificar la contraseña. Intenta de nuevo.";
    errorBox.classList.add("show");
  } catch {
    errorBox.textContent = "No hay conexión con el servidor.";
    errorBox.classList.add("show");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Ingresar";
  }
});
