// Inputs Page JavaScript - Model AI

// Variáveis globais para controlar atualização de valores/percentuais
let isUpdatingFromPercent = false;
let isUpdatingFromValue = false;

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
    const entradaValorEl = document.getElementById('vendaEntradaValor');
    if (entradaValorEl) {
        entradaValorEl.value = formatBRNumber(entradaValor);
    }
    
    // Parcelas
    const parcelasPercent = parseFloat(document.getElementById('vendaParcelasPercent')?.value || 0);
    const parcelasValor = (valorImovel * parcelasPercent) / 100;
    const parcelasValorEl = document.getElementById('vendaParcelasValor');
    if (parcelasValorEl) {
        parcelasValorEl.value = formatBRNumber(parcelasValor);
    }
    
    // Reforço
    const reforcoPercent = parseFloat(document.getElementById('vendaReforcoPercent')?.value || 0);
    const reforcoValor = (valorImovel * reforcoPercent) / 100;
    const reforcoValorEl = document.getElementById('vendaReforcoValor');
    if (reforcoValorEl) {
        reforcoValorEl.value = formatBRNumber(reforcoValor);
    }
    
    // Nas Chaves (novo campo separado)
    const nasChavesPercent = parseFloat(document.getElementById('vendaNasChavesPercent')?.value || 0);
    const nasChavesValor = (valorImovel * nasChavesPercent) / 100;
    const nasChavesValorEl = document.getElementById('vendaNasChavesValor');
    if (nasChavesValorEl) {
        nasChavesValorEl.value = formatBRNumber(nasChavesValor);
    }
    
    isUpdatingFromPercent = false;
}

function updatePercentuaisFromValores() {
    const valorImovel = parseBRNumber(document.getElementById('valorImovelInput')?.value || '0');
    if (valorImovel <= 0) return;
    
    isUpdatingFromValue = true;
    
    // Entrada
    const entradaValor = parseBRNumber(document.getElementById('vendaEntradaValor')?.value || '0');
    const entradaPercent = (entradaValor / valorImovel) * 100;
    const entradaPercentEl = document.getElementById('vendaEntradaPercent');
    if (entradaPercentEl) {
        entradaPercentEl.value = entradaPercent.toFixed(2);
    }
    
    // Parcelas
    const parcelasValor = parseBRNumber(document.getElementById('vendaParcelasValor')?.value || '0');
    const parcelasPercent = (parcelasValor / valorImovel) * 100;
    const parcelasPercentEl = document.getElementById('vendaParcelasPercent');
    if (parcelasPercentEl) {
        parcelasPercentEl.value = parcelasPercent.toFixed(2);
    }
    
    // Reforço
    const reforcoValor = parseBRNumber(document.getElementById('vendaReforcoValor')?.value || '0');
    const reforcoPercent = (reforcoValor / valorImovel) * 100;
    const reforcoPercentEl = document.getElementById('vendaReforcoPercent');
    if (reforcoPercentEl) {
        reforcoPercentEl.value = reforcoPercent.toFixed(2);
    }
    
    // Nas Chaves
    const nasChavesValor = parseBRNumber(document.getElementById('vendaNasChavesValor')?.value || '0');
    const nasChavesPercent = (nasChavesValor / valorImovel) * 100;
    const nasChavesPercentEl = document.getElementById('vendaNasChavesPercent');
    if (nasChavesPercentEl) {
        nasChavesPercentEl.value = nasChavesPercent.toFixed(2);
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
        resumoNasChavesEl.textContent = `${percNasChaves.toFixed(1)}%`;
    }
}

// ============== PROPOSTA CLIENTE CALCULATIONS ==============

function calculatePropostaCliente() {
    // Calcular totais da proposta do cliente
    const entradaValor = parseBRNumber(document.getElementById('propostaEntradaValor')?.value || '0');
    const parcelasValor = parseBRNumber(document.getElementById('propostaParcelasValor')?.value || '0');
    const reforcoValor = parseBRNumber(document.getElementById('propostaReforcoValor')?.value || '0');
    const bemMovelImovel = parseBRNumber(document.getElementById('bemMovelImovel')?.value || '0');
    
    const total = entradaValor + parcelasValor + reforcoValor + bemMovelImovel;
    
    // Atualizar campo de total calculado automaticamente
    const valorPropostaCalculadoEl = document.getElementById('valorPropostaCalculado');
    if (valorPropostaCalculadoEl) {
        valorPropostaCalculadoEl.textContent = formatBRNumber(total);
    }
    
    // Atualizar campo de total se existir
    const totalEl = document.getElementById('propostaTotal');
    if (totalEl) {
        totalEl.value = formatBRNumber(total);
    }
    
    // Calcular percentuais automaticamente baseado no total
    if (total > 0) {
        // Calcular e atualizar percentual da entrada
        const entradaPercent = (entradaValor / total) * 100;
        const entradaPercentEl = document.getElementById('propostaEntradaPercent');
        if (entradaPercentEl) {
            entradaPercentEl.value = entradaPercent.toFixed(2) + '%';
        }
        
        // Calcular e atualizar percentual das parcelas
        const parcelasPercent = (parcelasValor / total) * 100;
        const parcelasPercentEl = document.getElementById('propostaParcelasPercent');
        if (parcelasPercentEl) {
            parcelasPercentEl.value = parcelasPercent.toFixed(2) + '%';
        }
        
        // Calcular e atualizar percentual do reforço
        const reforcoPercent = (reforcoValor / total) * 100;
        const reforcoPercentEl = document.getElementById('propostaReforcoPercent');
        if (reforcoPercentEl) {
            reforcoPercentEl.value = reforcoPercent.toFixed(2) + '%';
        }
        
        // Calcular e atualizar percentual do bem móvel/imóvel
        const bemMovelPercent = (bemMovelImovel / total) * 100;
        const bemMovelPercentEl = document.getElementById('bemMovelImovelPercent');
        if (bemMovelPercentEl) {
            bemMovelPercentEl.value = bemMovelPercent.toFixed(2) + '%';
        }
    } else {
        // Se total for zero, limpar percentuais
        const percentElements = [
            'propostaEntradaPercent',
            'propostaParcelasPercent', 
            'propostaReforcoPercent',
            'bemMovelImovelPercent'
        ];
        
        percentElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = '0,00%';
            }
        });
    }
    
    // Calcular valores por parcela após calcular totais
    calculatePropostaValorPorParcela();
}

function calculatePropostaValorPorParcela() {
    // Entrada: Valor / Número de parcelas
    const entradaValor = parseBRNumber(document.getElementById('propostaEntradaValor')?.value || '0');
    const entradaParcelas = parseInt(document.getElementById('propostaEntradaParcelas')?.value || 1);
    
    if (entradaParcelas > 0 && entradaValor > 0) {
        const valorPorParcela = entradaValor / entradaParcelas;
        if (document.getElementById('propostaEntradaValorParcela')) {
            document.getElementById('propostaEntradaValorParcela').value = formatBRNumber(valorPorParcela);
        }
    }
    
    // Parcelas: Valor / Número de parcelas
    const parcelasValor = parseBRNumber(document.getElementById('propostaParcelasValor')?.value || '0');
    const parcelasQtd = parseInt(document.getElementById('propostaParcelasQtd')?.value || 1);
    
    if (parcelasQtd > 0 && parcelasValor > 0) {
        const valorPorParcela = parcelasValor / parcelasQtd;
        if (document.getElementById('propostaParcelasValorParcela')) {
            document.getElementById('propostaParcelasValorParcela').value = formatBRNumber(valorPorParcela);
        }
    }
    
    // Reforço: Valor / Número de parcelas
    const reforcoValor = parseBRNumber(document.getElementById('propostaReforcoValor')?.value || '0');
    const reforcoQtd = parseInt(document.getElementById('propostaReforcoQtd')?.value || 1);
    
    if (reforcoQtd > 0 && reforcoValor > 0) {
        const valorPorParcela = reforcoValor / reforcoQtd;
        if (document.getElementById('propostaReforcoValorParcela')) {
            document.getElementById('propostaReforcoValorParcela').value = formatBRNumber(valorPorParcela);
        }
    }
}

// ============== EVENT LISTENERS ==============

document.addEventListener('DOMContentLoaded', function() {
    // TMA Ano listener
    const tmaAnoInput = document.getElementById('tmaAno');
    if (tmaAnoInput) {
        tmaAnoInput.addEventListener('input', calculateTMAMes);
        tmaAnoInput.addEventListener('change', calculateTMAMes);
    }

    // ============== TABELA DE VENDAS EVENT LISTENERS ==============
    
    // Valor do Imóvel
    const valorImovelInput = document.getElementById('valorImovelInput');
    if (valorImovelInput) {
        valorImovelInput.addEventListener('blur', function() {
            formatInputValue(this);
            calculateTabelaVendas();
        });
        valorImovelInput.addEventListener('input', function() {
            calculateTabelaVendas();
        });
    }
    
    // Entrada - Valor
    const vendaEntradaValorEl = document.getElementById('vendaEntradaValor');
    if (vendaEntradaValorEl) {
        vendaEntradaValorEl.addEventListener('blur', function() {
            formatInputValue(this);
            updatePercentuaisFromValores();
            calculateVendaValorPorParcela();
            updateResumoCards();
        });
        vendaEntradaValorEl.addEventListener('input', function() {
            updatePercentuaisFromValores();
            updateResumoCards();
        });
    }
    
    // Entrada - Percentual
    const vendaEntradaPercentEl = document.getElementById('vendaEntradaPercent');
    if (vendaEntradaPercentEl) {
        vendaEntradaPercentEl.addEventListener('input', function() {
            const valorImovel = parseBRNumber(document.getElementById('valorImovelInput')?.value || '0');
            updateValoresFromPercentuais(valorImovel);
            calculateVendaValorPorParcela();
            updateResumoCards();
        });
    }
    
    // Entrada - Parcelas
    const vendaEntradaParcelasEl = document.getElementById('vendaEntradaParcelas');
    if (vendaEntradaParcelasEl) {
        vendaEntradaParcelasEl.addEventListener('input', function() {
            calculateVendaValorPorParcela();
            updateResumoCards();
        });
    }
    
    // Parcelas - Valor
    const vendaParcelasValorEl = document.getElementById('vendaParcelasValor');
    if (vendaParcelasValorEl) {
        vendaParcelasValorEl.addEventListener('blur', function() {
            formatInputValue(this);
            updatePercentuaisFromValores();
            calculateVendaValorPorParcela();
            updateResumoCards();
        });
        vendaParcelasValorEl.addEventListener('input', function() {
            updatePercentuaisFromValores();
            updateResumoCards();
        });
    }
    
    // Parcelas - Percentual
    const vendaParcelasPercentEl = document.getElementById('vendaParcelasPercent');
    if (vendaParcelasPercentEl) {
        vendaParcelasPercentEl.addEventListener('input', function() {
            const valorImovel = parseBRNumber(document.getElementById('valorImovelInput')?.value || '0');
            updateValoresFromPercentuais(valorImovel);
            calculateVendaValorPorParcela();
            updateResumoCards();
        });
    }
    
    // Parcelas - Quantidade
    const vendaParcelasQtdEl = document.getElementById('vendaParcelasQtd');
    if (vendaParcelasQtdEl) {
        vendaParcelasQtdEl.addEventListener('input', function() {
            calculateVendaValorPorParcela();
            updateResumoCards();
        });
    }
    
    // Reforço - Valor
    const vendaReforcoValorEl = document.getElementById('vendaReforcoValor');
    if (vendaReforcoValorEl) {
        vendaReforcoValorEl.addEventListener('blur', function() {
            formatInputValue(this);
            updatePercentuaisFromValores();
            calculateVendaValorPorParcela();
            updateResumoCards();
        });
        vendaReforcoValorEl.addEventListener('input', function() {
            updatePercentuaisFromValores();
            updateResumoCards();
        });
    }
    
    // Reforço - Percentual
    const vendaReforcoPercentEl = document.getElementById('vendaReforcoPercent');
    if (vendaReforcoPercentEl) {
        vendaReforcoPercentEl.addEventListener('input', function() {
            const valorImovel = parseBRNumber(document.getElementById('valorImovelInput')?.value || '0');
            updateValoresFromPercentuais(valorImovel);
            calculateVendaValorPorParcela();
            updateResumoCards();
        });
    }
    
    // Reforço - Quantidade
    const vendaReforcoQtdEl = document.getElementById('vendaReforcoQtd');
    if (vendaReforcoQtdEl) {
        vendaReforcoQtdEl.addEventListener('input', function() {
            calculateVendaValorPorParcela();
            updateResumoCards();
        });
    }
    
    // Nas Chaves - Valor
    const vendaNasChavesValorEl = document.getElementById('vendaNasChavesValor');
    if (vendaNasChavesValorEl) {
        vendaNasChavesValorEl.addEventListener('blur', function() {
            formatInputValue(this);
            updatePercentuaisFromValores();
            updateResumoCards();
        });
        vendaNasChavesValorEl.addEventListener('input', function() {
            updatePercentuaisFromValores();
            updateResumoCards();
        });
    }
    
    // Nas Chaves - Percentual
    const vendaNasChavesPercentEl = document.getElementById('vendaNasChavesPercent');
    if (vendaNasChavesPercentEl) {
        vendaNasChavesPercentEl.addEventListener('input', function() {
            const valorImovel = parseBRNumber(document.getElementById('valorImovelInput')?.value || '0');
            updateValoresFromPercentuais(valorImovel);
            updateResumoCards();
        });
    }

    // ============== PROPOSTA CLIENTE EVENT LISTENERS ==============
    
    // Entrada - Valor
    const propostaEntradaValorEl = document.getElementById('propostaEntradaValor');
    if (propostaEntradaValorEl) {
        propostaEntradaValorEl.addEventListener('blur', function() {
            formatInputValue(this);
            calculatePropostaCliente();
        });
        propostaEntradaValorEl.addEventListener('input', function() {
            calculatePropostaCliente();
        });
    }
    
    // Entrada - Parcelas
    const propostaEntradaParcelasEl = document.getElementById('propostaEntradaParcelas');
    if (propostaEntradaParcelasEl) {
        propostaEntradaParcelasEl.addEventListener('input', function() {
            calculatePropostaValorPorParcela();
        });
    }
    
    // Parcelas - Valor
    const propostaParcelasValorEl = document.getElementById('propostaParcelasValor');
    if (propostaParcelasValorEl) {
        propostaParcelasValorEl.addEventListener('blur', function() {
            formatInputValue(this);
            calculatePropostaCliente();
        });
        propostaParcelasValorEl.addEventListener('input', function() {
            calculatePropostaCliente();
        });
    }
    
    // Parcelas - Quantidade
    const propostaParcelasQtdEl = document.getElementById('propostaParcelasQtd');
    if (propostaParcelasQtdEl) {
        propostaParcelasQtdEl.addEventListener('input', function() {
            calculatePropostaValorPorParcela();
        });
    }
    
    // Reforço - Valor
    const propostaReforcoValorEl = document.getElementById('propostaReforcoValor');
    if (propostaReforcoValorEl) {
        propostaReforcoValorEl.addEventListener('blur', function() {
            formatInputValue(this);
            calculatePropostaCliente();
        });
        propostaReforcoValorEl.addEventListener('input', function() {
            calculatePropostaCliente();
        });
    }
    
    // Reforço - Quantidade
    const propostaReforcoQtdEl = document.getElementById('propostaReforcoQtd');
    if (propostaReforcoQtdEl) {
        propostaReforcoQtdEl.addEventListener('input', function() {
            calculatePropostaValorPorParcela();
        });
    }
    
    // Bem Móvel/Imóvel
    const bemMovelImovelEl = document.getElementById('bemMovelImovel');
    if (bemMovelImovelEl) {
        bemMovelImovelEl.addEventListener('blur', function() {
            formatInputValue(this);
            calculatePropostaCliente();
        });
        bemMovelImovelEl.addEventListener('input', function() {
            calculatePropostaCliente();
        });
    }
    
    // ============== CALCULATE INITIAL VALUES ==============
    
    // Primeiro, limpar dados antigos se não estiver editando
    checkAndClearOldData();
    
    // Calculate initial values
    setTimeout(() => {
        calculateTMAMes();
        calculateTabelaVendas();
        calculatePropostaCliente();
    }, 100);
    
    // Carregar dados salvos se estiver editando
    loadSavedData();
});

// ==================== ACTION BUTTON FUNCTIONALITY ====================

function updateActionButton(tabId) {
    const actionBtn = document.getElementById('actionBtn');
    if (!actionBtn) {
        console.error('Botão actionBtn não encontrado!');
        return;
    }
    
    // Limpar onclick anterior
    actionBtn.onclick = null;
    
    console.log('Atualizando botão para aba:', tabId);
    
    switch(tabId) {
        case 'generalData':
            actionBtn.innerHTML = '<i class="fas fa-arrow-right"></i> <span>Próximo: Tabela de Vendas</span>';
            actionBtn.onclick = () => {
                console.log('Clicou para ir para salesData');
                switchToTab('salesData');
            };
            break;
        case 'salesData':
            actionBtn.innerHTML = '<i class="fas fa-arrow-right"></i> <span>Próximo: Proposta Cliente</span>';
            actionBtn.onclick = () => {
                console.log('Clicou para ir para propostaCliente');
                switchToTab('propostaCliente');
            };
            break;
        case 'propostaCliente':
            // Check if in editing mode
            if (window.editingScenarioId) {
                actionBtn.innerHTML = '<i class="fas fa-save"></i> <span>Atualizar Cenário</span>';
                actionBtn.onclick = () => {
                    console.log('Clicou para atualizar cenário');
                    updateExistingScenario();
                };
            } else {
                actionBtn.innerHTML = '<i class="fas fa-save"></i> <span>Salvar Cenário</span>';
                actionBtn.onclick = () => {
                    console.log('Clicou para salvar cenário');
                    openSaveModal();
                };
            }
            break;
        default:
            actionBtn.innerHTML = '<i class="fas fa-arrow-right"></i> <span>Próximo</span>';
            actionBtn.onclick = () => switchToTab('salesData');
    }
}

function switchToTab(targetTabId) {
    console.log('Tentando mudar para aba:', targetTabId);
    
    // Find and click the target tab
    const targetBtn = document.querySelector(`[data-tab="${targetTabId}"]`);
    if (targetBtn) {
        console.log('Botão da aba encontrado, clicando...');
        targetBtn.click();
    } else {
        console.error('Botão da aba não encontrado para:', targetTabId);
    }
}

// ==================== VALIDATION ====================

function validateRequiredFields() {
    const requiredFields = [
        // Dados Gerais
        'cliente', 'imobiliaria', 'incorporadora', 'empreendimento', 'unidade', 'areaPrivativa', 'tmaAno'
    ];
    
    // Campos da Tabela de Vendas (sempre obrigatórios se a aba estiver sendo usada)
    const tabelaVendasFields = [
        'valorImovelInput', 'vendaEntradaValor', 'vendaEntradaParcelas', 'vendaParcelasValor', 'vendaParcelasQtd', 
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
        'valorImovelInput': 'Valor do Imóvel (R$)',
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

// ==================== SAVE SCENARIO ====================

function openSaveModal() {
    // Validar campos obrigatórios
    const missingFields = validateRequiredFields();
    
    if (missingFields.length > 0) {
        const message = `Por favor, preencha os seguintes campos obrigatórios:\n\n${missingFields.join('\n')}`;
        if (window.showError) {
            window.showError(message, 8000);
        } else {
            alert(message);
        }
        return;
    }
    
    // Show modal for scenario name
    const modal = document.getElementById('scenarioNameModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('scenarioNameInput')?.focus();
    }
}

function nextStep() {
    // Esta função agora só é chamada pelo modal de salvar
    openSaveModal();
}

function closeScenarioNameModal() {
    const modal = document.getElementById('scenarioNameModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function saveScenarioAndProceed() {
    const scenarioName = document.getElementById('scenarioNameInput')?.value?.trim();
    if (!scenarioName) {
        if (window.showError) {
            window.showError('Por favor, digite um nome para o cenário.');
        } else {
            alert('Por favor, digite um nome para o cenário.');
        }
        document.getElementById('scenarioNameInput')?.focus();
        return;
    }
    
    // Close modal
    closeScenarioNameModal();
    
    // Mostrar indicador de carregamento
    if (window.showInfo) {
        window.showInfo('Salvando cenário...', 2000);
    }
    
    // Coletar dados gerais
    const dadosGerais = {
        cliente: document.getElementById('cliente')?.value || '',
        imobiliaria: document.getElementById('imobiliaria')?.value || '',
        incorporadora: document.getElementById('incorporadora')?.value || '',
        empreendimento: document.getElementById('empreendimento')?.value || '',
        unidade: document.getElementById('unidade')?.value || '',
        areaPrivativa: parseFloat(document.getElementById('areaPrivativa')?.value) || 0,
        tmaAno: parseFloat(document.getElementById('tmaAno')?.value) || 0,
        tmaMes: parseFloat(document.getElementById('tmaMes')?.value) || 0
    };
    
    // Coletar tabela de vendas com novo campo valorImovel
    const tabelaVendas = {
        valorImovel: parseBRNumber(document.getElementById('valorImovelInput')?.value || '0'),
        entradaValor: parseBRNumber(document.getElementById('vendaEntradaValor')?.value || '0'),
        entradaPercent: parseFloat(document.getElementById('vendaEntradaPercent')?.value) || 0,
        entradaParcelas: parseInt(document.getElementById('vendaEntradaParcelas')?.value) || 1,
        entradaValorParcela: parseBRNumber(document.getElementById('vendaEntradaValorParcela')?.value || '0'),
        parcelasValor: parseBRNumber(document.getElementById('vendaParcelasValor')?.value || '0'),
        parcelasPercent: parseFloat(document.getElementById('vendaParcelasPercent')?.value) || 0,
        parcelasQtd: parseInt(document.getElementById('vendaParcelasQtd')?.value) || 1,
        parcelasValorParcela: parseBRNumber(document.getElementById('vendaParcelasValorParcela')?.value || '0'),
        reforcoValor: parseBRNumber(document.getElementById('vendaReforcoValor')?.value || '0'),
        reforcoPercent: parseFloat(document.getElementById('vendaReforcoPercent')?.value) || 0,
        reforcoQtd: parseInt(document.getElementById('vendaReforcoQtd')?.value) || 1,
        reforcoFrequencia: parseInt(document.getElementById('vendaReforcoFrequencia')?.value) || 6,
        reforcoValorParcela: parseBRNumber(document.getElementById('vendaReforcoValorParcela')?.value || '0'),
        // Separar Nas Chaves do Bem Móvel/Imóvel
        nasChavesValor: parseBRNumber(document.getElementById('vendaNasChavesValor')?.value || '0'),
        nasChavesPercent: parseFloat(document.getElementById('vendaNasChavesPercent')?.value) || 0,
        nasChavesMes: parseInt(document.getElementById('vendaNasChavesMes')?.value) || 24,
        nasChavesDesagio: parseFloat(document.getElementById('vendaDesagio')?.value) || 0
    };
    
    // Coletar proposta do cliente
    const propostaCliente = {
        entradaValor: parseBRNumber(document.getElementById('propostaEntradaValor')?.value || '0'),
        entradaParcelas: parseInt(document.getElementById('propostaEntradaParcelas')?.value) || 1,
        entradaValorParcela: parseBRNumber(document.getElementById('propostaEntradaValorParcela')?.value || '0'),
        parcelasValor: parseBRNumber(document.getElementById('propostaParcelasValor')?.value || '0'),
        parcelasQtd: parseInt(document.getElementById('propostaParcelasQtd')?.value) || 1,
        parcelasValorParcela: parseBRNumber(document.getElementById('propostaParcelasValorParcela')?.value || '0'),
        reforcoValor: parseBRNumber(document.getElementById('propostaReforcoValor')?.value || '0'),
        reforcoQtd: parseInt(document.getElementById('propostaReforcoQtd')?.value) || 1,
        reforcoValorParcela: parseBRNumber(document.getElementById('propostaReforcoValorParcela')?.value || '0'),
        bemMovelImovel: parseBRNumber(document.getElementById('bemMovelImovel')?.value || '0')
    };
    
    // Criar objeto do cenário
    const scenario = {
        name: scenarioName,
        data: {
            dadosGerais: dadosGerais,
            tabelaVendas: tabelaVendas,
            propostaCliente: {
                entradaValor: parseBRNumber(document.getElementById('propostaEntradaValor')?.value || '0'),
                entradaParcelas: parseInt(document.getElementById('propostaEntradaParcelas')?.value) || 1,
                entradaValorParcela: parseBRNumber(document.getElementById('propostaEntradaValorParcela')?.value || '0'),
                parcelasValor: parseBRNumber(document.getElementById('propostaParcelasValor')?.value || '0'),
                parcelasQtd: parseInt(document.getElementById('propostaParcelasQtd')?.value) || 1,
                parcelasValorParcela: parseBRNumber(document.getElementById('propostaParcelasValorParcela')?.value || '0'),
                reforcoValor: parseBRNumber(document.getElementById('propostaReforcoValor')?.value || '0'),
                reforcoQtd: parseInt(document.getElementById('propostaReforcoQtd')?.value) || 1,
                reforcoFrequencia: parseInt(document.getElementById('propostaReforcoFrequencia')?.value) || 6,
                reforcoValorParcela: parseBRNumber(document.getElementById('propostaReforcoValorParcela')?.value || '0'),
                bemMovelImovel: parseBRNumber(document.getElementById('bemMovelImovel')?.value || '0'),
                mesVenda: parseInt(document.getElementById('mesVenda')?.value) || 1,
                bemMovelDesagio: parseFloat(document.getElementById('desagio')?.value) || 0
            },
            createdAt: new Date().toISOString()
        }
    };
    
    // Salvar no localStorage temporariamente
    localStorage.setItem('currentScenario', JSON.stringify(scenario));
    
    // Enviar para o servidor
    fetch('/api/scenarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(scenario)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Resposta do servidor:', data);
        if (data.scenario) {
            // Limpar dados dos formulários
            clearAllForms();
            
            // Mostrar sucesso
            if (window.showSuccess) {
                window.showSuccess('Cenário salvo com sucesso!', 3000);
            }
            
            // Redirecionar para a página de resultados com o ID do cenário
            setTimeout(() => {
                window.location.href = `/resultados.html?scenario=${data.scenario._id}`;
            }, 1000);
        } else {
            if (window.showError) {
                window.showError('Erro ao salvar cenário: ' + (data.message || 'Erro desconhecido'));
            } else {
                alert('Erro ao salvar cenário: ' + (data.message || 'Erro desconhecido'));
            }
        }
    })
    .catch(error => {
        console.error('Erro ao salvar cenário:', error);
        if (window.showError) {
            window.showError('Erro ao salvar cenário: ' + error.message);
        } else {
            alert('Erro ao salvar cenário. Verifique sua conexão.');
        }
    });
}

function clearAllFormsConfirm() {
    if (window.confirm('Tem certeza de que deseja limpar todos os dados preenchidos? Esta ação não pode ser desfeita.')) {
        clearAllForms();
        
        // Mostrar mensagem de sucesso
        if (window.showSuccess) {
            window.showSuccess('Todos os dados foram limpos com sucesso!', 3000);
        }
        
        // Voltar para a primeira aba
        const firstTab = document.querySelector('[data-tab="dados-gerais"]');
        if (firstTab) {
            firstTab.click();
        }
    }
}

function updateExistingScenario() {
    if (!window.editingScenarioId) {
        if (window.showError) {
            window.showError('Erro: Modo de edição não identificado.');
        } else {
            alert('Erro: Modo de edição não identificado.');
        }
        return;
    }
    
    // Validar campos obrigatórios básicos
    const cliente = document.getElementById('cliente')?.value?.trim();
    const valorImovel = document.getElementById('valorImovelInput')?.value?.trim();
    
    if (!cliente) {
        if (window.showError) {
            window.showError('Campo "Cliente" é obrigatório.');
        } else {
            alert('Campo "Cliente" é obrigatório.');
        }
        return;
    }
    
    if (!valorImovel || parseBRNumber(valorImovel) <= 0) {
        if (window.showError) {
            window.showError('Campo "Valor do Imóvel" é obrigatório e deve ser maior que zero.');
        } else {
            alert('Campo "Valor do Imóvel" é obrigatório e deve ser maior que zero.');
        }
        return;
    }
    
    // Mostrar indicador de carregamento
    if (window.showInfo) {
        window.showInfo('Atualizando cenário...', 2000);
    }
    
    // Coletar dados gerais
    const dadosGerais = {
        cliente: document.getElementById('cliente')?.value || '',
        imobiliaria: document.getElementById('imobiliaria')?.value || '',
        incorporadora: document.getElementById('incorporadora')?.value || '',
        empreendimento: document.getElementById('empreendimento')?.value || '',
        unidade: document.getElementById('unidade')?.value || '',
        areaPrivativa: parseFloat(document.getElementById('areaPrivativa')?.value) || 0,
        tmaAno: parseFloat(document.getElementById('tmaAno')?.value) || 0,
        tmaMes: parseFloat(document.getElementById('tmaMes')?.value) || 0
    };
    
    // Coletar tabela de vendas com novo campo valorImovel
    const tabelaVendas = {
        valorImovel: parseBRNumber(document.getElementById('valorImovelInput')?.value || '0'),
        entradaValor: parseBRNumber(document.getElementById('vendaEntradaValor')?.value || '0'),
        entradaPercent: parseFloat(document.getElementById('vendaEntradaPercent')?.value) || 0,
        entradaParcelas: parseInt(document.getElementById('vendaEntradaParcelas')?.value) || 1,
        entradaValorParcela: parseBRNumber(document.getElementById('vendaEntradaValorParcela')?.value || '0'),
        parcelasValor: parseBRNumber(document.getElementById('vendaParcelasValor')?.value || '0'),
        parcelasPercent: parseFloat(document.getElementById('vendaParcelasPercent')?.value) || 0,
        parcelasQtd: parseInt(document.getElementById('vendaParcelasQtd')?.value) || 1,
        parcelasValorParcela: parseBRNumber(document.getElementById('vendaParcelasValorParcela')?.value || '0'),
        reforcoValor: parseBRNumber(document.getElementById('vendaReforcoValor')?.value || '0'),
        reforcoPercent: parseFloat(document.getElementById('vendaReforcoPercent')?.value) || 0,
        reforcoQtd: parseInt(document.getElementById('vendaReforcoQtd')?.value) || 1,
        reforcoFrequencia: parseInt(document.getElementById('vendaReforcoFrequencia')?.value) || 6,
        reforcoValorParcela: parseBRNumber(document.getElementById('vendaReforcoValorParcela')?.value || '0'),
        // Separar Nas Chaves do Bem Móvel/Imóvel
        nasChavesValor: parseBRNumber(document.getElementById('vendaNasChavesValor')?.value || '0'),
        nasChavesPercent: parseFloat(document.getElementById('vendaNasChavesPercent')?.value) || 0,
        nasChavesMes: parseInt(document.getElementById('vendaNasChavesMes')?.value) || 24,
        nasChavesDesagio: parseFloat(document.getElementById('vendaDesagio')?.value) || 0
    };
    
    // Coletar proposta do cliente
    const propostaCliente = {
        entradaValor: parseBRNumber(document.getElementById('propostaEntradaValor')?.value || '0'),
        entradaParcelas: parseInt(document.getElementById('propostaEntradaParcelas')?.value) || 1,
        entradaValorParcela: parseBRNumber(document.getElementById('propostaEntradaValorParcela')?.value || '0'),
        parcelasValor: parseBRNumber(document.getElementById('propostaParcelasValor')?.value || '0'),
        parcelasQtd: parseInt(document.getElementById('propostaParcelasQtd')?.value) || 1,
        parcelasValorParcela: parseBRNumber(document.getElementById('propostaParcelasValorParcela')?.value || '0'),
        reforcoValor: parseBRNumber(document.getElementById('propostaReforcoValor')?.value || '0'),
        reforcoQtd: parseInt(document.getElementById('propostaReforcoQtd')?.value) || 1,
        reforcoFrequencia: parseInt(document.getElementById('propostaReforcoFrequencia')?.value) || 6,
        reforcoValorParcela: parseBRNumber(document.getElementById('propostaReforcoValorParcela')?.value || '0'),
        bemMovelImovel: parseBRNumber(document.getElementById('bemMovelImovel')?.value || '0'),
        mesVenda: parseInt(document.getElementById('mesVenda')?.value) || 1,
        bemMovelDesagio: parseFloat(document.getElementById('desagio')?.value) || 0
    };
    
    // Criar objeto de atualização
    const scenarioName = window.editingScenarioData?.name || 'Cenário Editado';
    const updateData = {
        name: scenarioName,
        data: {
            dadosGerais: dadosGerais,
            tabelaVendas: tabelaVendas,
            propostaCliente: propostaCliente,
            updatedAt: new Date().toISOString()
        }
    };
    
    // Enviar para o servidor
    fetch(`/api/scenarios/${window.editingScenarioId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Resposta da atualização:', data);
        if (data.scenario) {
            // Limpar modo de edição
            window.editingScenarioId = null;
            window.editingScenarioData = null;
            
            // Mostrar sucesso
            if (window.showSuccess) {
                window.showSuccess('Cenário atualizado com sucesso!', 3000);
            }
            
            // Redirecionar para a página de resultados com o ID do cenário
            setTimeout(() => {
                window.location.href = `/resultados.html?scenario=${data.scenario._id}`;
            }, 1000);
        } else {
            if (window.showError) {
                window.showError('Erro ao atualizar cenário: ' + (data.message || 'Erro desconhecido'));
            } else {
                alert('Erro ao atualizar cenário: ' + (data.message || 'Erro desconhecido'));
            }
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar cenário:', error);
        if (window.showError) {
            window.showError('Erro ao atualizar cenário: ' + error.message);
        } else {
            alert('Erro ao atualizar cenário. Verifique sua conexão.');
        }
    });
}

function clearAllForms() {
    try {
        // Limpar dados gerais
        const generalFields = ['cliente', 'imobiliaria', 'incorporadora', 'empreendimento', 'unidade', 'areaPrivativa', 'tmaAno', 'tmaMes'];
        generalFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) field.value = '';
        });
        
        // Limpar tabela de vendas
        const vendasFields = [
            'valorImovelInput', 'vendaEntradaValor', 'vendaEntradaPercent', 'vendaEntradaParcelas', 'vendaEntradaValorParcela',
            'vendaParcelasValor', 'vendaParcelasPercent', 'vendaParcelasQtd', 'vendaParcelasValorParcela',
            'vendaReforcoValor', 'vendaReforcoPercent', 'vendaReforcoQtd', 'vendaReforcoFrequencia', 'vendaReforcoValorParcela',
            'vendaNasChavesValor', 'vendaNasChavesPercent'
        ];
        vendasFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                if (id.includes('Parcelas') && !id.includes('Valor')) {
                    field.value = '1';
                } else if (id.includes('Qtd')) {
                    field.value = '1';
                } else if (id === 'vendaReforcoFrequencia') {
                    field.value = '6';
                } else {
                    field.value = '';
                }
            }
        });
        
        // Limpar proposta cliente
        const propostaFields = [
            'propostaEntradaValor', 'propostaEntradaPercent', 'propostaEntradaParcelas', 'propostaEntradaValorParcela',
            'propostaParcelasValor', 'propostaParcelasPercent', 'propostaParcelasQtd', 'propostaParcelasValorParcela',
            'propostaReforcoValor', 'propostaReforcoPercent', 'propostaReforcoQtd', 'propostaReforcoValorParcela',
            'bemMovelImovel', 'bemMovelImovelPercent', 'propostaTotal'
        ];
        propostaFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                if (id.includes('Parcelas') && !id.includes('Valor')) {
                    field.value = '1';
                } else if (id.includes('Qtd')) {
                    field.value = '1';
                } else {
                    field.value = '';
                }
            }
        });
        
        // Limpar resumo cards
        const resumoElements = ['resumoEntrada', 'resumoParcelas', 'resumoReforco', 'resumoNasChaves'];
        resumoElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = '0.0% - 0x';
            }
        });
        
        // Limpar localStorage
        localStorage.removeItem('currentScenario');
        
        console.log('Formulários limpos com sucesso');
    } catch (error) {
        console.error('Erro ao limpar formulários:', error);
    }
}

// ==================== LOAD SAVED DATA ====================

function checkAndClearOldData() {
    // Check if editing an existing scenario
    const urlParams = new URLSearchParams(window.location.search);
    const scenarioId = urlParams.get('scenario');
    
    // Se não estiver editando um cenário, limpar todos os dados
    if (!scenarioId) {
        clearAllForms();
        localStorage.removeItem('currentScenario');
    }
}

function loadSavedData() {
    // Check if editing an existing scenario
    const urlParams = new URLSearchParams(window.location.search);
    const scenarioId = urlParams.get('scenario');
    
    // Check for editing scenario in sessionStorage first
    const editingScenario = sessionStorage.getItem('editingScenario');
    
    if (editingScenario) {
        try {
            const scenario = JSON.parse(editingScenario);
            console.log('Carregando cenário do sessionStorage:', scenario);
            
            // Set editing mode
            window.editingScenarioId = scenario._id || scenario.id;
            window.editingScenarioData = scenario; // Store full scenario data
            console.log('Modo de edição ativado para cenário:', window.editingScenarioId);
            
            populateForm(scenario);
            // Clear after loading to prevent reloading on refresh
            sessionStorage.removeItem('editingScenario');
        } catch (error) {
            console.error('Erro ao carregar cenário do sessionStorage:', error);
        }
    } else if (scenarioId) {
        // Set editing mode for URL parameter
        window.editingScenarioId = scenarioId;
        window.editingScenarioData = null; // Will be loaded from server
        console.log('Modo de edição ativado via URL para cenário:', window.editingScenarioId);
        
        // Load from server
        fetch(`/api/scenarios/${scenarioId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Dados recebidos do servidor:', data);
            if (data.scenario) {
                window.editingScenarioData = data.scenario; // Store full scenario data
                populateForm(data.scenario);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar cenário:', error);
        });
    } else {
        // Clear editing mode - this is creation mode
        window.editingScenarioId = null;
        window.editingScenarioData = null;
        console.log('Modo de criação ativado');
        
        // Load from localStorage if available
        const savedScenario = localStorage.getItem('currentScenario');
        if (savedScenario) {
            try {
                const scenario = JSON.parse(savedScenario);
                // Adaptar formato do localStorage para o formato esperado
                const adaptedScenario = {
                    data: scenario
                };
                populateForm(adaptedScenario);
            } catch (error) {
                console.error('Erro ao carregar dados salvos:', error);
            }
        }
    }
}

function populateForm(scenario) {
    console.log('populateForm chamada com:', scenario);
    
    // Verificar se há dados válidos para preencher
    if (!scenario) {
        console.log('Nenhum cenário para preencher');
        return;
    }
    
    // Adaptar estrutura - dados podem estar em scenario.data ou diretamente em scenario
    const data = scenario.data || scenario;
    console.log('Dados extraídos:', data);
    
    // Populate dados gerais
    if (data.dadosGerais) {
        console.log('Preenchendo dados gerais:', data.dadosGerais);
        const dadosGerais = data.dadosGerais;
        if (document.getElementById('cliente')) document.getElementById('cliente').value = dadosGerais.cliente || '';
        if (document.getElementById('imobiliaria')) document.getElementById('imobiliaria').value = dadosGerais.imobiliaria || '';
        if (document.getElementById('incorporadora')) document.getElementById('incorporadora').value = dadosGerais.incorporadora || '';
        if (document.getElementById('empreendimento')) document.getElementById('empreendimento').value = dadosGerais.empreendimento || '';
        if (document.getElementById('unidade')) document.getElementById('unidade').value = dadosGerais.unidade || '';
        if (document.getElementById('areaPrivativa')) document.getElementById('areaPrivativa').value = dadosGerais.areaPrivativa || '';
        if (document.getElementById('tmaAno')) document.getElementById('tmaAno').value = dadosGerais.tmaAno || '';
        if (document.getElementById('tmaMes')) document.getElementById('tmaMes').value = dadosGerais.tmaMes || '';
    }
    
    // Populate tabela de vendas
    if (data.tabelaVendas) {
        const tabelaVendas = data.tabelaVendas;
        if (document.getElementById('valorImovelInput')) document.getElementById('valorImovelInput').value = formatBRNumber(tabelaVendas.valorImovel || 0);
        if (document.getElementById('vendaEntradaValor')) document.getElementById('vendaEntradaValor').value = formatBRNumber(tabelaVendas.entradaValor || 0);
        if (document.getElementById('vendaEntradaPercent')) document.getElementById('vendaEntradaPercent').value = tabelaVendas.entradaPercent || 0;
        if (document.getElementById('vendaEntradaParcelas') && tabelaVendas.entradaParcelas && tabelaVendas.entradaParcelas !== 1) document.getElementById('vendaEntradaParcelas').value = tabelaVendas.entradaParcelas;
        if (document.getElementById('vendaParcelasValor')) document.getElementById('vendaParcelasValor').value = formatBRNumber(tabelaVendas.parcelasValor || 0);
        if (document.getElementById('vendaParcelasPercent')) document.getElementById('vendaParcelasPercent').value = tabelaVendas.parcelasPercent || 0;
        if (document.getElementById('vendaParcelasQtd') && tabelaVendas.parcelasQtd && tabelaVendas.parcelasQtd !== 1) document.getElementById('vendaParcelasQtd').value = tabelaVendas.parcelasQtd;
        if (document.getElementById('vendaReforcoValor')) document.getElementById('vendaReforcoValor').value = formatBRNumber(tabelaVendas.reforcoValor || 0);
        if (document.getElementById('vendaReforcoPercent')) document.getElementById('vendaReforcoPercent').value = tabelaVendas.reforcoPercent || 0;
        if (document.getElementById('vendaReforcoQtd') && tabelaVendas.reforcoQtd && tabelaVendas.reforcoQtd !== 1) document.getElementById('vendaReforcoQtd').value = tabelaVendas.reforcoQtd;
        if (document.getElementById('vendaReforcoFrequencia')) document.getElementById('vendaReforcoFrequencia').value = tabelaVendas.reforcoFrequencia || 6;
        if (document.getElementById('vendaNasChavesValor')) document.getElementById('vendaNasChavesValor').value = formatBRNumber(tabelaVendas.nasChavesValor || 0);
        if (document.getElementById('vendaNasChavesPercent')) document.getElementById('vendaNasChavesPercent').value = tabelaVendas.nasChavesPercent || 0;
        if (document.getElementById('vendaNasChavesMes')) document.getElementById('vendaNasChavesMes').value = tabelaVendas.nasChavesMes || 24;
        if (document.getElementById('vendaDesagio')) document.getElementById('vendaDesagio').value = tabelaVendas.nasChavesDesagio || 0;
    }
    
    // Populate proposta cliente
    if (data.propostaCliente) {
        const propostaCliente = data.propostaCliente;
        if (document.getElementById('propostaEntradaValor')) document.getElementById('propostaEntradaValor').value = formatBRNumber(propostaCliente.entradaValor || 0);
        if (document.getElementById('propostaEntradaParcelas') && propostaCliente.entradaParcelas && propostaCliente.entradaParcelas !== 1) document.getElementById('propostaEntradaParcelas').value = propostaCliente.entradaParcelas;
        if (document.getElementById('propostaParcelasValor')) document.getElementById('propostaParcelasValor').value = formatBRNumber(propostaCliente.parcelasValor || 0);
        if (document.getElementById('propostaParcelasQtd') && propostaCliente.parcelasQtd && propostaCliente.parcelasQtd !== 1) document.getElementById('propostaParcelasQtd').value = propostaCliente.parcelasQtd;
        if (document.getElementById('propostaReforcoValor')) document.getElementById('propostaReforcoValor').value = formatBRNumber(propostaCliente.reforcoValor || 0);
        if (document.getElementById('propostaReforcoQtd') && propostaCliente.reforcoQtd && propostaCliente.reforcoQtd !== 1) document.getElementById('propostaReforcoQtd').value = propostaCliente.reforcoQtd;
        if (document.getElementById('propostaReforcoFrequencia')) document.getElementById('propostaReforcoFrequencia').value = propostaCliente.reforcoFrequencia || 6;
        if (document.getElementById('bemMovelImovel')) document.getElementById('bemMovelImovel').value = formatBRNumber(propostaCliente.bemMovelImovel || 0);
        if (document.getElementById('mesVenda') && propostaCliente.mesVenda && propostaCliente.mesVenda !== 1) document.getElementById('mesVenda').value = propostaCliente.mesVenda;
        if (document.getElementById('desagio')) document.getElementById('desagio').value = propostaCliente.bemMovelDesagio || 0;
    }
    
    // Recalculate after loading
    setTimeout(() => {
        calculateTMAMes();
        calculateTabelaVendas();
        calculatePropostaCliente();
    }, 100);
}
