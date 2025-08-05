// Renderizar tabela de fluxo de caixa zerada (default) com 11 colunas
function renderDefaultFluxoCaixa(periodos = 12) {
    const tbody = document.getElementById('fluxoCaixaDetalhado');
    if (!tbody) return;
    let html = '';
    for (let i = 1; i <= periodos; i++) {
        html += `<tr>
            <td class="text-center tabela-incorporadora">${i}</td>
            <td class="text-center tabela-incorporadora">R$ 0,00</td>
            <td class="text-center tabela-incorporadora">R$ 0,00</td>
            <td class="text-center tabela-incorporadora">R$ 0,00</td>
            <td class="text-center tabela-incorporadora">R$ 0,00</td>
            <td class="text-center tabela-incorporadora">R$ 0,00</td>
            <td class="text-center proposta-cliente">R$ 0,00</td>
            <td class="text-center proposta-cliente">R$ 0,00</td>
            <td class="text-center proposta-cliente">R$ 0,00</td>
            <td class="text-center proposta-cliente">R$ 0,00</td>
            <td class="text-center proposta-cliente">R$ 0,00</td>
        </tr>`;
    }
    tbody.innerHTML = html;
}
// resultados.js - Cálculos financeiros com fórmulas exatas do Excel

let currentScenarioData = null;

// Inicialização da página
function initializeResultsPage() {
    
    // Verificar se há parâmetros na URL que podem estar causando problemas
    const urlParams = new URLSearchParams(window.location.search);
    const scenarioParam = urlParams.get('scenario');
    const idParam = urlParams.get('id');
    
    
    if (scenarioParam && scenarioParam !== 'undefined') {
        // Pode implementar carregamento automático aqui se necessário
    }
    
    checkAuthentication();
    renderDefaultCards(); // Mostra os 6 cards zerados e fórmulas
    renderDefaultFluxoCaixa(); // Mostra a tabela zerada
    createDefaultChart(); // Cria gráfico vazio
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
        
        // Limpar listeners anteriores
        scenarioFilter.removeEventListener('change', handleScenarioSelection);
        
        // Adicionar novo listener
        scenarioFilter.addEventListener('change', function() {
            const selectedScenarioId = this.value;
            console.log('📝 Filtro mudou:', {
                selectedValue: selectedScenarioId,
                filterHTML: this.outerHTML.substring(0, 200) + '...',
                allOptions: Array.from(this.options).map(opt => ({
                    value: opt.value,
                    text: opt.textContent,
                    selected: opt.selected
                }))
            });
            
            if (selectedScenarioId) {
                console.log(`🎯 Chamando handleScenarioSelection com ID: "${selectedScenarioId}"`);
                handleScenarioSelection(selectedScenarioId);
            } else {
                console.log('❌ Nenhum cenário selecionado (valor vazio)');
                clearResults();
            }
        });
        
        console.log('✅ Event listener configurado com sucesso');
    } else {
        console.error('❌ scenarioFilter não encontrado!');
    }
    
    // Configurar event listener para mudança de período quando não há dados carregados
    const periodoSelect = document.getElementById('periodoAnalise');
    if (periodoSelect) {
        periodoSelect.addEventListener('change', function() {
            if (!currentScenarioData) {
                // Se não há dados carregados, atualizar apenas o gráfico vazio
                const periodoSelecionado = parseInt(this.value) || 12;
                createDefaultChart(periodoSelecionado);
            }
        });
        console.log('✅ Event listener do período da tabela configurado');
    }
    
    // Configurar event listener específico para o filtro do gráfico
    const periodoGraficoSelect = document.getElementById('periodoGrafico');
    if (periodoGraficoSelect) {
        periodoGraficoSelect.addEventListener('change', function() {
            const periodoSelecionado = parseInt(this.value) || 24;
            if (currentScenarioData) {
                // Se há dados carregados, atualizar o gráfico com os dados
                createFluxoComparativoChart(periodoSelecionado);
            } else {
                // Se não há dados, atualizar o gráfico vazio
                createDefaultChart(periodoSelecionado);
            }
        });
        console.log('✅ Event listener do período do gráfico configurado');
    }
}

// Carregar cenários para o filtro
async function loadScenariosForFilter() {
    try {
        
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
            cliente: scenario.data?.dadosGerais?.cliente,
            fullScenario: scenario
        });
        
        const scenarioId = scenario._id || scenario.id;
        
        if (!scenarioId) {
            console.warn(`⚠️ Cenário ${index + 1} não possui ID válido:`, scenario);
            return; // Pula este cenário
        }
        
        const option = document.createElement('option');
        option.value = scenarioId;
        option.textContent = `${scenario.name} - ${scenario.data?.dadosGerais?.cliente || 'Sem cliente'}`;
        scenarioFilter.appendChild(option);
        
        console.log(`✅ Opção adicionada - ID: ${scenarioId}, Texto: ${option.textContent}`);
    });
    
    console.log('✅ Filtro de cenários populado com sucesso!');
}

// Manipular seleção de cenário
async function handleScenarioSelection(scenarioIdOrEvent) {
    console.log('🎯 === SELEÇÃO DE CENÁRIO ===');
    
    let scenarioId;
    
    // Verificar se é um ID direto ou um event
    if (typeof scenarioIdOrEvent === 'string') {
        scenarioId = scenarioIdOrEvent;
        console.log('📊 ID direto recebido:', scenarioId);
    } else if (scenarioIdOrEvent && scenarioIdOrEvent.target) {
        scenarioId = scenarioIdOrEvent.target.value;
        console.log('📊 Event recebido - ID:', scenarioId);
    } else {
        console.error('❌ Parâmetro inválido:', scenarioIdOrEvent);
        return;
    }
    
    console.log('🔍 Scenario ID final:', scenarioId);
    console.log('🔍 Tipo do Scenario ID:', typeof scenarioId);
    
    // Validação mais rigorosa
    if (!scenarioId || scenarioId === 'undefined' || scenarioId === 'null' || scenarioId.trim() === '') {
        console.log('⚠️ Scenario ID inválido, mostrando estado vazio. ID recebido:', scenarioId);
        showEmptyState();
        return;
    }

    console.log('✅ Scenario ID válido, prosseguindo com carregamento...');

    // Nunca mostra loading, cards sempre visíveis
    
    try {
        console.log('🚀 Iniciando carregamento do cenário:', scenarioId);
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
    console.log('📊 === CARREGANDO DADOS DO CENÁRIO ===');
    console.log('🎯 Scenario ID:', scenarioId);
    console.log('🎯 Tipo do ID:', typeof scenarioId);
    console.log('🎯 Comprimento do ID:', scenarioId ? scenarioId.length : 'N/A');
    console.log('🔑 Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
    
    if (!scenarioId) {
        console.error('❌ Scenario ID é null ou undefined:', scenarioId);
        throw new Error('ID do cenário não fornecido');
    }
    
    const trimmedId = scenarioId.toString().trim();
    
    if (trimmedId === '' || trimmedId === 'undefined' || trimmedId === 'null') {
        console.error('❌ Scenario ID inválido após trim:', trimmedId);
        throw new Error(`ID do cenário é inválido: "${trimmedId}"`);
    }
    
    const url = `/api/scenarios/${trimmedId}`;
    console.log('🌐 URL da requisição:', url);
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    console.log('📈 Status da resposta:', response.status);
    console.log('📈 URL da resposta:', response.url);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro HTTP:', response.status, errorText);
        throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('📦 Resposta completa da API:', result);
    
    // Usar a mesma estrutura que funciona no cenarios-novo.js
    const scenario = result.scenario || result;
    console.log('📋 Cenário extraído:', scenario);
    
    if (!scenario) {
        console.error('❌ Cenário não encontrado na resposta da API');
        throw new Error('Cenário não encontrado na resposta da API');
    }
    
    currentScenarioData = scenario;
    
    console.log('✅ Dados do cenário carregados:', currentScenarioData);
    console.log('📊 Estrutura dos dados:', {
        name: scenario.name,
        hasData: !!scenario.data,
        dataKeys: scenario.data ? Object.keys(scenario.data) : []
    });
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
    
    showResultsState();
    
    // Atualizar informações do cenário
    updateScenarioInfo();
    
    // Calcular e exibir indicadores financeiros
    calculateAndDisplayIndicators();
    
    // Atualizar preview do fluxo de caixa
    updateCashFlowPreview();
    
    // Criar/atualizar gráfico comparativo
    createFluxoComparativoChart();
    
    // Atualizar filtros com o máximo de meses do cenário
    updateFiltersWithScenarioData();
}

// Atualizar informações do cenário
function updateScenarioInfo() {
    console.log('📝 === ATUALIZANDO INFORMAÇÕES DO CENÁRIO ===');
    
    if (!currentScenarioData) {
        console.error('❌ currentScenarioData não existe');
        return;
    }
    
    console.log('📊 currentScenarioData:', currentScenarioData);
    
    const data = currentScenarioData.data;
    
    if (!data) {
        console.error('❌ currentScenarioData.data não existe');
        return;
    }
    
    console.log('📋 data:', data);
    console.log('📋 data.dadosGerais:', data.dadosGerais);
    
    document.getElementById('scenarioName').textContent = currentScenarioData.name || 'Sem nome';
    
    if (data.dadosGerais) {
        document.getElementById('scenarioClient').textContent = data.dadosGerais.cliente || 'Não informado';
        document.getElementById('scenarioEmpreendimento').textContent = data.dadosGerais.empreendimento || 'Não informado';
        document.getElementById('scenarioUnidade').textContent = data.dadosGerais.unidade || 'Não informada';
        
        // Área privativa
        const areaPrivativa = parseFloat(data.dadosGerais.areaPrivativa) || 0;
        document.getElementById('scenarioArea').textContent = areaPrivativa > 0 ? `${areaPrivativa} m²` : '- m²';
        
        // TMA Anual
        const tmaAnual = parseFloat(data.dadosGerais.tmaAno) || 0;
        document.getElementById('scenarioTMA').textContent = `${tmaAnual.toFixed(2)}%`;
        
        console.log('✅ Informações do cenário atualizadas');
    } else {
        console.warn('⚠️ dadosGerais não encontrado');
        document.getElementById('scenarioClient').textContent = 'Não informado';
        document.getElementById('scenarioEmpreendimento').textContent = 'Não informado';
        document.getElementById('scenarioUnidade').textContent = 'Não informada';
        document.getElementById('scenarioArea').textContent = '- m²';
        document.getElementById('scenarioTMA').textContent = '0%';
    }
}

// Calcular e exibir indicadores financeiros principais
function calculateAndDisplayIndicators() {
    console.log('🧮 === CALCULANDO INDICADORES FINANCEIROS ===');
    
    if (!currentScenarioData) {
        console.error('❌ currentScenarioData é null/undefined');
        return;
    }
    
    console.log('📊 Estrutura currentScenarioData:', {
        hasData: !!currentScenarioData.data,
        name: currentScenarioData.name,
        keys: Object.keys(currentScenarioData)
    });
    
    const data = currentScenarioData.data;
    
    if (!data) {
        console.error('❌ currentScenarioData.data é null/undefined');
        showAlert('Dados do cenário não encontrados', 'error');
        return;
    }
    
    console.log('📋 Estrutura data:', {
        hasDadosGerais: !!data.dadosGerais,
        hasTabelaVendas: !!data.tabelaVendas,
        hasPropostaCliente: !!data.propostaCliente,
        keys: Object.keys(data)
    });
    
    // Validar dados necessários
    if (!validateCalculationInputs(data)) {
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
    console.log('🔍 === VALIDANDO DADOS PARA CÁLCULO ===');
    
    // Verificar se temos as estruturas principais
    const estruturas = {
        dadosGerais: !!data.dadosGerais,
        tabelaVendas: !!data.tabelaVendas,
        propostaCliente: !!data.propostaCliente
    };
    
    console.log('📊 Estruturas disponíveis:', estruturas);
    
    if (!data.dadosGerais || !data.tabelaVendas || !data.propostaCliente) {
        console.error('❌ Estruturas principais de dados ausentes');
        console.log('🔍 Dados disponíveis:', Object.keys(data));
        return false;
    }
    
    // Verificar campos essenciais com validação mais flexível
    const campos = {
        'dadosGerais.tmaAno': data.dadosGerais.tmaAno,
        'tabelaVendas.entradaValor': data.tabelaVendas.entradaValor,
        'propostaCliente.entradaValor': data.propostaCliente.entradaValor
    };
    
    console.log('🔍 Campos verificados:', campos);
    
    let camposValidos = 0;
    for (const [field, value] of Object.entries(campos)) {
        if (value !== null && value !== undefined && value !== '') {
            camposValidos++;
            console.log(`✅ ${field}: ${value}`);
        } else {
            console.warn(`⚠️ ${field}: ausente ou vazio`);
        }
    }
    
    // Exigir pelo menos alguns campos básicos
    if (camposValidos < 2) {
        console.error('❌ Dados insuficientes para cálculo');
        return false;
    }
    
    console.log('✅ Validação passou - dados suficientes para cálculo');
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
    // Se TMA vem como 22 (22%), converter para 0.22
    // Se TMA vem como 0.22 (já decimal), manter
    let tmaDecimal = parseFloat(tmaAnual) || 0;
    
    // Se o valor é maior que 1, assumir que está em percentual
    if (tmaDecimal > 1) {
        tmaDecimal = tmaDecimal / 100;
    }
    
    // Fórmula: (1 + TMA_anual)^(1/12) - 1
    const tmaMensal = Math.pow(1 + tmaDecimal, 1/12) - 1;
    
    console.log(`TMA Conversão: Anual=${tmaAnual} (${tmaDecimal}) -> Mensal=${tmaMensal.toFixed(6)} (${(tmaMensal*100).toFixed(4)}%)`);
    
    return tmaMensal;
}

// Gerar Fluxo de Caixa da Tabela (250 meses)
function generateFluxoTabela(data, valorTotal) {
    const fluxo = new Array(250).fill(0);
    const tabela = data.tabelaVendas;
    const mesVenda = parseInt(data.propostaCliente.mesVenda) || 1;
    
    console.log(`📊 Gerando fluxo TABELA - Mês de venda (só para bem móvel): ${mesVenda}`);
    
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
    
    // 1. Entrada - SEMPRE COMEÇA NO MÊS 1 (não no mesVenda)
    for (let i = 0; i < entradaParcelas && i < 250; i++) {
        fluxo[i] += valorPorEntrada;
        console.log(`Entrada Tabela Mês ${i+1}: R$ ${valorPorEntrada.toLocaleString('pt-BR')}`);
    }
    
    // 2. Parcelas mensais - COMEÇA APÓS A ENTRADA (mês 1 + entradaParcelas)
    for (let i = 0; i < parcelasQtd && (entradaParcelas + i) < 250; i++) {
        fluxo[entradaParcelas + i] += valorPorParcela;
        if (i < 5) console.log(`Parcela Tabela Mês ${entradaParcelas + i + 1}: R$ ${valorPorParcela.toLocaleString('pt-BR')}`);
    }
    
    // 3. Reforços conforme frequência - COMEÇA NO MÊS 1 + frequência
    for (let i = 0; i < reforcoQtd; i++) {
        const mesReforco = (i + 1) * reforcoFrequencia - 1; // -1 porque array é 0-indexed
        if (mesReforco < 250) {
            fluxo[mesReforco] += valorPorReforco;
            console.log(`Reforço Tabela Mês ${mesReforco + 1}: R$ ${valorPorReforco.toLocaleString('pt-BR')}`);
        }
    }
    
    // 4. Bem móvel - SÓ ESTE USA O MÊS DE VENDA
    if (bemMovelMes > 0 && bemMovelMes <= 250) {
        fluxo[bemMovelMes - 1] += bemMovelValor;
        console.log(`Bem Móvel Tabela Mês ${bemMovelMes}: R$ ${bemMovelValor.toLocaleString('pt-BR')}`);
    }
    
    const valoresNaoZero = fluxo.map((v, i) => v > 0 ? `Mês ${i+1}: R$ ${v.toLocaleString('pt-BR')}` : null).filter(Boolean);
    console.log(`✅ Fluxo TABELA gerado - Valores:`, valoresNaoZero.slice(0, 10));
    
    return fluxo;
}

// Gerar Fluxo de Caixa da Proposta (250 meses)
function generateFluxoProposta(data, valorTotal) {
    const fluxo = new Array(250).fill(0);
    const proposta = data.propostaCliente;
    const mesVenda = parseInt(proposta.mesVenda) || 1;
    
    console.log(`📊 Gerando fluxo PROPOSTA - Mês de venda (só para bem móvel): ${mesVenda}`);
    
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
    
    // 1. Entrada - SEMPRE COMEÇA NO MÊS 1 (não no mesVenda)
    for (let i = 0; i < entradaParcelas && i < 250; i++) {
        fluxo[i] += valorPorEntrada;
        console.log(`Entrada Proposta Mês ${i+1}: R$ ${valorPorEntrada.toLocaleString('pt-BR')}`);
    }
    
    // 2. Parcelas mensais - COMEÇA APÓS A ENTRADA (mês 1 + entradaParcelas)
    for (let i = 0; i < parcelasQtd && (entradaParcelas + i) < 250; i++) {
        fluxo[entradaParcelas + i] += valorPorParcela;
        if (i < 5) console.log(`Parcela Proposta Mês ${entradaParcelas + i + 1}: R$ ${valorPorParcela.toLocaleString('pt-BR')}`);
    }
    
    // 3. Reforços conforme frequência - COMEÇA NO MÊS 1 + frequência
    for (let i = 0; i < reforcoQtd; i++) {
        const mesReforco = (i + 1) * reforcoFrequencia - 1; // -1 porque array é 0-indexed
        if (mesReforco < 250) {
            fluxo[mesReforco] += valorPorReforco;
            console.log(`Reforço Proposta Mês ${mesReforco + 1}: R$ ${valorPorReforco.toLocaleString('pt-BR')}`);
        }
    }
    
    // 4. Bem móvel - SÓ ESTE USA O MÊS DE VENDA
    if (bemMovelMes > 0 && bemMovelMes <= 250) {
        fluxo[bemMovelMes - 1] += bemMovelValor;
        console.log(`Bem Móvel Proposta Mês ${bemMovelMes}: R$ ${bemMovelValor.toLocaleString('pt-BR')}`);
    }
    
    const valoresNaoZero = fluxo.map((v, i) => v > 0 ? `Mês ${i+1}: R$ ${v.toLocaleString('pt-BR')}` : null).filter(Boolean);
    console.log(`✅ Fluxo PROPOSTA gerado - Valores:`, valoresNaoZero.slice(0, 10));
    
    return fluxo;
}

// Calcular VPL usando fórmula do Excel: =VPL(taxa; fluxo_mensal)
function calculateVPL(taxa, fluxoMensal) {
    let vpl = 0;
    
    console.log(`🧮 === INÍCIO CÁLCULO VPL ===`);
    console.log(`Taxa mensal: ${(taxa * 100).toFixed(6)}%`);
    console.log(`Fluxo total tem ${fluxoMensal.length} meses`);
    
    // Contar quantos meses têm valores
    const mesesComValor = fluxoMensal.filter(valor => valor > 0).length;
    console.log(`Meses com valores > 0: ${mesesComValor}`);
    
    // Fórmula exata do Excel: VPL = Σ(Rt / (1 + i)^t)
    // Onde t começa em 1 (mês 1), não em 0
    for (let t = 1; t <= fluxoMensal.length; t++) {
        const fluxoMes = fluxoMensal[t - 1] || 0; // Array é 0-indexed, mas fórmula usa t=1
        
        if (fluxoMes > 0) {
            const fatorDesconto = Math.pow(1 + taxa, t);
            const valorDescontado = fluxoMes / fatorDesconto;
            vpl += valorDescontado;
            
            // Log detalhado para primeiros meses ou valores grandes
            if (t <= 10 || fluxoMes > 100000) {
                console.log(`Mês ${t}: Fluxo=R$ ${fluxoMes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}, Fator=(1+${(taxa*100).toFixed(4)}%)^${t}=${fatorDesconto.toFixed(6)}, VP=R$ ${valorDescontado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
            }
        }
    }
    
    console.log(`💰 VPL Final: R$ ${vpl.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
    console.log(`🧮 === FIM CÁLCULO VPL ===\n`);
    
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
    formatValueWithNegativeStyle('descontoNominalPercent', percent, true);
    
    // Card 2: Desconto Nominal R$
    formatValueWithNegativeStyle('descontoNominalReais', values ? values.descontoNominalReais : 0);
    
    // Card 3: VPL Tabela
    formatValueWithNegativeStyle('vplTabela', values ? values.vplTabela : 0);
    
    // Card 4: VPL Proposta
    formatValueWithNegativeStyle('vplProposta', values ? values.vplProposta : 0);
    
    // Card 5: Delta VPL
    formatValueWithNegativeStyle('deltaVPL', values ? values.deltaVPL : 0);
    
    // Card 6: % Delta VPL
    let percentDelta = 0;
    if (values && !isNaN(values.percentDeltaVPL)) {
        percentDelta = values.percentDeltaVPL * 100;
    }
    formatValueWithNegativeStyle('percentDeltaVPL', percentDelta, true);
    
    // Cards principais - Valor Total Imóvel e Valor Total Proposta
    document.getElementById('valorTotalImovel').textContent =
        values ? formatCurrency(values.valorTotalImovel) : 'R$ 0,00';
    document.getElementById('valorTotalProposta').textContent =
        values ? formatCurrency(values.valorTotalProposta) : 'R$ 0,00';
    
    // Resumo Financeiro (sem formatação negativa, pois são valores absolutos)
    document.getElementById('valorTotalImovelResumo').textContent =
        values ? formatCurrency(values.valorTotalImovel) : 'R$ 0,00';
    document.getElementById('valorTotalPropostaResumo').textContent =
        values ? formatCurrency(values.valorTotalProposta) : 'R$ 0,00';
    
    // Desconto Nominal % no resumo (com formatação negativa)
    let descontoResumo = 0;
    if (values && !isNaN(values.descontoNominalPercent)) {
        descontoResumo = values.descontoNominalPercent * 100;
    }
    formatValueWithNegativeStyle('descontoNominalResumo', descontoResumo, true);
    
    // Calcular R$/m² da Tabela
    const areaPrivativa = parseFloat(currentScenarioData.data.dadosGerais.areaPrivativa) || 0;
    const valorPorM2 = (values && areaPrivativa > 0) ? values.valorTotalImovel / areaPrivativa : 0;
    document.getElementById('valorPorMetroQuadrado').textContent = formatCurrency(valorPorM2);
    
    // Calcular R$/m² da Proposta
    const valorPorM2Proposta = (values && areaPrivativa > 0) ? values.valorTotalProposta / areaPrivativa : 0;
    document.getElementById('valorPorMetroQuadradoProposta').textContent = formatCurrency(valorPorM2Proposta);
}

// Atualizar preview do fluxo de caixa (tabela detalhada como no Excel)
function updateCashFlowPreview() {
    const data = currentScenarioData.data;
    
    const valorTotalImovel = calculateValorTotalImovel(data);
    const valorTotalProposta = calculateValorTotalProposta(data);
    
    const fluxoTabela = generateFluxoTabela(data, valorTotalImovel);
    const fluxoProposta = generateFluxoProposta(data, valorTotalProposta);
    
    // Gerar componentes separados para tabela e proposta
    const componentesTabela = generateComponentesFluxoTabela(data);
    const componentesProposta = generateComponentesFluxoProposta(data);
    
    const tbody = document.getElementById('fluxoCaixaDetalhado');
    tbody.innerHTML = '';
    
    // Obter período selecionado
    const periodoAnalise = parseInt(document.getElementById('periodoAnalise')?.value) || 12;
    const maxMeses = Math.min(periodoAnalise, 250);
    
    // Gerar tabela mês a mês - começando do mês 1
    for (let mes = 0; mes < maxMeses; mes++) {
        const row = document.createElement('tr');
        row.className = mes % 2 === 0 ? 'bg-gray-50' : 'bg-white';
        
        // TABELA VENDAS (primeiras 6 colunas)
        const valorTabelaTotal = fluxoTabela[mes] || 0;
        const valorTabelaEntrada = componentesTabela.entrada[mes] || 0;
        const valorTabelaParcelas = componentesTabela.parcelas[mes] || 0;
        const valorTabelaReforcos = componentesTabela.reforcos[mes] || 0;
        const valorTabelaNasChaves = componentesTabela.nasChaves[mes] || 0;
        
        // PROPOSTA CLIENTE (últimas 5 colunas)
        const valorPropostaTotal = componentesProposta.entrada[mes] + componentesProposta.parcelas[mes] + componentesProposta.reforcos[mes] + componentesProposta.nasChaves[mes];
        const valorPropostaEntrada = componentesProposta.entrada[mes] || 0;
        const valorPropostaParcelas = componentesProposta.parcelas[mes] || 0;
        const valorPropostaReforcos = componentesProposta.reforcos[mes] || 0;
        const valorPropostaBens = componentesProposta.nasChaves[mes] || 0;
        
        row.innerHTML = `
            <td class="px-3 py-2 text-center text-sm font-medium text-gray-900 border-r border-gray-200 tabela-incorporadora">${mes + 1}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200 tabela-incorporadora">${formatCurrency(valorTabelaTotal)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200 tabela-incorporadora">${formatCurrency(valorTabelaEntrada)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200 tabela-incorporadora">${formatCurrency(valorTabelaParcelas)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200 tabela-incorporadora">${formatCurrency(valorTabelaReforcos)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-orange-200 tabela-incorporadora">${formatCurrency(valorTabelaNasChaves)}</td>
            <td class="px-3 py-2 text-right text-sm font-semibold text-gray-900 border-r border-orange-200 proposta-cliente">${formatCurrency(valorPropostaTotal)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-orange-200 proposta-cliente">${formatCurrency(valorPropostaEntrada)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-orange-200 proposta-cliente">${formatCurrency(valorPropostaParcelas)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-orange-200 proposta-cliente">${formatCurrency(valorPropostaReforcos)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 proposta-cliente">${formatCurrency(valorPropostaBens)}</td>
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
    
    // 1. Entrada - SEMPRE COMEÇA NO MÊS 1
    for (let i = 0; i < entradaParcelas && i < 250; i++) {
        entrada[i] = valorPorEntrada;
    }
    
    // 2. Parcelas mensais - COMEÇA APÓS A ENTRADA
    for (let i = 0; i < parcelasQtd && (entradaParcelas + i) < 250; i++) {
        parcelas[entradaParcelas + i] = valorPorParcela;
    }
    
    // 3. Reforços conforme frequência (ex: a cada 6 meses) - COMEÇA NO MÊS 1 + frequência
    for (let i = 0; i < reforcoQtd; i++) {
        const mesReforco = (i + 1) * reforcoFrequencia - 1; // -1 porque array é 0-indexed
        if (mesReforco < 250) {
            reforcos[mesReforco] = valorPorReforco;
        }
    }
    
    // 4. Bem móvel - SÓ ESTE USA O MÊS DE VENDA
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

// Gerar componentes do fluxo da TABELA VENDAS
function generateComponentesFluxoTabela(data) {
    const tabela = data.tabelaVendas;
    const mesVenda = parseInt(data.propostaCliente.mesVenda) || 1;
    
    // Arrays para cada componente da TABELA
    const entrada = new Array(250).fill(0);
    const parcelas = new Array(250).fill(0);
    const reforcos = new Array(250).fill(0);
    const nasChaves = new Array(250).fill(0);
    
    // Valores da TABELA VENDAS
    const entradaValor = parseFloat(tabela.entradaValor) || 0;
    const entradaParcelas = parseInt(tabela.entradaParcelas) || 1;
    const parcelasValor = parseFloat(tabela.parcelasValor) || 0;
    const parcelasQtd = parseInt(tabela.parcelasQtd) || 0;
    const reforcoValor = parseFloat(tabela.reforcoValor) || 0;
    const reforcoQtd = parseInt(tabela.reforcoQtd) || 0;
    const reforcoFrequencia = parseInt(tabela.reforcoFrequencia) || 12;
    
    // Bem móvel da TABELA
    const bemMovelValor = parseFloat(tabela.bemMovelImovel) || 0;
    const bemMovelMes = parseInt(tabela.bemMovelImovelMes) || mesVenda;
    
    // Calcular valores por parcela da TABELA
    const valorPorEntrada = entradaParcelas > 0 ? entradaValor / entradaParcelas : entradaValor;
    const valorPorParcela = parcelasQtd > 0 ? parcelasValor / parcelasQtd : 0;
    const valorPorReforco = reforcoQtd > 0 ? reforcoValor / reforcoQtd : 0;
    
    // 1. Entrada da TABELA - SEMPRE COMEÇA NO MÊS 1
    for (let i = 0; i < entradaParcelas && i < 250; i++) {
        entrada[i] = valorPorEntrada;
    }
    
    // 2. Parcelas mensais da TABELA - COMEÇA APÓS A ENTRADA
    for (let i = 0; i < parcelasQtd && (entradaParcelas + i) < 250; i++) {
        parcelas[entradaParcelas + i] = valorPorParcela;
    }
    
    // 3. Reforços da TABELA - COMEÇA NO MÊS 1 + frequência
    for (let i = 0; i < reforcoQtd; i++) {
        const mesReforco = (i + 1) * reforcoFrequencia - 1; // -1 porque array é 0-indexed
        if (mesReforco < 250) {
            reforcos[mesReforco] = valorPorReforco;
        }
    }
    
    // 4. Bem móvel da TABELA - SÓ ESTE USA O MÊS DE VENDA
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

// Função para formatar valor com estilo negativo (parênteses e vermelho)
function formatValueWithNegativeStyle(elementId, value, isPercentage = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let formattedValue;
    let isNegative = false;
    
    if (value === null || value === undefined || isNaN(value)) {
        formattedValue = isPercentage ? '0,00%' : 'R$ 0,00';
    } else {
        isNegative = value < 0;
        const absValue = Math.abs(value);
        
        if (isPercentage) {
            formattedValue = `${absValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%`;
        } else {
            formattedValue = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(absValue);
        }
        
        if (isNegative) {
            formattedValue = `(${formattedValue})`;
        }
    }
    
    element.textContent = formattedValue;
    
    // Aplicar ou remover classe de estilo negativo
    if (isNegative) {
        element.classList.add('negative-value');
    } else {
        element.classList.remove('negative-value');
    }
}

function showAlert(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Aqui você pode implementar um sistema de alertas visual se necessário
}

// Função para exportar relatório em PDF
function exportToPDF() {
    console.log('🔍 Iniciando exportação PDF');
    
    // Verificar se há dados para exportar
    const scenarioName = document.getElementById('scenarioName').textContent || 'Nome do Cenário';
    if (scenarioName === 'Nome do Cenário') {
        if (window.showAlert) {
            showAlert('warning', 'Selecione um cenário antes de exportar o relatório.');
        } else {
            alert('Selecione um cenário antes de exportar o relatório.');
        }
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Configurações básicas
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        let yPosition = margin;
        
        // Cabeçalho com logo centralizada
        doc.setFillColor(20, 184, 166); // Cor teal
        doc.rect(0, 0, pageWidth, 30, 'F');
        
        // Logo centralizada no cabeçalho (usando texto como fallback)
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        const text = 'ModelAI';
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, 20);
        
        yPosition = 40;
        doc.setTextColor(0, 0, 0);
        
        // Título do relatório
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Relatório de Análise Financeira', margin, yPosition);
        yPosition += 10;
        
        // Data e hora do relatório
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const agora = new Date();
        const dataHora = `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR')}`;
        doc.text(`Relatório gerado em: ${dataHora}`, margin, yPosition);
        yPosition += 15;
        
        // Informações do cenário
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Informações do Cenário', margin, yPosition);
        yPosition += 8;
        
        const scenarioClient = document.getElementById('scenarioClient').textContent || 'Cliente';
        const scenarioEmpreendimento = document.getElementById('scenarioEmpreendimento').textContent || 'Empreendimento';
        const scenarioUnidade = document.getElementById('scenarioUnidade').textContent || 'Unidade';
        const scenarioTMA = document.getElementById('scenarioTMA').textContent || '0%';
        
        const infoData = [
            ['Nome do Cenário', scenarioName],
            ['Cliente', scenarioClient],
            ['Empreendimento', scenarioEmpreendimento],
            ['Unidade', scenarioUnidade],
            ['TMA Anual', scenarioTMA]
        ];
        
        doc.autoTable({
            startY: yPosition,
            body: infoData,
            theme: 'plain',
            bodyStyles: {
                fontSize: 10,
                cellPadding: 2
            },
            columnStyles: {
                0: { cellWidth: 50, fontStyle: 'bold' },
                1: { cellWidth: 80 }
            },
            margin: { left: margin, right: margin }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
        
        // Indicadores financeiros principais
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Indicadores Financeiros Principais', margin, yPosition);
        yPosition += 8;
        
        // Dados dos cards
        const indicadores = [
            ['Desconto Nominal %', document.getElementById('descontoNominalPercent').textContent, '(Valor Proposta/Valor Imóvel)-1'],
            ['Desconto Nominal R$', document.getElementById('descontoNominalReais').textContent, 'Valor Imóvel - Valor Proposta'],
            ['VPL Tabela', document.getElementById('vplTabela').textContent, 'VPL(TMA_mês;Fluxo_mês1:mês250)'],
            ['VPL Proposta', document.getElementById('vplProposta').textContent, 'VPL(TMA_mês;Proposta_mês1:mês250)'],
            ['Delta VPL', document.getElementById('deltaVPL').textContent, 'VPL Proposta - VPL Tabela'],
            ['% Delta VPL', document.getElementById('percentDeltaVPL').textContent, 'SEERRO(Delta_VPL/VPL_Tabela;0)']
        ];
        
        // Tabela de indicadores
        doc.autoTable({
            startY: yPosition,
            head: [['Indicador', 'Valor', 'Fórmula']],
            body: indicadores,
            theme: 'striped',
            headStyles: {
                fillColor: [20, 184, 166],
                textColor: 255,
                fontSize: 11,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 9,
                cellPadding: 4
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { cellWidth: 45, fontStyle: 'bold' },
                1: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
                2: { cellWidth: 80, fontSize: 8 }
            },
            margin: { left: margin, right: margin }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
        
        // Resumo financeiro
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumo Financeiro', margin, yPosition);
        yPosition += 8;
        
        const valorTotalImovel = document.getElementById('valorTotalImovel').textContent || 'R$ 0,00';
        const valorTotalProposta = document.getElementById('valorTotalProposta').textContent || 'R$ 0,00';
        const descontoNominalResumo = document.getElementById('descontoNominalResumo').textContent || '0,00%';
        
        const resumoFinanceiro = [
            ['Valor Total Imóvel', valorTotalImovel],
            ['Valor Total Proposta', valorTotalProposta],
            ['Desconto Nominal %', descontoNominalResumo]
        ];
        
        doc.autoTable({
            startY: yPosition,
            body: resumoFinanceiro,
            theme: 'grid',
            bodyStyles: {
                fontSize: 10,
                cellPadding: 4
            },
            columnStyles: {
                0: { cellWidth: 70, fontStyle: 'bold', fillColor: [240, 240, 240] },
                1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: margin, right: margin }
        });
        
        // Nova página para o fluxo de caixa
        doc.addPage();
        yPosition = margin;
        
        // Cabeçalho da segunda página
        doc.setFillColor(20, 184, 166);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const titulo = 'Fluxo de Caixa Detalhado';
        const tituloWidth = doc.getTextWidth(titulo);
        doc.text(titulo, (pageWidth - tituloWidth) / 2, 20);
        
        yPosition = 40;
        doc.setTextColor(0, 0, 0);
        
        // Período de análise - USAR O FILTRO SELECIONADO
        const periodoSelect = document.getElementById('periodoAnalise');
        const periodoSelecionado = periodoSelect ? periodoSelect.value : '12';
        const numPeriodos = parseInt(periodoSelecionado);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Período de Análise: ${periodoSelecionado} meses`, margin, yPosition);
        yPosition += 10;
        
        // Coletar dados da tabela de fluxo de caixa
        const fluxoTable = document.getElementById('fluxoCaixaDetalhado');
        const fluxoData = [];
        
        if (fluxoTable) {
            const rows = fluxoTable.querySelectorAll('tr');
            
            // USAR O PERÍODO SELECIONADO PELO USUÁRIO
            const maxRows = Math.min(rows.length, numPeriodos);
            
            console.log(`📊 Exportando ${maxRows} linhas de fluxo de caixa (período selecionado: ${periodoSelecionado})`);
            
            for (let i = 0; i < maxRows; i++) {
                const cells = rows[i].querySelectorAll('td');
                if (cells.length > 0) {
                    const rowData = [];
                    // Pegar as primeiras 6 colunas principais
                    for (let j = 0; j < Math.min(cells.length, 6); j++) {
                        rowData.push(cells[j].textContent.trim());
                    }
                    fluxoData.push(rowData);
                }
            }
        }
        
        if (fluxoData.length > 0) {
            doc.autoTable({
                startY: yPosition,
                head: [['Mês', 'Tabela Inc', 'Entrada', 'Parcelas', 'Reforços', 'Nas Chaves']],
                body: fluxoData,
                theme: 'striped',
                headStyles: {
                    fillColor: [20, 184, 166],
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: 8,
                    cellPadding: 2
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                columnStyles: {
                    0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
                    1: { cellWidth: 28, halign: 'right' },
                    2: { cellWidth: 28, halign: 'right' },
                    3: { cellWidth: 28, halign: 'right' },
                    4: { cellWidth: 28, halign: 'right' },
                    5: { cellWidth: 28, halign: 'right' }
                },
                margin: { left: margin, right: margin }
            });
        } else {
            doc.setFontSize(10);
            doc.text('Nenhum dado de fluxo de caixa disponível para exibição.', margin, yPosition);
        }
        
        // Rodapé em todas as páginas
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Linha do rodapé
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, doc.internal.pageSize.height - 20, pageWidth - margin, doc.internal.pageSize.height - 20);
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            
            // Texto esquerdo
            doc.text('ModelAI - Sistema de Análise Financeira', margin, doc.internal.pageSize.height - 12);
            
            // Número da página (direita)
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 20, doc.internal.pageSize.height - 12);
            
            // Data/hora (centro)
            const footerText = `Gerado em ${dataHora}`;
            const textWidth = doc.getTextWidth(footerText);
            doc.text(footerText, (pageWidth - textWidth) / 2, doc.internal.pageSize.height - 12);
        }
        
        // Gerar nome do arquivo
        const fileName = `ModelAI_Analise_${scenarioName.replace(/[^a-zA-Z0-9]/g, '_')}_${agora.toISOString().slice(0,10)}.pdf`;
        
        // Fazer download
        doc.save(fileName);
        
        console.log('✅ PDF exportado com sucesso:', fileName);
        console.log(`📊 Total de linhas exportadas: ${fluxoData.length} (período: ${periodoSelecionado} meses)`);
        
        // Mostrar mensagem de sucesso
        if (window.showAlert) {
            showAlert('success', `PDF "${fileName}" exportado com sucesso! (${fluxoData.length} meses de dados)`);
        } else {
            alert(`PDF "${fileName}" exportado com sucesso! (${fluxoData.length} meses de dados)`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao exportar PDF:', error);
        
        // Mostrar mensagem de erro
        if (window.showAlert) {
            showAlert('error', 'Erro ao exportar PDF. Verifique se os dados estão carregados e tente novamente.');
        } else {
            alert('Erro ao exportar PDF. Verifique se os dados estão carregados e tente novamente.');
        }
    }
}

// Função para exportar tabela de fluxo de caixa para Excel
function exportTableToExcel() {
    try {
        // Verificar se a biblioteca XLSX está disponível
        if (typeof XLSX === 'undefined') {
            alert('Biblioteca de exportação Excel não carregada. Recarregue a página e tente novamente.');
            return;
        }
        
        // Obter informações do cenário
        const scenarioName = document.getElementById('scenarioName').textContent || 'Cenario';
        const scenarioClient = document.getElementById('scenarioClient').textContent || 'Cliente';
        const scenarioEmpreendimento = document.getElementById('scenarioEmpreendimento').textContent || 'Empreendimento';
        const scenarioUnidade = document.getElementById('scenarioUnidade').textContent || 'Unidade';
        const scenarioArea = document.getElementById('scenarioArea').textContent || '- m²';
        const periodoSelecionado = document.getElementById('periodoAnalise').value || '12';
        
        // Obter dados da tabela
        const table = document.querySelector('#fluxoCaixaDetalhado').closest('table');
        const rows = table.querySelectorAll('tbody tr');
        
        if (rows.length === 0) {
            alert('Nenhum dado disponível para exportar. Carregue um cenário primeiro.');
            return;
        }
        
        // Criar dados do Excel
        const excelData = [];
        
        // Adicionar informações do cenário no topo
        excelData.push(['MODELAI - ANÁLISE FINANCEIRA']);
        excelData.push(['Cenário:', scenarioName]);
        excelData.push(['Cliente:', scenarioClient]);
        excelData.push(['Empreendimento:', scenarioEmpreendimento]);
        excelData.push(['Unidade:', scenarioUnidade]);
        excelData.push(['Área Privativa:', scenarioArea]);
        excelData.push(['Período de Análise:', `${periodoSelecionado} meses`]);
        excelData.push(['Data de Exportação:', new Date().toLocaleDateString('pt-BR')]);
        excelData.push([]); // Linha em branco
        
        // Adicionar resumo financeiro
        const valorTotalImovel = document.getElementById('valorTotalImovel').textContent || 'R$ 0,00';
        const valorTotalProposta = document.getElementById('valorTotalProposta').textContent || 'R$ 0,00';
        const descontoNominalResumo = document.getElementById('descontoNominalResumo').textContent || '0,00%';
        const valorPorMetroQuadrado = document.getElementById('valorPorMetroQuadrado').textContent || 'R$ 0,00';
        const valorPorMetroQuadradoProposta = document.getElementById('valorPorMetroQuadradoProposta').textContent || 'R$ 0,00';
        
        excelData.push(['RESUMO FINANCEIRO']);
        excelData.push(['Valor Total Imóvel:', valorTotalImovel]);
        excelData.push(['Valor Total Proposta:', valorTotalProposta]);
        excelData.push(['Desconto Nominal:', descontoNominalResumo]);
        excelData.push(['R$/m² Tabela:', valorPorMetroQuadrado]);
        excelData.push(['R$/m² Proposta:', valorPorMetroQuadradoProposta]);
        excelData.push([]); // Linha em branco
        
        // Adicionar cabeçalhos
        const headers = [
            'MÊS', 'TABELA INC', 'ENTRADA', 'PARCELAS', 'REFORÇOS', 'NAS CHAVES',
            'PROPOSTA CLIENTE', 'ENTRADA', 'PARCELAS', 'REFORÇOS', 'BENS MÓVEIS/IMÓVEIS'
        ];
        excelData.push(headers);
        
        // Determinar quantas linhas exportar baseado no período selecionado
        const maxRows = Math.min(parseInt(periodoSelecionado), rows.length);
        
        // Adicionar dados das linhas
        for (let i = 0; i < maxRows; i++) {
            const cells = rows[i].querySelectorAll('td');
            const rowData = [];
            
            for (let j = 0; j < cells.length; j++) {
                let cellValue = cells[j].textContent.trim();
                
                // Manter a formatação original com R$ para melhor apresentação
                // Apenas limpar espaços extras se houver
                cellValue = cellValue.replace(/\s+/g, ' ').trim();
                
                rowData.push(cellValue);
            }
            excelData.push(rowData);
        }
        
        // Criar workbook e worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // Configurar larguras das colunas
        const colWidths = [
            { wch: 8 },  // MÊS
            { wch: 18 }, // TABELA INC
            { wch: 18 }, // ENTRADA
            { wch: 18 }, // PARCELAS
            { wch: 18 }, // REFORÇOS
            { wch: 18 }, // NAS CHAVES
            { wch: 20 }, // PROPOSTA CLIENTE
            { wch: 18 }, // ENTRADA
            { wch: 18 }, // PARCELAS
            { wch: 18 }, // REFORÇOS
            { wch: 22 }  // BENS MÓVEIS/IMÓVEIS
        ];
        ws['!cols'] = colWidths;
        
        // Adicionar worksheet ao workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Fluxo de Caixa');
        
        // Gerar nome do arquivo
        const agora = new Date();
        const dataFormatada = agora.toISOString().slice(0, 10);
        const fileName = `ModelAI_FluxoCaixa_${scenarioName.replace(/[^a-zA-Z0-9]/g, '_')}_${periodoSelecionado}meses_${dataFormatada}.xlsx`;
        
        // Salvar arquivo
        XLSX.writeFile(wb, fileName);
        
        console.log('✅ Tabela exportada para Excel:', fileName);
        console.log(`📊 Total de linhas exportadas: ${maxRows} (período: ${periodoSelecionado} meses)`);
        
        if (window.showAlert) {
            showAlert('success', `Tabela exportada com sucesso! Arquivo: "${fileName}" (${maxRows} meses de dados)`);
        } else {
            alert(`Tabela exportada com sucesso! Arquivo: "${fileName}" (${maxRows} meses de dados)`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao exportar tabela para Excel:', error);
        if (window.showAlert) {
            showAlert('error', 'Erro ao exportar tabela. Verifique se os dados estão carregados e tente novamente.');
        } else {
            alert('Erro ao exportar tabela. Verifique se os dados estão carregados e tente novamente.');
        }
    }
}

// Variável global para armazenar a instância do gráfico
let fluxoChart = null;

// Criar gráfico comparativo de fluxos
function createFluxoComparativoChart(periodoMeses = null) {
    if (!currentScenarioData) {
        console.log('🚫 Não há dados de cenário para criar o gráfico');
        return;
    }
    
    const data = currentScenarioData.data;
    const valorTotalImovel = calculateValorTotalImovel(data);
    const valorTotalProposta = calculateValorTotalProposta(data);
    
    const fluxoTabela = generateFluxoTabela(data, valorTotalImovel);
    const fluxoProposta = generateFluxoProposta(data, valorTotalProposta);
    
    // Usar o período selecionado ou pegar do seletor do gráfico
    let meses = periodoMeses;
    if (!meses) {
        meses = parseInt(document.getElementById('periodoGrafico')?.value) || 24;
    }
    
    // Preparar dados para o gráfico
    const labels = [];
    const dadosTabela = [];
    const dadosProposta = [];
    
    // Primeiro, coletar todos os dados até o período máximo
    for (let i = 0; i < meses; i++) {
        labels.push(`Mês ${i + 1}`);
        dadosTabela.push(fluxoTabela[i] || 0);
        dadosProposta.push(fluxoProposta[i] || 0);
    }
    
    // Encontrar o último mês com dados reais (não zero) para ambas as séries
    let ultimoMesComDados = 0;
    for (let i = meses - 1; i >= 0; i--) {
        if (dadosTabela[i] > 0 || dadosProposta[i] > 0) {
            ultimoMesComDados = i + 1; // +1 porque queremos incluir este mês
            break;
        }
    }
    
    // Se encontrou dados, truncar as arrays no último mês com dados
    // Mas garantir pelo menos 12 meses para visualização
    const mesesParaExibir = Math.max(ultimoMesComDados, 12);
    
    // Truncar os dados se necessário
    if (mesesParaExibir < meses) {
        labels.splice(mesesParaExibir);
        dadosTabela.splice(mesesParaExibir);
        dadosProposta.splice(mesesParaExibir);
    }
    
    const ctx = document.getElementById('fluxoComparativoChart');
    if (!ctx) {
        console.error('❌ Canvas do gráfico não encontrado');
        return;
    }
    
    // Destruir gráfico anterior se existir
    if (fluxoChart) {
        fluxoChart.destroy();
    }
    
    // Criar novo gráfico
    fluxoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tabela Incorporadora',
                    data: dadosTabela,
                    borderColor: 'rgb(20, 184, 166)', // Teal
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgb(20, 184, 166)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Proposta Cliente',
                    data: dadosProposta,
                    borderColor: 'rgb(249, 115, 22)', // Laranja
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgb(249, 115, 22)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: true,
                    text: `Comparação de Fluxos de Caixa - ${labels.length} Meses`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#374151'
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        color: '#374151'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#374151',
                    bodyColor: '#374151',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            const label = context.dataset.label;
                            return `${label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 11
                        },
                        maxTicksLimit: Math.min(labels.length, 20) // Limitar número de ticks no eixo X
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            elements: {
                point: {
                    hoverBorderWidth: 3
                }
            }
        }
    });
    
    console.log(`📊 Gráfico comparativo criado com ${labels.length} meses (últimos dados no mês ${ultimoMesComDados})`);
}

// Criar gráfico padrão vazio
function createDefaultChart(periodoMeses = 12) {
    const ctx = document.getElementById('fluxoComparativoChart');
    if (!ctx) {
        console.error('❌ Canvas do gráfico não encontrado');
        return;
    }
    
    // Dados vazios para o período especificado
    const labels = [];
    for (let i = 1; i <= periodoMeses; i++) {
        labels.push(`Mês ${i}`);
    }
    
    const dadosVazios = new Array(periodoMeses).fill(0);
    
    // Destruir gráfico anterior se existir
    if (fluxoChart) {
        fluxoChart.destroy();
    }
    
    // Criar gráfico vazio
    fluxoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tabela Incorporadora',
                    data: dadosVazios,
                    borderColor: 'rgb(20, 184, 166)',
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgb(20, 184, 166)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Proposta Cliente',
                    data: dadosVazios,
                    borderColor: 'rgb(249, 115, 22)',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgb(249, 115, 22)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Selecione um cenário para visualizar a comparação',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#9CA3AF'
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        color: '#6B7280'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#9CA3AF',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#9CA3AF',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
    
    console.log('📊 Gráfico padrão vazio criado');
}

// Atualizar filtros com dados do cenário atual
function updateFiltersWithScenarioData() {
    if (!currentScenarioData) {
        console.log('🚫 Sem dados de cenário para atualizar filtros');
        return;
    }
    
    const data = currentScenarioData.data;
    const valorTotalImovel = calculateValorTotalImovel(data);
    const valorTotalProposta = calculateValorTotalProposta(data);
    
    const fluxoTabela = generateFluxoTabela(data, valorTotalImovel);
    const fluxoProposta = generateFluxoProposta(data, valorTotalProposta);
    
    // Encontrar o último mês com dados reais
    let maxMesesComDados = 0;
    for (let i = 249; i >= 0; i--) { // 250 meses máximo, índice 0-249
        if ((fluxoTabela[i] && fluxoTabela[i] > 0) || (fluxoProposta[i] && fluxoProposta[i] > 0)) {
            maxMesesComDados = i + 1; // +1 porque array é 0-indexed
            break;
        }
    }
    
    if (maxMesesComDados > 0) {
        console.log(`📅 Máximo de meses com dados encontrado: ${maxMesesComDados}`);
        
        // Atualizar filtro do gráfico
        updateSelectWithMaxOption('periodoGrafico', maxMesesComDados);
        
        // Atualizar filtro da tabela
        updateSelectWithMaxOption('periodoAnalise', maxMesesComDados);
    }
}

// Limpar resultados quando nenhum cenário está selecionado
function clearResults() {
    console.log('🧹 Limpando resultados');
    
    // Limpar dados do cenário atual
    currentScenarioData = null;
    
    // Restaurar cards padrão
    renderDefaultCards();
    
    // Restaurar tabela padrão
    renderDefaultFluxoCaixa();
    
    // Restaurar gráfico padrão
    createDefaultChart();
    
    // Limpar opções do cenário nos filtros
    clearScenarioOptionsFromFilters();
    
    // Restaurar informações do cenário
    document.getElementById('scenarioName').textContent = 'Nome do Cenário';
    document.getElementById('scenarioClient').textContent = 'Cliente';
    document.getElementById('scenarioEmpreendimento').textContent = 'Empreendimento';
    document.getElementById('scenarioUnidade').textContent = 'Unidade';
    document.getElementById('scenarioArea').textContent = '- m²';
    document.getElementById('scenarioTMA').textContent = '0%';
}

// Limpar opções do cenário dos filtros
function clearScenarioOptionsFromFilters() {
    // Limpar do filtro do gráfico
    const periodoGrafico = document.getElementById('periodoGrafico');
    if (periodoGrafico) {
        const scenarioOption = periodoGrafico.querySelector('option[data-scenario-max]');
        if (scenarioOption) {
            scenarioOption.remove();
            console.log('🧹 Removida opção do cenário do filtro do gráfico');
        }
    }
    
    // Limpar do filtro da tabela
    const periodoAnalise = document.getElementById('periodoAnalise');
    if (periodoAnalise) {
        const scenarioOption = periodoAnalise.querySelector('option[data-scenario-max]');
        if (scenarioOption) {
            scenarioOption.remove();
            console.log('🧹 Removida opção do cenário do filtro da tabela');
        }
    }
}

// Atualizar um select adicionando opção com máximo de meses
function updateSelectWithMaxOption(selectId, maxMeses) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.error(`❌ Select ${selectId} não encontrado`);
        return;
    }
    
    // Remover opção anterior do cenário se existir
    const existingOption = select.querySelector('option[data-scenario-max]');
    if (existingOption) {
        existingOption.remove();
    }
    
    // Verificar se já existe uma opção padrão com esse valor
    const existingStandardOption = Array.from(select.options).find(option => 
        parseInt(option.value) === maxMeses && !option.hasAttribute('data-scenario-max')
    );
    
    if (!existingStandardOption) {
        // Criar nova opção
        const newOption = document.createElement('option');
        newOption.value = maxMeses;
        newOption.textContent = `${maxMeses} meses (máximo do cenário)`;
        newOption.setAttribute('data-scenario-max', 'true');
        
        // Encontrar a posição correta para inserir (em ordem crescente)
        let insertIndex = select.options.length;
        for (let i = 0; i < select.options.length; i++) {
            const optionValue = parseInt(select.options[i].value);
            if (optionValue > maxMeses) {
                insertIndex = i;
                break;
            }
        }
        
        // Inserir na posição correta
        if (insertIndex < select.options.length) {
            select.insertBefore(newOption, select.options[insertIndex]);
        } else {
            select.appendChild(newOption);
        }
        
        console.log(`✅ Adicionada opção '${maxMeses} meses (máximo do cenário)' ao select ${selectId}`);
    } else {
        console.log(`ℹ️ Opção ${maxMeses} meses já existe no select ${selectId}`);
    }
}

// Exportar funções para uso global
window.initializeResultsPage = initializeResultsPage;
window.exportToPDF = exportToPDF;
window.exportTableToExcel = exportTableToExcel;

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', initializeResultsPage);
