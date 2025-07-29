// API Configuration and Helper Functions - SISTEMA REAL
class ApiClient {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api' 
            : '/api'; // Usar URL relativa para Vercel
        this.token = localStorage.getItem('token') || localStorage.getItem('modelai_token');
        console.log('🔗 API Base URL:', this.baseURL);
    }

    // Configurar cabeçalhos padrão
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Fazer requisição HTTP
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            console.log(`🔗 ${options.method || 'GET'}: ${url}`);
            const response = await fetch(url, config);
            const data = await response.json();

            // Se token expirou, redirecionar para login
            if (response.status === 401) {
                console.log('❌ Token inválido - fazendo logout');
                this.logout();
                window.location.href = 'login.html';
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            if (!response.ok) {
                throw new Error(data.message || data.error || `Erro HTTP: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`❌ Erro na requisição ${endpoint}:`, error);
            throw error;
        }
    }

    // Métodos HTTP
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Métodos de autenticação
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
        localStorage.setItem('modelai_token', token); // Backward compatibility
    }

    logout() {
        console.log('🚪 API Logout - limpando dados...');
        this.token = null;
        localStorage.clear();
        sessionStorage.clear();
    }

    // Verificar se usuário está logado
    isAuthenticated() {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('modelai_token');
            const user = localStorage.getItem('user') || localStorage.getItem('modelai_user');
            
            const isAuth = !!(token && user);
            console.log('🔍 Verificação de autenticação:', {
                token: !!token,
                user: !!user,
                result: isAuth
            });
            
            return isAuth;
        } catch (error) {
            console.error('❌ Erro na verificação de autenticação:', error);
            return false;
        }
    }

    // Verificar se é admin
    isAdmin() {
        try {
            const userData = localStorage.getItem('user') || localStorage.getItem('modelai_user');
            if (!userData) return false;
            
            const user = JSON.parse(userData);
            return user.role === 'admin';
        } catch (error) {
            console.error('❌ Erro ao verificar admin:', error);
            return false;
        }
    }

    // Obter usuário atual
    getCurrentUser() {
        try {
            const userData = localStorage.getItem('user') || localStorage.getItem('modelai_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('❌ Erro ao obter usuário atual:', error);
            return null;
        }
    }

    // Verificação de token no servidor
    async verifyAuth() {
        try {
            const response = await this.get('/auth/verify');
            return response.valid;
        } catch (error) {
            console.error('❌ Erro na verificação do servidor:', error);
            return false;
        }
    }

    // === MÉTODOS DE AUTENTICAÇÃO ===

    // Login
    async login(email, password) {
        const response = await this.post('/auth/login', { email, password });
        return response;
    }

    // Registro (para admins)
    async register(userData) {
        const response = await this.post('/auth/register', userData);
        return response;
    }

    // === MÉTODOS DE USUÁRIO ===

    // Obter perfil
    async getProfile() {
        return this.get('/user/profile');
    }

    // Atualizar perfil
    async updateProfile(userData) {
        return this.put('/user/profile', userData);
    }

    // Alterar senha
    async changePassword(currentPassword, newPassword) {
        return this.put('/user/password', { currentPassword, newPassword });
    }

    // === MÉTODOS DE CENÁRIOS ===

    // Listar cenários
    async getScenarios(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/scenarios${queryString ? '?' + queryString : ''}`);
    }

    // Criar cenário
    async createScenario(scenarioData) {
        return this.post('/scenarios', scenarioData);
    }

    // Obter cenário específico
    async getScenario(id) {
        return this.get(`/scenarios/${id}`);
    }

    // Atualizar cenário
    async updateScenario(id, scenarioData) {
        return this.put(`/scenarios/${id}`, scenarioData);
    }

    // Excluir cenário
    async deleteScenario(id) {
        return this.delete(`/scenarios/${id}`);
    }

    // === MÉTODOS DE USUÁRIOS (ADMIN ONLY) ===

    // Listar usuários
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/users${queryString ? '?' + queryString : ''}`);
    }

    // Atualizar status do usuário
    async updateUserStatus(userId, isActive) {
        return this.put(`/users/${userId}/status`, { isActive });
    }

    // Excluir usuário
    async deleteUser(userId) {
        return this.delete(`/users/${userId}`);
    }

    // === MÉTODOS DE RESULTADOS ===

    // Obter resultados
    async getResults(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/results${queryString ? '?' + queryString : ''}`);
    }

    // Criar resultado
    async createResult(resultData) {
        return this.post('/results', resultData);
    }

    // === MÉTODOS DE DEBUG ===

    // Debug: Listar todos os usuários
    async debugGetAllUsers() {
        return this.get('/debug/users');
    }

    // Health check
    async healthCheck() {
        return this.get('/health');
    }
}

// Instância global da API
const api = new ApiClient();

// === FUNÇÕES DE UTILIDADE ===

// Mostrar notificação
function showNotification(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Simple alert for now - can be replaced with a toast library
    if (type === 'error') {
        alert('❌ ' + message);
    } else if (type === 'success') {
        alert('✅ ' + message);
    } else {
        alert('ℹ️ ' + message);
    }
}

// Mostrar erro
function showError(message) {
    showNotification(message, 'error');
}

// Mostrar sucesso
function showSuccess(message) {
    showNotification(message, 'success');
}

// Mostrar informação
function showInfo(message) {
    showNotification(message, 'info');
}

// Confirmar ação
function confirmAction(message, title = 'Confirmar') {
    return new Promise(resolve => {
        const confirmed = confirm(`${title}\n\n${message}`);
        resolve(confirmed);
    });
}

// === EXPORTAÇÕES ===
window.api = api;
window.ApiClient = ApiClient;
window.showNotification = showNotification;
window.showError = showError;
window.showSuccess = showSuccess;
window.showInfo = showInfo;
window.confirmAction = confirmAction;

console.log('🔗 API CLIENT - Sistema Real Configurado!');
