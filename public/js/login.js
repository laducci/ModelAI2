// Global state
let isLoading = false;

// DOM elements
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const loginBtn = document.getElementById('login-btn');
const btnText = document.getElementById('btn-text');
const btnLoading = document.getElementById('btn-loading');

// Utils
function showError(message) {
  // Usar sistema moderno de alertas se disponível
  if (window.showError) {
    window.showError(message);
  } else {
    // Fallback para método antigo
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('animate-pulse');
    setTimeout(() => {
      errorMessage.classList.remove('animate-pulse');
    }, 1000);
  }
}

function hideError() {
  errorMessage.classList.add('hidden');
}

function setLoading(loading) {
  isLoading = loading;
  loginBtn.disabled = loading;

  if (loading) {
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
  } else {
    btnText.classList.remove('hidden');
    btnLoading.classList.add('hidden');
  }
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const passwordIcon = document.getElementById('password-icon');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    passwordIcon.classList.remove('fa-eye');
    passwordIcon.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    passwordIcon.classList.remove('fa-eye-slash');
    passwordIcon.classList.add('fa-eye');
  }
}

function showForgotPassword() {
  alert('Entre em contato com o administrador para recuperar sua senha.\n\nE-mail: suporte@modelai.com');
}

// Login submit
if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (isLoading) return;

    hideError();
    setLoading(true);

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      console.log('🧾 Resposta bruta:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        showError("Resposta inválida do servidor.");
        throw new Error("Falha ao interpretar resposta: não é JSON");
      }

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('modelai_token', data.token);
        localStorage.setItem('modelai_user', JSON.stringify(data.user));
        localStorage.setItem('modelai_logged_in', 'true');

        btnText.innerHTML = '<i class="fas fa-check mr-2"></i>Sucesso!';
        
        // Mostrar alerta de sucesso
        if (window.showSuccess) {
          window.showSuccess(`Bem-vindo, ${data.user.name}!`, 2000);
        }

        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = 'usuarios.html';
          } else {
            window.location.href = 'inputs.html';
          }
        }, 1500);
      } else {
        throw new Error(data.message || data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError(error.message || 'Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  });
}

// Token verification
document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('token');
  const modelaiToken = localStorage.getItem('modelai_token');

  if (token || modelaiToken) {
    const authToken = token || modelaiToken;

    fetch('/api/auth/verify', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error('Token inválido');
      })
      .then((data) => {
        if (data.valid) {
          const user =
            data.user ||
            JSON.parse(localStorage.getItem('user') || localStorage.getItem('modelai_user') || '{}');
          if (user && user.role === 'admin') {
            window.location.href = 'usuarios.html';
          } else {
            window.location.href = 'index.html';
          }
        }
      })
      .catch((error) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('modelai_token');
        localStorage.removeItem('modelai_user');
        localStorage.removeItem('modelai_logged_in');
        console.log('Token inválido, mantendo na página de login');
      });
  }

  // Input animations
  const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
  inputs.forEach((input) => {
    input.addEventListener('focus', function () {
      this.parentElement.classList.add('transform', 'scale-105');
    });

    input.addEventListener('blur', function () {
      this.parentElement.classList.remove('transform', 'scale-105');
    });

    input.addEventListener('input', function () {
      if (this.value.length > 0) {
        this.classList.add('border-teal-400');
      } else {
        this.classList.remove('border-teal-400');
      }
    });
  });

  // Load animation
  const card = document.querySelector('.glassmorphism');
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    setTimeout(() => {
      card.style.transition = 'all 0.8s ease-out';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100);
  }
});
