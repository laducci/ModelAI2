// Inputs Page JavaScript - Model AI

// Tab functionality - Aguardar DOM estar pronto
document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    document.querySelectorAll('.subtab-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and contents
            document.querySelectorAll('.subtab-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('text-gray-600');
            });
            document.querySelectorAll('.subtab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            this.classList.remove('text-gray-600');
            
            const tabId = this.getAttribute('data-tab');
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Atualizar botão de ação baseado na aba ativa
            updateActionButton(tabId);
        });
    });
    
    // Configurar botão inicial na primeira aba
    const activeTab = document.querySelector('.subtab-btn.active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('data-tab');
        updateActionButton(tabId);
    }
});

// TMA calculations
function calculateTMAMes() {
    const tmaAno = parseFloat(document.getElementById('tmaAno')?.value || 0);
    if (document.getElementById('tmaMes')) {
        // Fórmula: (1+TMA_ANO)^(1/12)-1
        const tmaMes = Math.pow(1 + (tmaAno / 100), 1/12) - 1;
        document.getElementById('tmaMes').value = (tmaMes * 100).toFixed(4);
    }
}

// Utility functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
}

function formatBRNumber(value) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function parseBRNumber(value) {
    if (typeof value === 'string') {
        // Remove todos os pontos (separadores de milhares) e substitui vírgula por ponto
        const cleanValue = value.replace(/\./g, '').replace(',', '.');
        const result = parseFloat(cleanValue) || 0;
        return result;
    }
    const result = parseFloat(value) || 0;
    return result;
}

function formatInputValue(input) {
    const currentValue = input.value;
    if (currentValue && currentValue.trim() !== '') {
        const numValue = parseBRNumber(currentValue);
        if (numValue > 0) {
            input.value = formatNumber(numValue);
        }
        return numValue;
    }
    return 0;
}

// ==================== TABELA DE VENDAS ====================

// Variável para controlar se estamos atualizando valores ou percentuais
let isUpdatingFromPercent = false;
let isUpdatingFromValue = false;

// Função principal de cálculos da tabela de vendas
function calculateTabelaVendas() {
    if (isUpdatingFromPercent || isUpdatingFromValue) return;
    
    // Obter valor do imóvel
    const valorImovel = parseBRNumber(document.getElementById('valorImovelInput')?.value || '0');
    
    // Calcular valores baseados em percentuais
    updateValoresFromPercentuais(valorImovel);
    
    // Atualizar valor por parcela
    calculateVendaValorPorParcela();
    
    // Atualizar resumo
    updateResumoCards();
}

function updateValoresFromPercentuais(valorImovel) {
    if (valorImovel <= 0) return;
    
    isUpdatingFromPercent = true;
    
    // Entrada
    const entradaPercent = parseFloat(document.getElementById('vendaEntradaPercent')?.value || 0);
    const entradaValor = (valorImovel * entradaPercent) / 100;
    if (document.getElementById('vendaEntradaValor')) {
        document.getElementById('vendaEntradaValor').value = formatNumber(entradaValor);
    }
    
    // Parcelas
    const parcelasPercent = parseFloat(document.getElementById('vendaParcelasPercent')?.value || 0);
    const parcelasValor = (valorImovel * parcelasPercent) / 100;
    if (document.getElementById('vendaParcelasValor')) {
        document.getElementById('vendaParcelasValor').value = formatNumber(parcelasValor);
    }
    
    // Reforço
    const reforcoPercent = parseFloat(document.getElementById('vendaReforcoPercent')?.value || 0);
    const reforcoValor = (valorImovel * reforcoPercent) / 100;
    if (document.getElementById('vendaReforcoValor')) {
        document.getElementById('vendaReforcoValor').value = formatNumber(reforcoValor);
    }
    
    // Nas Chaves
    const nasChavesPercent = parseFloat(document.getElementById('vendaNasChavesPercent')?.value || 0);
    const nasChavesValor = (valorImovel * nasChavesPercent) / 100;
    if (document.getElementById('vendaNasChavesValor')) {
        document.getElementById('vendaNasChavesValor').value = formatNumber(nasChavesValor);
    }
    
    isUpdatingFromPercent = false;
}

function updatePercentuaisFromValores() {
    if (isUpdatingFromPercent || isUpdatingFromValue) return;
    
    const valorImovel = parseBRNumber(document.getElementById('valorImovelInput')?.value || '0');
    if (valorImovel <= 0) return;
    
    isUpdatingFromValue = true;
    
    // Entrada
    const entradaValor = parseBRNumber(document.getElementById('vendaEntradaValor')?.value || '0');
    const entradaPercent = (entradaValor / valorImovel) * 100;
    if (document.getElementById('vendaEntradaPercent')) {
        document.getElementById('vendaEntradaPercent').value = entradaPercent.toFixed(1);
    }
    
    // Parcelas
    const parcelasValor = parseBRNumber(document.getElementById('vendaParcelasValor')?.value || '0');
    const parcelasPercent = (parcelasValor / valorImovel) * 100;
    if (document.getElementById('vendaParcelasPercent')) {
        document.getElementById('vendaParcelasPercent').value = parcelasPercent.toFixed(1);
    }
    
    // Reforço
    const reforcoValor = parseBRNumber(document.getElementById('vendaReforcoValor')?.value || '0');
    const reforcoPercent = (reforcoValor / valorImovel) * 100;
    if (document.getElementById('vendaReforcoPercent')) {
        document.getElementById('vendaReforcoPercent').value = reforcoPercent.toFixed(1);
    }
    
    // Nas Chaves
    const nasChavesValor = parseBRNumber(document.getElementById('vendaNasChavesValor')?.value || '0');
    const nasChavesPercent = (nasChavesValor / valorImovel) * 100;
    if (document.getElementById('vendaNasChavesPercent')) {
        document.getElementById('vendaNasChavesPercent').value = nasChavesPercent.toFixed(1);
    }
    
    isUpdatingFromValue = false;
}

function calculateVendaValorPorParcela() {
    // Entrada: Valor / Número de parcelas
    const entradaValor = parseBRNumber(document.getElementById('vendaEntradaValor')?.value || '0');
    const entradaParcelas = parseInt(document.getElementById('vendaEntradaParcelas')?.value || 1);
    
    if (entradaParcelas > 0 && entradaValor > 0) {
        const valorPorParcela = entradaValor / entradaParcelas;
        if (document.getElementById('vendaEntradaValorParcela')) {
            document.getElementById('vendaEntradaValorParcela').value = formatBRNumber(valorPorParcela);
        }
    }
    
    // Parcelas: Valor / Número de parcelas
    const parcelasValor = parseBRNumber(document.getElementById('vendaParcelasValor')?.value || '0');
    const parcelasQtd = parseInt(document.getElementById('vendaParcelasQtd')?.value || 1);
    
    if (parcelasQtd > 0 && parcelasValor > 0) {
        const valorPorParcela = parcelasValor / parcelasQtd;
        if (document.getElementById('vendaParcelasValorParcela')) {
            document.getElementById('vendaParcelasValorParcela').value = formatBRNumber(valorPorParcela);
        }
    }
    
    // Reforço: Valor / Número de parcelas
    const reforcoValor = parseBRNumber(document.getElementById('vendaReforcoValor')?.value || '0');
    const reforcoQtd = parseInt(document.getElementById('vendaReforcoQtd')?.value || 1);
    
    if (reforcoQtd > 0 && reforcoValor > 0) {
        const valorPorParcela = reforcoValor / reforcoQtd;
        if (document.getElementById('vendaReforcoValorParcela')) {
            document.getElementById('vendaReforcoValorParcela').value = formatBRNumber(valorPorParcela);
        }
    }
}

function updateResumoCards() {
    // Obter número de parcelas
    const entradaParcelas = parseInt(document.getElementById('vendaEntradaParcelas')?.value || 0);
    const parcelasQtd = parseInt(document.getElementById('vendaParcelasQtd')?.value || 0);
    const reforcoQtd = parseInt(document.getElementById('vendaReforcoQtd')?.value || 0);
    
    // Obter percentuais dos campos
    const percEntrada = parseFloat(document.getElementById('vendaEntradaPercent')?.value || 0);
    const percParcelas = parseFloat(document.getElementById('vendaParcelasPercent')?.value || 0);
    const percReforco = parseFloat(document.getElementById('vendaReforcoPercent')?.value || 0);
    const percNasChaves = parseFloat(document.getElementById('vendaNasChavesPercent')?.value || 0);
    
    // Atualizar cards do resumo
    const resumoEntradaEl = document.getElementById('resumoEntrada');
    if (resumoEntradaEl) {
        resumoEntradaEl.textContent = `${percEntrada.toFixed(1)}% - ${entradaParcelas}x`;
    }
    
    const resumoParcelasEl = document.getElementById('resumoParcelas');
    if (resumoParcelasEl) {
        resumoParcelasEl.textContent = `${percParcelas.toFixed(1)}% - ${parcelasQtd}x`;
    }
    
    const resumoReforcoEl = document.getElementById('resumoReforco');
    if (resumoReforcoEl) {
        resumoReforcoEl.textContent = `${percReforco.toFixed(1)}% - ${reforcoQtd}x`;
    }
    
    const resumoNasChavesEl = document.getElementById('resumoNasChaves');
    if (resumoNasChavesEl) {
        resumoNasChavesEl.textContent = `${percNasChaves.toFixed(1)}% - N/A`;
    }
}
function calculateVendaValorPorParcela() {
    // Entrada: Valor / Número de parcelas
    const entradaValor = parseBRNumber(document.getElementById('vendaEntradaValor')?.value || '0');
    const entradaParcelas = parseInt(document.getElementById('vendaEntradaParcelas')?.value || 1);
    
    if (entradaParcelas > 0 && entradaValor > 0) {
        const valorPorParcela = entradaValor / entradaParcelas;
        if (document.getElementById('vendaEntradaValorParcela')) {
            document.getElementById('vendaEntradaValorParcela').value = formatBRNumber(valorPorParcela);
        }
    }
    
    // Parcelas: Valor / Número de parcelas
    const parcelasValor = parseBRNumber(document.getElementById('vendaParcelasValor')?.value || '0');
    const parcelasQtd = parseInt(document.getElementById('vendaParcelasQtd')?.value || 1);
    
    if (parcelasQtd > 0 && parcelasValor > 0) {
        const valorPorParcela = parcelasValor / parcelasQtd;
        if (document.getElementById('vendaParcelasValorParcela')) {
            document.getElementById('vendaParcelasValorParcela').value = formatBRNumber(valorPorParcela);
        }
    }
    
    // Reforço: Valor / Número de parcelas
    const reforcoValor = parseBRNumber(document.getElementById('vendaReforcoValor')?.value || '0');
    const reforcoQtd = parseInt(document.getElementById('vendaReforcoQtd')?.value || 1);
    
    if (reforcoQtd > 0 && reforcoValor > 0) {
        const valorPorParcela = reforcoValor / reforcoQtd;
        if (document.getElementById('vendaReforcoValorParcela')) {
            document.getElementById('vendaReforcoValorParcela').value = formatBRNumber(valorPorParcela);
        }
    }
    
    // Atualizar cards do resumo
    updateResumoCards();
}

function calculateValorImovel() {
    // Valor do Imóvel = Entrada + Parcelas + Reforços + Nas Chaves
    const entradaValor = parseBRNumber(document.getElementById('vendaEntradaValor')?.value || '0');
    const parcelasValor = parseBRNumber(document.getElementById('vendaParcelasValor')?.value || '0');
    const reforcoValor = parseBRNumber(document.getElementById('vendaReforcoValor')?.value || '0');
    const bemMovelValor = parseBRNumber(document.getElementById('vendaBemMovelImovel')?.value || '0');
    
    const valorTotal = entradaValor + parcelasValor + reforcoValor + bemMovelValor;
    
    // Atualizar valor total do imóvel
    const valorImovelEl = document.getElementById('valorImovelCalculado');
    if (valorImovelEl) {
        valorImovelEl.textContent = formatCurrency(valorTotal);
    }
    
    // Calcular percentuais: Valor da linha ÷ Valor Total do Imóvel
    if (valorTotal > 0) {
        // % Entrada = Valor da Entrada ÷ Valor Total do Imóvel
        const percEntrada = (entradaValor / valorTotal * 100).toFixed(2);
        const percEntradaEl = document.getElementById('vendaEntradaPercent');
        if (percEntradaEl) {
            percEntradaEl.value = percEntrada + '%';
        }
        
        // % Parcelas = Valor das Parcelas ÷ Valor Total do Imóvel
        const percParcelas = (parcelasValor / valorTotal * 100).toFixed(2);
        const percParcelasEl = document.getElementById('vendaParcelasPercent');
        if (percParcelasEl) {
            percParcelasEl.value = percParcelas + '%';
        }
        
        // % Reforço = Valor do Reforço ÷ Valor Total do Imóvel
        const percReforco = (reforcoValor / valorTotal * 100).toFixed(2);
        const percReforcoEl = document.getElementById('vendaReforcoPercent');
        if (percReforcoEl) {
            percReforcoEl.value = percReforco + '%';
        }
        
        // % Nas Chaves = Valor Nas Chaves ÷ Valor Total do Imóvel
        const percBemMovel = (bemMovelValor / valorTotal * 100).toFixed(2);
        const percBemMovelEl = document.getElementById('vendaBemMovelImovelPercent');
        if (percBemMovelEl) {
            percBemMovelEl.value = percBemMovel + '%';
        }
    } else {
        // Se valor total for 0, zerar os percentuais
        const percEntradaEl = document.getElementById('vendaEntradaPercent');
        if (percEntradaEl) {
            percEntradaEl.value = '0,00%';
        }
        const percParcelasEl = document.getElementById('vendaParcelasPercent');
        if (percParcelasEl) {
            percParcelasEl.value = '0,00%';
        }
        const percReforcoEl = document.getElementById('vendaReforcoPercent');
        if (percReforcoEl) {
            percReforcoEl.value = '0,00%';
        }
        const percBemMovelEl = document.getElementById('vendaBemMovelImovelPercent');
        if (percBemMovelEl) {
            percBemMovelEl.value = '0,00%';
        }
    }
    
    // Atualizar cards do resumo
    updateResumoCards();
}

function updateResumoCards() {
    // Obter número de parcelas
    const entradaParcelas = parseInt(document.getElementById('vendaEntradaParcelas')?.value || 0);
    const parcelasQtd = parseInt(document.getElementById('vendaParcelasQtd')?.value || 0);
    const reforcoQtd = parseInt(document.getElementById('vendaReforcoQtd')?.value || 0);
    
    // Obter percentuais dos campos
    const percEntrada = document.getElementById('vendaEntradaPercent')?.value || '0%';
    const percParcelas = document.getElementById('vendaParcelasPercent')?.value || '0%';
    const percReforco = document.getElementById('vendaReforcoPercent')?.value || '0%';
    const percBemMovel = document.getElementById('vendaBemMovelImovelPercent')?.value || '0%';
    
    // Atualizar cards do resumo
    const resumoEntradaEl = document.getElementById('resumoEntrada');
    if (resumoEntradaEl) {
        resumoEntradaEl.textContent = `${percEntrada} - ${entradaParcelas}x`;
    }
    
    const resumoParcelasEl = document.getElementById('resumoParcelas');
    if (resumoParcelasEl) {
        resumoParcelasEl.textContent = `${percParcelas} - ${parcelasQtd}x`;
    }
    
    const resumoReforcoEl = document.getElementById('resumoReforco');
    if (resumoReforcoEl) {
        resumoReforcoEl.textContent = `${percReforco} - ${reforcoQtd}x`;
    }
    
    const resumoBemMovelEl = document.getElementById('resumoBemMovel');
    if (resumoBemMovelEl) {
        resumoBemMovelEl.textContent = `${percBemMovel} - N/A`;
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
}

function formatBRNumber(value) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function parseBRNumber(value) {
    if (typeof value === 'string') {
        // Remove todos os pontos (separadores de milhares) e substitui vírgula por ponto
        const cleanValue = value.replace(/\./g, '').replace(',', '.');
        const result = parseFloat(cleanValue) || 0;
        return result;
    }
    const result = parseFloat(value) || 0;
    return result;
}

// FUNÇÃO DE TESTE PARA DEBUG
window.testParseBRNumber = function() {
    const testValues = ['100000', '100.000', '100.000,00', 'R$ 100.000,00', '500000'];
    testValues.forEach(val => {
        const result = parseBRNumber(val);
        
        
    });
};

function formatInputValue(input) {
    const currentValue = input.value;
    if (currentValue && currentValue.trim() !== '') {
        const numValue = parseBRNumber(currentValue);
        if (numValue > 0) {
            input.value = formatNumber(numValue);
        }
        return numValue;
    }
    return 0;
}

function calculateParcelas() {
    calculateTMAMes();
    
    // Parse values
    const valorImovel = parseBRNumber(document.getElementById('valorImovel')?.value || 0);
    const entradaValor = parseBRNumber(document.getElementById('entradaValor')?.value || 0);
    const entradaQtd = parseFloat(document.getElementById('entradaParcelas')?.value || 1);
    const parcelasValor = parseBRNumber(document.getElementById('parcelasValor')?.value || 0);
    const parcelasQtd = parseFloat(document.getElementById('parcelasQtd')?.value || 1);
    const reforcoValor = parseBRNumber(document.getElementById('reforcoValor')?.value || 0);
    const reforcoQtd = parseFloat(document.getElementById('reforcoQtd')?.value || 1);
    
    // Calculate per-installment values
    if (document.getElementById('entradaValorParcela')) {
        document.getElementById('entradaValorParcela').value = formatNumber(entradaValor / entradaQtd);
    }
    
    if (document.getElementById('parcelasValorParcela')) {
        document.getElementById('parcelasValorParcela').value = formatNumber(parcelasValor / parcelasQtd);
    }
    
    if (document.getElementById('reforcoValorParcela')) {
        document.getElementById('reforcoValorParcela').value = formatNumber(reforcoValor / reforcoQtd);
    }

    // Update formatted displays
    updateCurrencyDisplays();
    updateResumo();
}

function updateCurrencyDisplays() {
    const valorImovel = parseBRNumber(document.getElementById('valorImovel')?.value || 0);
    
    if (document.getElementById('valorImovelFormatado')) {
        document.getElementById('valorImovelFormatado').textContent = formatCurrency(valorImovel);
    }
}

function updateResumo() {
    const entradaPercent = parseFloat(document.getElementById('entradaPercent')?.value || 0);
    const entradaQtd = parseFloat(document.getElementById('entradaParcelas')?.value || 1);
    const parcelasPercent = parseFloat(document.getElementById('parcelasPercent')?.value || 0);
    const parcelasQtd = parseFloat(document.getElementById('parcelasQtd')?.value || 1);
    const reforcoPercent = parseFloat(document.getElementById('reforcoPercent')?.value || 0);
    const reforcoQtd = parseFloat(document.getElementById('reforcoQtd')?.value || 1);

    if (document.getElementById('resumoEntrada')) {
        document.getElementById('resumoEntrada').textContent = `${entradaPercent}% - ${entradaQtd}x`;
    }
    
    if (document.getElementById('resumoParcelas')) {
        document.getElementById('resumoParcelas').textContent = `${parcelasPercent}% - ${parcelasQtd}x`;
    }
    
    if (document.getElementById('resumoReforco')) {
        document.getElementById('resumoReforco').textContent = `${reforcoPercent}% - ${reforcoQtd}x`;
    }
}

// Add event listeners for automatic calculations
document.addEventListener('DOMContentLoaded', function() {
    // TMA Ano listener
    const tmaAnoInput = document.getElementById('tmaAno');
    if (tmaAnoInput) {
        tmaAnoInput.addEventListener('input', calculateTMAMes);
        tmaAnoInput.addEventListener('change', calculateTMAMes);
    }

    // Currency input formatting
    const currencyInputs = ['valorImovel', 'entradaValor', 'parcelasValor', 'reforcoValor'];
    currencyInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('blur', function() {
                formatInputValue(this, this.value);
                calculateParcelas();
            });
            element.addEventListener('input', calculateParcelas);
        }
    });

    // Regular calculation inputs
    const calcInputs = [
        'entradaParcelas', 'entradaPercent',
        'parcelasQtd', 'parcelasPercent',
        'reforcoQtd', 'reforcoPercent'
    ];

    calcInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateParcelas);
            element.addEventListener('change', calculateParcelas);
        }
    });

    // Calculate initial values
    calculateParcelas();
});

// Save scenario function
function saveScenario() {
    // Validar nome do cenário
    const scenarioName = document.getElementById('scenarioName')?.value?.trim();
    if (!scenarioName) {
        alert('Por favor, digite um nome para o cenário.');
        document.getElementById('scenarioName')?.focus();
        return;
    }
    
    // Verificar se está editando um cenário existente
    const editingScenarioId = sessionStorage.getItem('editingScenarioId');
    
    // Coletar dados gerais
    const dadosGerais = {
        cliente: document.getElementById('cliente')?.value || '',
        imobiliaria: document.getElementById('imobiliaria')?.value || '',
        incorporadora: document.getElementById('incorporadora')?.value || '',
        empreendimento: document.getElementById('empreendimento')?.value || '',
        unidade: document.getElementById('unidade')?.value || '',
        areaPrivativa: document.getElementById('areaPrivativa')?.value || '',
        tmaAno: document.getElementById('tmaAno')?.value || '',
        tmaMes: document.getElementById('tmaMes')?.value || ''
    };
    
    // Coletar tabela de vendas
    const tabelaVendas = {
        vendaEntradaValor: document.getElementById('vendaEntradaValor')?.value || '',
        vendaEntradaParcelas: document.getElementById('vendaEntradaParcelas')?.value || '',
        vendaParcelasValor: document.getElementById('vendaParcelasValor')?.value || '',
        vendaParcelasQtd: document.getElementById('vendaParcelasQtd')?.value || '',
        vendaReforcoValor: document.getElementById('vendaReforcoValor')?.value || '',
        vendaReforcoQtd: document.getElementById('vendaReforcoQtd')?.value || '',
        vendaBemMovelImovel: document.getElementById('vendaBemMovelImovel')?.value || '',
        vendaDesagio: document.getElementById('vendaDesagio')?.value || ''
    };
    
    // Coletar proposta cliente
    const propostaCliente = {
        mesVenda: document.getElementById('mesVenda')?.value || '',
        propostaEntradaValor: document.getElementById('propostaEntradaValor')?.value || '',
        propostaEntradaParcelas: document.getElementById('propostaEntradaParcelas')?.value || '',
        propostaParcelasValor: document.getElementById('propostaParcelasValor')?.value || '',
        propostaParcelasQtd: document.getElementById('propostaParcelasQtd')?.value || '',
        propostaReforcoValor: document.getElementById('propostaReforcoValor')?.value || '',
        propostaReforcoQtd: document.getElementById('propostaReforcoQtd')?.value || ''
    };
    
    // Carregar cenários existentes
    const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
    
    if (editingScenarioId) {
        // Atualizar cenário existente
        const scenarioIndex = scenarios.findIndex(s => s.id === editingScenarioId);
        if (scenarioIndex !== -1) {
            scenarios[scenarioIndex] = {
                ...scenarios[scenarioIndex],
                name: scenarioName,
                updatedAt: new Date().toISOString(),
                data: {
                    dadosGerais,
                    tabelaVendas,
                    propostaCliente
                }
            };
        }
        // Limpar flag de edição
        sessionStorage.removeItem('editingScenarioId');
    } else {
        // Criar novo cenário
        const scenario = {
            id: Date.now().toString(),
            name: scenarioName,
            createdAt: new Date().toISOString(),
            data: {
                dadosGerais,
                tabelaVendas,
                propostaCliente
            }
        };
        scenarios.push(scenario);
    }
    
    // Salvar no localStorage
    localStorage.setItem('scenarios', JSON.stringify(scenarios));
    
    // Também salvar os dados para que os resultados possam ser calculados imediatamente
    localStorage.setItem('dadosGerais', JSON.stringify(dadosGerais));
    localStorage.setItem('tabelaVendas', JSON.stringify(tabelaVendas));
    localStorage.setItem('propostaCliente', JSON.stringify(propostaCliente));
    
    // Feedback para o usuário
    const goToResults = confirm('Cenário salvo com sucesso! Deseja visualizar os resultados agora?');
    
    if (goToResults) {
        // Redirecionar para resultados
        window.location.href = 'resultados.html';
    } else {
        // Redirecionar para cenários
        window.location.href = 'cenarios.html';
    }
}

// Save and analyze function
function saveAndAnalyze() {
    // Collect all form data
    const scenarioData = {
        name: document.getElementById('scenarioName').value,
        // Dados Gerais
        cliente: document.getElementById('cliente')?.value || '',
        imobiliaria: document.getElementById('imobiliaria')?.value || '',
        incorporadora: document.getElementById('incorporadora')?.value || '',
        empreendimento: document.getElementById('empreendimento')?.value || '',
        unidade: document.getElementById('unidade')?.value || '',
        areaPrivativa: document.getElementById('areaPrivativa')?.value || '',
        tmaAno: document.getElementById('tmaAno')?.value || '',
        tmaMes: document.getElementById('tmaMes')?.value || '',
        // Tabela de Vendas
        valorImovel: document.getElementById('valorImovel')?.value || '',
        // Entrada
        entradaValor: document.getElementById('entradaValor')?.value || '',
        entradaPercent: document.getElementById('entradaPercent')?.value || '',
        entradaParcelas: document.getElementById('entradaParcelas')?.value || '',
        // Parcelas
        parcelasValor: document.getElementById('parcelasValor')?.value || '',
        parcelasPercent: document.getElementById('parcelasPercent')?.value || '',
        parcelasQtd: document.getElementById('parcelasQtd')?.value || '',
        // Reforço
        reforcoValor: document.getElementById('reforcoValor')?.value || '',
        reforcoPercent: document.getElementById('reforcoPercent')?.value || '',
        reforcoQtd: document.getElementById('reforcoQtd')?.value || '',
        // Proposta Cliente
        propostaValor: document.getElementById('propostaValor')?.value || '',
        timestamp: new Date().toISOString()
    };

    // Save to localStorage
    const scenarios = JSON.parse(localStorage.getItem('modelai_scenarios') || '[]');
    scenarios.push(scenarioData);
    localStorage.setItem('modelai_scenarios', JSON.stringify(scenarios));

    // Show success message
    alert('Cenário salvo com sucesso! Redirecionando para os resultados...');
    
    // Redirect to results
    window.location.href = 'resultados.html';
}

// Load saved data if editing
function loadSavedData() {
    const editingScenarioId = sessionStorage.getItem('editingScenarioId');
    
    if (editingScenarioId) {
        // Carregar dados gerais
        const dadosGerais = JSON.parse(localStorage.getItem('dadosGerais') || '{}');
        const tabelaVendas = JSON.parse(localStorage.getItem('tabelaVendas') || '{}');
        const propostaCliente = JSON.parse(localStorage.getItem('propostaCliente') || '{}');
        
        // Preencher formulário com dados gerais
        if (dadosGerais.cliente) document.getElementById('cliente').value = dadosGerais.cliente;
        if (dadosGerais.imobiliaria) document.getElementById('imobiliaria').value = dadosGerais.imobiliaria;
        if (dadosGerais.incorporadora) document.getElementById('incorporadora').value = dadosGerais.incorporadora;
        if (dadosGerais.empreendimento) document.getElementById('empreendimento').value = dadosGerais.empreendimento;
        if (dadosGerais.unidade) document.getElementById('unidade').value = dadosGerais.unidade;
        if (dadosGerais.areaPrivativa) document.getElementById('areaPrivativa').value = dadosGerais.areaPrivativa;
        if (dadosGerais.tmaAno) document.getElementById('tmaAno').value = dadosGerais.tmaAno;
        
        // Preencher tabela de vendas
        if (tabelaVendas.vendaEntradaValor) document.getElementById('vendaEntradaValor').value = tabelaVendas.vendaEntradaValor;
        if (tabelaVendas.vendaEntradaParcelas) document.getElementById('vendaEntradaParcelas').value = tabelaVendas.vendaEntradaParcelas;
        if (tabelaVendas.vendaParcelasValor) document.getElementById('vendaParcelasValor').value = tabelaVendas.vendaParcelasValor;
        if (tabelaVendas.vendaParcelasQtd) document.getElementById('vendaParcelasQtd').value = tabelaVendas.vendaParcelasQtd;
        if (tabelaVendas.vendaReforcoValor) document.getElementById('vendaReforcoValor').value = tabelaVendas.vendaReforcoValor;
        if (tabelaVendas.vendaReforcoQtd) document.getElementById('vendaReforcoQtd').value = tabelaVendas.vendaReforcoQtd;
        if (tabelaVendas.vendaBemMovelImovel) document.getElementById('vendaBemMovelImovel').value = tabelaVendas.vendaBemMovelImovel;
        if (tabelaVendas.vendaDesagio) document.getElementById('vendaDesagio').value = tabelaVendas.vendaDesagio;
        
        // Preencher proposta cliente
        if (propostaCliente.mesVenda) document.getElementById('mesVenda').value = propostaCliente.mesVenda;
        if (propostaCliente.propostaEntradaValor) document.getElementById('propostaEntradaValor').value = propostaCliente.propostaEntradaValor;
        if (propostaCliente.propostaEntradaParcelas) document.getElementById('propostaEntradaParcelas').value = propostaCliente.propostaEntradaParcelas;
        if (propostaCliente.propostaParcelasValor) document.getElementById('propostaParcelasValor').value = propostaCliente.propostaParcelasValor;
        if (propostaCliente.propostaParcelasQtd) document.getElementById('propostaParcelasQtd').value = propostaCliente.propostaParcelasQtd;
        if (propostaCliente.propostaReforcoValor) document.getElementById('propostaReforcoValor').value = propostaCliente.propostaReforcoValor;
        if (propostaCliente.propostaReforcoQtd) document.getElementById('propostaReforcoQtd').value = propostaCliente.propostaReforcoQtd;
        
        // Carregar nome do cenário apenas se estiver editando
        const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
        const scenario = scenarios.find(s => s.id === editingScenarioId);
        if (scenario && document.getElementById('scenarioName')) {
            document.getElementById('scenarioName').value = scenario.name;
        }
        
        // NÃO limpar a flag aqui - será limpa ao salvar
    } else {
        // Se não está editando, garantir que todos os campos estejam limpos
        clearAllFields();
    }
}

// Função para limpar todos os campos quando não está editando
function clearAllFields() {
    // Limpar dados gerais
    const generalFields = ['cliente', 'imobiliaria', 'incorporadora', 'empreendimento', 'unidade', 'areaPrivativa', 'tmaAno', 'tmaMes'];
    generalFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    // Limpar tabela de vendas
    const vendaFields = ['vendaEntradaValor', 'vendaEntradaParcelas', 'vendaParcelasValor', 'vendaParcelasQtd', 
                        'vendaReforcoValor', 'vendaReforcoQtd', 'vendaBemMovelImovel', 'vendaDesagio'];
    vendaFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    // Limpar proposta cliente
    const propostaFields = ['mesVenda', 'propostaEntradaValor', 'propostaEntradaParcelas', 'propostaParcelasValor', 
                           'propostaParcelasQtd', 'propostaReforcoValor', 'propostaReforcoQtd'];
    propostaFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    // Limpar nome do cenário
    const scenarioNameField = document.getElementById('scenarioName');
    if (scenarioNameField) scenarioNameField.value = '';
    
    // Limpar dados do localStorage que não devem estar quando não editando
    localStorage.removeItem('dadosGerais');
    localStorage.removeItem('tabelaVendas');
    localStorage.removeItem('propostaCliente');
    sessionStorage.removeItem('currentScenarioId');
}
// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    
    // Executar cálculos iniciais após um pequeno delay para garantir que DOM está pronto
    setTimeout(() => {
        calculateTMAMes();
        calculateVendaValorPorParcela();
        calculateValorImovel();
        calculatePropostaEntradaValorPorParcela();
        calculatePropostaParcelasValorPorParcela();
        calculatePropostaReforcoValorPorParcela();
        calculatePropostaTotal();
        updateResumos();
    }, 100);
    
    // Event listeners para TMA
    const tmaAnoInput = document.getElementById('tmaAno');
    if (tmaAnoInput) {
        tmaAnoInput.addEventListener('input', calculateTMAMes);
        tmaAnoInput.addEventListener('change', calculateTMAMes);
    }
    
    // Tabela de Vendas event listeners
    const vendaEntradaValorEl = document.getElementById('vendaEntradaValor');
    const vendaEntradaParcelasEl = document.getElementById('vendaEntradaParcelas');
    const vendaParcelasValorEl = document.getElementById('vendaParcelasValor');
    const vendaParcelasQtdEl = document.getElementById('vendaParcelasQtd');
    const vendaReforcoValorEl = document.getElementById('vendaReforcoValor');
    const vendaReforcoQtdEl = document.getElementById('vendaReforcoQtd');
    
    if (vendaEntradaValorEl) {
        vendaEntradaValorEl.addEventListener('blur', function() {
            formatInputValue(this);
            calculateVendaValorPorParcela();
            calculateValorImovel();
        });
        vendaEntradaValorEl.addEventListener('input', function() {
            calculateVendaValorPorParcela();
            calculateValorImovel();
        });
    }
    
    if (vendaEntradaParcelasEl) {
        vendaEntradaParcelasEl.addEventListener('input', function() {
            calculateVendaValorPorParcela();
        });
    }
    
    if (vendaParcelasValorEl) {
        vendaParcelasValorEl.addEventListener('blur', function() {
            formatInputValue(this);
            calculateVendaValorPorParcela();
            calculateValorImovel();
        });
        vendaParcelasValorEl.addEventListener('input', function() {
            calculateVendaValorPorParcela();
            calculateValorImovel();
        });
    }
    
    if (vendaParcelasQtdEl) {
        vendaParcelasQtdEl.addEventListener('input', function() {
            calculateVendaValorPorParcela();
        });
    }
    
    if (vendaReforcoValorEl) {
        vendaReforcoValorEl.addEventListener('blur', function() {
            formatInputValue(this);
            calculateVendaValorPorParcela();
            calculateValorImovel();
        });
        vendaReforcoValorEl.addEventListener('input', function() {
            calculateVendaValorPorParcela();
            calculateValorImovel();
        });
    }
    
    if (vendaReforcoQtdEl) {
        vendaReforcoQtdEl.addEventListener('input', function() {
            calculateVendaValorPorParcela();
        });
    }
    
    // Nas Chaves event listeners for Tabela de Vendas
    const vendaBemMovelImovelEl = document.getElementById('vendaBemMovelImovel');
    if (vendaBemMovelImovelEl) {
        vendaBemMovelImovelEl.addEventListener('blur', function() {
            formatInputValue(this);
            calculateValorImovel();
        });
        vendaBemMovelImovelEl.addEventListener('input', function() {
            calculateValorImovel();
        });
    }
    
    // Function to calculate Proposta Cliente total value and percentages
    function calculatePropostaTotal() {
        const entradaValorEl = document.getElementById('propostaEntradaValor');
        const parcelasValorEl = document.getElementById('propostaParcelasValor');
        const reforcoValorEl = document.getElementById('propostaReforcoValor');
        const bemMovelValorEl = document.getElementById('bemMovelImovel');
        const totalEl = document.getElementById('valorPropostaCalculado');
        
        if (!entradaValorEl || !parcelasValorEl || !reforcoValorEl || !bemMovelValorEl || !totalEl) return;
        
        const entradaValor = parseBRNumber(entradaValorEl.value);
        const parcelasValor = parseBRNumber(parcelasValorEl.value);
        const reforcoValor = parseBRNumber(reforcoValorEl.value);
        const bemMovelValor = parseBRNumber(bemMovelValorEl.value);
        
        const total = entradaValor + parcelasValor + reforcoValor + bemMovelValor;
        totalEl.textContent = formatCurrency(total);
        
        // Calculate percentages
        calculatePropostaPercentages(total);
    }
    
    // Function to calculate Proposta Cliente percentages
    function calculatePropostaPercentages(total) {
        const entradaValorEl = document.getElementById('propostaEntradaValor');
        const parcelasValorEl = document.getElementById('propostaParcelasValor');
        const reforcoValorEl = document.getElementById('propostaReforcoValor');
        const bemMovelValorEl = document.getElementById('bemMovelImovel');
        
        const entradaPercentEl = document.getElementById('propostaEntradaPercent');
        const parcelasPercentEl = document.getElementById('propostaParcelasPercent');
        const reforcoPercentEl = document.getElementById('propostaReforcoPercent');
        const bemMovelPercentEl = document.getElementById('bemMovelImovelPercent');
        
        if (!entradaValorEl || !parcelasValorEl || !reforcoValorEl || !bemMovelValorEl) return;
        if (!entradaPercentEl || !parcelasPercentEl || !reforcoPercentEl || !bemMovelPercentEl) return;
        
        // Calculate total if not provided
        if (!total) {
            const entradaValor = parseBRNumber(entradaValorEl.value);
            const parcelasValor = parseBRNumber(parcelasValorEl.value);
            const reforcoValor = parseBRNumber(reforcoValorEl.value);
            const bemMovelValor = parseBRNumber(bemMovelValorEl.value);
            total = entradaValor + parcelasValor + reforcoValor + bemMovelValor;
        }
        
        if (total > 0) {
            const entradaValor = parseBRNumber(entradaValorEl.value);
            const parcelasValor = parseBRNumber(parcelasValorEl.value);
            const reforcoValor = parseBRNumber(reforcoValorEl.value);
            const bemMovelValor = parseBRNumber(bemMovelValorEl.value);
            
            const entradaPercent = (entradaValor / total) * 100;
            const parcelasPercent = (parcelasValor / total) * 100;
            const reforcoPercent = (reforcoValor / total) * 100;
            const bemMovelPercent = (bemMovelValor / total) * 100;
            
            entradaPercentEl.value = entradaPercent.toFixed(1) + '%';
            parcelasPercentEl.value = parcelasPercent.toFixed(1) + '%';
            reforcoPercentEl.value = reforcoPercent.toFixed(1) + '%';
            bemMovelPercentEl.value = bemMovelPercent.toFixed(1) + '%';
        } else {
            entradaPercentEl.value = '0%';
            parcelasPercentEl.value = '0%';
            reforcoPercentEl.value = '0%';
            bemMovelPercentEl.value = '0%';
        }
        
        // Update the total display
        const totalEl = document.getElementById('valorPropostaCalculado');
        if (totalEl) {
            totalEl.textContent = formatCurrency(total);
        }
    }
    
    // Function to calculate valor por parcela for entrada
    function calculatePropostaEntradaValorPorParcela() {
        const valorEl = document.getElementById('propostaEntradaValor');
        const parcelasEl = document.getElementById('propostaEntradaParcelas');
        const valorPorParcelaEl = document.getElementById('propostaEntradaValorParcela');
        
        if (!valorEl || !parcelasEl || !valorPorParcelaEl) return;
        
        const valor = parseBRNumber(valorEl.value);
        const parcelas = parseInt(parcelasEl.value) || 1;
        
        if (valor > 0 && parcelas > 0) {
            const valorPorParcela = valor / parcelas;
            valorPorParcelaEl.value = formatBRNumber(valorPorParcela);
        } else {
            valorPorParcelaEl.value = formatBRNumber(0);
        }
    }
    
    // Function to calculate valor por parcela for parcelas
    function calculatePropostaParcelasValorPorParcela() {
        const valorEl = document.getElementById('propostaParcelasValor');
        const parcelasEl = document.getElementById('propostaParcelasQtd');
        const valorPorParcelaEl = document.getElementById('propostaParcelasValorParcela');
        
        if (!valorEl || !parcelasEl || !valorPorParcelaEl) return;
        
        const valor = parseBRNumber(valorEl.value);
        const parcelas = parseInt(parcelasEl.value) || 1;
        
        if (valor > 0 && parcelas > 0) {
            const valorPorParcela = valor / parcelas;
            valorPorParcelaEl.value = formatBRNumber(valorPorParcela);
        } else {
            valorPorParcelaEl.value = formatBRNumber(0);
        }
    }
    
    // Function to calculate valor por parcela for reforco
    function calculatePropostaReforcoValorPorParcela() {
        const valorEl = document.getElementById('propostaReforcoValor');
        const parcelasEl = document.getElementById('propostaReforcoQtd');
        const valorPorParcelaEl = document.getElementById('propostaReforcoValorParcela');
        
        if (!valorEl || !parcelasEl || !valorPorParcelaEl) return;
        
        const valor = parseBRNumber(valorEl.value);
        const parcelas = parseInt(parcelasEl.value) || 1;
        
        if (valor > 0 && parcelas > 0) {
            const valorPorParcela = valor / parcelas;
            valorPorParcelaEl.value = formatBRNumber(valorPorParcela);
        } else {
            valorPorParcelaEl.value = formatBRNumber(0);
        }
    }
    
    // Calculate initial values for Tabela de Vendas
    calculateVendaValorPorParcela();
    calculateValorImovel();
    
    // Proposta Cliente event listeners
    const propostaEntradaValorEl = document.getElementById('propostaEntradaValor');
    const propostaEntradaParcelasEl = document.getElementById('propostaEntradaParcelas');
    const propostaParcelasValorEl = document.getElementById('propostaParcelasValor');
    const propostaParcelasQtdEl = document.getElementById('propostaParcelasQtd');
    const propostaReforcoValorEl = document.getElementById('propostaReforcoValor');
    const propostaReforcoQtdEl = document.getElementById('propostaReforcoQtd');
    const bemMovelImovelEl = document.getElementById('bemMovelImovel');
    
    // Entrada event listeners
    if (propostaEntradaValorEl) {
        propostaEntradaValorEl.addEventListener('blur', function() {
            formatInputValue(this);
            calculatePropostaTotal();
            calculatePropostaEntradaValorPorParcela();
        });
        propostaEntradaValorEl.addEventListener('input', function() {
            calculatePropostaTotal();
            calculatePropostaEntradaValorPorParcela();
        });
    }
    
    if (propostaEntradaParcelasEl) {
        propostaEntradaParcelasEl.addEventListener('input', function() {
            calculatePropostaEntradaValorPorParcela();
        });
    }
    
    // Parcelas event listeners
    if (propostaParcelasValorEl) {
        propostaParcelasValorEl.addEventListener('blur', function() {
            formatInputValue(this);
            calculatePropostaTotal();
            calculatePropostaParcelasValorPorParcela();
        });
        propostaParcelasValorEl.addEventListener('input', function() {
            calculatePropostaTotal();
            calculatePropostaParcelasValorPorParcela();
        });
    }
    
    if (propostaParcelasQtdEl) {
        propostaParcelasQtdEl.addEventListener('input', function() {
            calculatePropostaParcelasValorPorParcela();
        });
    }
    
    // Reforco event listeners
    if (propostaReforcoValorEl) {
        propostaReforcoValorEl.addEventListener('blur', function() {
            formatInputValue(this);
            calculatePropostaTotal();
            calculatePropostaReforcoValorPorParcela();
        });
        propostaReforcoValorEl.addEventListener('input', function() {
            calculatePropostaTotal();
            calculatePropostaReforcoValorPorParcela();
        });
    }
    
    if (propostaReforcoQtdEl) {
        propostaReforcoQtdEl.addEventListener('input', function() {
            calculatePropostaReforcoValorPorParcela();
        });
    }
    
    if (bemMovelImovelEl) {
        bemMovelImovelEl.addEventListener('blur', function() {
            formatInputValue(this);
            calculatePropostaTotal();
        });
        bemMovelImovelEl.addEventListener('input', function() {
            calculatePropostaTotal();
        });
    }
    
    // Calculate initial values for Proposta Cliente
    calculatePropostaTotal();
    calculatePropostaEntradaValorPorParcela();
    calculatePropostaParcelasValorPorParcela();
    calculatePropostaReforcoValorPorParcela();
    
    // Não carregar dados automaticamente - apenas quando explicitamente editando
});

// ==================== FUNÇÕES DE CENÁRIO ====================

// Função para atualizar cenário existente (modo edição)
async function updateExistingScenario() {
    
    
    const editingScenario = sessionStorage.getItem('editingScenario');
    if (!editingScenario) {
        console.error('❌ Cenário em edição não encontrado');
        showError('Erro: dados do cenário não encontrados');
        return;
    }
    
    try {
        const scenario = JSON.parse(editingScenario);
        
        
        // 1. Coletar dados dos inputs atuais
        const data = collectAllInputData();
        
        
        // 2. Calcular todos os indicadores com os novos dados
        let results = null;
        try {
            results = calculateAllIndicators(data);
            
        } catch (calcError) {
            console.warn('⚠️ Erro no cálculo dos indicadores:', calcError.message);
            showError('Aviso: Cenário atualizado, mas alguns cálculos podem estar incompletos: ' + calcError.message);
        }
        
        // 3. Preparar payload para atualização
        const payload = {
            name: scenario.name, // Manter nome original
            description: scenario.description || `Cenário atualizado em ${new Date().toLocaleDateString('pt-BR')}`,
            data: data,
            results: results,
            lastModified: new Date().toISOString()
        };
        
        
        
        // Verificar se temos um ID válido
        if (!scenario._id) {
            console.error('❌ ID do cenário não encontrado:', scenario);
            showError('Erro: ID do cenário não encontrado. Criando novo cenário...');
            // Fallback: criar novo cenário
            await saveScenarioWithName(scenario.name || 'Cenário Editado');
            return;
        }
        
        
        
        // 4. Enviar atualização para o backend
        const response = await fetch(`/api/scenarios/${scenario._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const result = await response.json();
            
            
            // Salvar dados necessários para exibição dos resultados
            sessionStorage.setItem('currentInputData', JSON.stringify(data));
            sessionStorage.setItem('currentScenarioName', scenario.name);
            sessionStorage.setItem('currentScenarioId', scenario._id);
            
            // Também salvar no formato antigo para compatibilidade
            const updatedScenario = {
                ...result,
                data: data,
                results: results
            };
            
            sessionStorage.setItem('resultadosData', JSON.stringify(updatedScenario));
            sessionStorage.setItem('lastScenarioData', JSON.stringify(updatedScenario));
            
            console.log('💾 Dados salvos no sessionStorage após atualização:', {
                currentInputData: !!data,
                currentScenarioName: scenario.name,
                currentScenarioId: scenario._id
            });
            
            // Limpar dados de edição
            sessionStorage.removeItem('editingScenario');
            
            showSuccess('Cenário atualizado com sucesso!');
            
            // Redirecionar para resultados
            setTimeout(() => {
                window.location.href = 'resultados.html';
            }, 1500);
            
        } else {
            const error = await response.text();
            console.error('❌ Erro na atualização:', error);
            showError('Erro ao atualizar cenário: ' + error);
        }
        
    } catch (error) {
        console.error('❌ Erro ao processar atualização:', error);
        showError('Erro ao processar atualização: ' + error.message);
    }
}

function saveScenario() {
    
    
    try {
        // Limpar modo de edição se existir (garante que é um novo cenário)
        sessionStorage.removeItem('editingScenario');
        
        
        // Coletar todos os dados dos inputs
        const scenarioData = collectAllInputData();
        
        if (!scenarioData) {
            showError('Erro ao coletar dados dos inputs');
            return;
        }
        
        // Salvar no sessionStorage
        sessionStorage.setItem('currentInputData', JSON.stringify(scenarioData));
        
        // Abrir modal para nome do cenário
        openScenarioModal();
        
    } catch (error) {
        console.error('Erro ao salvar cenário:', error);
        showError('Erro ao preparar dados para salvamento');
    }
}


// ==================== FUNÇÕES DE CENÁRIO ====================

function openScenarioModal() {
    // Verificar se estamos na página de inputs
    const modal = document.getElementById('scenarioModal');
    if (modal) {
        modal.classList.remove('hidden');
        const input = document.getElementById('scenarioNameInput');
        if (input) {
            input.value = '';
            input.focus();
        }
    } else {
        // Se não há modal na página, criar um simples
        const name = prompt('Digite o nome do cenário:');
        if (name && name.trim()) {
            saveScenarioWithName(name.trim());
        }
    }
}

function closeScenarioModal() {
    const modal = document.getElementById('scenarioModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function confirmSaveScenarioFromInputs() {
    const nameInput = document.getElementById('scenarioNameInput');
    const name = nameInput?.value?.trim();
    
    if (!name) {
        showError('Digite um nome para o cenário');
        return;
    }
    
    closeScenarioModal();
    await saveScenarioWithName(name);
}

async function saveScenarioWithName(name) {
    try {
        
        
        // 1. Coletar dados dos inputs
        const data = collectAllInputData();
        
        
        // 2. Calcular todos os indicadores
        let results = null;
        try {
            results = calculateAllIndicators(data);
            
        } catch (calcError) {
            console.warn('⚠️ Erro no cálculo dos indicadores:', calcError.message);
            showError('Aviso: Cenário salvo, mas alguns cálculos podem estar incompletos: ' + calcError.message);
        }
        
        // 3. Preparar payload para o backend
        const payload = {
            name: name,
            description: `Cenário criado em ${new Date().toLocaleDateString('pt-BR')}`,
            data: data,
            results: results
        };
        
        
        
        // 4. Enviar para o backend
        const response = await fetch('/api/scenarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const result = await response.json();
            
            showSuccess('Cenário salvo com sucesso! Cálculos realizados.');
            
            // Retornar o resultado para uso posterior
            return result.scenario || result;
        } else {
            const error = await response.json();
            console.error('❌ Erro da API:', error);
            showError(error.message || 'Erro ao salvar cenário');
            throw new Error(error.message || 'Erro ao salvar cenário');
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar cenário:', error);
        showError('Erro ao salvar cenário. Tente novamente.');
    }
}

// ==================== INTEGRAÇÃO COM CENÁRIOS ====================

// Initialize page with scenario data ONLY if editing
document.addEventListener('DOMContentLoaded', function() {
    
    // Verificar se veio através de navegação direta (novo cenário) ou de edição
    const referrer = document.referrer;
    const cameFromScenarios = referrer.includes('cenarios.html');
    
    
    // Verificar todas as chaves do sessionStorage
    
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        
    }
    
    // ONLY load scenario data if explicitly editing AND came from scenarios page
    const editingScenario = sessionStorage.getItem('editingScenario');
    
    if (editingScenario && cameFromScenarios) {
        try {
            const scenario = JSON.parse(editingScenario);
            
            
            
            
            // ✅ MODO EDIÇÃO - Cenário existe e veio de cenarios.html
            
            
            loadScenarioData(scenario.data);
            showInfo(`Editando cenário: ${scenario.name}`);
            
            // Atualizar texto do botão para "Atualizar Cenário"
            const saveButton = document.querySelector('button[onclick="saveScenario()"]');
            if (saveButton) {
                const span = saveButton.querySelector('span');
                if (span) {
                    span.textContent = 'Atualizar Cenário';
                }
                saveButton.setAttribute('onclick', 'updateScenario()');
                
            } else {
                
            }
            
            // NÃO remover o editingScenario aqui - manter até salvar/cancelar
            
        } catch (error) {
            console.error('❌ ERRO ao carregar cenário para edição:', error);
            console.error('❌ Dados que causaram erro:', editingScenario);
            sessionStorage.removeItem('editingScenario');
            setupCreateMode();
        }
    } else {
        
        // Se não veio de cenarios.html, limpar dados de edição e configurar modo criação
        if (!cameFromScenarios && editingScenario) {
            
            sessionStorage.removeItem('editingScenario');
        }
        setupCreateMode();
    }
});

function setupCreateMode() {
    
    // Garantir que o botão esteja configurado para salvar novo cenário
    const saveButton = document.querySelector('button[onclick="saveScenario()"], button[onclick="updateScenario()"]');
    if (saveButton) {
        // Atualizar o span interno e o onclick
        const span = saveButton.querySelector('span');
        if (span) {
            span.textContent = 'Salvar Cenário';
        }
        saveButton.setAttribute('onclick', 'saveScenario()');
        console.log('✅ Botão configurado para saveScenario (novo cenário)');
    } else {
        
    }
    
    // Limpar qualquer dado residual
    sessionStorage.removeItem('editingScenario');
    
    // Inicializar o botão para a aba ativa
    const activeTab = document.querySelector('.subtab-btn.active');
    if (activeTab) {
        const tabId = activeTab.getAttribute('data-tab');
        updateActionButton(tabId);
    }
    
    
}

// Função para resetar para modo de criação (pode ser chamada manualmente)
function resetToCreateMode() {
    
    sessionStorage.removeItem('editingScenario');
    setupCreateMode();
    showInfo('Modo de criação ativado - agora você pode criar um novo cenário');
}

// Function to collect all input data
function collectAllInputData() {
    
    
    // Função auxiliar para debugar cada campo
    function getFieldValue(id, parser = (v) => v || '') {
        const element = document.getElementById(id);
        const exists = !!element;
        const value = element?.value;
        
        
        
        console.log(`  📝 Valor bruto: "${value}" (tipo: ${typeof value})`);
        
        if (!exists) {
            
            return '';
        }
        
        if (value === undefined || value === null || value === '') {
            
            return parser('') || 0;
        }
        
        try {
            const parsed = parser(value);
            console.log(`  ✅ Valor parseado: ${parsed} (tipo: ${typeof parsed})`);
            return parsed;
        } catch (error) {
            
            return '';
        }
    }

    // Parser universal para números
    function parseNumberUniversal(value) {
        if (!value && value !== 0) return 0;
        
        let str = String(value);
        
        // Remove R$ e espaços
        str = str.replace(/R\$\s*/g, '');
        
        // Remove pontos dos milhares mas preserva vírgula decimal
        str = str.replace(/\.(?=\d{3})/g, '');
        
        // Substitui vírgula por ponto
        str = str.replace(',', '.');
        
        // Remove qualquer caractere não numérico exceto ponto e sinal negativo
        str = str.replace(/[^\d.-]/g, '');
        
        return parseFloat(str) || 0;
    }

    const data = {
        // DADOS GERAIS (8 campos)
        dadosGerais: {
            cliente: getFieldValue('cliente', (v) => v || ''),
            imobiliaria: getFieldValue('imobiliaria', (v) => v || ''),
            incorporadora: getFieldValue('incorporadora', (v) => v || ''),
            empreendimento: getFieldValue('empreendimento', (v) => v || ''),
            unidade: getFieldValue('unidade', (v) => v || ''),
            areaPrivativa: getFieldValue('areaPrivativa', parseNumberUniversal),
            tmaAno: getFieldValue('tmaAno', parseNumberUniversal),
            tmaMes: getFieldValue('tmaMes', parseNumberUniversal)
        },
        
        // TABELA DE VENDAS (16 campos)
        tabelaVendas: {
            // Entrada (4 campos)
            entradaValor: getFieldValue('vendaEntradaValor', parseNumberUniversal),
            entradaPercent: getFieldValue('vendaEntradaPercent', parseNumberUniversal),
            entradaParcelas: getFieldValue('vendaEntradaParcelas', parseNumberUniversal),
            entradaValorParcela: getFieldValue('vendaEntradaValorParcela', parseNumberUniversal),
            
            // Parcelas (4 campos)
            parcelasValor: getFieldValue('vendaParcelasValor', parseNumberUniversal),
            parcelasPercent: getFieldValue('vendaParcelasPercent', parseNumberUniversal),
            parcelasQtd: getFieldValue('vendaParcelasQtd', parseNumberUniversal),
            parcelasValorParcela: getFieldValue('vendaParcelasValorParcela', parseNumberUniversal),
            
            // Reforço (5 campos)
            reforcoValor: getFieldValue('vendaReforcoValor', parseNumberUniversal),
            reforcoPercent: getFieldValue('vendaReforcoPercent', parseNumberUniversal),
            reforcoQtd: getFieldValue('vendaReforcoQtd', parseNumberUniversal),
            reforcoFrequencia: getFieldValue('vendaReforcoFrequencia', parseNumberUniversal),
            reforcoValorParcela: getFieldValue('vendaReforcoValorParcela', parseNumberUniversal),
            
            // Outros (4 campos)
            bemMovelImovel: getFieldValue('vendaBemMovelImovel', parseNumberUniversal),
            bemMovelImovelMes: getFieldValue('vendaBemMovelImovelMes', parseNumberUniversal),
            bemMovelImovelPercent: getFieldValue('vendaBemMovelImovelPercent', parseNumberUniversal),
            desagio: getFieldValue('vendaDesagio', parseNumberUniversal)
        },
        
        // PROPOSTA CLIENTE (17 campos)
        propostaCliente: {
            mesVenda: getFieldValue('mesVenda', parseNumberUniversal),
            
            // Entrada (4 campos)
            entradaValor: getFieldValue('propostaEntradaValor', parseNumberUniversal),
            entradaPercent: getFieldValue('propostaEntradaPercent', parseNumberUniversal),
            entradaParcelas: getFieldValue('propostaEntradaParcelas', parseNumberUniversal),
            entradaValorParcela: getFieldValue('propostaEntradaValorParcela', parseNumberUniversal),
            
            // Parcelas (4 campos)
            parcelasValor: getFieldValue('propostaParcelasValor', parseNumberUniversal),
            parcelasPercent: getFieldValue('propostaParcelasPercent', parseNumberUniversal),
            parcelasQtd: getFieldValue('propostaParcelasQtd', parseNumberUniversal),
            parcelasValorParcela: getFieldValue('propostaParcelasValorParcela', parseNumberUniversal),
            
            // Reforço (5 campos)
            reforcoValor: getFieldValue('propostaReforcoValor', parseNumberUniversal),
            reforcoPercent: getFieldValue('propostaReforcoPercent', parseNumberUniversal),
            reforcoQtd: getFieldValue('propostaReforcoQtd', parseNumberUniversal),
            reforcoFrequencia: getFieldValue('propostaReforcoFrequencia', parseNumberUniversal),
            reforcoValorParcela: getFieldValue('propostaReforcoValorParcela', parseNumberUniversal),
            
            // Outros (3 campos)
            bemMovelImovel: getFieldValue('bemMovelImovel', parseNumberUniversal),
            bemMovelImovelPercent: getFieldValue('bemMovelImovelPercent', parseNumberUniversal),
            desagio: getFieldValue('desagio', parseNumberUniversal)
        }
    };
    
    
    console.log('👥 Dados Gerais:', Object.keys(data.dadosGerais).length, 'campos');
    console.log('📊 Tabela Vendas:', Object.keys(data.tabelaVendas).length, 'campos');
    console.log('🤝 Proposta Cliente:', Object.keys(data.propostaCliente).length, 'campos');
    console.log('� Total de campos:', 
        Object.keys(data.dadosGerais).length + 
        Object.keys(data.tabelaVendas).length + 
        Object.keys(data.propostaCliente).length);
    
    
    return data;
}

// Function to load scenario data into inputs
function loadScenarioData(data) {
    
    
    
    if (!data) {
        
        return;
    }
    
    
    
    // Função auxiliar para formatar números em formato brasileiro
    function formatBRNumber(value) {
        if (!value && value !== 0) return '';
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    // DADOS GERAIS (8 campos)
    if (data.dadosGerais) {
        
        const dg = data.dadosGerais;
        
        const campos = [
            'cliente', 'imobiliaria', 'incorporadora', 'empreendimento', 
            'unidade', 'areaPrivativa', 'tmaAno', 'tmaMes'
        ];
        
        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento && dg[campo] !== undefined) {
                if (campo === 'areaPrivativa' || campo === 'tmaAno' || campo === 'tmaMes') {
                    elemento.value = dg[campo] || '';
                } else {
                    elemento.value = dg[campo] || '';
                }
                
            } else if (!elemento) {
                
            }
        });
    } else {
        
    }
    
    // TABELA DE VENDAS (15 campos)
    if (data.tabelaVendas) {
        
        const tv = data.tabelaVendas;
        
        // Entrada (4 campos)
        ['entradaValor', 'entradaPercent', 'entradaParcelas', 'entradaValorParcela'].forEach(field => {
            const elementId = 'venda' + field.charAt(0).toUpperCase() + field.slice(1);
            const element = document.getElementById(elementId);
            if (element && tv[field] !== undefined) {
                if (field.includes('Valor') && !field.includes('Parcela')) {
                    element.value = formatBRNumber(tv[field]);
                } else if (field.includes('Percent')) {
                    element.value = tv[field] ? tv[field] + '%' : '';
                } else {
                    element.value = tv[field] || '';
                }
                
            }
        });
        
        // Parcelas (4 campos)
        ['parcelasValor', 'parcelasPercent', 'parcelasQtd', 'parcelasValorParcela'].forEach(field => {
            const elementId = 'venda' + field.charAt(0).toUpperCase() + field.slice(1);
            const element = document.getElementById(elementId);
            if (element && tv[field] !== undefined) {
                if (field.includes('Valor') && !field.includes('Parcela')) {
                    element.value = formatBRNumber(tv[field]);
                } else if (field.includes('Percent')) {
                    element.value = tv[field] ? tv[field] + '%' : '';
                } else {
                    element.value = tv[field] || '';
                }
                
            }
        });
        
        // Reforço (5 campos)
        ['reforcoValor', 'reforcoPercent', 'reforcoQtd', 'reforcoFrequencia', 'reforcoValorParcela'].forEach(field => {
            const elementId = 'venda' + field.charAt(0).toUpperCase() + field.slice(1);
            const element = document.getElementById(elementId);
            if (element && tv[field] !== undefined) {
                if (field.includes('Valor') && !field.includes('Parcela')) {
                    element.value = formatBRNumber(tv[field]);
                } else if (field.includes('Percent')) {
                    element.value = tv[field] ? tv[field] + '%' : '';
                } else {
                    element.value = tv[field] || '';
                }
                
            }
        });
        
        // Outros (4 campos)
        if (document.getElementById('vendaBemMovelImovel') && tv.bemMovelImovel !== undefined) {
            document.getElementById('vendaBemMovelImovel').value = formatBRNumber(tv.bemMovelImovel);
        }
        if (document.getElementById('vendaBemMovelImovelMes') && tv.bemMovelImovelMes !== undefined) {
            document.getElementById('vendaBemMovelImovelMes').value = tv.bemMovelImovelMes || '';
        }
        if (document.getElementById('vendaBemMovelImovelPercent') && tv.bemMovelImovelPercent !== undefined) {
            document.getElementById('vendaBemMovelImovelPercent').value = tv.bemMovelImovelPercent ? tv.bemMovelImovelPercent + '%' : '';
        }
        if (document.getElementById('vendaDesagio') && tv.desagio !== undefined) {
            document.getElementById('vendaDesagio').value = tv.desagio || '';
        }
    } else {
        
    }
    
    // PROPOSTA CLIENTE (16 campos)
    if (data.propostaCliente) {
        
        const pc = data.propostaCliente;
        
        // Mês da venda
        if (document.getElementById('mesVenda') && pc.mesVenda !== undefined) {
            document.getElementById('mesVenda').value = pc.mesVenda || '';
        }
        
        // Entrada (4 campos)
        ['entradaValor', 'entradaPercent', 'entradaParcelas', 'entradaValorParcela'].forEach(field => {
            const elementId = 'proposta' + field.charAt(0).toUpperCase() + field.slice(1);
            const element = document.getElementById(elementId);
            if (element && pc[field] !== undefined) {
                if (field.includes('Valor') && !field.includes('Parcela')) {
                    element.value = formatBRNumber(pc[field]);
                } else if (field.includes('Percent')) {
                    element.value = pc[field] ? pc[field] + '%' : '';
                } else {
                    element.value = pc[field] || '';
                }
                
            }
        });
        
        // Parcelas (4 campos)
        ['parcelasValor', 'parcelasPercent', 'parcelasQtd', 'parcelasValorParcela'].forEach(field => {
            const elementId = 'proposta' + field.charAt(0).toUpperCase() + field.slice(1);
            const element = document.getElementById(elementId);
            if (element && pc[field] !== undefined) {
                if (field.includes('Valor') && !field.includes('Parcela')) {
                    element.value = formatBRNumber(pc[field]);
                } else if (field.includes('Percent')) {
                    element.value = pc[field] ? pc[field] + '%' : '';
                } else {
                    element.value = pc[field] || '';
                }
                
            }
        });
        
        // Reforço (5 campos)
        ['reforcoValor', 'reforcoPercent', 'reforcoQtd', 'reforcoFrequencia', 'reforcoValorParcela'].forEach(field => {
            const elementId = 'proposta' + field.charAt(0).toUpperCase() + field.slice(1);
            const element = document.getElementById(elementId);
            if (element && pc[field] !== undefined) {
                if (field.includes('Valor') && !field.includes('Parcela')) {
                    element.value = formatBRNumber(pc[field]);
                } else if (field.includes('Percent')) {
                    element.value = pc[field] ? pc[field] + '%' : '';
                } else {
                    element.value = pc[field] || '';
                }
                
            }
        });
        
        // Outros (3 campos)
        if (document.getElementById('bemMovelImovel') && pc.bemMovelImovel !== undefined) {
            document.getElementById('bemMovelImovel').value = formatBRNumber(pc.bemMovelImovel);
        }
        if (document.getElementById('bemMovelImovelPercent') && pc.bemMovelImovelPercent !== undefined) {
            document.getElementById('bemMovelImovelPercent').value = pc.bemMovelImovelPercent ? pc.bemMovelImovelPercent + '%' : '';
        }
        if (document.getElementById('desagio') && pc.desagio !== undefined) {
            document.getElementById('desagio').value = pc.desagio || '';
        }
    } else {
        
    }
    
}

// Function to update scenario (when editing)
async function updateScenario() {

    const editingScenario = sessionStorage.getItem('editingScenario');
    
    if (!editingScenario) {
        showError('Nenhum cenário em edição encontrado.');
        return;
    }
    
    // Verificar token de autenticação
    const token = localStorage.getItem('token');
    
    console.log('🔐 Token (primeiros 50 chars):', token ? token.substring(0, 50) + '...' : 'N/A');
    
    try {
        const scenario = JSON.parse(editingScenario);
        
        
        
        // 1. Coletar dados dos inputs
        const data = collectAllInputData();
        
        
        // 2. Calcular todos os indicadores
        let results = null;
        try {
            results = calculateAllIndicators(data);
            
        } catch (calcError) {
            console.warn('⚠️ Erro no cálculo dos indicadores:', calcError.message);
            showError('Aviso: Cenário atualizado, mas alguns cálculos podem estar incompletos: ' + calcError.message);
        }
        
        const requestBody = {
            name: scenario.name,
            description: scenario.description || `Cenário atualizado em ${new Date().toLocaleDateString('pt-BR')}`,
            data: data,
            results: results
        };
        
        
        const response = await fetch(`/api/scenarios/${scenario.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        
        if (response.ok) {
            const result = await response.json();
            
            showSuccess('Cenário atualizado com sucesso!');
            
            // Limpar modo de edição
            sessionStorage.removeItem('editingScenario');
            
            // Resetar para modo de criação
            setupCreateMode();
            
            // Redirecionar para cenários após 2 segundos
            setTimeout(() => {
                window.location.href = '/cenarios.html';
            }, 2000);
        } else {
            const errorText = await response.text();
            console.error('❌ Erro da API:', response.status, errorText);
            
            if (response.status === 401) {
                console.error('❌ Token inválido ou expirado - redirecionando para login');
                showError('Sessão expirada. Redirecionando para login...');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                return;
            }
            
            try {
                const error = JSON.parse(errorText);
                showError(error.message || 'Erro ao atualizar cenário');
            } catch {
                showError(`Erro ${response.status}: ${errorText}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao atualizar cenário:', error);
        showError('Erro ao atualizar cenário. Tente novamente.');
    }
}

// ================================
// FUNÇÕES DE CÁLCULO VPL E INDICADORES
// ================================

// Função para gerar o fluxo de caixa mensal
function generateCashFlow(data, tipo) {
    
    const fluxo = [];
    const MAX_MESES = 250;
    
    // Obter dados do tipo (tabela ou proposta)
    const dadosFluxo = tipo === 'tabela' ? data.tabelaVendas : data.propostaCliente;
    
    // Valores de entrada
    const entradaValor = dadosFluxo.entradaValor || 0;
    const entradaParcelas = dadosFluxo.entradaParcelas || 1;
    const entradaValorParcela = entradaValor / entradaParcelas;
    
    // Valores de parcelas
    const parcelasValor = dadosFluxo.parcelasValor || 0;
    const parcelasQtd = dadosFluxo.parcelasQtd || 0;
    const parcelasValorParcela = parcelasQtd > 0 ? parcelasValor / parcelasQtd : 0;
    
    // Valores de reforço
    const reforcoValor = dadosFluxo.reforcoValor || 0;
    const reforcoQtd = dadosFluxo.reforcoQtd || 0;
    const reforcoFrequencia = dadosFluxo.reforcoFrequencia || 6;
    const reforcoValorParcela = reforcoQtd > 0 ? reforcoValor / reforcoQtd : 0;
    
    // Valores "nas chaves" ou "bem móvel"
    const bemMovelValor = dadosFluxo.bemMovelImovel || 0;
    const bemMovelMes = tipo === 'tabela' ? dadosFluxo.bemMovelImovelMes : data.propostaCliente.mesVenda;
    
    console.log(`💰 Valores para ${tipo}:`, {
        entradaValorParcela, parcelasValorParcela, reforcoValorParcela, bemMovelValor, bemMovelMes
    });
    
    // Gerar fluxo mês a mês
    for (let mes = 1; mes <= MAX_MESES; mes++) {
        let valorMes = 0;
        
        // 1. ENTRADA (primeiros meses conforme quantidade de parcelas de entrada)
        if (mes <= entradaParcelas) {
            valorMes += entradaValorParcela;
        }
        
        // 2. PARCELAS (após entrada, durante quantidade de parcelas)
        const inicioParcelamento = entradaParcelas + 1;
        if (mes >= inicioParcelamento && mes < inicioParcelamento + parcelasQtd) {
            valorMes += parcelasValorParcela;
        }
        
        // 3. REFORÇO (a cada X meses conforme frequência)
        if (reforcoValorParcela > 0 && mes % reforcoFrequencia === 0) {
            // Verificar se ainda há parcelas de reforço disponíveis
            const parcelasReforcoJaPagas = Math.floor(mes / reforcoFrequencia);
            if (parcelasReforcoJaPagas <= reforcoQtd) {
                valorMes += reforcoValorParcela;
            }
        }
        
        // 4. BEM MÓVEL/NAS CHAVES (no mês específico)
        if (bemMovelMes && mes === bemMovelMes) {
            valorMes += bemMovelValor;
        }
        
        // Adicionar ao fluxo (apenas valores > 0 ou até onde há fluxo)
        if (valorMes > 0) {
            fluxo.push(valorMes);
        } else if (fluxo.length > 0 && mes > Math.max(inicioParcelamento + parcelasQtd, bemMovelMes || 0, reforcoQtd * reforcoFrequencia)) {
            // Parar quando não há mais fluxo esperado
            break;
        } else {
            fluxo.push(0);
        }
    }
    
    console.log(`Fluxo gerado para ${tipo}: ${fluxo.length} meses, soma total: ${fluxo.reduce((a, b) => a + b, 0)}`);
    return fluxo;
}

// Função para calcular VPL
function calculateVPL(fluxoDeCaixa, tmaMes) {
    
    if (!fluxoDeCaixa || fluxoDeCaixa.length === 0) {
        
        return 0;
    }
    
    let vpl = 0;
    const taxaDesconto = tmaMes / 100; // Converter de % para decimal
    
    fluxoDeCaixa.forEach((valor, index) => {
        if (valor > 0) {
            const valorPresente = valor / Math.pow(1 + taxaDesconto, index + 1);
            vpl += valorPresente;
            
            // Log para debug (apenas primeiros 12 meses)
            if (index < 12) {
                console.log(`Mês ${index + 1}: R$ ${valor.toFixed(2)} -> VP: R$ ${valorPresente.toFixed(2)}`);
            }
        }
    });
    
    return vpl;
}

// Função principal para calcular todos os indicadores
function calculateAllIndicators(data) {
    
    try {
        // 1. Verificar TMA
        const tmaMes = data.dadosGerais.tmaMes;
        if (!tmaMes || tmaMes <= 0) {
            throw new Error('TMA mensal não definida ou inválida');
        }
        
        // 2. Calcular valores totais
        const valorTotalTabela = (data.tabelaVendas.entradaValor || 0) + 
                                (data.tabelaVendas.parcelasValor || 0) + 
                                (data.tabelaVendas.reforcoValor || 0) + 
                                (data.tabelaVendas.bemMovelImovel || 0);
        
        const valorTotalProposta = (data.propostaCliente.entradaValor || 0) + 
                                  (data.propostaCliente.parcelasValor || 0) + 
                                  (data.propostaCliente.reforcoValor || 0) + 
                                  (data.propostaCliente.bemMovelImovel || 0);
        
        // 3. Calcular descontos nominais
        const descontoNominalPercent = valorTotalTabela > 0 ? 
            ((valorTotalProposta / valorTotalTabela) - 1) * 100 : 0;
        
        const descontoNominalReais = valorTotalTabela - valorTotalProposta;
        
        // 4. Gerar fluxos de caixa
        const fluxoTabela = generateCashFlow(data, 'tabela');
        const fluxoProposta = generateCashFlow(data, 'proposta');
        
        // 5. Calcular VPLs
        const vplTabela = calculateVPL(fluxoTabela, tmaMes);
        const vplProposta = calculateVPL(fluxoProposta, tmaMes);
        
        // 6. Calcular deltas
        const deltaVpl = vplProposta - vplTabela;
        
        // 7. Calcular % Delta VPL (com proteção SEERRO)
        let percentualDeltaVpl = 0;
        if (vplTabela !== 0) {
            percentualDeltaVpl = (deltaVpl / vplTabela) * 100;
        }
        
        const resultados = {
            valorTotalTabela,
            valorTotalProposta,
            descontoNominalPercent,
            descontoNominalReais,
            vplTabela,
            vplProposta,
            deltaVpl,
            percentualDeltaVpl,
            tmaMesUsada: tmaMes,
            periodosCalculados: Math.max(fluxoTabela.length, fluxoProposta.length),
            calculatedAt: new Date()
        };
        return resultados;
        
    } catch (error) {
        throw error;
    }
}

// Função para atualizar o botão de ação baseado na aba ativa
function updateActionButton(activeTab) {
    const actionContainer = document.querySelector('.glassmorphism.rounded-2xl.p-6.shadow-lg');
    if (!actionContainer) return;
    
    const titleElement = actionContainer.querySelector('h3');
    const descriptionElement = actionContainer.querySelector('p');
    const buttonElement = actionContainer.querySelector('button');
    
    if (!titleElement || !descriptionElement || !buttonElement) return;
    
    if (activeTab === 'propostaCliente') {
        // Última aba - botão para salvar
        titleElement.textContent = 'Finalizar Cenário';
        descriptionElement.textContent = 'Todos os dados foram preenchidos. Salve o cenário para análise.';
        
        const iconElement = buttonElement.querySelector('i');
        const spanElement = buttonElement.querySelector('span');
        
        if (iconElement && spanElement) {
            iconElement.className = 'fas fa-save';
            spanElement.textContent = 'Salvar Cenário';
        }
        
        buttonElement.onclick = nextStep; // Mesma função, mas agora é "salvar"
    } else {
        // Outras abas - botão para próxima etapa
        titleElement.textContent = 'Pronto para avançar?';
        descriptionElement.textContent = 'Vamos para a próxima etapa da análise';
        
        const iconElement = buttonElement.querySelector('i');
        const spanElement = buttonElement.querySelector('span');
        
        if (iconElement && spanElement) {
            iconElement.className = 'fas fa-arrow-right';
            spanElement.textContent = 'Próxima Etapa';
        }
        
        buttonElement.onclick = goToNextTab;
    }
}

// Função para ir para a próxima aba
function goToNextTab() {
    const currentActiveTab = document.querySelector('.subtab-btn.active');
    if (!currentActiveTab) return;
    
    const currentTabId = currentActiveTab.getAttribute('data-tab');
    const allTabs = ['generalData', 'salesData', 'propostaCliente'];
    const currentIndex = allTabs.indexOf(currentTabId);
    
    if (currentIndex < allTabs.length - 1) {
        // Ir para a próxima aba
        const nextTabId = allTabs[currentIndex + 1];
        const nextTabButton = document.querySelector(`[data-tab="${nextTabId}"]`);
        
        if (nextTabButton) {
            nextTabButton.click();
        }
    } else {
        // Já está na última aba, chamar nextStep
        nextStep();
    }
}

// Validação de campos obrigatórios
function validateRequiredFields() {
    const requiredFields = [
        // Dados Gerais
        'cliente', 'imobiliaria', 'incorporadora', 'empreendimento', 'unidade', 'areaPrivativa', 'tmaAno'
    ];
    
    // Campos da Tabela de Vendas (sempre obrigatórios se a aba estiver sendo usada)
    const tabelaVendasFields = [
        'vendaEntradaValor', 'vendaEntradaParcelas', 'vendaParcelasValor', 'vendaParcelasQtd', 
        'vendaReforcoValor', 'vendaReforcoQtd'
    ];
    
    // Campos da Proposta Cliente (obrigatórios se a aba estiver sendo usada)
    const propostaClienteFields = [
        'propostaEntradaValor', 'propostaEntradaParcelas', 'propostaParcelasValor', 'propostaParcelasQtd',
        'propostaReforcoValor', 'propostaReforcoQtd'
    ];
    
    const missingFields = [];
    
    // Função helper para verificar se um valor está vazio
    function isEmpty(value) {
        if (!value) return true;
        const trimmed = value.toString().trim();
        return trimmed === '' || 
               trimmed === '0' || 
               trimmed === '0,00' || 
               trimmed === 'R$ 0,00' ||
               trimmed === 'R$0,00' ||
               trimmed === '0.00';
    }
    
    // Validar campos gerais (sempre obrigatórios)
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field) continue;
        
        if (isEmpty(field.value)) {
            const label = getFieldLabel(fieldId);
            missingFields.push(label);
        }
    }
    
    // Verificar se há dados na Tabela de Vendas
    const hasVendasData = tabelaVendasFields.some(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return false;
        return !isEmpty(field.value);
    });
    
    // Verificar se há dados na Proposta Cliente
    const hasPropostaData = propostaClienteFields.some(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return false;
        return !isEmpty(field.value);
    });
    
    // Se há dados na Tabela de Vendas, validar todos os campos obrigatórios da Tabela
    if (hasVendasData) {
        for (const fieldId of tabelaVendasFields) {
            const field = document.getElementById(fieldId);
            if (!field) continue;
            
            if (isEmpty(field.value)) {
                const label = getFieldLabel(fieldId);
                missingFields.push(label);
            }
        }
    }
    
    // Se há dados na Proposta Cliente, validar todos os campos obrigatórios da Proposta
    if (hasPropostaData) {
        for (const fieldId of propostaClienteFields) {
            const field = document.getElementById(fieldId);
            if (!field) continue;
            
            if (isEmpty(field.value)) {
                const label = getFieldLabel(fieldId);
                missingFields.push(label);
            }
        }
    }
    
    // Verificar se AMBAS as abas têm dados (obrigatório preencher as duas)
    if (!hasVendasData) {
        missingFields.push('Preencha todos os campos da aba: Tabela de Vendas');
    }
    if (!hasPropostaData) {
        missingFields.push('Preencha todos os campos da aba: Proposta Cliente');
    }
    
    return missingFields;
}

function getFieldLabel(fieldId) {
    const labels = {
        // Dados Gerais
        'cliente': 'Cliente',
        'imobiliaria': 'Imobiliária',
        'incorporadora': 'Incorporadora',
        'empreendimento': 'Empreendimento', 
        'unidade': 'Unidade',
        'areaPrivativa': 'Área Privativa (m²)',
        'tmaAno': 'TMA Ano (%)',
        
        // Tabela de Vendas
        'vendaEntradaValor': 'Valor da Entrada (Tabela)',
        'vendaEntradaParcelas': 'Parcelas da Entrada (Tabela)',
        'vendaParcelasValor': 'Valor das Parcelas (Tabela)',
        'vendaParcelasQtd': 'Quantidade de Parcelas (Tabela)',
        'vendaReforcoValor': 'Valor do Reforço (Tabela)',
        'vendaReforcoQtd': 'Quantidade de Parcelas do Reforço (Tabela)',
        
        // Proposta Cliente
        'propostaEntradaValor': 'Valor da Entrada (Proposta)',
        'propostaEntradaParcelas': 'Parcelas da Entrada (Proposta)',
        'propostaParcelasValor': 'Valor das Parcelas (Proposta)',
        'propostaParcelasQtd': 'Quantidade de Parcelas (Proposta)',
        'propostaReforcoValor': 'Valor do Reforço (Proposta)',
        'propostaReforcoQtd': 'Quantidade de Parcelas do Reforço (Proposta)'
    };
    
    return labels[fieldId] || fieldId;
}

// Função para próxima etapa
function nextStep() {
    
    // Verificar se está em modo de edição
    const editingScenario = sessionStorage.getItem('editingScenario');
    const isEditMode = !!editingScenario;
    
    
    // Validar campos obrigatórios
    const missingFields = validateRequiredFields();
    
    if (missingFields.length > 0) {
        const message = `Por favor, preencha os seguintes campos obrigatórios:\n\n${missingFields.join('\n')}`;
        showError(message);
        return;
    }
    
    if (isEditMode) {
        // Modo edição: salvar diretamente sem pedir nome
        updateExistingScenario(); // Usar a nova função específica para edição
    } else {
        // Modo criação: mostrar modal para nome do cenário
        showScenarioNameModal();
    }
}

function showScenarioNameModal() {
    const modal = document.getElementById('scenarioNameModal');
    const input = document.getElementById('scenarioNameInput');
    
    if (modal && input) {
        modal.classList.remove('hidden');
        input.focus();
        input.value = ''; // Limpar campo
    }
}

function closeScenarioNameModal() {
    const modal = document.getElementById('scenarioNameModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function saveScenarioAndProceed() {
    const nameInput = document.getElementById('scenarioNameInput');
    const name = nameInput?.value?.trim();
    
    if (!name) {
        showError('Digite um nome para o cenário');
        return;
    }
    
    closeScenarioNameModal();
    
    try {
        showSuccess('Salvando cenário...');
        const savedScenario = await saveScenarioWithName(name);
        
        // Salvar dados necessários para exibição dos resultados
        if (savedScenario) {
            // Coletar dados atuais dos inputs
            const currentData = collectAllInputData();
            
            // Salvar no sessionStorage com as chaves que resultados.js espera
            sessionStorage.setItem('currentInputData', JSON.stringify(currentData));
            sessionStorage.setItem('currentScenarioName', name);
            sessionStorage.setItem('currentScenarioId', savedScenario._id || savedScenario.id);

            console.log('Dados salvos no sessionStorage para resultados:', {
                currentInputData: !!currentData,
                currentScenarioName: name,
                currentScenarioId: savedScenario._id || savedScenario.id
            });
        }
        
        // Redirecionar para resultados com o ID do cenário salvo
        if (savedScenario && savedScenario._id) {
            setTimeout(() => {
                window.location.href = `resultados.html?scenario=${savedScenario._id}`;
            }, 1000);
        } else {
            setTimeout(() => {
                window.location.href = 'resultados.html';
            }, 1000);
        }
        
    } catch (error) {
        showError('Erro ao salvar o cenário. Tente novamente.');
    }
}

// Global functions
window.collectAllInputData = collectAllInputData;
window.loadScenarioData = loadScenarioData;
window.updateScenario = updateScenario;
window.nextStep = nextStep;
window.showScenarioNameModal = showScenarioNameModal;
window.closeScenarioNameModal = closeScenarioNameModal;
window.saveScenarioAndProceed = saveScenarioAndProceed;
window.updateActionButton = updateActionButton;
window.goToNextTab = goToNextTab;
