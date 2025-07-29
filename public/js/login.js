document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const mensagemErro = document.getElementById("error-text");
    const erroBox = document.getElementById("error-message");

    mensagemErro.textContent = "";
    erroBox.classList.add("hidden");

    if (!email || !password) {
      mensagemErro.textContent = "E-mail e senha obrigatórios.";
      erroBox.classList.remove("hidden");
      return;
    }

    try {
      const response = await fetch("https://model-ai-2.vercel.app/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      console.log("🧾 Resposta:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        mensagemErro.textContent = "Resposta inválida do servidor.";
        erroBox.classList.remove("hidden");
        return;
      }

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "index.html";
      } else {
        mensagemErro.textContent = data.message || "Erro ao fazer login.";
        erroBox.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      mensagemErro.textContent = "Falha na conexão com o servidor.";
      erroBox.classList.remove("hidden");
    }
  });
});
