async function AdicionarAula(event) {
  event.preventDefault(); // stop page reload

  // Match IDs to your HTML fields
  const id = localStorage.getItem("id");

  try {
    const res = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Cadastro realizado com sucesso!");
      alert(`${id}`);
      window.location.href = "login.html";
    } else {
      alert("❌ Erro: " + (data.error || "Falha no cadastro"));
    }
  } catch (err) {
    console.error("Erro no cadastro:", err);
    alert("Erro inesperado!");
  }
}
