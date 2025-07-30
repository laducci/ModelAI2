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
        const nasChaves = parseCurrency(data.propostaBemMovelImovel) || 0;
        return entrada + parcelas + reforco + nasChaves;
    }
    
    return 0;
}

// Função para calcular TMA mensal - Excel: (1+TMA_ANUAL)^(1/12)-1
function calcularTmaMensal(tmaAnual) {
    return Math.pow(1 + tmaAnual, 1 / 12) - 1;
}

// Função para gerar fluxo de caixa simples (entrada + parcelas, sem reforços)
function gerarFluxoCaixa(entrada, valorParcela, quantidadeParcelas) {
    const fluxo = [entrada]; // entrada no mês 1
    for (let i = 0; i < quantidadeParcelas; i++) {
        fluxo.push(valorParcela); // parcelas mensais a partir do mês 2
    }
    return fluxo;
}

// Função para calcular VPL simples (para VPL Tabela) - Excel method
function calcularVPL(tmaMensal, fluxo) {
    return fluxo.reduce((vpl, valor, index) => {
        const periodo = index + 1; // Excel começa do período 1
        return vpl + valor / Math.pow(1 + tmaMensal, periodo);
    }, 0);
}

// Função para calcular VPL (Valor Presente Líquido) - versão completa para proposta
function calculateVPL(rate, cashFlows) {
    let vpl = 0;
    for (let i = 0; i < cashFlows.length; i++) {
        const periodo = i + 1; // Excel começa do período 1
        vpl += cashFlows[i] / Math.pow(1 + rate, periodo);
    }
    return vpl;
}

// Função para calcular TMA mensal - versão original
function calculateTMAMensal(tmaAnual) {
    return Math.pow(1 + (tmaAnual / 100), 1/12) - 1;
}

// Função para gerar fluxo de caixa mensal com reforços a cada 6 meses
function generateMonthlyFlow(dadosGerais, tabelaVendas, propostaCliente, periodo = 250) {
    const mesVenda = parseInt(propostaCliente.mesVenda) || 1;
    
    // Usar a mesma TMA do cálculo principal
    let tmaAnual = parseFloat(dadosGerais.tmaAno) / 100;
    if (!tmaAnual || tmaAnual === 0) {
        tmaAnual = 0.22; // 22% padrão
    }
    const tmaMensal = calcularTmaMensal(tmaAnual); // Usar a mesma função
    
    const fluxo = [];
    const fluxoTabela = [];
    const fluxoProposta = [];
    
    // Valores da tabela de vendas
    const entradaTabela = parseCurrency(tabelaVendas.vendaEntradaValor) || 0;
    const parcelasTabela = parseCurrency(tabelaVendas.vendaParcelasValor) || 0;
    const reforcosTabela = parseCurrency(tabelaVendas.vendaReforcoValor) || 0;
    const nasChavesTabela = parseCurrency(tabelaVendas.vendaBemMovelImovel) || 0;
    const qtdParcelasTabela = parseInt(tabelaVendas.vendaParcelasQtd) || 1;
    const qtdReforcosTabela = parseInt(tabelaVendas.vendaReforcoQtd) || 1;
    const qtdEntradaTabela = parseInt(tabelaVendas.vendaEntradaParcelas) || 1;
    
    // Valores da proposta cliente
    const entradaProposta = parseCurrency(propostaCliente.propostaEntradaValor) || 0;
    const parcelasProposta = parseCurrency(propostaCliente.propostaParcelasValor) || 0;
    const reforcosProposta = parseCurrency(propostaCliente.propostaReforcoValor) || 0;
    const nasChavesProposta = parseCurrency(propostaCliente.propostaBemMovelImovel) || 0;
    const qtdParcelasProposta = parseInt(propostaCliente.propostaParcelasQtd) || 1;
    const qtdReforcosProposta = parseInt(propostaCliente.propostaReforcoQtd) || 1;
    const qtdEntradaProposta = parseInt(propostaCliente.propostaEntradaParcelas) || 1;
    
    // Calcular valores unitários para tabela
    const valorEntradaUnitTabela = entradaTabela / qtdEntradaTabela;
    const valorParcelaMensalTabela = parcelasTabela / qtdParcelasTabela;
    const valorReforcoUnitTabela = reforcosTabela / qtdReforcosTabela;
    
    // Calcular valores unitários para proposta
    const valorEntradaUnitProposta = entradaProposta / qtdEntradaProposta;
    const valorParcelaMensalProposta = parcelasProposta / qtdParcelasProposta;
    const valorReforcoUnitProposta = reforcosProposta / qtdReforcosProposta;
    
    // Determinar período máximo baseado nos fluxos mais longos
    const periodoMaximoTabela = Math.max(
        mesVenda + qtdEntradaTabela + qtdParcelasTabela,
        qtdReforcosTabela > 0 ? mesVenda + (qtdReforcosTabela * 6) : 0
    );
    const periodoMaximoProposta = Math.max(
        mesVenda + qtdEntradaProposta + qtdParcelasProposta,
        qtdReforcosProposta > 0 ? mesVenda + (qtdReforcosProposta * 6) : 0
    );
    const periodoFinal = Math.min(Math.max(periodoMaximoTabela, periodoMaximoProposta), periodo);
    
    let reforcosUtilizadosTabela = 0;
    let reforcosUtilizadosProposta = 0;
    
    for (let mes = 1; mes <= periodoFinal; mes++) {
        let valorTabela = 0;
        let valorProposta = 0;
        
        // TABELA DE VENDAS
        // Entrada (nos primeiros meses a partir do mês de venda)
        if (mes >= mesVenda && mes < mesVenda + qtdEntradaTabela) {
            valorTabela += valorEntradaUnitTabela;
        }
        
        // Parcelas (após entrada)
        const inicioParcelasTabela = mesVenda + qtdEntradaTabela;
        const fimParcelasTabela = inicioParcelasTabela + qtdParcelasTabela;
        if (mes >= inicioParcelasTabela && mes < fimParcelasTabela) {
            valorTabela += valorParcelaMensalTabela;
        }
        
        // Reforços a cada 6 meses (começando do mês 6 após início da venda)
        const mesRelativoTabela = mes - mesVenda + 1;
        if (mesRelativoTabela > 0 && mesRelativoTabela % 6 === 0 && 
            reforcosUtilizadosTabela < qtdReforcosTabela && mes >= mesVenda + 5) {
            valorTabela += valorReforcoUnitTabela;
            reforcosUtilizadosTabela++;
        }
        
        // PROPOSTA CLIENTE
        // Entrada (nos primeiros meses a partir do mês de venda)
        if (mes >= mesVenda && mes < mesVenda + qtdEntradaProposta) {
            valorProposta += valorEntradaUnitProposta;
        }
        
        // Parcelas (após entrada)
        const inicioParcelasProposta = mesVenda + qtdEntradaProposta;
        const fimParcelasProposta = inicioParcelasProposta + qtdParcelasProposta;
        if (mes >= inicioParcelasProposta && mes < fimParcelasProposta) {
            valorProposta += valorParcelaMensalProposta;
        }
        
        // Reforços a cada 6 meses (começando do mês 6 após início da venda)
        const mesRelativoProposta = mes - mesVenda + 1;
        if (mesRelativoProposta > 0 && mesRelativoProposta % 6 === 0 && 
            reforcosUtilizadosProposta < qtdReforcosProposta && mes >= mesVenda + 5) {
            valorProposta += valorReforcoUnitProposta;
            reforcosUtilizadosProposta++;
        }
        
        // Nas chaves (último mês do período)
        if (mes === periodoFinal) {
            valorTabela += nasChavesTabela;
            valorProposta += nasChavesProposta;
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
    
    console.log('Fluxo Proposta - Debug:', {
        entradaProposta: entradaProposta,
        parcelasProposta: parcelasProposta,
        reforcosProposta: reforcosProposta,
        qtdEntradaProposta: qtdEntradaProposta,
        qtdParcelasProposta: qtdParcelasProposta,
        qtdReforcosProposta: qtdReforcosProposta,
        valorEntradaUnit: valorEntradaUnitProposta,
        valorParcelaUnit: valorParcelaMensalProposta,
        valorReforcoUnit: valorReforcoUnitProposta,
        reforcosUtilizados: reforcosUtilizadosProposta,
        periodoFinal: periodoFinal,
        fluxoPrimeiros10: fluxoProposta.slice(0, 10)
    });
    
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
        // Primeiro tentar dados de cenário, depois localStorage antigo
        let dadosGerais, tabelaVendas, propostaCliente;
        
        const scenarioData = sessionStorage.getItem('currentInputData');
        if (scenarioData) {
            console.log('📊 Usando dados do cenário');
            const data = JSON.parse(scenarioData);
            dadosGerais = data.dadosGerais || {};
            tabelaVendas = data.tabelaVendas || {};
            propostaCliente = data.propostaCliente || {};
            
            // Mostrar nome do cenário se disponível
            const scenarioName = sessionStorage.getItem('currentScenarioName');
            if (scenarioName) {
                console.log('📋 Cenário atual:', scenarioName);
                // Aqui podemos mostrar o nome do cenário na tela se necessário
            }
        } else {
            console.log('📂 Usando dados do localStorage antigo');
            // Recuperar dados do localStorage antigo
            dadosGerais = JSON.parse(localStorage.getItem('dadosGerais') || '{}');
            tabelaVendas = JSON.parse(localStorage.getItem('tabelaVendas') || '{}');
            propostaCliente = JSON.parse(localStorage.getItem('propostaCliente') || '{}');
        }
        
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
        
        // Calcular VPL Tabela usando o método Excel correto com reforços a cada 6 meses
        // Usar TMA informada pelo usuário ou padrão 22%
        let tmaAnual = parseFloat(dadosGerais.tmaAno) / 100;
        if (!tmaAnual || tmaAnual === 0) {
            tmaAnual = 0.22; // 22% padrão
        }
        
        const tmaMensalSimples = calcularTmaMensal(tmaAnual);
        
        // Extrair dados da tabela de vendas para o cálculo do VPL Tabela
        const entradaTabela = parseCurrency(tabelaVendas.vendaEntradaValor) || 0;
        const parcelasTabela = parseCurrency(tabelaVendas.vendaParcelasValor) || 0;
        const qtdParcelasTabela = parseInt(tabelaVendas.vendaParcelasQtd) || 0;
        const qtdEntradaTabela = parseInt(tabelaVendas.vendaEntradaParcelas) || 1;
        const reforcoTabela = parseCurrency(tabelaVendas.vendaReforcoValor) || 0;
        const qtdReforcoTabela = parseInt(tabelaVendas.vendaReforcoQtd) || 0;
        const nasChavesTabela = parseCurrency(tabelaVendas.vendaBemMovelImovel) || 0;
        
        // Gerar fluxo de caixa mês a mês como no Excel
        const fluxoCaixaVPL = [];
        
        // Calcular valores unitários
        const valorPorParcelaEntrada = qtdEntradaTabela > 0 ? entradaTabela / qtdEntradaTabela : 0;
        const valorParcelaMensal = qtdParcelasTabela > 0 ? parcelasTabela / qtdParcelasTabela : 0;
        const valorReforcoUnitario = qtdReforcoTabela > 0 ? reforcoTabela / qtdReforcoTabela : 0;
        
        // Definir período total de análise (até que todas as parcelas e reforços sejam pagos)
        const periodoMaximo = Math.max(qtdEntradaTabela + qtdParcelasTabela, qtdReforcoTabela * 6);
        
        let reforcosJaUtilizados = 0;
        
        for (let mes = 1; mes <= periodoMaximo; mes++) {
            let valorMes = 0;
            
            // Entrada (nos primeiros meses conforme qtdEntradaTabela)
            if (mes <= qtdEntradaTabela) {
                valorMes += valorPorParcelaEntrada;
            }
            
            // Parcelas (começam após a entrada e vão até qtdParcelasTabela)
            const inicioParcelasNormalMes = qtdEntradaTabela + 1;
            const fimParcelasNormalMes = qtdEntradaTabela + qtdParcelasTabela;
            if (mes >= inicioParcelasNormalMes && mes <= fimParcelasNormalMes) {
                valorMes += valorParcelaMensal;
            }
            
            // Reforços (a cada 6 meses, começando do mês 6)
            if (mes % 6 === 0 && reforcosJaUtilizados < qtdReforcoTabela && mes >= 6) {
                valorMes += valorReforcoUnitario;
                reforcosJaUtilizados++;
            }
            
            // Nas chaves (último mês do período)
            if (mes === periodoMaximo && nasChavesTabela > 0) {
                valorMes += nasChavesTabela;
            }
            
            if (valorMes > 0) {
                fluxoCaixaVPL.push(valorMes);
            } else if (fluxoCaixaVPL.length > 0) {
                // Se já começou o fluxo mas este mês é zero, adicionar zero para manter sequência
                fluxoCaixaVPL.push(0);
            }
        }
        
        // Calcular VPL Tabela usando a fórmula Excel
        let vplTabelaSimples = 0;
        for (let i = 0; i < fluxoCaixaVPL.length; i++) {
            const periodo = i + 1;
            vplTabelaSimples += fluxoCaixaVPL[i] / Math.pow(1 + tmaMensalSimples, periodo);
        }
        
        console.log('Dados VPL Tabela:', {
            tmaAnual: tmaAnual * 100 + '%',
            tmaMensal: (tmaMensalSimples * 100).toFixed(6) + '%',
            entradaTabela: entradaTabela,
            parcelasTabela: parcelasTabela,
            reforcoTabela: reforcoTabela,
            qtdEntradaTabela: qtdEntradaTabela,
            qtdParcelasTabela: qtdParcelasTabela,
            qtdReforcoTabela: qtdReforcoTabela,
            valorParcelaMensal: valorParcelaMensal,
            valorReforcoUnitario: valorReforcoUnitario,
            reforcosUtilizados: reforcosJaUtilizados,
            totalMeses: fluxoCaixaVPL.length,
            fluxoPrimeiros10: fluxoCaixaVPL.slice(0, 10),
            vplCalculado: vplTabelaSimples
        });
        
        // Gerar fluxo de caixa para VPL Proposta usando os mesmos dados mas com lógica correta
        const entradaProposta = parseCurrency(propostaCliente.propostaEntradaValor) || 0;
        const parcelasProposta = parseCurrency(propostaCliente.propostaParcelasValor) || 0;
        const qtdParcelasProposta = parseInt(propostaCliente.propostaParcelasQtd) || 0;
        const qtdEntradaProposta = parseInt(propostaCliente.propostaEntradaParcelas) || 1;
        const reforcosProposta = parseCurrency(propostaCliente.propostaReforcoValor) || 0;
        const qtdReforcosProposta = parseInt(propostaCliente.propostaReforcoQtd) || 0;
        const nasChavesProposta = parseCurrency(propostaCliente.propostaBemMovelImovel) || 0;
        
        // Gerar fluxo de caixa proposta mês a mês como no Excel
        const fluxoCaixaProposta = [];
        
        // Calcular valores unitários para proposta
        const valorPorParcelaEntradaProp = qtdEntradaProposta > 0 ? entradaProposta / qtdEntradaProposta : 0;
        const valorParcelaMensalProp = qtdParcelasProposta > 0 ? parcelasProposta / qtdParcelasProposta : 0;
        const valorReforcoUnitarioProp = qtdReforcosProposta > 0 ? reforcosProposta / qtdReforcosProposta : 0;
        
        // Definir período total para proposta
        const periodoMaximoProposta = Math.max(qtdEntradaProposta + qtdParcelasProposta, qtdReforcosProposta * 6);
        
        let reforcosJaUtilizadosProp = 0;
        
        for (let mes = 1; mes <= periodoMaximoProposta; mes++) {
            let valorMesProp = 0;
            
            // Entrada (nos primeiros meses conforme qtdEntradaProposta)
            if (mes <= qtdEntradaProposta) {
                valorMesProp += valorPorParcelaEntradaProp;
            }
            
            // Parcelas (começam após a entrada e vão até qtdParcelasProposta)
            const inicioParcelasPropMes = qtdEntradaProposta + 1;
            const fimParcelasPropMes = qtdEntradaProposta + qtdParcelasProposta;
            if (mes >= inicioParcelasPropMes && mes <= fimParcelasPropMes) {
                valorMesProp += valorParcelaMensalProp;
            }
            
            // Reforços (a cada 6 meses, começando do mês 6)
            if (mes % 6 === 0 && reforcosJaUtilizadosProp < qtdReforcosProposta && mes >= 6) {
                valorMesProp += valorReforcoUnitarioProp;
                reforcosJaUtilizadosProp++;
            }
            
            // Nas chaves (último mês do período)
            if (mes === periodoMaximoProposta && nasChavesProposta > 0) {
                valorMesProp += nasChavesProposta;
            }
            
            if (valorMesProp > 0) {
                fluxoCaixaProposta.push(valorMesProp);
            } else if (fluxoCaixaProposta.length > 0) {
                // Se já começou o fluxo mas este mês é zero, adicionar zero para manter sequência
                fluxoCaixaProposta.push(0);
            }
        }
        
        // Calcular VPL Proposta usando a fórmula Excel
        let vplProposta = 0;
        for (let i = 0; i < fluxoCaixaProposta.length; i++) {
            const periodo = i + 1;
            vplProposta += fluxoCaixaProposta[i] / Math.pow(1 + tmaMensalSimples, periodo);
        }
        
        console.log('Dados VPL Proposta:', {
            tmaAnual: tmaAnual * 100 + '%',
            tmaMensal: (tmaMensalSimples * 100).toFixed(6) + '%',
            entradaProposta: entradaProposta,
            parcelasProposta: parcelasProposta,
            reforcosProposta: reforcosProposta,
            qtdEntradaProposta: qtdEntradaProposta,
            qtdParcelasProposta: qtdParcelasProposta,
            qtdReforcosProposta: qtdReforcosProposta,
            valorParcelaMensalProp: valorParcelaMensalProp,
            valorReforcoUnitarioProp: valorReforcoUnitarioProp,
            reforcosUtilizados: reforcosJaUtilizadosProp,
            totalMeses: fluxoCaixaProposta.length,
            fluxoPrimeiros10: fluxoCaixaProposta.slice(0, 10),
            vplCalculado: vplProposta
        });
        
        // Gerar fluxo de caixa para tabelas (usando função antiga mas com TMA correta)
        const { fluxo, fluxoTabela, fluxoProposta: fluxoPropostaAntigo } = generateMonthlyFlow(dadosGerais, tabelaVendas, propostaCliente);
        
        // Delta de VPL = VPL Proposta - VPL Tabela
        const deltaVPL = vplProposta - vplTabelaSimples;
        
        // % Delta VPL = SE(VPL_Tabela=0;0;Delta_VPL/VPL_Tabela)
        const percentDeltaVPL = vplTabelaSimples !== 0 ? (deltaVPL / vplTabelaSimples) * 100 : 0;
        
        // Calcular valores totais para as outras fórmulas
        const valorTotalTabela = calculateTotalValue(tabelaVendas);
        const valorTotalProposta = calculateTotalValue(propostaCliente);
        
        // Desconto Nominal (%) = (Valor do Imóvel Proposta do Cliente/Valor do Imóvel)-1
        const descontoNominalPercent = valorTotalTabela !== 0 ? ((valorTotalProposta / valorTotalTabela) - 1) * 100 : 0;
        
        // Desconto Nominal (R$) = Valor do Imóvel - Valor do Imóvel Proposta do Cliente
        const descontoNominalReais = valorTotalTabela - valorTotalProposta;
        
        // Atualizar todos os 6 cards
        const descontoNominalEl = document.getElementById('descontoNominal');
        const deltaDescontoEl = document.getElementById('deltaDesconto');
        const vplTabelaEl = document.getElementById('vplTabela');
        const vplPropostaEl = document.getElementById('vplProposta');
        const deltaVPLEl = document.getElementById('deltaVPL');
        const percentDeltaVPLEl = document.getElementById('percentDeltaVPL');
        
        if (descontoNominalEl) descontoNominalEl.textContent = formatPercent(descontoNominalPercent);
        if (deltaDescontoEl) deltaDescontoEl.textContent = formatCurrency(descontoNominalReais);
        if (vplTabelaEl) vplTabelaEl.textContent = formatCurrency(vplTabelaSimples);
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
        if (dadosTMAmêsEl) dadosTMAmêsEl.textContent = tmaMensalSimples ? `${(tmaMensalSimples * 100).toFixed(4)}% a.m.` : '-';
        
        // Atualizar tabela de fluxo de caixa (usar fluxo da função generateMonthlyFlow)
        updateFluxoTable(fluxo);
        
        // Atualizar gráficos (usar VPLs calculados corretamente)
        updateCharts(fluxoTabela, fluxoCaixaProposta, vplTabelaSimples, vplProposta);
        
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
async function loadScenariosInFilter() {
    try {
        console.log('📋 Carregando cenários para o filtro...');
        
        const token = localStorage.getItem('token') || localStorage.getItem('modelai_token');
        if (!token) {
            console.log('❌ Token não encontrado');
            return;
        }
        
        const response = await fetch('/api/scenarios', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro ${response.status} ao carregar cenários`);
        }
        
        const data = await response.json();
        const scenarios = data.scenarios || data; // API pode retornar {scenarios: [...]} ou [...] diretamente
        const filter = document.getElementById('cenarioFilter');
        const currentScenarioId = sessionStorage.getItem('currentScenarioId');
        
        if (filter) {
            filter.innerHTML = '<option value="">Selecione um cenário</option>';
            
            if (scenarios && scenarios.length > 0) {
                scenarios.forEach(scenario => {
                    const option = document.createElement('option');
                    option.value = scenario._id || scenario.id;
                    option.textContent = scenario.name;
                    if ((scenario._id || scenario.id) === currentScenarioId) {
                        option.selected = true;
                    }
                    filter.appendChild(option);
                });
                
                console.log(`✅ ${scenarios.length} cenários carregados no filtro`);
            } else {
                console.log('ℹ️ Nenhum cenário encontrado');
                filter.innerHTML = '<option value="">Nenhum cenário encontrado</option>';
            }
        } else {
            console.error('❌ Elemento cenarioFilter não encontrado');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar cenários:', error);
        const filter = document.getElementById('cenarioFilter');
        if (filter) {
            filter.innerHTML = '<option value="">Erro ao carregar cenários</option>';
        }
    }
}

// Atualizar quando a aba ficar ativa
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updateResultados();
    }
});

// ==================== INTEGRAÇÃO COM CENÁRIOS ====================

function setupScenarioFilter() {
    const filter = document.getElementById('cenarioFilter');
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
        console.log('📊 Carregando dados do cenário:', scenarioId);
        
        if (!scenarioId) {
            showError('ID do cenário é obrigatório');
            return;
        }

        const token = localStorage.getItem('token') || localStorage.getItem('modelai_token');
        if (!token) {
            showError('Token de autenticação não encontrado');
            return;
        }
        
        const response = await fetch(`/api/scenarios/${scenarioId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const scenario = data.scenario;
            
            if (!scenario) {
                throw new Error('Dados do cenário não encontrados');
            }
            
            console.log('✅ Cenário carregado:', scenario.name);
            
            // Salvar dados no sessionStorage
            sessionStorage.setItem('currentInputData', JSON.stringify(scenario.data));
            sessionStorage.setItem('currentScenarioName', scenario.name);
            sessionStorage.setItem('currentScenarioId', scenarioId);
            
            // Atualizar resultados
            updateResultados();
            
            showSuccess(`Cenário "${scenario.name}" carregado com sucesso!`);
            
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Erro ${response.status}: Não foi possível carregar o cenário`;
            showError(errorMessage);
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar cenário:', error);
        showError(`Erro ao carregar dados do cenário: ${error.message}`);
    }
}

// Verificar se há dados de cenário ao carregar a página
function checkForScenarioData() {
    const scenarioData = sessionStorage.getItem('currentInputData');
    const scenarioName = sessionStorage.getItem('currentScenarioName');
    
    if (scenarioData && scenarioName) {
        console.log('📊 Dados de cenário encontrados:', scenarioName);
        // Os dados já estão no sessionStorage, updateResultados() irá usá-los
    }
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    loadScenariosInFilter();
    setupScenarioFilter();
    checkForScenarioData();
});