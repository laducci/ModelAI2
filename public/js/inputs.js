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
    console.log(`🔄 parseBRNumber chamado com valor: "${value}" (tipo: ${typeof value})`);
    if (typeof value === 'string') {
        // Remove todos os pontos (separadores de milhares) e substitui vírgula por ponto
        const cleanValue = value.replace(/\./g, '').replace(',', '.');
        const result = parseFloat(cleanValue) || 0;
        console.log(`🔄 parseBRNumber resultado: "${value}" → "${cleanValue}" → ${result}`);
        return result;
    }
    const result = parseFloat(value) || 0;
    console.log(`🔄 parseBRNumber resultado direto: ${value} → ${result}`);
    return result;
}

// FUNÇÃO DE TESTE PARA DEBUG
window.testParseBRNumber = function() {
    console.log('🧪 === TESTE parseBRNumber ===');
    const testValues = ['100000', '100.000', '100.000,00', 'R$ 100.000,00', '500000'];
    testValues.forEach(val => {
        console.log(`🧪 Testando: "${val}"`);
        const result = parseBRNumber(val);
        console.log(`🧪 Resultado: ${result}`);
        console.log('---');
    });
};

// FUNÇÃO SIMPLES PARA TESTAR COLETA DE INPUTS
window.debugInputValues = function() {
    console.log('🔍 === DEBUG DOS VALORES DOS INPUTS ===');
    
    // Teste simples dos campos problemáticos
    const problematicFields = [
        'vendaEntradaValor',
        'vendaParcelasValor', 
        'areaPrivativa',
        'tmaAno',
        'tmaMes'
    ];
    
    problematicFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            console.log(`📍 ${fieldId}:`);
            console.log(`  📝 Valor bruto: "${element.value}"`);
            console.log(`  🔧 parseBRNumber: ${parseBRNumber(element.value)}`);
            console.log(`  🔧 parseFloat: ${parseFloat(element.value)}`);
            console.log('---');
        } else {
            console.log(`❌ Elemento ${fieldId} não encontrado!`);
        }
    });
};

// TESTE RÁPIDO DA COLETA
window.testCollectData = function() {
    console.log('🔍 === TESTE RÁPIDO DA COLETA ===');
    const data = collectAllInputData();
    console.log('📊 Resultado final:', data);
};

// TESTE SUPER SIMPLES DOS VALORES DIRETOS
window.testDirectValues = function() {
    console.log('🔍 === TESTE VALORES DIRETOS ===');
    
    // Teste campos que funcionam
    const tmaAno = document.getElementById('tmaAno');
    const tmaMes = document.getElementById('tmaMes');
    
    // Teste campos que falham  
    const areaPrivativa = document.getElementById('areaPrivativa');
    const vendaEntradaValor = document.getElementById('vendaEntradaValor');
    
    console.log('✅ CAMPOS QUE FUNCIONAM:');
    console.log(`tmaAno: elemento existe=${!!tmaAno}, valor="${tmaAno?.value}", parseFloat=${parseFloat(tmaAno?.value)}`);
    console.log(`tmaMes: elemento existe=${!!tmaMes}, valor="${tmaMes?.value}", parseFloat=${parseFloat(tmaMes?.value)}`);
    
    console.log('❌ CAMPOS QUE FALHAM:');
    console.log(`areaPrivativa: elemento existe=${!!areaPrivativa}, valor="${areaPrivativa?.value}", parseFloat=${parseFloat(areaPrivativa?.value)}`);
    console.log(`vendaEntradaValor: elemento existe=${!!vendaEntradaValor}, valor="${vendaEntradaValor?.value}", parseBRNumber=${parseBRNumber(vendaEntradaValor?.value)}`);
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
        calculatePropostaEntradaValorPorParcela();
        calculatePropostaParcelasValorPorParcela();
        calculatePropostaReforcoValorPorParcela();
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
    
    // Não carregar dados automaticamente - apenas quando explicitamente editando
});

// ==================== FUNÇÕES DE CENÁRIO ====================

function saveScenario() {
    console.log('💾 Salvando NOVO cenário...');
    
    try {
        // Limpar modo de edição se existir (garante que é um novo cenário)
        sessionStorage.removeItem('editingScenario');
        console.log('🗑️ Removido editingScenario - criando novo cenário');
        
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
        const inputData = sessionStorage.getItem('currentInputData');
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

// Initialize page with scenario data ONLY if editing
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOMContentLoaded disparado - verificando modo de edição...');
    
    // Verificar se veio através de navegação direta (novo cenário) ou de edição
    const referrer = document.referrer;
    const cameFromScenarios = referrer.includes('cenarios.html');
    
    console.log('🔗 Referrer:', referrer);
    console.log('🔗 Veio de cenarios.html?', cameFromScenarios);
    
    // Verificar todas as chaves do sessionStorage
    console.log('🔍 Conteúdo completo do sessionStorage:');
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        console.log(`  ${key}: ${value}`);
    }
    
    // ONLY load scenario data if explicitly editing AND came from scenarios page
    const editingScenario = sessionStorage.getItem('editingScenario');
    console.log('📋 editingScenario RAW:', editingScenario);
    
    if (editingScenario && cameFromScenarios) {
        try {
            const scenario = JSON.parse(editingScenario);
            console.log('📝 SUCESSO - Cenário parseado:', scenario);
            console.log('📝 Nome do cenário:', scenario.name);
            console.log('📊 Dados do cenário:', scenario.data);
            
            // ✅ MODO EDIÇÃO - Cenário existe e veio de cenarios.html
            console.log('🔄 MODO EDIÇÃO ATIVADO');
            
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
                console.log('✅ Botão alterado para updateScenario');
            } else {
                console.log('⚠️ Botão de salvar não encontrado');
            }
            
            // NÃO remover o editingScenario aqui - manter até salvar/cancelar
            console.log('✅ Modo de edição ativado com sucesso');
        } catch (error) {
            console.error('❌ ERRO ao carregar cenário para edição:', error);
            console.error('❌ Dados que causaram erro:', editingScenario);
            sessionStorage.removeItem('editingScenario');
            setupCreateMode();
        }
    } else {
        console.log('📝 MODO CRIAÇÃO ATIVADO');
        // Se não veio de cenarios.html, limpar dados de edição e configurar modo criação
        if (!cameFromScenarios && editingScenario) {
            console.log('🧹 Limpando editingScenario - acesso direto à página');
            sessionStorage.removeItem('editingScenario');
        }
        setupCreateMode();
    }
});

function setupCreateMode() {
    console.log('🆕 Configurando modo de criação...');
    console.log('ℹ️ sessionStorage.editingScenario está vazio ou não existe');
    
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
        console.log('⚠️ Botão de salvar não encontrado');
    }
    
    // Limpar qualquer dado residual
    sessionStorage.removeItem('editingScenario');
    console.log('✅ Modo de criação configurado');
}

// Função para resetar para modo de criação (pode ser chamada manualmente)
function resetToCreateMode() {
    console.log('🔄 Resetando para modo de criação...');
    sessionStorage.removeItem('editingScenario');
    setupCreateMode();
    showInfo('Modo de criação ativado - agora você pode criar um novo cenário');
}

// Function to collect all input data
function collectAllInputData() {
    console.log('🔍 === COLETANDO DADOS DE TODOS OS INPUTS ===');
    
    // Função auxiliar para debugar cada campo
    function getFieldValue(id, parser = (v) => v || '') {
        const element = document.getElementById(id);
        const exists = !!element;
        const value = element?.value;
        
        console.log(`🔍 Campo ${id}:`);
        console.log(`  📍 Elemento existe: ${exists}`);
        console.log(`  📝 Valor bruto: "${value}" (tipo: ${typeof value})`);
        
        if (!exists) {
            console.log(`  ❌ ELEMENTO ${id} NÃO ENCONTRADO!`);
            return '';
        }
        
        if (value === undefined || value === null || value === '') {
            console.log(`  ⚠️ Valor vazio - retornando valor padrão`);
            return parser('') || 0;
        }
        
        try {
            const parsed = parser(value);
            console.log(`  ✅ Valor parseado: ${parsed} (tipo: ${typeof parsed})`);
            return parsed;
        } catch (error) {
            console.log(`  ❌ Erro no parser: ${error.message}`);
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
        
        // TABELA DE VENDAS (15 campos)
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
            
            // Reforço (4 campos)
            reforcoValor: getFieldValue('vendaReforcoValor', parseNumberUniversal),
            reforcoPercent: getFieldValue('vendaReforcoPercent', parseNumberUniversal),
            reforcoQtd: getFieldValue('vendaReforcoQtd', parseNumberUniversal),
            reforcoValorParcela: getFieldValue('vendaReforcoValorParcela', parseNumberUniversal),
            
            // Outros (3 campos)
            bemMovelImovel: getFieldValue('vendaBemMovelImovel', parseNumberUniversal),
            bemMovelImovelPercent: getFieldValue('vendaBemMovelImovelPercent', parseNumberUniversal),
            desagio: getFieldValue('vendaDesagio', parseNumberUniversal)
        },
        
        // PROPOSTA CLIENTE (16 campos)
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
            
            // Reforço (4 campos)
            reforcoValor: getFieldValue('propostaReforcoValor', parseNumberUniversal),
            reforcoPercent: getFieldValue('propostaReforcoPercent', parseNumberUniversal),
            reforcoQtd: getFieldValue('propostaReforcoQtd', parseNumberUniversal),
            reforcoValorParcela: getFieldValue('propostaReforcoValorParcela', parseNumberUniversal),
            
            // Outros (3 campos)
            bemMovelImovel: getFieldValue('bemMovelImovel', parseNumberUniversal),
            bemMovelImovelPercent: getFieldValue('bemMovelImovelPercent', parseNumberUniversal),
            desagio: getFieldValue('desagio', parseNumberUniversal)
        }
    };
    
    console.log('📊 === RESUMO DOS DADOS COLETADOS ===');
    console.log('👥 Dados Gerais:', Object.keys(data.dadosGerais).length, 'campos');
    console.log('📊 Tabela Vendas:', Object.keys(data.tabelaVendas).length, 'campos');
    console.log('🤝 Proposta Cliente:', Object.keys(data.propostaCliente).length, 'campos');
    console.log('� Total de campos:', 
        Object.keys(data.dadosGerais).length + 
        Object.keys(data.tabelaVendas).length + 
        Object.keys(data.propostaCliente).length);
    console.log('📊 Dados completos coletados:', data);
    
    return data;
}

// Function to load scenario data into inputs
function loadScenarioData(data) {
    console.log('🔄 === INICIANDO CARREGAMENTO DOS DADOS ===');
    console.log('📊 Dados recebidos:', data);
    
    if (!data) {
        console.log('❌ Nenhum dado fornecido para carregar');
        return;
    }
    
    console.log('📂 Carregando dados do cenário nos inputs...');
    
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
        console.log('📋 Carregando dados gerais:', data.dadosGerais);
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
                console.log(`✅ ${campo}: ${dg[campo]}`);
            } else if (!elemento) {
                console.log(`⚠️ Elemento não encontrado: ${campo}`);
            }
        });
    } else {
        console.log('⚠️ dadosGerais não encontrado nos dados');
    }
    
    // TABELA DE VENDAS (15 campos)
    if (data.tabelaVendas) {
        console.log('💰 Carregando tabela de vendas:', data.tabelaVendas);
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
                console.log(`✅ ${elementId}: ${tv[field]}`);
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
                console.log(`✅ ${elementId}: ${tv[field]}`);
            }
        });
        
        // Reforço (4 campos)
        ['reforcoValor', 'reforcoPercent', 'reforcoQtd', 'reforcoValorParcela'].forEach(field => {
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
                console.log(`✅ ${elementId}: ${tv[field]}`);
            }
        });
        
        // Outros (3 campos)
        if (document.getElementById('vendaBemMovelImovel') && tv.bemMovelImovel !== undefined) {
            document.getElementById('vendaBemMovelImovel').value = formatBRNumber(tv.bemMovelImovel);
        }
        if (document.getElementById('vendaBemMovelImovelPercent') && tv.bemMovelImovelPercent !== undefined) {
            document.getElementById('vendaBemMovelImovelPercent').value = tv.bemMovelImovelPercent ? tv.bemMovelImovelPercent + '%' : '';
        }
        if (document.getElementById('vendaDesagio') && tv.desagio !== undefined) {
            document.getElementById('vendaDesagio').value = tv.desagio || '';
        }
    } else {
        console.log('⚠️ tabelaVendas não encontrado nos dados');
    }
    
    // PROPOSTA CLIENTE (16 campos)
    if (data.propostaCliente) {
        console.log('📝 Carregando proposta cliente:', data.propostaCliente);
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
                console.log(`✅ ${elementId}: ${pc[field]}`);
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
                console.log(`✅ ${elementId}: ${pc[field]}`);
            }
        });
        
        // Reforço (4 campos)
        ['reforcoValor', 'reforcoPercent', 'reforcoQtd', 'reforcoValorParcela'].forEach(field => {
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
                console.log(`✅ ${elementId}: ${pc[field]}`);
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
        console.log('⚠️ propostaCliente não encontrado nos dados');
    }
    
    console.log('✅ === CARREGAMENTO DOS DADOS CONCLUÍDO ===');
}

// Function to update scenario (when editing)
async function updateScenario() {
    console.log('🔄 === ATUALIZANDO CENÁRIO ===');
    
    const editingScenario = sessionStorage.getItem('editingScenario');
    console.log('📂 Cenário em edição:', editingScenario ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    console.log('📂 Dados completos do editingScenario:', editingScenario);
    
    if (!editingScenario) {
        console.error('❌ Nenhum cenário em edição no sessionStorage');
        showError('Nenhum cenário em edição encontrado.');
        return;
    }
    
    // Verificar token de autenticação
    const token = localStorage.getItem('token');
    console.log('🔐 Token encontrado:', token ? 'SIM' : 'NÃO');
    console.log('🔐 Token (primeiros 50 chars):', token ? token.substring(0, 50) + '...' : 'N/A');
    
    try {
        const scenario = JSON.parse(editingScenario);
        console.log('📝 ID do cenário:', scenario.id);
        console.log('📝 Nome do cenário:', scenario.name);
        
        const data = collectAllInputData();
        console.log('� Dados coletados para atualização:', data);
        
        const requestBody = {
            name: scenario.name,
            description: scenario.description || `Cenário atualizado em ${new Date().toLocaleDateString('pt-BR')}`,
            data: data
        };
        
        console.log('� Enviando PUT para:', `/api/scenarios/${scenario.id}`);
        console.log('📦 Body da requisição:', requestBody);
        
        const response = await fetch(`/api/scenarios/${scenario.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📈 Status da resposta:', response.status);
        console.log('📈 Headers da resposta:', Object.fromEntries(response.headers));
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Cenário atualizado com sucesso:', result);
            
            showSuccess('Cenário atualizado com sucesso!');
            
            // Limpar modo de edição
            sessionStorage.removeItem('editingScenario');
            console.log('🗑️ Modo de edição limpo após atualização');
            
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

// Global functions
window.collectAllInputData = collectAllInputData;
window.loadScenarioData = loadScenarioData;
window.updateScenario = updateScenario;
