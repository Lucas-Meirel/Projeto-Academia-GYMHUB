async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Admin shortcut: if admin credentials provided, redirect to admin dashboard
  if (email === 'admin@gmail.com' && password === 'admin') {
    const admin = { id: 'adm_custom', email, password };
    localStorage.setItem('gym_current_admin', JSON.stringify(admin));
    window.location.href = 'admin-dashboard.html';
    return;
  }

  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    // Armazena o token JWT no localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("userEmail", email);
    // API retorna o id dentro de `data.user.id` (ou, possivelmente, em `data.id`).
    const userId = data.id ?? (data.user && data.user.id);
    if (userId !== undefined && userId !== null) {
      localStorage.setItem("id", String(userId));
    }
    const id = localStorage.getItem("id");

    alert("✅ Login bem-sucedido!");
    window.location.href = "index-logado.html"; // ou dashboard.html
  } else {
    alert("❌ Erro: " + (data.error || "Falha no login"));
  }
}
