class EmpreendimentosManager {
    constructor() {
        this.empreendimentos = [];
        this.editingId = null;
        this.init();
    }

    async init() {
        await this.loadEmpreendimentos();
        this.initEventListeners();
        this.setupCurrencyInputs();
        this.renderEmpreendimentos();
    }

    initEventListeners() {
        // Toggle do formulário
        document.getElementById('toggleEmpreendimentoForm').addEventListener('click', () => {
            this.toggleForm();
        });

        // Botões de ação
        document.getElementById('salvarEmpreendimento').addEventListener('click', () => {
            this.salvarEmpreendimento();
        });

        document.getElementById('cancelarEmpreendimento').addEventListener('click', () => {
            this.cancelarEdicao();
        });

        // Auto-cálculo baseado no valor total
        document.getElementById('novoEmpreendimentoValorTotal').addEventListener('input', () => {
            this.updateCalculations();
        });

        // Auto-cálculo para percentuais
        ['entrada', 'parcelas', 'reforco', 'nasChaves'].forEach(tipo => {
            document.getElementById(`novoEmpreendimento${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Percent`).addEventListener('input', () => {
                this.updateValueFromPercent(tipo);
            });
        });
    }

    setupCurrencyInputs() {
        const currencyInputs = document.querySelectorAll('.currency-input');
        currencyInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.formatCurrency(e.target);
            });
        });
    }

    formatCurrency(input) {
        let value = input.value.replace(/\D/g, '');
        if (value) {
            value = (parseInt(value) / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        }
        input.value = value;
    }

    parseCurrency(value) {
        if (!value) return 0;
        // Remove tudo exceto números, vírgulas e pontos
        let cleaned = value.replace(/[^\d,]/g, '');
        // Se tem vírgula, trata como separador decimal
        if (cleaned.includes(',')) {
            cleaned = cleaned.replace(',', '.');
        }
        return parseFloat(cleaned) || 0;
    }

    updateCalculations() {
        const valorTotal = this.parseCurrency(document.getElementById('novoEmpreendimentoValorTotal').value);
        if (!valorTotal) return;

        // Calcular valores baseados nos percentuais
        ['entrada', 'parcelas', 'reforco', 'nasChaves'].forEach(tipo => {
            const percentInput = document.getElementById(`novoEmpreendimento${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Percent`);
            const valorInput = document.getElementById(`novoEmpreendimento${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Valor`);
            
            if (percentInput.value && !valorInput.value) {
                const percent = parseFloat(percentInput.value);
                const valor = (valorTotal * percent / 100).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });
                valorInput.value = valor;
            }
        });
    }

    updateValueFromPercent(tipo) {
        const valorTotal = this.parseCurrency(document.getElementById('novoEmpreendimentoValorTotal').value);
        if (!valorTotal) return;

        const percentInput = document.getElementById(`novoEmpreendimento${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Percent`);
        const valorInput = document.getElementById(`novoEmpreendimento${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Valor`);
        
        if (percentInput.value) {
            const percent = parseFloat(percentInput.value);
            const valor = (valorTotal * percent / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
            valorInput.value = valor;
        }
    }

    toggleForm() {
        const form = document.getElementById('empreendimentoForm');
        const isHidden = form.classList.contains('hidden');
        
        if (isHidden) {
            form.classList.remove('hidden');
            document.getElementById('toggleEmpreendimentoForm').innerHTML = '<i class="fas fa-minus mr-2"></i>Fechar';
        } else {
            form.classList.add('hidden');
            document.getElementById('toggleEmpreendimentoForm').innerHTML = '<i class="fas fa-plus mr-2"></i>Adicionar';
            this.clearForm();
        }
    }

    async salvarEmpreendimento() {
        const empreendimento = this.getFormData();
        
        if (!this.validateForm(empreendimento)) {
            return;
        }

        try {
            // Preparar dados no formato da API
            const dadosAPI = {
                nome: empreendimento.nome,
                incorporadora: empreendimento.incorporadora,
                tabelaVendas: {
                    valorImovel: empreendimento.valorTotal,
                    entradaValor: empreendimento.entrada.valor,
                    entradaPercent: empreendimento.entrada.percent,
                    entradaParcelas: empreendimento.entrada.parcelas,
                    parcelasValor: empreendimento.parcelas.valor,
                    parcelasPercent: empreendimento.parcelas.percent,
                    parcelasQtd: empreendimento.parcelas.qtd,
                    reforcoValor: empreendimento.reforco.valor,
                    reforcoPercent: empreendimento.reforco.percent,
                    reforcoQtd: empreendimento.reforco.qtd,
                    reforcoFrequencia: empreendimento.reforco.frequencia,
                    nasChavesValor: empreendimento.nasChaves.valor,
                    nasChavesPercent: empreendimento.nasChaves.percent,
                    nasChavesMes: empreendimento.nasChaves.mes,
                    nasChavesDesagio: empreendimento.desagio
                }
            };

            let response;
            if (this.editingId) {
                // Editando empreendimento existente
                response = await fetch(`/api/empreendimentos/${this.editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(dadosAPI)
                });
            } else {
                // Novo empreendimento
                response = await fetch('/api/empreendimentos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(dadosAPI)
                });
            }

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Empreendimento salvo:', result);

            // Atualizar localStorage também para compatibilidade
            if (this.editingId) {
                const index = this.empreendimentos.findIndex(e => e.id === this.editingId);
                if (index !== -1) {
                    this.empreendimentos[index] = { ...empreendimento, id: this.editingId };
                }
                this.editingId = null;
            } else {
                empreendimento.id = result.empreendimento._id;
                this.empreendimentos.push(empreendimento);
            }

            this.saveEmpreendimentos();
            this.renderEmpreendimentos();
            this.clearForm();
            this.toggleForm();
            
            this.showSuccessMessage('Empreendimento salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar empreendimento:', error);
            this.showErrorMessage('Erro ao salvar empreendimento: ' + error.message);
        }
    }

    getFormData() {
        return {
            nome: document.getElementById('novoEmpreendimentoNome').value,
            incorporadora: document.getElementById('novoEmpreendimentoIncorporadora').value,
            valorTotal: this.parseCurrency(document.getElementById('novoEmpreendimentoValorTotal').value),
            entrada: {
                valor: this.parseCurrency(document.getElementById('novoEmpreendimentoEntradaValor').value),
                percent: parseFloat(document.getElementById('novoEmpreendimentoEntradaPercent').value) || 0,
                parcelas: parseInt(document.getElementById('novoEmpreendimentoEntradaParcelas').value) || 1
            },
            parcelas: {
                valor: this.parseCurrency(document.getElementById('novoEmpreendimentoParcelasValor').value),
                percent: parseFloat(document.getElementById('novoEmpreendimentoParcelasPercent').value) || 0,
                qtd: parseInt(document.getElementById('novoEmpreendimentoParcelasQtd').value) || 1
            },
            reforco: {
                valor: this.parseCurrency(document.getElementById('novoEmpreendimentoReforcoValor').value),
                percent: parseFloat(document.getElementById('novoEmpreendimentoReforcoPercent').value) || 0,
                qtd: parseInt(document.getElementById('novoEmpreendimentoReforcoQtd').value) || 1,
                frequencia: parseInt(document.getElementById('novoEmpreendimentoReforcoFrequencia').value) || 6
            },
            nasChaves: {
                valor: this.parseCurrency(document.getElementById('novoEmpreendimentoNasChavesValor').value),
                percent: parseFloat(document.getElementById('novoEmpreendimentoNasChavesPercent').value) || 0,
                mes: parseInt(document.getElementById('novoEmpreendimentoNasChavesMes').value) || 0
            },
            desagio: parseFloat(document.getElementById('novoEmpreendimentoDesagio').value) || 0,
            createdAt: new Date().toISOString()
        };
    }

    validateForm(empreendimento) {
        if (!empreendimento.nome.trim()) {
            this.showErrorMessage('Nome do empreendimento é obrigatório!');
            return false;
        }

        if (!empreendimento.incorporadora.trim()) {
            this.showErrorMessage('Nome da incorporadora é obrigatório!');
            return false;
        }

        if (!empreendimento.valorTotal || empreendimento.valorTotal <= 0) {
            this.showErrorMessage('Valor total do imóvel é obrigatório!');
            return false;
        }

        return true;
    }

    editEmpreendimento(id) {
        const empreendimento = this.empreendimentos.find(e => e.id === id);
        if (!empreendimento) return;

        this.editingId = id;
        
        // Preencher formulário com valores seguros
        document.getElementById('novoEmpreendimentoNome').value = empreendimento.nome || '';
        document.getElementById('novoEmpreendimentoIncorporadora').value = empreendimento.incorporadora || '';
        document.getElementById('novoEmpreendimentoValorTotal').value = (empreendimento.valorTotal || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        // Entrada - com valores padrão
        const entrada = empreendimento.entrada || { valor: 0, percent: 0, parcelas: 1 };
        document.getElementById('novoEmpreendimentoEntradaValor').value = (entrada.valor || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        document.getElementById('novoEmpreendimentoEntradaPercent').value = entrada.percent || 0;
        document.getElementById('novoEmpreendimentoEntradaParcelas').value = entrada.parcelas || 1;

        // Parcelas - com valores padrão
        const parcelas = empreendimento.parcelas || { valor: 0, percent: 0, qtd: 1 };
        document.getElementById('novoEmpreendimentoParcelasValor').value = (parcelas.valor || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        document.getElementById('novoEmpreendimentoParcelasPercent').value = parcelas.percent || 0;
        document.getElementById('novoEmpreendimentoParcelasQtd').value = parcelas.qtd || 1;

        // Reforço - com valores padrão
        const reforco = empreendimento.reforco || { valor: 0, percent: 0, qtd: 1, frequencia: 6 };
        document.getElementById('novoEmpreendimentoReforcoValor').value = (reforco.valor || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        document.getElementById('novoEmpreendimentoReforcoPercent').value = reforco.percent || 0;
        document.getElementById('novoEmpreendimentoReforcoQtd').value = reforco.qtd || 1;
        document.getElementById('novoEmpreendimentoReforcoFrequencia').value = reforco.frequencia || 6;

        // Nas Chaves - com valores padrão
        const nasChaves = empreendimento.nasChaves || { valor: 0, percent: 0, mes: 36 };
        document.getElementById('novoEmpreendimentoNasChavesValor').value = (nasChaves.valor || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        document.getElementById('novoEmpreendimentoNasChavesPercent').value = nasChaves.percent || 0;
        document.getElementById('novoEmpreendimentoNasChavesMes').value = nasChaves.mes || 36;

        // Deságio
        document.getElementById('novoEmpreendimentoDesagio').value = empreendimento.desagio || 0;

        // Mostrar formulário
        if (document.getElementById('empreendimentoForm').classList.contains('hidden')) {
            this.toggleForm();
        }

        // Atualizar botão
        document.getElementById('salvarEmpreendimento').innerHTML = '<i class="fas fa-save"></i><span>Atualizar Empreendimento</span>';
    }

    async deleteEmpreendimento(id) {
        if (confirm('Tem certeza que deseja excluir este empreendimento?')) {
            try {
                // Tentar excluir da API
                const response = await fetch(`/api/empreendimentos/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    console.log('Empreendimento excluído da API:', id);
                }
                
                // Remover do estado local (independente do resultado da API)
                this.empreendimentos = this.empreendimentos.filter(e => e.id !== id);
                this.saveEmpreendimentos();
                this.renderEmpreendimentos();
                this.showSuccessMessage('Empreendimento excluído com sucesso!');
                
            } catch (error) {
                console.error('Erro ao excluir empreendimento da API:', error);
                
                // Ainda assim remover do localStorage
                this.empreendimentos = this.empreendimentos.filter(e => e.id !== id);
                this.saveEmpreendimentos();
                this.renderEmpreendimentos();
                this.showSuccessMessage('Empreendimento excluído localmente!');
            }
        }
    }

    cancelarEdicao() {
        this.editingId = null;
        this.clearForm();
        this.toggleForm();
        document.getElementById('salvarEmpreendimento').innerHTML = '<i class="fas fa-save"></i><span>Salvar Empreendimento</span>';
    }

    clearForm() {
        document.querySelectorAll('#empreendimentoForm input, #empreendimentoForm select').forEach(input => {
            if (input.type === 'number') {
                input.value = '';
            } else if (input.type === 'text') {
                input.value = '';
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 1; // Volta para a opção padrão (6 meses)
            }
        });
    }

    renderEmpreendimentos() {
        const container = document.getElementById('listaEmpreendimentos');
        
        if (this.empreendimentos.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-12 col-span-full">
                    <i class="fas fa-building text-6xl mb-6 text-gray-300"></i>
                    <h3 class="text-xl font-semibold mb-2">Nenhum empreendimento cadastrado</h3>
                    <p class="text-gray-400">Adicione um empreendimento para começar a criar seus modelos reutilizáveis.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.empreendimentos.map(emp => {
            // Garantir que todos os valores existam e tenham valores padrão
            const valorTotal = emp.valorTotal || 0;
            const entrada = emp.entrada || { valor: 0, percent: 0, parcelas: 1 };
            const parcelas = emp.parcelas || { valor: 0, percent: 0, qtd: 1 };
            const reforco = emp.reforco || { valor: 0, percent: 0, qtd: 1, frequencia: 6 };
            const nasChaves = emp.nasChaves || { valor: 0, percent: 0, mes: 1 };
            const desagio = emp.desagio || 0;

            return `
            <div class="empreendimento-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-gray-800 mb-1">${emp.nome || 'Nome não informado'}</h3>
                        <p class="text-sm text-gray-600">${emp.incorporadora || 'Incorporadora não informada'}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="empreendimentosManager.editEmpreendimento('${emp.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="empreendimentosManager.deleteEmpreendimento('${emp.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span class="text-sm font-medium text-blue-800">Valor Total</span>
                        <span class="font-bold text-blue-900">${valorTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div class="p-3 bg-green-50 rounded-lg">
                            <div class="text-xs text-green-700 font-medium mb-1">Entrada</div>
                            <div class="text-sm font-bold text-green-900">${entrada.percent || 0}%</div>
                            <div class="text-xs text-green-600">${entrada.parcelas || 1}x de ${((entrada.valor || 0) / (entrada.parcelas || 1)).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div>
                        </div>
                        
                        <div class="p-3 bg-orange-50 rounded-lg">
                            <div class="text-xs text-orange-700 font-medium mb-1">Parcelas</div>
                            <div class="text-sm font-bold text-orange-900">${parcelas.percent || 0}%</div>
                            <div class="text-xs text-orange-600">${parcelas.qtd || 1}x de ${((parcelas.valor || 0) / (parcelas.qtd || 1)).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div>
                        </div>
                        
                        <div class="p-3 bg-purple-50 rounded-lg">
                            <div class="text-xs text-purple-700 font-medium mb-1">Reforço</div>
                            <div class="text-sm font-bold text-purple-900">${reforco.percent || 0}%</div>
                            <div class="text-xs text-purple-600">${reforco.qtd || 0}x / ${reforco.frequencia || 6} meses</div>
                        </div>
                        
                        <div class="p-3 bg-gray-50 rounded-lg">
                            <div class="text-xs text-gray-700 font-medium mb-1">Nas Chaves</div>
                            <div class="text-sm font-bold text-gray-900">${nasChaves.percent || 0}%</div>
                            <div class="text-xs text-gray-600">Mês ${nasChaves.mes || 1}</div>
                        </div>
                    </div>
                    
                    ${desagio > 0 ? `
                    <div class="p-3 bg-red-50 rounded-lg">
                        <div class="text-xs text-red-700 font-medium mb-1">Deságio</div>
                        <div class="text-sm font-bold text-red-900">${desagio}%</div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="mt-4 pt-3 border-t border-gray-200">
                    <div class="text-xs text-gray-500">
                        Criado em ${emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('pt-BR') : 'Data não informada'}
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }

    async loadEmpreendimentos() {
        try {
            // Tentar carregar da API primeiro
            const response = await fetch('/api/empreendimentos', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Empreendimentos carregados da API:', data);
                
                // Converter dados da API para formato do frontend
                this.empreendimentos = data.empreendimentos.map(emp => ({
                    id: emp._id,
                    nome: emp.nome,
                    incorporadora: emp.incorporadora,
                    valorTotal: emp.tabelaVendas.valorImovel,
                    entrada: {
                        valor: emp.tabelaVendas.entradaValor,
                        percent: emp.tabelaVendas.entradaPercent,
                        parcelas: emp.tabelaVendas.entradaParcelas
                    },
                    parcelas: {
                        valor: emp.tabelaVendas.parcelasValor,
                        percent: emp.tabelaVendas.parcelasPercent,
                        qtd: emp.tabelaVendas.parcelasQtd
                    },
                    reforco: {
                        valor: emp.tabelaVendas.reforcoValor,
                        percent: emp.tabelaVendas.reforcoPercent,
                        qtd: emp.tabelaVendas.reforcoQtd,
                        frequencia: emp.tabelaVendas.reforcoFrequencia
                    },
                    nasChaves: {
                        valor: emp.tabelaVendas.nasChavesValor,
                        percent: emp.tabelaVendas.nasChavesPercent,
                        mes: emp.tabelaVendas.nasChavesMes
                    },
                    desagio: emp.tabelaVendas.nasChavesDesagio
                }));

                // Sincronizar com localStorage para compatibilidade
                this.saveEmpreendimentos();
                return this.empreendimentos;
            }
        } catch (error) {
            console.error('Erro ao carregar empreendimentos da API:', error);
        }

        // Fallback: carregar do localStorage
        console.log('Carregando empreendimentos do localStorage como fallback');
        try {
            const saved = localStorage.getItem('empreendimentos');
            if (saved) {
                this.empreendimentos = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Erro ao carregar empreendimentos:', error);
            this.empreendimentos = [];
        }
    }

    saveEmpreendimentos() {
        try {
            localStorage.setItem('empreendimentos', JSON.stringify(this.empreendimentos));
        } catch (error) {
            console.error('Erro ao salvar empreendimentos:', error);
            this.showErrorMessage('Erro ao salvar dados. Tente novamente.');
        }
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Criar toast notification
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Inicializar quando a página carregar
let empreendimentosManager;
document.addEventListener('DOMContentLoaded', () => {
    empreendimentosManager = new EmpreendimentosManager();
});
