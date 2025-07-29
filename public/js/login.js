// Login Page JavaScript - Model AI

// Form validation
function validateForm() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Hide previous messages
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    // Basic validation
    if (!email || !password) {
        showError('Por favor, preencha todos os campos.');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Por favor, insira um email válido.');
        return false;
    }
    
    // Password validation
    if (password.length < 6) {
        showError('A senha deve ter pelo menos 6 caracteres.');
        return false;
    }
    
    return true;
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Shake animation
    errorMessage.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        errorMessage.style.animation = '';
    }, 500);
}

// Show success message
function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.style.display = 'block';
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginButton = document.querySelector('.login-button');
    
    // Show loading state
    const originalText = loginButton.textContent;
    loginButton.textContent = 'Entrando...';
    loginButton.disabled = true;
    
    // Simulate login API call
    setTimeout(() => {
        // Demo credentials
        if (email === 'admin@modelai.com' && password === 'admin123') {
            showSuccess('Login realizado com sucesso! Redirecionando...');
            
            // Save login state
            localStorage.setItem('modelai_logged_in', 'true');
            localStorage.setItem('modelai_user', JSON.stringify({
                email: email,
                name: 'Admin',
                loginTime: new Date().toISOString()
            }));
            
            // Redirect after success
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showError('Email ou senha incorretos.');
        }
        
        // Reset button
        loginButton.textContent = originalText;
        loginButton.disabled = false;
    }, 1000);
}

// Handle social login
function handleSocialLogin(provider) {
    alert(`Login com ${provider} será implementado em breve.`);
}

// Forgot password
function handleForgotPassword() {
    const email = prompt('Digite seu email para recuperação de senha:');
    
    if (email) {
        if (email.includes('@')) {
            alert('Instruções de recuperação enviadas para seu email.');
        } else {
            alert('Por favor, digite um email válido.');
        }
    }
}

// Check if already logged in
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('modelai_logged_in');
    
    if (isLoggedIn === 'true') {
        window.location.href = 'index.html';
    }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    checkLoginStatus();
    
    // Setup form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup enter key handling
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleLogin(event);
        }
    });
    
    // Auto-focus email field
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }
});
