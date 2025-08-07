// Vendas Dashboard - Sistema de Gráficos Interativos
class VendasDashboard {
    constructor() {
        this.api = new ApiClient();
        this.dados = null;
        this.filtrosAtivos = {};
        this.graficos = {};
        
        this.init();
    }

    async init() {
        try {
            await this.carregarDados();
            this.configurarEventos();
            this.renderizarDashboard();
        } catch (error) {
            console.error('Erro ao inicializar dashboard:', error);
            this.mostrarErro('Erro ao carregar dados do dashboard');
        }
    }

    async carregarDados() {
        try {
            const response = await this.api.request('/sales/dashboard');
            
            if (response.success) {
                this.dados = response.data;
            } else {
                // Se não há dados, criar dados de exemplo para demonstração
                this.dados = this.criarDadosExemplo();
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            // Usar dados de exemplo em caso de erro
            this.dados = this.criarDadosExemplo();
        }
    }

    criarDadosExemplo() {
        // Dados de exemplo para demonstração
        return {
            resumo: {
                totalVendas: 246,
                totalArea: 15745,
                valorMedioM2: 15634,
                quantidadeEmpreendimentos: 8
            },
            variacaoPorEmpreendimento: [
                { nome: 'Sion', variacao: 20, tipo: 'positiva', valor: 23.063 },
                { nome: 'Orgânica', variacao: 0, tipo: 'neutro', valor: 13.129 },
                { nome: 'Era', variacao: -15, tipo: 'negativa', valor: 13.676 },
                { nome: 'Sunhaus', variacao: -20, tipo: 'negativa', valor: 13.727 },
                { nome: 'Futura', variacao: -38, tipo: 'negativa', valor: 13.579 },
                { nome: 'Plural', variacao: -12, tipo: 'negativa', valor: 15.593 }
            ],
            vendasPorPeriodo: [
                { periodo: '2024-01', vendas: 8, area: 737, quantidade: 6 },
                { periodo: '2024-02', vendas: 7, area: 490, quantidade: 7 },
                { periodo: '2024-03', vendas: 8, area: 686, quantidade: 5 },
                { periodo: '2024-04', vendas: 6, area: 494, quantidade: 3 },
                { periodo: '2024-05', vendas: 16, area: 1402, quantidade: 9 },
                { periodo: '2024-06', vendas: 18, area: 909, quantidade: 8 },
                { periodo: '2024-07', vendas: 58, area: 2375, quantidade: 16 },
                { periodo: '2024-08', vendas: 24, area: 1191, quantidade: 11 },
                { periodo: '2024-09', vendas: 23, area: 2019, quantidade: 15 },
                { periodo: '2024-10', vendas: 42, area: 2812, quantidade: 17 },
                { periodo: '2024-11', vendas: 20, area: 1366, quantidade: 15 },
                { periodo: '2024-12', vendas: 16, area: 1365, quantidade: 20 }
            ],
            tabelaPrincipal: [
                { projeto: 'Sion', unidade: '1203', titulo: '642', cliente: 'Mpr Participações Ltda', vendas: 186, valorM2: 9637.000, area: 51.703, data: '2024-07-29' },
                { projeto: 'Sion', unidade: '801', titulo: '642', cliente: 'Mpr Participações Ltda', vendas: 194, valorM2: 9637.000, area: 49.675, data: '2024-07-29' },
                { projeto: 'Sion', unidade: '1204', titulo: '642', cliente: 'Mpr Participações Ltda', vendas: 198, valorM2: 9637.000, area: 49.118, data: '2024-07-29' },
                { projeto: 'Sion', unidade: '802', titulo: '642', cliente: 'Mpr Participações Ltda', vendas: 235, valorM2: 9637.000, area: 40.965, data: '2024-07-29' },
                { projeto: 'Plural', unidade: '1704', titulo: '664', cliente: 'Efeg Engenharia De Fundações E...', vendas: 49, valorM2: 1839.704, area: 37.599, data: '2024-08-27' },
                { projeto: 'Plural', unidade: '1804', titulo: '664', cliente: 'Efeg Engenharia De Fundações E...', vendas: 49, valorM2: 1839.704, area: 37.599, data: '2024-08-27' },
                { projeto: 'Plural', unidade: '2004', titulo: '664', cliente: 'Efeg Engenharia De Fundações E...', vendas: 49, valorM2: 1839.704, area: 37.599, data: '2024-08-27' },
                { projeto: 'Futura', unidade: '1002', titulo: '627', cliente: 'Sinata Participações Ltda', vendas: 45, valorM2: 1538.810, area: 34.402, data: '2024-06-30' },
                { projeto: 'Futura', unidade: '1015', titulo: '627', cliente: 'Sinata Participações Ltda', vendas: 45, valorM2: 1538.810, area: 34.188, data: '2024-06-30' }
            ],
            opcoesFiltros: {
                empreendimentos: ['Sion', 'Orgânica', 'Era', 'Sunhaus', 'Futura', 'Plural'],
                tipos: ['Buettner', 'Era', 'Futura', 'Orgânica', 'Participações', 'Plural'],
                unidades: ['1203', '801', '1204', '802', '1704', '1804', '2004', '1002', '1015']
            }
        };
    }

    configurarEventos() {
        // Eventos dos filtros
        document.getElementById('aplicarFiltros').addEventListener('click', () => {
            this.aplicarFiltros();
        });

        document.getElementById('limparFiltros').addEventListener('click', () => {
            this.limparFiltros();
        });

        // Eventos de exportação
        document.getElementById('exportarPDF').addEventListener('click', () => {
            this.exportarPDF();
        });

        document.getElementById('exportarExcel').addEventListener('click', () => {
            this.exportarExcel();
        });

        // Eventos de mudança nos filtros
        ['filtroEmpreendimento', 'filtroUnidade', 'filtroTitulo', 'periodoInicio', 'periodoFim'].forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('change', () => {
                    this.atualizarVisualizacao();
                });
            }
        });
    }

    renderizarDashboard() {
        this.atualizarCards();
        this.carregarOpçoesFiltros();
        this.criarGraficos();
        this.atualizarTabela();
    }

    atualizarCards() {
        const { resumo } = this.dados;
        
        document.getElementById('totalVendas').textContent = `${resumo.totalVendas} Mi`;
        document.getElementById('totalArea').textContent = `${resumo.totalArea.toLocaleString()} m²`;
        document.getElementById('valorMedioM2').textContent = `R$ ${resumo.valorMedioM2.toLocaleString()}`;
        document.getElementById('totalEmpreendimentos').textContent = resumo.quantidadeEmpreendimentos;
    }

    carregarOpçoesFiltros() {
        const { opcoesFiltros } = this.dados;
        
        // Carregar opções de empreendimento
        const selectEmpreendimento = document.getElementById('filtroEmpreendimento');
        opcoesFiltros.empreendimentos.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp;
            option.textContent = emp;
            selectEmpreendimento.appendChild(option);
        });

        // Carregar opções de unidade
        const selectUnidade = document.getElementById('filtroUnidade');
        opcoesFiltros.unidades.forEach(unidade => {
            const option = document.createElement('option');
            option.value = unidade;
            option.textContent = unidade;
            selectUnidade.appendChild(option);
        });

        // Carregar opções de título (baseado nos dados da tabela)
        const selectTitulo = document.getElementById('filtroTitulo');
        const titulos = [...new Set(this.dados.tabelaPrincipal.map(item => item.titulo))];
        titulos.forEach(titulo => {
            const option = document.createElement('option');
            option.value = titulo;
            option.textContent = titulo;
            selectTitulo.appendChild(option);
        });
    }

    criarGraficos() {
        this.criarGraficoVariacao();
        this.criarGraficoVendasPeriodo();
    }

    criarGraficoVariacao() {
        const ctx = document.getElementById('graficoVariacao').getContext('2d');
        const dadosVariacao = this.dados.variacaoPorEmpreendimento;

        // Configurar cores baseadas no tipo de variação
        const cores = dadosVariacao.map(item => {
            switch (item.tipo) {
                case 'positiva': return '#10B981'; // Verde
                case 'negativa': return '#EF4444'; // Vermelho
                default: return '#6B7280'; // Cinza
            }
        });

        this.graficos.variacao = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dadosVariacao.map(item => item.nome),
                datasets: [{
                    label: 'Variação %',
                    data: dadosVariacao.map(item => item.variacao),
                    backgroundColor: cores,
                    borderColor: cores,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const item = dadosVariacao[context.dataIndex];
                                return [
                                    `Variação: ${item.variacao}%`,
                                    `Valor: ${item.valor} Mi`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const empreendimento = dadosVariacao[index].nome;
                        this.filtrarPorEmpreendimento(empreendimento);
                    }
                }
            }
        });
    }

    criarGraficoVendasPeriodo() {
        const ctx = document.getElementById('graficoVendasPeriodo').getContext('2d');
        const dadosVendas = this.dados.vendasPorPeriodo;

        // Definir cores para diferentes tipos de empreendimento
        const coresPorTipo = {
            'Era': '#3B82F6',
            'Futura': '#F59E0B',
            'Orgânica': '#10B981',
            'Sion': '#8B5CF6',
            'Sunhaus': '#EF4444',
            'Sunstar': '#F97316',
            'Plural': '#06B6D4'
        };

        this.graficos.vendasPeriodo = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dadosVendas.map(item => {
                    const [ano, mes] = item.periodo.split('-');
                    return `${mes}/${ano}`;
                }),
                datasets: [{
                    label: 'Vendas (Mi)',
                    data: dadosVendas.map(item => item.vendas),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Área (m²)',
                    data: dadosVendas.map(item => item.area),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const item = dadosVendas[context.dataIndex];
                                if (context.datasetIndex === 0) {
                                    return `Vendas: ${item.vendas} Mi`;
                                } else {
                                    return `Área: ${item.area.toLocaleString()} m²`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Período'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Vendas (Mi)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Área (m²)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    atualizarTabela() {
        const tbody = document.getElementById('tabelaVendasBody');
        tbody.innerHTML = '';

        this.dados.tabelaPrincipal.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 cursor-pointer';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.projeto}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.unidade}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.titulo}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.cliente}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.vendas} Mi</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ ${item.valorM2.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(item.data).toLocaleDateString('pt-BR')}</td>
            `;

            // Adicionar evento de clique na linha
            row.addEventListener('click', () => {
                this.mostrarDetalhesItem(item);
            });

            tbody.appendChild(row);
        });
    }

    aplicarFiltros() {
        const filtros = {
            empreendimento: document.getElementById('filtroEmpreendimento').value,
            unidade: document.getElementById('filtroUnidade').value,
            titulo: document.getElementById('filtroTitulo').value,
            periodoInicio: document.getElementById('periodoInicio').value,
            periodoFim: document.getElementById('periodoFim').value
        };

        this.filtrosAtivos = filtros;
        this.atualizarVisualizacao();
    }

    limparFiltros() {
        document.getElementById('filtroEmpreendimento').value = '';
        document.getElementById('filtroUnidade').value = '';
        document.getElementById('filtroTitulo').value = '';
        document.getElementById('periodoInicio').value = '';
        document.getElementById('periodoFim').value = '';
        
        this.filtrosAtivos = {};
        this.atualizarVisualizacao();
    }

    atualizarVisualizacao() {
        // Aqui você filtraria os dados baseado nos filtros ativos
        // Por agora, apenas atualiza com os dados originais
        this.atualizarCards();
        this.atualizarTabela();
        
        // Recriar gráficos com dados filtrados
        if (this.graficos.variacao) {
            this.graficos.variacao.destroy();
        }
        if (this.graficos.vendasPeriodo) {
            this.graficos.vendasPeriodo.destroy();
        }
        this.criarGraficos();
    }

    filtrarPorEmpreendimento(empreendimento) {
        document.getElementById('filtroEmpreendimento').value = empreendimento;
        this.aplicarFiltros();
    }

    mostrarDetalhesItem(item) {
        // Implementar modal ou sidebar com detalhes do item
        alert(`Detalhes do ${item.projeto}\nUnidade: ${item.unidade}\nVendas: ${item.vendas} Mi\nValor m²: R$ ${item.valorM2.toLocaleString()}`);
    }

    exportarPDF() {
        // Implementar exportação para PDF
        alert('Funcionalidade de exportação PDF será implementada');
    }

    exportarExcel() {
        // Implementar exportação para Excel
        alert('Funcionalidade de exportação Excel será implementada');
    }

    mostrarErro(mensagem) {
        // Implementar sistema de notificações
        console.error(mensagem);
        alert(mensagem);
    }

    mostrarSucesso(mensagem) {
        // Implementar sistema de notificações
        console.log(mensagem);
        alert(mensagem);
    }
}

// Inicializar dashboard quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new VendasDashboard();
});
