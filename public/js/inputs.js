// Inputs Page JavaScript - Model AI

// Sidebar toggle functionality
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const toggleBtn = document.getElementById('toggleSidebar');

toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
});

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
        document.getElementById(tabId).classList.add('active');
    });
});

// Sales calculations
function calculateTMAMes() {
    const tmaAno = parseFloat(document.getElementById('tmaAno')?.value || 0);
    if (document.getElementById('tmaMes')) {
        // Fórmula: (1+TMA_ANO)^(1/12)-1
        const tmaMes = Math.pow(1 + (tmaAno / 100), 1/12) - 1;
        document.getElementById('tmaMes').value = (tmaMes * 100).toFixed(4);
    }
}

// Proposta Cliente calculations
function calculatePropostaPercentages() {
    const valorProposta = parseBRNumber(document.getElementById('valorProposta')?.value || '0');
    const valorEntrada = parseBRNumber(document.getElementById('valorEntrada')?.value || '0');
    const valorParcelas = parseBRNumber(document.getElementById('valorParcelas')?.value || '0');
    const valorReforco = parseBRNumber(document.getElementById('valorReforco')?.value || '0');
    
    if (valorProposta > 0) {
        // Calcular percentuais
        const percEntrada = (valorEntrada / valorProposta * 100).toFixed(0);
        const percParcelas = (valorParcelas / valorProposta * 100).toFixed(0);
        const percReforco = (valorReforco / valorProposta * 100).toFixed(0);
        
        // Atualizar campos de percentual
        if (document.getElementById('percEntrada')) {
            document.getElementById('percEntrada').value = percEntrada + '%';
        }
        if (document.getElementById('percParcelas')) {
            document.getElementById('percParcelas').value = percParcelas + '%';
        }
        if (document.getElementById('percReforco')) {
            document.getElementById('percReforco').value = percReforco + '%';
        }
    }
}

function calculateValorPorParcela() {
    const valorParcelas = parseBRNumber(document.getElementById('valorParcelas')?.value || '0');
    const numParcelas = parseInt(document.getElementById('numParcelas')?.value || 1);
    
    if (numParcelas > 0 && valorParcelas > 0) {
        const valorPorParcela = valorParcelas / numParcelas;
        if (document.getElementById('valorPorParcela')) {
            document.getElementById('valorPorParcela').value = formatBRNumber(valorPorParcela);
        }
    }
}

function calculateValorPorParcelaReforco() {
    const valorReforco = parseBRNumber(document.getElementById('valorReforco')?.value || '0');
    const numParcelasReforco = parseInt(document.getElementById('numParcelasReforco')?.value || 1);
    
    if (numParcelasReforco > 0 && valorReforco > 0) {
        const valorPorParcelaReforco = valorReforco / numParcelasReforco;
        if (document.getElementById('valorPorParcelaReforco')) {
            document.getElementById('valorPorParcelaReforco').value = formatBRNumber(valorPorParcelaReforco);
        }
    }
}

// Tabela de Vendas calculations
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
        return parseFloat(cleanValue) || 0;
    }
    return parseFloat(value) || 0;
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

// Responsive handling
function handleResize() {
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    } else {
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('expanded');
    }
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
    
    // Initial check and resize listener
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Executar cálculos iniciais após um pequeno delay para garantir que DOM está pronto
    setTimeout(() => {
        calculateTMAMes();
        calculateVendaValorPorParcela();
        calculateValorImovel();
        calculatePropostaValorPorParcela();
        calculateValorProposta();
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
    
    // Carregar dados se estivermos editando um cenário
    loadScenarioDataIfEditing();
});

// ==================== FUNÇÕES DE CENÁRIO ====================

function saveScenario() {
    console.log('💾 Salvando cenário...');
    
    try {
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

function collectAllInputData() {
    try {
        return {
            dadosGerais: {
                nomeEmpreendimento: document.getElementById('nomeEmpreendimento')?.value || '',
                dataAnalise: document.getElementById('dataAnalise')?.value || '',
                responsavel: document.getElementById('responsavel')?.value || '',
                tmaAno: parseFloat(document.getElementById('tmaAno')?.value || 0),
                tmaMes: parseFloat(document.getElementById('tmaMes')?.value || 0),
                observacoes: document.getElementById('observacoes')?.value || ''
            },
            tabelaVendas: {
                valorTabela: parseBRNumber(document.getElementById('valorTabela')?.value || '0'),
                percentualEntrada: parseFloat(document.getElementById('percentualEntrada')?.value || 0),
                valorEntrada: parseBRNumber(document.getElementById('valorEntrada')?.value || '0'),
                quantidadeParcelas: parseInt(document.getElementById('quantidadeParcelas')?.value || 0),
                valorParcelas: parseBRNumber(document.getElementById('valorParcelas')?.value || '0'),
                percentualReforco: parseFloat(document.getElementById('percentualReforco')?.value || 0),
                valorReforco: parseBRNumber(document.getElementById('valorReforco')?.value || '0'),
                quantidadeReforcos: parseInt(document.getElementById('quantidadeReforcos')?.value || 0),
                frequenciaReforcos: parseInt(document.getElementById('frequenciaReforcos')?.value || 0)
            },
            propostaCliente: {
                valorProposta: parseBRNumber(document.getElementById('valorProposta')?.value || '0'),
                percentualEntrada: parseFloat(document.getElementById('propostaPercentualEntrada')?.value || 0),
                valorEntrada: parseBRNumber(document.getElementById('propostaValorEntrada')?.value || '0'),
                quantidadeParcelas: parseInt(document.getElementById('propostaQuantidadeParcelas')?.value || 0),
                valorParcelas: parseBRNumber(document.getElementById('propostaValorParcelas')?.value || '0'),
                percentualReforco: parseFloat(document.getElementById('propostaPercentualReforco')?.value || 0),
                valorReforco: parseBRNumber(document.getElementById('propostaReforcoValor')?.value || '0'),
                quantidadeReforcos: parseInt(document.getElementById('propostaReforcoQtd')?.value || 0),
                frequenciaReforcos: parseInt(document.getElementById('propostaReforcoFreq')?.value || 0),
                bemMovelImovel: parseBRNumber(document.getElementById('bemMovelImovel')?.value || '0')
            }
        };
    } catch (error) {
        console.error('Erro ao coletar dados:', error);
        return null;
    }
}

function loadScenarioDataIfEditing() {
    try {
        const editingScenarioId = sessionStorage.getItem('editingScenarioId');
        const editingScenarioName = sessionStorage.getItem('editingScenarioName');
        const inputData = sessionStorage.getItem('currentInputData');
        
        if (editingScenarioId && inputData) {
            console.log('📂 Carregando dados do cenário para edição:', editingScenarioName);
            
            const data = JSON.parse(inputData);
            populateInputsWithData(data);
            
            // Mostrar notificação
            showInfo(`Editando cenário: ${editingScenarioName}`);
            
            // Limpar flags de edição após carregar
            sessionStorage.removeItem('editingScenarioId');
            sessionStorage.removeItem('editingScenarioName');
        }
    } catch (error) {
        console.error('Erro ao carregar dados do cenário:', error);
    }
}

function populateInputsWithData(data) {
    try {
        // Dados Gerais
        if (data.dadosGerais) {
            const dg = data.dadosGerais;
            if (dg.nomeEmpreendimento) document.getElementById('nomeEmpreendimento').value = dg.nomeEmpreendimento;
            if (dg.dataAnalise) document.getElementById('dataAnalise').value = dg.dataAnalise;
            if (dg.responsavel) document.getElementById('responsavel').value = dg.responsavel;
            if (dg.tmaAno) document.getElementById('tmaAno').value = dg.tmaAno;
            if (dg.tmaMes) document.getElementById('tmaMes').value = dg.tmaMes;
            if (dg.observacoes) document.getElementById('observacoes').value = dg.observacoes;
        }
        
        // Tabela de Vendas
        if (data.tabelaVendas) {
            const tv = data.tabelaVendas;
            if (tv.valorTabela) document.getElementById('valorTabela').value = formatToBR(tv.valorTabela);
            if (tv.percentualEntrada) document.getElementById('percentualEntrada').value = tv.percentualEntrada;
            if (tv.valorEntrada) document.getElementById('valorEntrada').value = formatToBR(tv.valorEntrada);
            if (tv.quantidadeParcelas) document.getElementById('quantidadeParcelas').value = tv.quantidadeParcelas;
            if (tv.valorParcelas) document.getElementById('valorParcelas').value = formatToBR(tv.valorParcelas);
            if (tv.percentualReforco) document.getElementById('percentualReforco').value = tv.percentualReforco;
            if (tv.valorReforco) document.getElementById('valorReforco').value = formatToBR(tv.valorReforco);
            if (tv.quantidadeReforcos) document.getElementById('quantidadeReforcos').value = tv.quantidadeReforcos;
            if (tv.frequenciaReforcos) document.getElementById('frequenciaReforcos').value = tv.frequenciaReforcos;
        }
        
        // Proposta Cliente
        if (data.propostaCliente) {
            const pc = data.propostaCliente;
            if (pc.valorProposta) document.getElementById('valorProposta').value = formatToBR(pc.valorProposta);
            if (pc.percentualEntrada) document.getElementById('propostaPercentualEntrada').value = pc.percentualEntrada;
            if (pc.valorEntrada) document.getElementById('propostaValorEntrada').value = formatToBR(pc.valorEntrada);
            if (pc.quantidadeParcelas) document.getElementById('propostaQuantidadeParcelas').value = pc.quantidadeParcelas;
            if (pc.valorParcelas) document.getElementById('propostaValorParcelas').value = formatToBR(pc.valorParcelas);
            if (pc.percentualReforco) document.getElementById('propostaPercentualReforco').value = pc.percentualReforco;
            if (pc.valorReforco) document.getElementById('propostaReforcoValor').value = formatToBR(pc.valorReforco);
            if (pc.quantidadeReforcos) document.getElementById('propostaReforcoQtd').value = pc.quantidadeReforcos;
            if (pc.frequenciaReforcos) document.getElementById('propostaReforcoFreq').value = pc.frequenciaReforcos;
            if (pc.bemMovelImovel) document.getElementById('bemMovelImovel').value = formatToBR(pc.bemMovelImovel);
        }
        
        console.log('✅ Dados carregados nos inputs com sucesso');
        
    } catch (error) {
        console.error('Erro ao preencher inputs:', error);
        showError('Erro ao carregar dados do cenário');
    }
}

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
        const inputData = localStorage.getItem('currentInputData');
        if (!inputData) {
            showError('Nenhum dado encontrado para salvar');
            return;
        }
        
        const data = JSON.parse(inputData);
        
        const response = await fetch('/api/scenarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: name,
                description: `Cenário criado em ${new Date().toLocaleDateString('pt-BR')}`,
                data: data
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showSuccess('Cenário salvo com sucesso!');
            
            // Redirecionar para cenários após 2 segundos
            setTimeout(() => {
                window.location.href = '/cenarios.html';
            }, 2000);
        } else {
            const error = await response.json();
            showError(error.message || 'Erro ao salvar cenário');
        }
        
    } catch (error) {
        console.error('Erro ao salvar cenário:', error);
        showError('Erro ao salvar cenário. Tente novamente.');
    }
}

// ==================== INTEGRAÇÃO COM CENÁRIOS ====================

// Initialize page with scenario data if editing
document.addEventListener('DOMContentLoaded', function() {
    // Check if editing a scenario
    const editingScenario = sessionStorage.getItem('editingScenario');
    if (editingScenario) {
        const scenario = JSON.parse(editingScenario);
        console.log('📝 Carregando cenário para edição:', scenario.name);
        loadScenarioData(scenario.data);
        showInfo(`Editando cenário: ${scenario.name}`);
        
        // Atualizar texto do botão para "Atualizar Cenário"
        const saveButton = document.querySelector('[onclick="saveScenario()"]');
        if (saveButton) {
            saveButton.innerHTML = '<i class="fas fa-save mr-2"></i><span>Atualizar Cenário</span>';
            saveButton.setAttribute('onclick', 'updateScenario()');
        }
    }
});

// Function to collect all input data
function collectAllInputData() {
    const data = {
        dadosGerais: {
            nomeEmpreendimento: document.getElementById('nomeEmpreendimento')?.value || '',
            dataAnalise: document.getElementById('dataAnalise')?.value || '',
            responsavel: document.getElementById('responsavel')?.value || '',
            tmaAno: parseFloat(document.getElementById('tmaAno')?.value || 0),
            tmaMes: parseFloat(document.getElementById('tmaMes')?.value || 0),
            observacoes: document.getElementById('observacoes')?.value || ''
        },
        tabelaVendas: {
            valorTabela: parseBRNumber(document.getElementById('valorTabela')?.value || '0'),
            percentualEntrada: parseFloat(document.getElementById('percentualEntrada')?.value || 0),
            valorEntrada: parseBRNumber(document.getElementById('valorEntrada')?.value || '0'),
            quantidadeParcelas: parseInt(document.getElementById('quantidadeParcelas')?.value || 0),
            valorParcelas: parseBRNumber(document.getElementById('valorParcelas')?.value || '0'),
            percentualReforco: parseFloat(document.getElementById('percentualReforco')?.value || 0),
            valorReforco: parseBRNumber(document.getElementById('valorReforco')?.value || '0'),
            quantidadeReforcos: parseInt(document.getElementById('quantidadeReforcos')?.value || 0),
            frequenciaReforcos: parseInt(document.getElementById('frequenciaReforcos')?.value || 0)
        },
        propostaCliente: {
            valorProposta: parseBRNumber(document.getElementById('valorProposta')?.value || '0'),
            percentualEntradaProposta: parseFloat(document.getElementById('percentualEntradaProposta')?.value || 0),
            valorEntradaProposta: parseBRNumber(document.getElementById('valorEntradaProposta')?.value || '0'),
            quantidadeParcelasProposta: parseInt(document.getElementById('quantidadeParcelasProposta')?.value || 0),
            valorParcelasProposta: parseBRNumber(document.getElementById('valorParcelasProposta')?.value || '0'),
            percentualReforcoProposta: parseFloat(document.getElementById('percentualReforcoProposta')?.value || 0),
            valorReforcoProposta: parseBRNumber(document.getElementById('valorReforcoProposta')?.value || '0'),
            quantidadeReforcosProposta: parseInt(document.getElementById('quantidadeReforcosProposta')?.value || 0),
            frequenciaReforcosProposta: parseInt(document.getElementById('frequenciaReforcosProposta')?.value || 0)
        }
    };
    
    console.log('📊 Dados coletados:', data);
    return data;
}

// Function to load scenario data into inputs
function loadScenarioData(data) {
    if (!data) return;
    
    console.log('📂 Carregando dados do cenário nos inputs:', data);
    
    // Dados Gerais
    if (data.dadosGerais) {
        const dg = data.dadosGerais;
        if (document.getElementById('nomeEmpreendimento')) document.getElementById('nomeEmpreendimento').value = dg.nomeEmpreendimento || '';
        if (document.getElementById('dataAnalise')) document.getElementById('dataAnalise').value = dg.dataAnalise || '';
        if (document.getElementById('responsavel')) document.getElementById('responsavel').value = dg.responsavel || '';
        if (document.getElementById('tmaAno')) document.getElementById('tmaAno').value = dg.tmaAno || '';
        if (document.getElementById('tmaMes')) document.getElementById('tmaMes').value = dg.tmaMes || '';
        if (document.getElementById('observacoes')) document.getElementById('observacoes').value = dg.observacoes || '';
    }
    
    // Tabela de Vendas
    if (data.tabelaVendas) {
        const tv = data.tabelaVendas;
        if (document.getElementById('valorTabela')) document.getElementById('valorTabela').value = formatBRCurrency(tv.valorTabela || 0);
        if (document.getElementById('percentualEntrada')) document.getElementById('percentualEntrada').value = tv.percentualEntrada || '';
        if (document.getElementById('valorEntrada')) document.getElementById('valorEntrada').value = formatBRCurrency(tv.valorEntrada || 0);
        if (document.getElementById('quantidadeParcelas')) document.getElementById('quantidadeParcelas').value = tv.quantidadeParcelas || '';
        if (document.getElementById('valorParcelas')) document.getElementById('valorParcelas').value = formatBRCurrency(tv.valorParcelas || 0);
        if (document.getElementById('percentualReforco')) document.getElementById('percentualReforco').value = tv.percentualReforco || '';
        if (document.getElementById('valorReforco')) document.getElementById('valorReforco').value = formatBRCurrency(tv.valorReforco || 0);
        if (document.getElementById('quantidadeReforcos')) document.getElementById('quantidadeReforcos').value = tv.quantidadeReforcos || '';
        if (document.getElementById('frequenciaReforcos')) document.getElementById('frequenciaReforcos').value = tv.frequenciaReforcos || '';
    }
    
    // Proposta Cliente
    if (data.propostaCliente) {
        const pc = data.propostaCliente;
        if (document.getElementById('valorProposta')) document.getElementById('valorProposta').value = formatBRCurrency(pc.valorProposta || 0);
        if (document.getElementById('percentualEntradaProposta')) document.getElementById('percentualEntradaProposta').value = pc.percentualEntradaProposta || '';
        if (document.getElementById('valorEntradaProposta')) document.getElementById('valorEntradaProposta').value = formatBRCurrency(pc.valorEntradaProposta || 0);
        if (document.getElementById('quantidadeParcelasProposta')) document.getElementById('quantidadeParcelasProposta').value = pc.quantidadeParcelasProposta || '';
        if (document.getElementById('valorParcelasProposta')) document.getElementById('valorParcelasProposta').value = formatBRCurrency(pc.valorParcelasProposta || 0);
        if (document.getElementById('percentualReforcoProposta')) document.getElementById('percentualReforcoProposta').value = pc.percentualReforcoProposta || '';
        if (document.getElementById('valorReforcoProposta')) document.getElementById('valorReforcoProposta').value = formatBRCurrency(pc.valorReforcoProposta || 0);
        if (document.getElementById('quantidadeReforcosProposta')) document.getElementById('quantidadeReforcosProposta').value = pc.quantidadeReforcosProposta || '';
        if (document.getElementById('frequenciaReforcosProposta')) document.getElementById('frequenciaReforcosProposta').value = pc.frequenciaReforcosProposta || '';
    }
    
    showSuccess('Dados do cenário carregados com sucesso!');
}

// Function to update scenario (when editing)
async function updateScenario() {
    const editingScenario = sessionStorage.getItem('editingScenario');
    if (!editingScenario) {
        showError('Nenhum cenário em edição encontrado.');
        return;
    }
    
    const scenario = JSON.parse(editingScenario);
    const data = collectAllInputData();
    
    try {
        const response = await fetch(`/api/scenarios/${scenario.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: scenario.name,
                description: `Cenário atualizado em ${new Date().toLocaleDateString('pt-BR')}`,
                data: data
            })
        });
        
        if (response.ok) {
            showSuccess('Cenário atualizado com sucesso!');
            sessionStorage.removeItem('editingScenario');
            
            // Redirecionar para cenários após 2 segundos
            setTimeout(() => {
                window.location.href = '/cenarios.html';
            }, 2000);
        } else {
            const error = await response.json();
            showError(error.message || 'Erro ao atualizar cenário');
        }
        
    } catch (error) {
        console.error('Erro ao atualizar cenário:', error);
        showError('Erro ao atualizar cenário. Tente novamente.');
    }
}

// Global functions
window.collectAllInputData = collectAllInputData;
window.loadScenarioData = loadScenarioData;
window.updateScenario = updateScenario;
