async function registerUser(event) {
  event.preventDefault(); // stop page reload

  // Match IDs to your HTML fields
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Cadastro realizado com sucesso!");
      window.location.href = "login.html";
    } else {
      alert("❌ Erro: " + (data.error || "Falha no cadastro"));
    }
  } catch (err) {
    console.error("Erro no cadastro:", err);
    alert("Erro inesperado!");
  }
}
