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
    console.log('🔄 === INICIALIZANDO PÁGINA DE RESULTADOS ===');
    
    // Verificar se há parâmetros na URL que podem estar causando problemas
    const urlParams = new URLSearchParams(window.location.search);
    const scenarioParam = urlParams.get('scenario');
    const idParam = urlParams.get('id');
    
    console.log('🔍 Parâmetros da URL:', { scenarioParam, idParam });
    
    if (scenarioParam && scenarioParam !== 'undefined') {
        console.log('📋 Parâmetro de cenário encontrado na URL:', scenarioParam);
        // Pode implementar carregamento automático aqui se necessário
    }
    
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
    console.log('🔗 === CONFIGURANDO EVENT LISTENERS ===');
    
    const scenarioFilter = document.getElementById('scenarioFilter');
    if (scenarioFilter) {
        console.log('✅ scenarioFilter encontrado, configurando listener...');
        
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
            console.log('✅ Cenário carregado com sucesso, exibindo resultados');
            displayResults();
        } else {
            console.log('⚠️ Cenário não foi carregado, mantendo cards zerados');
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
        
        // TMA Anual
        const tmaAnual = parseFloat(data.dadosGerais.tmaAno) || 0;
        document.getElementById('scenarioTMA').textContent = `${tmaAnual.toFixed(2)}%`;
        
        console.log('✅ Informações do cenário atualizadas');
    } else {
        console.warn('⚠️ dadosGerais não encontrado');
        document.getElementById('scenarioClient').textContent = 'Não informado';
        document.getElementById('scenarioEmpreendimento').textContent = 'Não informado';
        document.getElementById('scenarioUnidade').textContent = 'Não informada';
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
            <td class="px-3 py-2 text-center text-sm font-medium text-gray-900 border-r border-gray-200">${mes + 1}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200">${formatCurrency(valorTabelaTotal)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200">${formatCurrency(valorTabelaEntrada)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200">${formatCurrency(valorTabelaParcelas)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200">${formatCurrency(valorTabelaReforcos)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200">${formatCurrency(valorTabelaNasChaves)}</td>
            <td class="px-3 py-2 text-right text-sm font-semibold text-gray-900 border-r border-gray-200">${formatCurrency(valorPropostaTotal)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200">${formatCurrency(valorPropostaEntrada)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200">${formatCurrency(valorPropostaParcelas)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900 border-r border-gray-200">${formatCurrency(valorPropostaReforcos)}</td>
            <td class="px-3 py-2 text-right text-sm text-gray-900">${formatCurrency(valorPropostaBens)}</td>
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

function showAlert(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Aqui você pode implementar um sistema de alertas visual se necessário
}

// Exportar funções para uso global
window.initializeResultsPage = initializeResultsPage;

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', initializeResultsPage);
