// Renderizar tabela de fluxo de caixa zerada (default) com 11 colunas
function renderDefaultFluxoCaixa(periodos = 12) {
    const tbody = document.getElementById('fluxoCaixaDetalhado');
    if (!tbody) return;
    let html = '';
    for (let i = 1; i <= periodos; i++) {
        html += `<tr>
            <td class="text-center">${i}</td>
            <td class="text-center">R$ 0,00</td>
            <td class="text-center">R$ 0,00</td>
            <td class="text-center">R$ 0,00</td>
            <td class="text-center">R$ 0,00</td>
            <td class="text-center">R$ 0,00</td>
            <td class="text-center">R$ 0,00</td>
            <td class="text-center">R$ 0,00</td>
            <td class="text-center">R$ 0,00</td>
            <td class="text-center">R$ 0,00</td>
            <td class="text-center">R$ 0,00</td>
        </tr>`;
    }
    tbody.innerHTML = html;
}
// resultados.js - Cálculos financeiros com fórmulas exatas do Excel

let currentScenarioData = null;

// Inicialização da página
function initializeResultsPage() {
    console.log('🔄 Inicializando página de resultados...');
    checkAuthentication();
    renderDefaultCards(); // Mostra os 6 cards zerados e fórmulas
    renderDefaultFluxoCaixa(); // Mostra a tabela zerada
    loadScenariosForFilter();
    setupEventListeners();
}
// Renderizar os 6 cards SEMPRE zerados e com fórmulas
function renderDefaultCards() {
    document.getElementById('descontoNominalPercent').textContent = '0,00%';
    document.getElementById('descontoNominalReais').textContent = 'R$ 0,00';
    document.getElementById('vplTabela').textContent = 'R$ 0,00';
    document.getElementById('vplProposta').textContent = 'R$ 0,00';
    document.getElementById('deltaVPL').textContent = 'R$ 0,00';
    document.getElementById('percentDeltaVPL').textContent = '0,00%';
    // Se quiser garantir que as fórmulas estejam visíveis, pode atualizar os elementos de descrição também aqui se necessário
    // Exemplo: document.getElementById('descDescontoNominalPercent').textContent = '(Valor Proposta/Valor Imóvel)-1';
}

// Verificar autenticação
function checkAuthentication() {
    const token = localStorage.getItem('token') || localStorage.getItem('modelai_token');
    if (!token) {
        console.log('❌ Token não encontrado, redirecionando para login');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Configurar event listeners
function setupEventListeners() {
    const scenarioFilter = document.getElementById('scenarioFilter');
    if (scenarioFilter) {
        scenarioFilter.addEventListener('change', handleScenarioSelection);
    }
}

// Carregar cenários para o filtro
async function loadScenariosForFilter() {
    try {
        console.log('📂 === CARREGANDO CENÁRIOS PARA FILTRO ===');
        
        const response = await fetch('/api/scenarios', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('📈 Status da resposta:', response.status);

        if (response.ok) {
            const data = await response.json();
            const scenarios = data.scenarios || [];
            console.log('✅ Cenários carregados da API:', scenarios.length);
            populateScenarioFilter(scenarios);
        } else {
            const errorText = await response.text();
            console.error('❌ Erro da API:', response.status, errorText);
            showAlert('Erro ao carregar cenários: ' + response.status, 'error');
        }

    } catch (error) {
        console.error('❌ ERRO FATAL ao carregar cenários:', error);
        showAlert('Erro ao carregar cenários: ' + error.message, 'error');
    }
}

// Popular filtro de cenários
function populateScenarioFilter(scenarios) {
    console.log('🎨 === POPULANDO FILTRO DE CENÁRIOS ===');
    console.log('📊 Cenários recebidos:', scenarios.length);
    
    const scenarioFilter = document.getElementById('scenarioFilter');
    
    if (!scenarioFilter) {
        console.error('❌ Elemento scenarioFilter não encontrado!');
        return;
    }
    
    // Limpar opções existentes (manter primeira opção)
    scenarioFilter.innerHTML = '<option value="">Selecione um cenário</option>';
    
    if (scenarios.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "Nenhum cenário encontrado";
        option.disabled = true;
        scenarioFilter.appendChild(option);
        console.log('⚠️ Nenhum cenário encontrado');
        return;
    }
    
    scenarios.forEach((scenario, index) => {
        console.log(`📋 Cenário ${index + 1}:`, {
            id: scenario._id,
            name: scenario.name,
            cliente: scenario.data?.cliente
        });
        
        const option = document.createElement('option');
        option.value = scenario._id;
        option.textContent = `${scenario.name} - ${scenario.data?.cliente || 'Sem cliente'}`;
        scenarioFilter.appendChild(option);
    });
    
    console.log('✅ Filtro de cenários populado com sucesso!');
}

// Manipular seleção de cenário
async function handleScenarioSelection(event) {
    const scenarioId = event.target.value;
    
    if (!scenarioId) {
        showEmptyState();
        return;
    }

    // Nunca mostra loading, cards sempre visíveis
    
    try {
        await loadScenarioData(scenarioId);
        
        if (currentScenarioData) {
            displayResults();
        } else {
            // Mantém cards zerados se não conseguir carregar
            renderDefaultCards();
            renderDefaultFluxoCaixa();
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar cenário:', error);
        showAlert('Erro ao carregar dados do cenário', 'error');
        // Mantém cards zerados em caso de erro
        renderDefaultCards();
        renderDefaultFluxoCaixa();
    }
}

// Carregar dados do cenário
async function loadScenarioData(scenarioId) {
    console.log('📊 Carregando dados do cenário:', scenarioId);
    
    const token = localStorage.getItem('token') || localStorage.getItem('modelai_token');
    const response = await fetch(`/api/scenarios/${scenarioId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }

    const scenario = await response.json();
    currentScenarioData = scenario;
    
    console.log('✅ Dados do cenário carregados:', currentScenarioData);
}

// Estados da interface
function showLoadingState() {
    // Nunca mostra loading, sempre mantém cards visíveis
    console.log('Loading ignorado - cards sempre visíveis');
}

function showEmptyState() {
    // Nunca esconde conteúdo, apenas zera os valores
    renderDefaultCards();
    renderDefaultFluxoCaixa();
}

function showResultsState() {
    // Cards sempre visíveis, apenas atualiza valores
    console.log('Exibindo resultados - cards sempre visíveis');
}

// Exibir resultados calculados
function displayResults() {
    console.log('🎯 Exibindo resultados calculados...');
    
    showResultsState();
    
    // Atualizar informações do cenário
    updateScenarioInfo();
    
    // Calcular e exibir indicadores financeiros
    calculateAndDisplayIndicators();
    
    // Atualizar resumo financeiro
    updateFinancialSummary();
    
    // Atualizar preview do fluxo de caixa
    updateCashFlowPreview();
}

// Atualizar informações do cenário
function updateScenarioInfo() {
    const data = currentScenarioData.data;
    
    document.getElementById('scenarioName').textContent = currentScenarioData.name || 'Sem nome';
    document.getElementById('scenarioClient').textContent = data.dadosGerais.cliente || 'Não informado';
    document.getElementById('scenarioEmpreendimento').textContent = data.dadosGerais.empreendimento || 'Não informado';
    document.getElementById('scenarioUnidade').textContent = data.dadosGerais.unidade || 'Não informada';
    
    // TMA Anual
    const tmaAnual = parseFloat(data.dadosGerais.tmaAno) || 0;
    document.getElementById('scenarioTMA').textContent = `${(tmaAnual * 100).toFixed(2)}%`;
}

// Calcular e exibir indicadores financeiros principais
function calculateAndDisplayIndicators() {
    console.log('🧮 Calculando indicadores financeiros...');
    
    const data = currentScenarioData.data;
    
    // Validar dados necessários
    if (!data || !validateCalculationInputs(data)) {
        console.error('❌ Dados insuficientes para cálculo');
        showAlert('Dados insuficientes para realizar os cálculos', 'error');
        return;
    }
    
    try {
        // 1. Calcular valores base
        const valorTotalImovel = calculateValorTotalImovel(data);
        const valorTotalProposta = calculateValorTotalProposta(data);
        
        // 2. Calcular Desconto Nominal % e R$
        const descontoNominalPercent = calculateDescontoNominalPercent(valorTotalProposta, valorTotalImovel);
        const descontoNominalReais = calculateDescontoNominalReais(valorTotalImovel, valorTotalProposta);
        
        // 3. Gerar fluxos de caixa
        const fluxoTabela = generateFluxoTabela(data, valorTotalImovel);
        const fluxoProposta = generateFluxoProposta(data, valorTotalProposta);
        
        // 4. Calcular VPLs
        const tmaMes = calculateTMAMensal(data.dadosGerais.tmaAno);
        const vplTabela = calculateVPL(tmaMes, fluxoTabela);
        const vplProposta = calculateVPL(tmaMes, fluxoProposta);
        
        // 5. Calcular deltas
        const deltaVPL = calculateDeltaVPL(vplProposta, vplTabela);
        const percentDeltaVPL = calculatePercentDeltaVPL(deltaVPL, vplTabela);
        
        // 6. Exibir resultados nos cards
        displayCalculatedValues({
            descontoNominalPercent,
            descontoNominalReais,
            vplTabela,
            vplProposta,
            deltaVPL,
            percentDeltaVPL,
            valorTotalImovel,
            valorTotalProposta,
            tmaMes
        });
        
        console.log('✅ Indicadores calculados e exibidos com sucesso');
        
    } catch (error) {
        console.error('❌ Erro nos cálculos:', error);
        showAlert('Erro ao calcular indicadores financeiros', 'error');
    }
}

// Validar inputs para cálculo
function validateCalculationInputs(data) {
    // Verificar se temos as estruturas principais
    if (!data.dadosGerais || !data.tabelaVendas || !data.propostaCliente) {
        console.error('❌ Estruturas principais de dados ausentes');
        return false;
    }
    
    // Verificar campos essenciais
    const required = {
        'dadosGerais.areaPrivativa': data.dadosGerais.areaPrivativa,
        'dadosGerais.tmaAno': data.dadosGerais.tmaAno,
        'tabelaVendas.entradaValor': data.tabelaVendas.entradaValor,
        'propostaCliente.mesVenda': data.propostaCliente.mesVenda
    };
    
    for (const [field, value] of Object.entries(required)) {
        if (!value && value !== 0) {
            console.error(`❌ Campo obrigatório ausente: ${field}`);
            return false;
        }
    }
    
    return true;
}

// Calcular Valor Total do Imóvel = soma de todos os valores da tabela
function calculateValorTotalImovel(data) {
    const tabela = data.tabelaVendas;
    const entradaValor = parseFloat(tabela.entradaValor) || 0;
    const parcelasValor = parseFloat(tabela.parcelasValor) || 0;
    const reforcoValor = parseFloat(tabela.reforcoValor) || 0;
    const bemMovelValor = parseFloat(tabela.bemMovelImovel) || 0;
    
    const total = entradaValor + parcelasValor + reforcoValor + bemMovelValor;
    
    console.log('💰 Valor Total Imóvel:');
    console.log('   Entrada:', entradaValor);
    console.log('   Parcelas:', parcelasValor);  
    console.log('   Reforço:', reforcoValor);
    console.log('   Bem Móvel:', bemMovelValor);
    console.log('   ✅ Total:', total);
    
    return total;
}

// Calcular Valor Total da Proposta = soma de todos os valores da proposta
function calculateValorTotalProposta(data) {
    const proposta = data.propostaCliente;
    const entradaValor = parseFloat(proposta.entradaValor) || 0;
    const parcelasValor = parseFloat(proposta.parcelasValor) || 0;
    const reforcoValor = parseFloat(proposta.reforcoValor) || 0;
    // Assumindo que bem móvel na proposta é o mesmo da tabela
    const bemMovelValor = parseFloat(data.tabelaVendas.bemMovelImovel) || 0;
    
    const total = entradaValor + parcelasValor + reforcoValor + bemMovelValor;
    
    console.log('💸 Valor Total Proposta:');
    console.log('   Entrada:', entradaValor);
    console.log('   Parcelas:', parcelasValor);
    console.log('   Reforço:', reforcoValor);
    console.log('   Bem Móvel:', bemMovelValor);
    console.log('   ✅ Total:', total);
    
    return total;
}

// Calcular Desconto Nominal % = (Valor Proposta / Valor Imóvel) - 1
function calculateDescontoNominalPercent(valorProposta, valorImovel) {
    console.log('🧮 Calculando Desconto Nominal %:');
    console.log('   Valor Proposta:', valorProposta);
    console.log('   Valor Imóvel:', valorImovel);
    
    if (valorImovel === 0) {
        console.log('   ⚠️ Valor Imóvel é zero, retornando 0');
        return 0;
    }
    
    const resultado = (valorProposta / valorImovel) - 1;
    console.log('   ✅ Resultado:', resultado, '=', (resultado * 100).toFixed(2) + '%');
    
    return resultado;
}

// Calcular Desconto Nominal R$ = Valor Imóvel - Valor Proposta
function calculateDescontoNominalReais(valorImovel, valorProposta) {
    return valorImovel - valorProposta;
}

// Calcular TMA Mensal = (1 + TMA_Anual)^(1/12) - 1
function calculateTMAMensal(tmaAnual) {
    const tmaDecimal = parseFloat(tmaAnual) || 0;
    return Math.pow(1 + tmaDecimal, 1/12) - 1;
}

// Gerar Fluxo de Caixa da Tabela (250 meses)
function generateFluxoTabela(data, valorTotal) {
    const fluxo = new Array(250).fill(0);
    const tabela = data.tabelaVendas;
    const mesVenda = parseInt(data.propostaCliente.mesVenda) || 1;
    
    // Valores da tabela
    const entradaValor = parseFloat(tabela.entradaValor) || 0;
    const entradaParcelas = parseInt(tabela.entradaParcelas) || 1;
    const parcelasValor = parseFloat(tabela.parcelasValor) || 0;
    const parcelasQtd = parseInt(tabela.parcelasQtd) || 0;
    const reforcoValor = parseFloat(tabela.reforcoValor) || 0;
    const reforcoQtd = parseInt(tabela.reforcoQtd) || 0;
    const reforcoFrequencia = parseInt(tabela.reforcoFrequencia) || 12;
    const bemMovelValor = parseFloat(tabela.bemMovelImovel) || 0;
    const bemMovelMes = parseInt(tabela.bemMovelImovelMes) || mesVenda;
    
    // Calcular valores por parcela
    const valorPorEntrada = entradaParcelas > 0 ? entradaValor / entradaParcelas : entradaValor;
    const valorPorParcela = parcelasQtd > 0 ? parcelasValor / parcelasQtd : 0;
    const valorPorReforco = reforcoQtd > 0 ? reforcoValor / reforcoQtd : 0;
    
    // 1. Entrada (primeiros meses)
    for (let i = 0; i < entradaParcelas && (mesVenda - 1 + i) < 250; i++) {
        fluxo[mesVenda - 1 + i] += valorPorEntrada;
    }
    
    // 2. Parcelas mensais
    for (let i = 0; i < parcelasQtd && (mesVenda - 1 + entradaParcelas + i) < 250; i++) {
        fluxo[mesVenda - 1 + entradaParcelas + i] += valorPorParcela;
    }
    
    // 3. Reforços conforme frequência
    for (let i = 0; i < reforcoQtd; i++) {
        const mesReforco = mesVenda - 1 + (i + 1) * reforcoFrequencia;
        if (mesReforco < 250) {
            fluxo[mesReforco] += valorPorReforco;
        }
    }
    
    // 4. Bem móvel no mês específico
    if (bemMovelMes > 0 && bemMovelMes <= 250) {
        fluxo[bemMovelMes - 1] += bemMovelValor;
    }
    
    return fluxo;
}

// Gerar Fluxo de Caixa da Proposta (250 meses)
function generateFluxoProposta(data, valorTotal) {
    const fluxo = new Array(250).fill(0);
    const proposta = data.propostaCliente;
    const mesVenda = parseInt(proposta.mesVenda) || 1;
    
    // Valores da proposta
    const entradaValor = parseFloat(proposta.entradaValor) || 0;
    const entradaParcelas = parseInt(proposta.entradaParcelas) || 1;
    const parcelasValor = parseFloat(proposta.parcelasValor) || 0;
    const parcelasQtd = parseInt(proposta.parcelasQtd) || 0;
    const reforcoValor = parseFloat(proposta.reforcoValor) || 0;
    const reforcoQtd = parseInt(proposta.reforcoQtd) || 0;
    const reforcoFrequencia = parseInt(proposta.reforcoFrequencia) || 12;
    // Bem móvel assumindo mesmo da tabela
    const bemMovelValor = parseFloat(data.tabelaVendas.bemMovelImovel) || 0;
    const bemMovelMes = parseInt(data.tabelaVendas.bemMovelImovelMes) || mesVenda;
    
    // Calcular valores por parcela
    const valorPorEntrada = entradaParcelas > 0 ? entradaValor / entradaParcelas : entradaValor;
    const valorPorParcela = parcelasQtd > 0 ? parcelasValor / parcelasQtd : 0;
    const valorPorReforco = reforcoQtd > 0 ? reforcoValor / reforcoQtd : 0;
    
    // 1. Entrada (primeiros meses)
    for (let i = 0; i < entradaParcelas && (mesVenda - 1 + i) < 250; i++) {
        fluxo[mesVenda - 1 + i] += valorPorEntrada;
    }
    
    // 2. Parcelas mensais
    for (let i = 0; i < parcelasQtd && (mesVenda - 1 + entradaParcelas + i) < 250; i++) {
        fluxo[mesVenda - 1 + entradaParcelas + i] += valorPorParcela;
    }
    
    // 3. Reforços conforme frequência
    for (let i = 0; i < reforcoQtd; i++) {
        const mesReforco = mesVenda - 1 + (i + 1) * reforcoFrequencia;
        if (mesReforco < 250) {
            fluxo[mesReforco] += valorPorReforco;
        }
    }
    
    // 4. Bem móvel no mês específico
    if (bemMovelMes > 0 && bemMovelMes <= 250) {
        fluxo[bemMovelMes - 1] += bemMovelValor;
    }
    
    return fluxo;
}

// Calcular VPL usando fórmula do Excel: =VPL(taxa; fluxo_mensal)
function calculateVPL(taxa, fluxoMensal) {
    let vpl = 0;
    
    // VPL Excel considera o primeiro valor no período 1, não 0
    // Fórmula: Σ(fluxo[i] / (1 + taxa)^(i+1))
    for (let i = 0; i < fluxoMensal.length; i++) {
        if (fluxoMensal[i] !== 0) {
            vpl += fluxoMensal[i] / Math.pow(1 + taxa, i + 1);
        }
    }
    
    return vpl;
}

// Calcular Delta VPL = VPL Proposta - VPL Tabela
function calculateDeltaVPL(vplProposta, vplTabela) {
    return vplProposta - vplTabela;
}

// Calcular % Delta VPL com SEERRO = SE(VPL_Tabela=0; 0; Delta_VPL/VPL_Tabela)
function calculatePercentDeltaVPL(deltaVPL, vplTabela) {
    // Implementa SEERRO (IFERROR): se VPL_Tabela = 0, retorna 0, senão calcula percentual
    if (vplTabela === 0) {
        return 0;
    }
    return deltaVPL / vplTabela;
}

// Exibir valores calculados nos cards
function displayCalculatedValues(values) {
    // Card 1: Desconto Nominal %
    let percent = 0;
    if (values && typeof values.descontoNominalPercent === 'number' && !isNaN(values.descontoNominalPercent)) {
        percent = values.descontoNominalPercent * 100;
    }
    console.log('📊 Atualizando Card 1 - Desconto Nominal %:', percent.toFixed(2) + '%');
    document.getElementById('descontoNominalPercent').textContent = `${percent.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%`;
    document.getElementById('descontoNominalReais').textContent =
        values ? formatCurrency(values.descontoNominalReais) : 'R$ 0,00';
    document.getElementById('vplTabela').textContent =
        values ? formatCurrency(values.vplTabela) : 'R$ 0,00';
    document.getElementById('vplProposta').textContent =
        values ? formatCurrency(values.vplProposta) : 'R$ 0,00';
    document.getElementById('deltaVPL').textContent =
        values ? formatCurrency(values.deltaVPL) : 'R$ 0,00';
    document.getElementById('percentDeltaVPL').textContent =
        values && !isNaN(values.percentDeltaVPL) ? `${(values.percentDeltaVPL * 100).toFixed(2)}%` : '0,00%';
    document.getElementById('valorTotalImovel').textContent =
        values ? formatCurrency(values.valorTotalImovel) : 'R$ 0,00';
    document.getElementById('valorTotalProposta').textContent =
        values ? formatCurrency(values.valorTotalProposta) : 'R$ 0,00';
    document.getElementById('tmaMensal').textContent =
        values && !isNaN(values.tmaMes) ? `${(values.tmaMes * 100).toFixed(4)}%` : '0%';
}

// Atualizar resumo financeiro
function updateFinancialSummary() {
    const data = currentScenarioData.data;
    
    document.getElementById('mesVenda').textContent = data.propostaCliente.mesVenda || '1';
    
    // Atualizar informações do cenário
    document.getElementById('infoCliente').textContent = data.dadosGerais.cliente || '-';
    document.getElementById('infoEmpreendimento').textContent = data.dadosGerais.empreendimento || '-';
    document.getElementById('infoUnidade').textContent = data.dadosGerais.unidade || '-';
    
    const areaPrivativa = data.dadosGerais.areaPrivativa;
    document.getElementById('infoArea').textContent = areaPrivativa ? `${areaPrivativa} m²` : '-';
}

// Atualizar preview do fluxo de caixa (tabela detalhada como no Excel)
function updateCashFlowPreview() {
    const data = currentScenarioData.data;
    
    const valorTotalImovel = calculateValorTotalImovel(data);
    const valorTotalProposta = calculateValorTotalProposta(data);
    
    const fluxoTabela = generateFluxoTabela(data, valorTotalImovel);
    const fluxoProposta = generateFluxoProposta(data, valorTotalProposta);
    
    // Gerar componentes individuais do fluxo da proposta
    const componentesFluxo = generateComponentesFluxoProposta(data);
    
    const tbody = document.getElementById('fluxoCaixaDetalhado');
    tbody.innerHTML = '';
    
    // Obter período selecionado
    const periodoAnalise = parseInt(document.getElementById('periodoAnalise')?.value) || 12;
    const maxMeses = Math.min(periodoAnalise, 250);
    
    // Gerar tabela mês a mês
    for (let mes = 0; mes < maxMeses; mes++) {
        const row = document.createElement('tr');
        row.className = mes % 2 === 0 ? 'bg-gray-50' : 'bg-white';
        
        // Valores das componentes individuais
        const valorTabelaTMA = fluxoTabela[mes];
        const valorEntrada = componentesFluxo.entrada[mes] || 0;
        const valorParcelas = componentesFluxo.parcelas[mes] || 0;
        const valorReforcos = componentesFluxo.reforcos[mes] || 0;
        const valorNasChaves = componentesFluxo.nasChaves[mes] || 0;
        const valorPropostaTotal = fluxoProposta[mes];
        
        row.innerHTML = `
            <td class="px-3 py-2 text-center text-sm font-medium text-gray-900 border-r border-gray-200">${mes + 1}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200">${formatCurrency(valorTabelaTMA)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200">${formatCurrency(valorEntrada)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200">${formatCurrency(valorParcelas)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200">${formatCurrency(valorReforcos)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200">${formatCurrency(valorNasChaves)}</td>
            <td class="px-3 py-2 text-right text-sm font-semibold text-gray-900">${formatCurrency(valorPropostaTotal)}</td>
        `;
        
        tbody.appendChild(row);
    }
    
    // Configurar event listener para mudança de período
    const periodoSelect = document.getElementById('periodoAnalise');
    if (periodoSelect) {
        periodoSelect.removeEventListener('change', updateCashFlowPreview);
        periodoSelect.addEventListener('change', updateCashFlowPreview);
    }
}

// Gerar componentes individuais do fluxo da proposta
function generateComponentesFluxoProposta(data) {
    const proposta = data.propostaCliente;
    const mesVenda = parseInt(proposta.mesVenda) || 1;
    
    // Arrays para cada componente
    const entrada = new Array(250).fill(0);
    const parcelas = new Array(250).fill(0);
    const reforcos = new Array(250).fill(0);
    const nasChaves = new Array(250).fill(0);
    
    // Valores da proposta
    const entradaValor = parseFloat(proposta.entradaValor) || 0;
    const entradaParcelas = parseInt(proposta.entradaParcelas) || 1;
    const parcelasValor = parseFloat(proposta.parcelasValor) || 0;
    const parcelasQtd = parseInt(proposta.parcelasQtd) || 0;
    const reforcoValor = parseFloat(proposta.reforcoValor) || 0;
    const reforcoQtd = parseInt(proposta.reforcoQtd) || 0;
    const reforcoFrequencia = parseInt(proposta.reforcoFrequencia) || 12;
    
    // Bem móvel (nas chaves) - assumindo mesmo da tabela
    const bemMovelValor = parseFloat(data.tabelaVendas.bemMovelImovel) || 0;
    const bemMovelMes = parseInt(data.tabelaVendas.bemMovelImovelMes) || mesVenda;
    
    // Calcular valores por parcela
    const valorPorEntrada = entradaParcelas > 0 ? entradaValor / entradaParcelas : entradaValor;
    const valorPorParcela = parcelasQtd > 0 ? parcelasValor / parcelasQtd : 0;
    const valorPorReforco = reforcoQtd > 0 ? reforcoValor / reforcoQtd : 0;
    
    // 1. Entrada (primeiros meses)
    for (let i = 0; i < entradaParcelas && (mesVenda - 1 + i) < 250; i++) {
        entrada[mesVenda - 1 + i] = valorPorEntrada;
    }
    
    // 2. Parcelas mensais
    for (let i = 0; i < parcelasQtd && (mesVenda - 1 + entradaParcelas + i) < 250; i++) {
        parcelas[mesVenda - 1 + entradaParcelas + i] = valorPorParcela;
    }
    
    // 3. Reforços conforme frequência
    for (let i = 0; i < reforcoQtd; i++) {
        const mesReforco = mesVenda - 1 + (i + 1) * reforcoFrequencia;
        if (mesReforco < 250) {
            reforcos[mesReforco] = valorPorReforco;
        }
    }
    
    // 4. Bem móvel no mês específico
    if (bemMovelMes > 0 && bemMovelMes <= 250) {
        nasChaves[bemMovelMes - 1] = bemMovelValor;
    }
    
    return {
        entrada,
        parcelas,
        reforcos,
        nasChaves
    };
}

// Utilitários
function formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function showAlert(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Aqui você pode implementar um sistema de alertas visual se necessário
}

// Exportar funções para uso global
window.initializeResultsPage = initializeResultsPage;

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', initializeResultsPage);
