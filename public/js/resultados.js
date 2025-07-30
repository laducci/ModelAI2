// ================================
// RESULTADOS.JS - VERSÃO LIMPA
// ================================

// Sidebar toggle functionality
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const toggleBtn = document.getElementById('toggleSidebar');

if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });
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

// Funções de formatação brasileira
function formatCurrency(value) {
    if (!value || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatNumber(value) {
    if (!value || isNaN(value)) return '0';
    return new Intl.NumberFormat('pt-BR').format(value);
}

function formatPercent(value) {
    if (!value || isNaN(value)) return '0,00%';
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
}

function parseCurrency(value) {
    if (!value) return 0;
    return parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}

// Função para calcular TMA mensal
function calcularTmaMensal(tmaAnual) {
    return Math.pow(1 + (tmaAnual / 100), 1/12) - 1;
}

// ================================
// FUNÇÕES PARA EXIBIR RESULTADOS CALCULADOS
// ================================

// Função para exibir resultados pré-calculados nos 6 cards
function displayCalculatedResults(results) {
    console.log('🎯 Exibindo resultados calculados:', results);
    
    try {
        // Card 1: DESCONTO NOMINAL (%)
        const descontoNominalCard = document.querySelector('[data-card="desconto-nominal"]');
        if (descontoNominalCard) {
            const valueEl = descontoNominalCard.querySelector('.text-3xl, .text-4xl');
            if (valueEl && results.descontoNominalPercent !== undefined) {
                valueEl.textContent = formatPercent(results.descontoNominalPercent);
            }
        }
        
        // Card 2: DELTA DESCONTO (R$)
        const deltaDescontoCard = document.querySelector('[data-card="delta-desconto"]');
        if (deltaDescontoCard) {
            const valueEl = deltaDescontoCard.querySelector('.text-3xl, .text-4xl');
            if (valueEl && results.descontoNominalReais !== undefined) {
                valueEl.textContent = formatCurrency(results.descontoNominalReais);
            }
        }
        
        // Card 3: VPL TABELA
        const vplTabelaCard = document.querySelector('[data-card="vpl-tabela"]');
        if (vplTabelaCard) {
            const valueEl = vplTabelaCard.querySelector('.text-3xl, .text-4xl');
            if (valueEl && results.vplTabela !== undefined) {
                valueEl.textContent = formatCurrency(results.vplTabela);
            }
        }
        
        // Card 4: VPL PROPOSTA
        const vplPropostaCard = document.querySelector('[data-card="vpl-proposta"]');
        if (vplPropostaCard) {
            const valueEl = vplPropostaCard.querySelector('.text-3xl, .text-4xl');
            if (valueEl && results.vplProposta !== undefined) {
                valueEl.textContent = formatCurrency(results.vplProposta);
            }
        }
        
        // Card 5: DELTA DE VPL
        const deltaVplCard = document.querySelector('[data-card="delta-vpl"]');
        if (deltaVplCard) {
            const valueEl = deltaVplCard.querySelector('.text-3xl, .text-4xl');
            if (valueEl && results.deltaVpl !== undefined) {
                valueEl.textContent = formatCurrency(results.deltaVpl);
            }
        }
        
        // Card 6: % DELTA VPL
        const percentDeltaVplCard = document.querySelector('[data-card="percent-delta-vpl"]');
        if (percentDeltaVplCard) {
            const valueEl = percentDeltaVplCard.querySelector('.text-3xl, .text-4xl');
            if (valueEl && results.percentualDeltaVpl !== undefined) {
                valueEl.textContent = formatPercent(results.percentualDeltaVpl);
            }
        }
        
        console.log('✅ Resultados exibidos nos cards com sucesso');
        
        // Atualizar timestamp se houver
        if (results.calculatedAt) {
            const timestamp = new Date(results.calculatedAt);
            console.log('🕐 Cálculo realizado em:', timestamp.toLocaleString('pt-BR'));
        }
        
    } catch (error) {
        console.error('❌ Erro ao exibir resultados calculados:', error);
    }
}

// Função alternativa para buscar cards por texto (caso data-card não exista)
function displayCalculatedResultsByText(results) {
    console.log('🎯 Exibindo resultados por busca de texto:', results);
    
    try {
        // Encontrar cards pelos títulos
        const cards = document.querySelectorAll('.bg-white, .glassmorphism');
        
        cards.forEach(card => {
            const titleElement = card.querySelector('h3, h4, .font-bold');
            if (!titleElement) return;
            
            const title = titleElement.textContent.trim().toUpperCase();
            const valueElement = card.querySelector('.text-3xl, .text-4xl, .text-2xl');
            
            if (!valueElement) return;
            
            // Mapear títulos para valores
            if (title.includes('DESCONTO NOMINAL') && title.includes('%')) {
                valueElement.textContent = formatPercent(results.descontoNominalPercent || 0);
            } else if (title.includes('DELTA DESCONTO') || (title.includes('DESCONTO') && title.includes('R$'))) {
                valueElement.textContent = formatCurrency(results.descontoNominalReais || 0);
            } else if (title.includes('VPL TABELA')) {
                valueElement.textContent = formatCurrency(results.vplTabela || 0);
            } else if (title.includes('VPL PROPOSTA')) {
                valueElement.textContent = formatCurrency(results.vplProposta || 0);
            } else if (title.includes('DELTA DE VPL') || title.includes('DELTA VPL')) {
                valueElement.textContent = formatCurrency(results.deltaVpl || 0);
            } else if (title.includes('% DELTA VPL') || title.includes('DELTA VPL %')) {
                valueElement.textContent = formatPercent(results.percentualDeltaVpl || 0);
            }
        });
        
        console.log('✅ Resultados exibidos por texto com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao exibir resultados por texto:', error);
    }
}

// Função para atualizar os dados na página
function updateResultados() {
    try {
        console.log('🔄 === ATUALIZANDO RESULTADOS ===');
        
        // Obter dados do cenário
        const scenarioData = sessionStorage.getItem('currentInputData');
        if (!scenarioData) {
            console.log('⚠️ Nenhum dado de cenário encontrado');
            displayEmptyResults();
            return;
        }
        
        const data = JSON.parse(scenarioData);
        console.log('📊 Dados do cenário para cálculo:', data);
        
        // Verificar se há dados mínimos necessários
        if (!data.dadosGerais || !data.dadosGerais.tmaMes) {
            console.log('⚠️ Dados insuficientes para cálculo (TMA não definida)');
            displayEmptyResults();
            return;
        }
        
        // Usar a mesma lógica de cálculo que implementamos no inputs.js
        try {
            const results = calculateAllIndicatorsInResults(data);
            
            // Exibir resultados nos cards usando as duas estratégias
            displayCalculatedResults(results);
            displayCalculatedResultsByText(results);
            
            console.log('✅ Resultados atualizados com sucesso');
            
        } catch (calcError) {
            console.error('❌ Erro no cálculo:', calcError);
            showError('Erro ao calcular indicadores: ' + calcError.message);
            displayEmptyResults();
        }
        
    } catch (error) {
        console.error('❌ Erro geral ao atualizar resultados:', error);
        displayEmptyResults();
    }
}

// Função para exibir mensagem quando não há dados
function displayEmptyResults() {
    const defaultText = 'R$ 0,00';
    const defaultPercent = '0,00%';
    
    // Buscar todos os elementos de valor nos cards
    const valueElements = document.querySelectorAll('.text-3xl, .text-4xl, .text-2xl');
    valueElements.forEach((el, index) => {
        // Cards de porcentagem (1º e 6º geralmente)
        if (index === 0 || index === 5) {
            el.textContent = defaultPercent;
        } else {
            el.textContent = defaultText;
        }
    });
}

// Cópia da função de cálculo do inputs.js para usar aqui
function calculateAllIndicatorsInResults(data) {
    console.log('🚀 === CALCULANDO INDICADORES NOS RESULTADOS ===');
    
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
        const fluxoTabela = generateCashFlowInResults(data, 'tabela');
        const fluxoProposta = generateCashFlowInResults(data, 'proposta');
        
        // 5. Calcular VPLs
        const vplTabela = calculateVPLInResults(fluxoTabela, tmaMes);
        const vplProposta = calculateVPLInResults(fluxoProposta, tmaMes);
        
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
        
        console.log('📊 === RESULTADOS CALCULADOS ===');
        console.log('💰 Valor Total Tabela:', valorTotalTabela.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}));
        console.log('💰 Valor Total Proposta:', valorTotalProposta.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}));
        console.log('📉 Desconto Nominal %:', descontoNominalPercent.toFixed(2) + '%');
        console.log('📉 Desconto Nominal R$:', descontoNominalReais.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}));
        console.log('📈 VPL Tabela:', vplTabela.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}));
        console.log('📈 VPL Proposta:', vplProposta.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}));
        console.log('🔄 Delta VPL:', deltaVpl.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}));
        console.log('📊 % Delta VPL:', percentualDeltaVpl.toFixed(2) + '%');
        
        return resultados;
        
    } catch (error) {
        console.error('❌ Erro no cálculo dos indicadores:', error);
        throw error;
    }
}

// Cópia das funções auxiliares para os cálculos
function generateCashFlowInResults(data, tipo) {
    console.log(`🔢 Gerando fluxo de caixa para: ${tipo}`);
    
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
    
    console.log(`📊 Fluxo gerado para ${tipo}: ${fluxo.length} meses, soma total: ${fluxo.reduce((a, b) => a + b, 0)}`);
    return fluxo;
}

function calculateVPLInResults(fluxoDeCaixa, tmaMes) {
    console.log('🧮 Calculando VPL com TMA mensal:', tmaMes);
    
    if (!fluxoDeCaixa || fluxoDeCaixa.length === 0) {
        console.log('⚠️ Fluxo de caixa vazio');
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
    
    console.log(`✅ VPL calculado: R$ ${vpl.toFixed(2)}`);
    return vpl;
}

// ================================
// FUNÇÕES PARA CARREGAR CENÁRIOS
// ================================

// Função para carregar cenários no filtro
async function loadScenariosInFilter() {
    try {
        console.log('🔍 Carregando cenários para o filtro...');
        
        const token = localStorage.getItem('token') || localStorage.getItem('modelai_token');
        if (!token) {
            console.error('❌ Token não encontrado');
            showError('Token de autenticação não encontrado');
            return;
        }
        
        console.log('🔑 Token encontrado, fazendo requisição...');
        
        const response = await fetch('/api/scenarios', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Resposta da API:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            const scenarios = data.scenarios || [];
            
            console.log(`✅ ${scenarios.length} cenários carregados:`, scenarios.map(s => s.name));
            
            // Atualizar dropdown de cenários
            const scenarioFilter = document.getElementById('scenarioFilter');
            if (scenarioFilter) {
                scenarioFilter.innerHTML = '<option value="">Selecione um cenário</option>';
                
                scenarios.forEach(scenario => {
                    const option = document.createElement('option');
                    option.value = scenario._id;
                    option.textContent = scenario.name;
                    scenarioFilter.appendChild(option);
                });
                
                console.log('✅ Dropdown atualizado com', scenarios.length, 'cenários');
            } else {
                console.error('❌ Elemento scenarioFilter não encontrado!');
            }
            
        } else {
            const error = await response.json().catch(() => ({}));
            console.error('❌ Erro ao carregar cenários:', response.status, error.message);
            showError(error.message || `Erro ${response.status}: Não foi possível carregar cenários`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar cenários:', error);
        showError('Erro ao carregar lista de cenários: ' + error.message);
    }
}

// Configurar filtro de cenários
function setupScenarioFilter() {
    const filter = document.getElementById('scenarioFilter');
    if (filter) {
        filter.addEventListener('change', function() {
            const scenarioId = this.value;
            if (scenarioId) {
                loadScenarioData(scenarioId);
            }
        });
    }
}

async function loadScenarioData(scenarioId) {
    try {
        console.log('📊 === CARREGANDO DADOS DO CENÁRIO ===');
        console.log('📊 ID do cenário:', scenarioId);
        
        if (!scenarioId) {
            showError('ID do cenário é obrigatório');
            return;
        }

        const token = localStorage.getItem('token') || localStorage.getItem('modelai_token');
        if (!token) {
            showError('Token de autenticação não encontrado');
            return;
        }
        
        console.log('🔑 Token encontrado, buscando cenário...');
        
        const response = await fetch(`/api/scenarios/${scenarioId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Resposta da API:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            const scenario = data.scenario;
            
            if (!scenario) {
                throw new Error('Dados do cenário não encontrados na resposta');
            }
            
            console.log('✅ Cenário carregado:', scenario.name);
            console.log('📊 Dados do cenário:', scenario.data);
            console.log('📈 Resultados pré-calculados:', scenario.results);
            
            // Salvar dados no sessionStorage
            sessionStorage.setItem('currentInputData', JSON.stringify(scenario.data));
            sessionStorage.setItem('currentScenarioName', scenario.name);
            sessionStorage.setItem('currentScenarioId', scenarioId);
            
            // Exibir resultados pré-calculados se existirem
            if (scenario.results) {
                console.log('📊 Exibindo resultados pré-calculados');
                displayCalculatedResults(scenario.results);
                displayCalculatedResultsByText(scenario.results);
            } else {
                console.log('⚠️ Cenário sem resultados pré-calculados, calculando...');
                // Atualizar resultados (cálculo em tempo real)
                updateResultados();
            }
            
            showSuccess(`Cenário "${scenario.name}" carregado com sucesso!`);
            
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Erro ${response.status}: Não foi possível carregar o cenário`;
            console.error('❌ Erro da API:', errorMessage);
            showError(errorMessage);
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar cenário:', error);
        showError(`Erro ao carregar dados do cenário: ${error.message}`);
    }
}

// Verificar se há dados de cenário ao carregar a página
function checkForScenarioData() {
    // Verificar se há um ID de cenário na URL
    const urlParams = new URLSearchParams(window.location.search);
    const scenarioId = urlParams.get('scenario');
    
    if (scenarioId) {
        console.log('🔗 ID do cenário encontrado na URL:', scenarioId);
        // Aguardar um pouco para garantir que o filtro foi carregado
        setTimeout(() => {
            const scenarioFilter = document.getElementById('scenarioFilter');
            if (scenarioFilter) {
                console.log('🎯 Selecionando cenário no filtro:', scenarioId);
                scenarioFilter.value = scenarioId;
                loadScenarioData(scenarioId);
            } else {
                console.warn('⚠️ Filtro de cenário não encontrado!');
            }
        }, 1000); // Aumentei o tempo para garantir carregamento
        return;
    }
    
    // Verificar dados no sessionStorage (fallback)
    const scenarioData = sessionStorage.getItem('currentInputData');
    const scenarioName = sessionStorage.getItem('currentScenarioName');
    
    if (scenarioData && scenarioName) {
        console.log('📊 Dados de cenário encontrados no sessionStorage:', scenarioName);
        // Atualizar resultados com dados do sessionStorage
        updateResultados();
        return;
    }
    
    // Verificar formato antigo de dados
    const oldScenarioData = sessionStorage.getItem('currentScenario');
    if (oldScenarioData) {
        try {
            const parsedData = JSON.parse(oldScenarioData);
            console.log('📊 Dados de cenário em formato antigo encontrados:', parsedData.name);
            
            // Converter para novo formato
            sessionStorage.setItem('currentInputData', JSON.stringify(parsedData.data));
            sessionStorage.setItem('currentScenarioName', parsedData.name);
            sessionStorage.setItem('currentScenarioId', parsedData.id);
            
            // Remover formato antigo
            sessionStorage.removeItem('currentScenario');
            
            // Atualizar resultados
            updateResultados();
        } catch (error) {
            console.error('❌ Erro ao processar dados antigos:', error);
        }
    }
    
    console.log('ℹ️ Nenhum cenário encontrado para carregar');
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM carregado - inicializando resultados...');
    
    // Verificar elementos essenciais
    const scenarioFilter = document.getElementById('scenarioFilter');
    console.log('🔍 Filtro de cenários encontrado:', !!scenarioFilter);
    
    loadScenariosInFilter();
    setupScenarioFilter();
    checkForScenarioData();
    
    // Log do estado inicial
    console.log('📊 Estado inicial do sessionStorage:');
    console.log('  - currentInputData:', !!sessionStorage.getItem('currentInputData'));
    console.log('  - currentScenarioName:', sessionStorage.getItem('currentScenarioName'));
    console.log('  - currentScenarioId:', sessionStorage.getItem('currentScenarioId'));
});

// ================================
// FUNÇÕES DE ALERTA (COMPATIBILITY)
// ================================

function showSuccess(message) {
    console.log('✅', message);
    // Usar alerts.js se disponível
    if (window.alerts && window.alerts.success) {
        window.alerts.success(message);
    } else {
        alert('✅ ' + message);
    }
}

function showError(message) {
    console.error('❌', message);
    // Usar alerts.js se disponível
    if (window.alerts && window.alerts.error) {
        window.alerts.error(message);
    } else {
        alert('❌ ' + message);
    }
}

// ================================
// EVENTOS DE REDIMENSIONAMENTO
// ================================

window.addEventListener('resize', handleResize);
window.addEventListener('load', handleResize);
