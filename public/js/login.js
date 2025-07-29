document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const statusMessage = document.getElementById("status-message");

  statusMessage.innerHTML = "Carregando...";
  statusMessage.style.color = "black";

  try {
    const response = await fetch("https://model-ai-2.vercel.app/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      statusMessage.innerHTML = "Login realizado com sucesso!";
      statusMessage.style.color = "green";
      // redirecionar, salvar token, etc.
    } else {
      statusMessage.innerHTML = data.message || "Erro ao fazer login";
      statusMessage.style.color = "red";
    }
  } catch (err) {
    statusMessage.innerHTML = "Erro inesperado: não foi possível conectar ao servidor.";
    statusMessage.style.color = "red";
    console.error(err);
  }
});
