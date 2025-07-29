// Sistema de Alertas Modernos - ModelAI

class AlertSystem {
    constructor() {
        this.createAlertContainer();
    }

    createAlertContainer() {
        if (document.getElementById('alert-container')) return;
        
        const container = document.createElement('div');
        container.id = 'alert-container';
        container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    show(message, type = 'info', duration = 4000) {
        const alert = this.createAlert(message, type);
        const container = document.getElementById('alert-container');
        
        container.appendChild(alert);
        
        // Animação de entrada
        setTimeout(() => {
            alert.classList.remove('opacity-0', 'translate-x-full');
            alert.classList.add('opacity-100', 'translate-x-0');
        }, 10);

        // Auto-remove
        setTimeout(() => {
            this.removeAlert(alert);
        }, duration);

        return alert;
    }

    createAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `
            opacity-0 translate-x-full transform transition-all duration-300 ease-in-out
            bg-white rounded-lg shadow-lg border-l-4 p-4 flex items-center space-x-3
            ${this.getTypeClasses(type)}
        `;

        const icon = this.getIcon(type);
        const color = this.getIconColor(type);

        alert.innerHTML = `
            <div class="flex-shrink-0">
                <i class="${icon} text-lg ${color}"></i>
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">${message}</p>
            </div>
            <button onclick="this.parentElement.remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                <i class="fas fa-times"></i>
            </button>
        `;

        return alert;
    }

    getTypeClasses(type) {
        const classes = {
            'success': 'border-green-500 bg-green-50',
            'error': 'border-red-500 bg-red-50',
            'warning': 'border-yellow-500 bg-yellow-50',
            'info': 'border-blue-500 bg-blue-50'
        };
        return classes[type] || classes['info'];
    }

    getIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || icons['info'];
    }

    getIconColor(type) {
        const colors = {
            'success': 'text-green-500',
            'error': 'text-red-500',
            'warning': 'text-yellow-500',
            'info': 'text-blue-500'
        };
        return colors[type] || colors['info'];
    }

    removeAlert(alert) {
        if (!alert) return;
        
        alert.classList.remove('opacity-100', 'translate-x-0');
        alert.classList.add('opacity-0', 'translate-x-full');
        
        setTimeout(() => {
            if (alert.parentElement) {
                alert.parentElement.removeChild(alert);
            }
        }, 300);
    }

    // Métodos de conveniência
    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 6000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }

    // Alerta de confirmação moderno
    confirm(message, title = 'Confirmação') {
        return new Promise((resolve) => {
            const modal = this.createConfirmModal(message, title, resolve);
            document.body.appendChild(modal);
            
            // Animação de entrada
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('.transform').classList.remove('scale-95');
                modal.querySelector('.transform').classList.add('scale-100');
            }, 10);
        });
    }

    // Confirmação especial para exclusão
    confirmDelete(message, title = 'Confirmar Exclusão', itemName = '') {
        return new Promise((resolve) => {
            const modal = this.createDeleteModal(message, title, itemName, resolve);
            document.body.appendChild(modal);
            
            // Animação de entrada
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('.transform').classList.remove('scale-95');
                modal.querySelector('.transform').classList.add('scale-100');
            }, 10);
        });
    }

    createDeleteModal(message, title, itemName, resolve) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 opacity-0 transition-opacity duration-300';
        modal.style.zIndex = '9999';

        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl transform scale-95 transition-transform duration-300 max-w-md w-full mx-4">
                <div class="p-6">
                    <div class="flex items-center space-x-3 mb-4">
                        <div class="flex-shrink-0">
                            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-trash-alt text-red-600 text-xl"></i>
                            </div>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                            ${itemName ? `<p class="text-sm text-gray-500">${itemName}</p>` : ''}
                        </div>
                    </div>
                    <div class="mb-6">
                        <p class="text-gray-700 leading-relaxed">${message}</p>
                        <div class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p class="text-sm text-red-800 font-medium">Esta ação não pode ser desfeita.</p>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button onclick="this.cancelDelete()" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                            Cancelar
                        </button>
                        <button onclick="this.confirmDelete()" class="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium">
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Adicionar evento de confirmação
        const buttons = modal.querySelectorAll('button');
        buttons[0].onclick = () => this.closeModal(modal, resolve, false);
        buttons[1].onclick = () => this.closeModal(modal, resolve, true);

        // Fechar ao clicar fora
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeModal(modal, resolve, false);
            }
        };

        return modal;
    }

    createConfirmModal(message, title, resolve) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 opacity-0 transition-opacity duration-300';
        modal.style.zIndex = '9999';

        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl transform scale-95 transition-transform duration-300 max-w-md w-full mx-4">
                <div class="p-6">
                    <div class="flex items-center space-x-3 mb-4">
                        <div class="flex-shrink-0">
                            <i class="fas fa-question-circle text-2xl text-blue-500"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-800">${title}</h3>
                        </div>
                    </div>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <div class="flex justify-end space-x-3">
                        <button onclick="this.confirmAction(false)" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            Cancelar
                        </button>
                        <button onclick="this.confirmAction(true)" class="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors">
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Adicionar evento de confirmação
        const confirmButtons = modal.querySelectorAll('button');
        confirmButtons[0].onclick = () => this.closeModal(modal, resolve, false);
        confirmButtons[1].onclick = () => this.closeModal(modal, resolve, true);

        // Fechar ao clicar fora
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeModal(modal, resolve, false);
            }
        };

        return modal;
    }

    closeModal(modal, resolve, result) {
        modal.classList.add('opacity-0');
        modal.querySelector('.transform').classList.remove('scale-100');
        modal.querySelector('.transform').classList.add('scale-95');
        
        setTimeout(() => {
            if (modal.parentElement) {
                modal.parentElement.removeChild(modal);
            }
            resolve(result);
        }, 300);
    }
}

// Instância global
const alerts = new AlertSystem();

// Funções globais de conveniência
window.showAlert = (message, type, duration) => alerts.show(message, type, duration);
window.showSuccess = (message, duration) => alerts.success(message, duration);
window.showError = (message, duration) => alerts.error(message, duration);
window.showWarning = (message, duration) => alerts.warning(message, duration);
window.showInfo = (message, duration) => alerts.info(message, duration);
window.confirmAction = (message, title) => alerts.confirm(message, title);
window.confirmDelete = (message, title, itemName) => alerts.confirmDelete(message, title, itemName);
