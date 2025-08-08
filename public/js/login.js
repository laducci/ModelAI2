// LOGIN.JS - SISTEMA REAL DE PRODUÇÃO


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
  console.error('❌ Erro:', message);
  
  if (errorText && errorMessage) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('animate-pulse');
    setTimeout(() => {
      errorMessage.classList.remove('animate-pulse');
    }, 1000);
  } else {
    alert('❌ ' + message);
  }
}

function hideError() {
  if (errorMessage) {
    errorMessage.classList.add('hidden');
  }
}

function setLoading(loading) {
  isLoading = loading;
  
  if (loginBtn) {
    loginBtn.disabled = loading;
  }

  if (loading) {
    if (btnText) btnText.classList.add('hidden');
    if (btnLoading) btnLoading.classList.remove('hidden');
  } else {
    if (btnText) btnText.classList.remove('hidden');
    if (btnLoading) btnLoading.classList.add('hidden');
  }
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const passwordIcon = document.getElementById('password-icon');

  if (passwordInput && passwordIcon) {
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
      // API Call direto (sem depender de ApiClient não carregado ainda)
      const baseURL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api' 
        : '/api'; // Usar URL relativa para Vercel

      
      const apiURL = `${baseURL}/auth/login`;
      
      

      const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      
      console.log('📥 Headers da resposta:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      

      if (!response.ok) {
        throw new Error(data.message || data.error || `Erro ${response.status}`);
      }

      if (data.message && data.token && data.user) {
        

        // Salvar dados de autenticação
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Backward compatibility
        localStorage.setItem('modelai_token', data.token);
        localStorage.setItem('modelai_user', JSON.stringify(data.user));

        // Feedback visual
        if (btnText) {
          btnText.innerHTML = '<i class="fas fa-check mr-2"></i>Sucesso!';
        }

        // Redirecionar baseado no role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            
            window.location.href = 'usuarios.html';
          } else {
            
            window.location.href = 'inputs.html';
          }
        }, 1000);

      } else {
        throw new Error('Resposta inválida do servidor');
      }

    } catch (error) {
      console.error('❌ Erro no login:', error);
      showError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  });
}

// Verificar se já está logado
document.addEventListener('DOMContentLoaded', function () {
  
  
  // COMENTANDO O REDIRECIONAMENTO AUTOMÁTICO PARA PODER TESTAR
  /*
  // Se já estiver logado, redirecionar
  const token = localStorage.getItem('token') || localStorage.getItem('modelai_token');
  const userData = localStorage.getItem('user') || localStorage.getItem('modelai_user');
  
  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      
      
      if (user.role === 'admin') {
        window.location.replace('usuarios.html');
      } else {
        window.location.replace('inputs.html');
      }
    } catch (error) {
      
      localStorage.clear();
    }
  }
  */

  // Mostrar mensagem se houver
  const loginMessage = localStorage.getItem('login_message');
  if (loginMessage) {
    showError(loginMessage);
    localStorage.removeItem('login_message');
  }
});

// Exportar funções para uso global
window.togglePasswordVisibility = togglePasswordVisibility;
window.showForgotPassword = showForgotPassword;


