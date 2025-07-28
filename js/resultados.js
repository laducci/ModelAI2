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

function calculateTotalValue(data) {
    if (!data) return 0;
    
    // Para tabela de vendas
    if (data.vendaEntradaValor !== undefined) {
        const entrada = parseCurrency(data.vendaEntradaValor) || 0;
        const parcelas = parseCurrency(data.vendaParcelasValor) || 0;
        const reforco = parseCurrency(data.vendaReforcoValor) || 0;
        const nasChaves = parseCurrency(data.vendaBemMovelImovel) || 0;
        return entrada + parcelas + reforco + nasChaves;
    }
    
    // Para proposta cliente
    if (data.propostaEntradaValor !== undefined) {
        const entrada = parseCurrency(data.propostaEntradaValor) || 0;
        const parcelas = parseCurrency(data.propostaParcelasValor) || 0;
        const reforco = parseCurrency(data.propostaReforcoValor) || 0;
        return entrada + parcelas + reforco;
    }
    
    return 0;
}

// Função para calcular VPL (Valor Presente Líquido)
function calculateVPL(rate, cashFlows) {
    let vpl = 0;
    for (let i = 0; i < cashFlows.length; i++) {
        vpl += cashFlows[i] / Math.pow(1 + rate, i + 1);
    }
    return vpl;
}

// Função para calcular TMA mensal
function calculateTMAMensal(tmaAnual) {
    return Math.pow(1 + (tmaAnual / 100), 1/12) - 1;
}

// Função para gerar fluxo de caixa mensal
function generateMonthlyFlow(dadosGerais, tabelaVendas, propostaCliente, periodo = 240) {
    const mesVenda = parseInt(propostaCliente.mesVenda) || 1;
    const tmaAnual = parseFloat(dadosGerais.tmaAno) || 12;
    const tmaMensal = calculateTMAMensal(tmaAnual);
    
    const fluxo = [];
    const fluxoTabela = [];
    const fluxoProposta = [];
    
    // Valores da tabela de vendas (usando nomes corretos dos campos)
    const entradaTabela = parseCurrency(tabelaVendas.vendaEntradaValor) || 0;
    const parcelasTabela = parseCurrency(tabelaVendas.vendaParcelasValor) || 0;
    const reforcosTabela = parseCurrency(tabelaVendas.vendaReforcoValor) || 0;
    const nasChavesTabela = parseCurrency(tabelaVendas.vendaBemMovelImovel) || 0;
    const qtdParcelasTabela = parseInt(tabelaVendas.vendaParcelasQtd) || 1;
    const qtdReforcosTabela = parseInt(tabelaVendas.vendaReforcoQtd) || 1;
    const qtdEntradaTabela = parseInt(tabelaVendas.vendaEntradaParcelas) || 1;
    
    // Valores da proposta cliente (usando nomes corretos dos campos)
    const entradaProposta = parseCurrency(propostaCliente.propostaEntradaValor) || 0;
    const parcelasProposta = parseCurrency(propostaCliente.propostaParcelasValor) || 0;
    const reforcosProposta = parseCurrency(propostaCliente.propostaReforcoValor) || 0;
    const qtdParcelasProposta = parseInt(propostaCliente.propostaParcelasQtd) || 1;
    const qtdReforcosProposta = parseInt(propostaCliente.propostaReforcoQtd) || 1;
    const qtdEntradaProposta = parseInt(propostaCliente.propostaEntradaParcelas) || 1;
    
    for (let mes = 1; mes <= periodo; mes++) {
        let valorTabela = 0;
        let valorProposta = 0;
        
        // Calcular entrada (pode ser parcelada)
        if (mes >= mesVenda && mes < mesVenda + qtdEntradaTabela) {
            valorTabela += entradaTabela / qtdEntradaTabela;
        }
        
        if (mes >= mesVenda && mes < mesVenda + qtdEntradaProposta) {
            valorProposta += entradaProposta / qtdEntradaProposta;
        }
        
        // Parcelas (começam após a entrada)
        const inicioParcelasTabela = mesVenda + qtdEntradaTabela;
        const fimParcelasTabela = inicioParcelasTabela + qtdParcelasTabela;
        if (mes >= inicioParcelasTabela && mes < fimParcelasTabela) {
            valorTabela += parcelasTabela / qtdParcelasTabela;
        }
        
        const inicioParcelasProposta = mesVenda + qtdEntradaProposta;
        const fimParcelasProposta = inicioParcelasProposta + qtdParcelasProposta;
        if (mes >= inicioParcelasProposta && mes < fimParcelasProposta) {
            valorProposta += parcelasProposta / qtdParcelasProposta;
        }
        
        // Reforços (distribuídos ao longo do período após as parcelas)
        const inicioReforcosTabela = fimParcelasTabela;
        if (qtdReforcosTabela > 0 && mes >= inicioReforcosTabela) {
            const intervalReforcoTabela = Math.max(1, Math.floor((periodo - inicioReforcosTabela) / qtdReforcosTabela));
            const posicaoReforco = mes - inicioReforcosTabela;
            if (posicaoReforco < qtdReforcosTabela * intervalReforcoTabela && posicaoReforco % intervalReforcoTabela === 0) {
                valorTabela += reforcosTabela / qtdReforcosTabela;
            }
        }
        
        const inicioReforcosProposta = fimParcelasProposta;
        if (qtdReforcosProposta > 0 && mes >= inicioReforcosProposta) {
            const intervalReforcoProposta = Math.max(1, Math.floor((periodo - inicioReforcosProposta) / qtdReforcosProposta));
            const posicaoReforcoProp = mes - inicioReforcosProposta;
            if (posicaoReforcoProp < qtdReforcosProposta * intervalReforcoProposta && posicaoReforcoProp % intervalReforcoProposta === 0) {
                valorProposta += reforcosProposta / qtdReforcosProposta;
            }
        }
        
        // Nas chaves (último mês)
        if (mes === periodo) {
            valorTabela += nasChavesTabela;
        }
        
        fluxoTabela.push(valorTabela);
        fluxoProposta.push(valorProposta);
        
        fluxo.push({
            mes: mes,
            tabelaVendas: valorTabela,
            propostaCliente: valorProposta,
            diferenca: valorProposta - valorTabela
        });
    }
    
    return {
        fluxo: fluxo,
        fluxoTabela: fluxoTabela,
        fluxoProposta: fluxoProposta,
        tmaMensal: tmaMensal
    };
}

// Função para atualizar os dados na página
function updateResultados() {
    try {
        // Recuperar dados do localStorage
        const dadosGerais = JSON.parse(localStorage.getItem('dadosGerais') || '{}');
        const tabelaVendas = JSON.parse(localStorage.getItem('tabelaVendas') || '{}');
        const propostaCliente = JSON.parse(localStorage.getItem('propostaCliente') || '{}');
        
        // Se não há dados, mostrar mensagem e não tentar calcular
        if (!dadosGerais || Object.keys(dadosGerais).length === 0) {
            console.log('Nenhum dado encontrado para calcular resultados');
            // Mostrar mensagem na tela
            const vplTabelaEl = document.getElementById('vplTabela');
            if (vplTabelaEl) {
                vplTabelaEl.textContent = 'Sem dados';
                document.getElementById('vplProposta').textContent = 'Sem dados';
                document.getElementById('deltaVPL').textContent = 'Sem dados';
                document.getElementById('percentDeltaVPL').textContent = 'Sem dados';
            }
            return;
        }
        
        // Gerar fluxo de caixa
        const { fluxo, fluxoTabela, fluxoProposta, tmaMensal } = generateMonthlyFlow(dadosGerais, tabelaVendas, propostaCliente);
        
        // Calcular VPLs usando as fórmulas do Excel
        const vplTabela = calculateVPL(tmaMensal, fluxoTabela);
        const vplProposta = calculateVPL(tmaMensal, fluxoProposta);
        
        // Delta de VPL = VPL Proposta - VPL Tabela (E27-D27)
        const deltaVPL = vplProposta - vplTabela;
        
        // % Delta VPL = Delta VPL / VPL Tabela (F27/D27) - SEERRO(F27/D27;0)
        const percentDeltaVPL = vplTabela !== 0 ? (deltaVPL / vplTabela) * 100 : 0;
        
        // Calcular valores totais para as outras fórmulas
        const valorTotalTabela = calculateTotalValue(tabelaVendas);
        const valorTotalProposta = calculateTotalValue(propostaCliente);
        
        // Desconto Nominal = (Valor Proposta / Valor Tabela) - 1 (H30/C30)-1
        const descontoNominal = valorTotalTabela !== 0 ? ((valorTotalProposta / valorTotalTabela) - 1) * 100 : 0;
        
        // Delta Desconto = Valor Tabela - Valor Proposta (C12-C19)
        const deltaDesconto = valorTotalTabela - valorTotalProposta;
        
        // Atualizar todos os 6 cards
        const descontoNominalEl = document.getElementById('descontoNominal');
        const deltaDescontoEl = document.getElementById('deltaDesconto');
        const vplTabelaEl = document.getElementById('vplTabela');
        const vplPropostaEl = document.getElementById('vplProposta');
        const deltaVPLEl = document.getElementById('deltaVPL');
        const percentDeltaVPLEl = document.getElementById('percentDeltaVPL');
        
        if (descontoNominalEl) descontoNominalEl.textContent = formatPercent(descontoNominal);
        if (deltaDescontoEl) deltaDescontoEl.textContent = formatCurrency(deltaDesconto);
        if (vplTabelaEl) vplTabelaEl.textContent = formatCurrency(vplTabela);
        if (vplPropostaEl) vplPropostaEl.textContent = formatCurrency(vplProposta);
        if (deltaVPLEl) deltaVPLEl.textContent = formatCurrency(deltaVPL);
        if (percentDeltaVPLEl) percentDeltaVPLEl.textContent = formatPercent(percentDeltaVPL);
        
        // Atualizar dados gerais
        const dadosClienteEl = document.getElementById('dadosCliente');
        const dadosEmpreendimentoEl = document.getElementById('dadosEmpreendimento');
        const dadosUnidadeEl = document.getElementById('dadosUnidade');
        const dadosAreaEl = document.getElementById('dadosArea');
        const dadosTMAanoEl = document.getElementById('dadosTMAano');
        const dadosTMAmêsEl = document.getElementById('dadosTMAmês');
        
        if (dadosClienteEl) dadosClienteEl.textContent = dadosGerais.cliente || '-';
        if (dadosEmpreendimentoEl) dadosEmpreendimentoEl.textContent = dadosGerais.empreendimento || '-';
        if (dadosUnidadeEl) dadosUnidadeEl.textContent = dadosGerais.unidade || '-';
        if (dadosAreaEl) dadosAreaEl.textContent = dadosGerais.areaPrivativa ? `${dadosGerais.areaPrivativa} m²` : '-';
        if (dadosTMAanoEl) dadosTMAanoEl.textContent = dadosGerais.tmaAno ? `${dadosGerais.tmaAno}% a.a.` : '-';
        if (dadosTMAmêsEl) dadosTMAmêsEl.textContent = tmaMensal ? `${(tmaMensal * 100).toFixed(4)}% a.m.` : '-';
        
        // Atualizar tabela de fluxo de caixa
        updateFluxoTable(fluxo);
        
        // Atualizar gráficos
        updateCharts(fluxoTabela, fluxoProposta, vplTabela, vplProposta);
        
    } catch (error) {
        console.error('Erro ao atualizar resultados:', error);
    }
}

// Função para atualizar a tabela de fluxo de caixa
function updateFluxoTable(fluxo) {
    const tbody = document.getElementById('fluxoCaixaTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Mostrar apenas os primeiros 60 meses ou conforme seleção
    const periodo = parseInt(document.getElementById('periodoAnalise')?.value) || 60;
    const fluxoLimitado = fluxo.slice(0, periodo);
    
    fluxoLimitado.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-sm font-medium text-gray-800">${item.mes}</td>
            <td class="px-4 py-3 text-sm text-right text-gray-600">${formatCurrency(item.tabelaTMA)}</td>
            <td class="px-4 py-3 text-sm text-right text-gray-600">${formatCurrency(item.entrada)}</td>
            <td class="px-4 py-3 text-sm text-right text-gray-600">${formatCurrency(item.parcelas)}</td>
            <td class="px-4 py-3 text-sm text-right text-gray-600">${formatCurrency(item.reforcos)}</td>
            <td class="px-4 py-3 text-sm text-right text-gray-600">${formatCurrency(item.nasChaves)}</td>
            <td class="px-4 py-3 text-sm text-right font-medium text-gray-800">${formatCurrency(item.propostaTotal)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Função para atualizar gráficos
function updateCharts(fluxoTabela, fluxoProposta, vplTabela, vplProposta) {
    // Gráfico VPL Comparativo
    const vplCtx = document.getElementById('vplChart');
    if (vplCtx) {
        if (window.vplChart) {
            window.vplChart.destroy();
        }
        
        window.vplChart = new Chart(vplCtx, {
            type: 'bar',
            data: {
                labels: ['VPL Tabela', 'VPL Proposta'],
                datasets: [{
                    label: 'Valor (R$)',
                    data: [vplTabela, vplProposta],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                    ],
                    borderColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(34, 197, 94, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico Fluxo de Caixa Acumulado
    const fluxoCtx = document.getElementById('fluxoChart');
    if (fluxoCtx) {
        if (window.fluxoChart) {
            window.fluxoChart.destroy();
        }
        
        // Calcular fluxo acumulado
        let acumuladoTabela = 0;
        let acumuladoProposta = 0;
        const fluxoAcumuladoTabela = fluxoTabela.map(valor => acumuladoTabela += valor);
        const fluxoAcumuladoProposta = fluxoProposta.map(valor => acumuladoProposta += valor);
        
        // Mostrar apenas os primeiros 60 meses
        const meses = Array.from({length: Math.min(60, fluxoTabela.length)}, (_, i) => i + 1);
        
        window.fluxoChart = new Chart(fluxoCtx, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Tabela',
                    data: fluxoAcumuladoTabela.slice(0, 60),
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Proposta',
                    data: fluxoAcumuladoProposta.slice(0, 60),
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Meses'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Valor Acumulado (R$)'
                        },
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Configurar responsividade
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Carregar cenários no filtro
    loadScenariosInFilter();
    
    // Atualizar resultados quando a página carregar
    updateResultados();
    
    // Event listener para mudança no período de análise
    const periodoSelect = document.getElementById('periodoAnalise');
    if (periodoSelect) {
        periodoSelect.addEventListener('change', function() {
            updateResultados();
        });
    }
    
    // Event listener para mudança no filtro de cenários
    const cenarioFilter = document.getElementById('cenarioFilter');
    if (cenarioFilter) {
        cenarioFilter.addEventListener('change', function() {
            const scenarioId = this.value;
            if (scenarioId) {
                loadScenarioData(scenarioId);
            }
        });
    }
    
    // Atualizar a cada 30 segundos caso haja mudanças nos dados
    setInterval(updateResultados, 30000);
});

// Função para carregar cenários no filtro
function loadScenariosInFilter() {
    const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
    const filter = document.getElementById('cenarioFilter');
    const currentScenarioId = localStorage.getItem('currentScenarioId');
    
    if (filter) {
        filter.innerHTML = '<option value="">Selecione um cenário</option>';
        
        scenarios.forEach(scenario => {
            const option = document.createElement('option');
            option.value = scenario.id;
            option.textContent = scenario.name;
            if (scenario.id === currentScenarioId) {
                option.selected = true;
            }
            filter.appendChild(option);
        });
    }
}

// Função para carregar dados de um cenário específico
function loadScenarioData(scenarioId) {
    const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
    const scenario = scenarios.find(s => s.id === scenarioId);
    
    if (scenario) {
        // Carregar dados no localStorage
        localStorage.setItem('dadosGerais', JSON.stringify(scenario.data.dadosGerais || {}));
        localStorage.setItem('tabelaVendas', JSON.stringify(scenario.data.tabelaVendas || {}));
        localStorage.setItem('propostaCliente', JSON.stringify(scenario.data.propostaCliente || {}));
        localStorage.setItem('currentScenarioId', scenarioId);
        
        // Atualizar resultados
        updateResultados();
    }
}

// Atualizar quando a aba ficar ativa
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updateResultados();
    }
});