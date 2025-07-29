// API Configuration and Helper Functions
class ApiClient {
    constructor() {
        this.baseURL = window.location.origin.includes('localhost') 
            ? 'http://localhost:3000/api' 
            : '/api';
        this.token = localStorage.getItem('modelai_token');
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
            const response = await fetch(url, config);
            const data = await response.json();

            // Se token expirou, redirecionar para login
            if (response.status === 401 && data.error?.includes('Token')) {
                this.logout();
                window.location.href = '/login.html';
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            if (!response.ok) {
                throw new Error(data.error || `Erro HTTP: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`Erro na requisição ${endpoint}:`, error);
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
        localStorage.setItem('modelai_token', token);
    }

    logout() {
        this.token = null;
        localStorage.removeItem('modelai_token');
        localStorage.removeItem('modelai_user');
        localStorage.removeItem('modelai_logged_in');
    }

    // Verificar se usuário está logado
    isAuthenticated() {
        const token = localStorage.getItem('modelai_token');
        const user = localStorage.getItem('modelai_user');
        const loggedIn = localStorage.getItem('modelai_logged_in');
        
        return !!(token && user && loggedIn === 'true');
    }

    // Verificar se é admin
    isAdmin() {
        try {
            const user = JSON.parse(localStorage.getItem('modelai_user') || '{}');
            return user.role === 'admin';
        } catch {
            return false;
        }
    }

    // Obter dados do usuário logado
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('modelai_user') || '{}');
        } catch {
            return null;
        }
    }

    // Verificar autenticação via API
    async verifyAuth() {
        try {
            const response = await this.get('/auth/verify');
            if (response.valid && response.user) {
                localStorage.setItem('modelai_user', JSON.stringify(response.user));
                return response.user;
            }
            throw new Error('Token inválido');
        } catch (error) {
            this.logout();
            throw error;
        }
    }

    // Métodos da API

    // Autenticação
    async login(email, password) {
        const response = await this.post('/auth/login', { email, password });
        if (response.token) {
            this.setToken(response.token);
            localStorage.setItem('modelai_user', JSON.stringify(response.user));
            localStorage.setItem('modelai_logged_in', 'true');
        }
        return response;
    }

    async register(userData) {
        const response = await this.post('/auth/register', userData);
        if (response.token) {
            this.setToken(response.token);
            localStorage.setItem('modelai_user', JSON.stringify(response.user));
            localStorage.setItem('modelai_logged_in', 'true');
        }
        return response;
    }

    async getProfile() {
        return this.get('/auth/me');
    }

    async updateProfile(userData) {
        return this.put('/auth/profile', userData);
    }

    async changePassword(currentPassword, newPassword) {
        return this.put('/auth/change-password', { currentPassword, newPassword });
    }

    // Cenários
    async getScenarios(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/scenarios${queryString ? '?' + queryString : ''}`);
    }

    async getScenario(id) {
        return this.get(`/scenarios/${id}`);
    }

    async createScenario(scenarioData) {
        return this.post('/scenarios', scenarioData);
    }

    async updateScenario(id, scenarioData) {
        return this.put(`/scenarios/${id}`, scenarioData);
    }

    async deleteScenario(id) {
        return this.delete(`/scenarios/${id}`);
    }

    async duplicateScenario(id, name) {
        return this.post(`/scenarios/${id}/duplicate`, { name });
    }

    async getScenarioHistory(id) {
        return this.get(`/scenarios/${id}/history`);
    }

    async getScenarioStats() {
        return this.get('/scenarios/stats/summary');
    }

    // Usuários
    async getUserProfile() {
        return this.get('/users/profile');
    }

    async exportUserData() {
        const response = await fetch(`${this.baseURL}/users/export`, {
            headers: this.getHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Erro ao exportar dados');
        }

        return response.blob();
    }
}

// Instância global da API
const api = new ApiClient();

// Helper para mostrar notificações
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-black' :
        'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-lg font-bold">×</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto remover após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Helper para verificar autenticação em páginas protegidas
function requireAuth() {
    if (!api.isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Helper para redirecionar se já logado
function redirectIfAuthenticated() {
    if (api.isAuthenticated()) {
        window.location.href = '/index.html';
        return true;
    }
    return false;
}

// Export para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiClient, api, showNotification, requireAuth, redirectIfAuthenticated };
}
