// Função auxiliar para converter imagem para base64
function getImageAsBase64(imagePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);
            
            try {
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = function() {
            reject(new Error('Falha ao carregar imagem'));
        };
        
        img.src = imagePath;
    });
}

// Função melhorada para exportar PDF com logo
async function exportToPDFWithLogo() {
    
    
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
        
        // Cabeçalho com fundo (reduzido)
        doc.setFillColor(20, 184, 166); // Cor teal
        doc.rect(0, 0, pageWidth, 20, 'F'); // Reduzido de 30 para 20
        
        // Tentar carregar e adicionar a logo
        try {
            const logoBase64 = await getImageAsBase64('images/Logo-ModelAI-positiva.png');
            
            const logoWidth = 45; // Ajustado para o header menor
            const logoHeight = 12; // Proporcional ao header menor
            const logoX = (pageWidth - logoWidth) / 2;
            const logoY = 4; // Centralizado no header de 20mm
            
            doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
            
            
        } catch (error) {
            console.warn('⚠️ Não foi possível carregar a logo, usando texto:', error);
            
            // Fallback: usar texto centralizado
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16); // Reduzido de 24 para 16
            doc.setFont('helvetica', 'bold');
            const text = 'ModelAI';
            const textWidth = doc.getTextWidth(text);
            doc.text(text, (pageWidth - textWidth) / 2, 14); // Ajustado para header menor
        }
        
        // Continuar com o resto do PDF...
        await continuarGeracaoPDF(doc, pageWidth, margin);
        
    } catch (error) {
        console.error('❌ Erro ao exportar PDF:', error);
        
        if (window.showAlert) {
            showAlert('error', 'Erro ao exportar PDF. Verifique se os dados estão carregados e tente novamente.');
        } else {
            alert('Erro ao exportar PDF. Verifique se os dados estão carregados e tente novamente.');
        }
    }
}

// Função para continuar a geração do PDF após o cabeçalho
async function continuarGeracaoPDF(doc, pageWidth, margin) {
    let yPosition = 30; // Ajustado de 40 para 30 (header menor)
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
    
    // Resto do conteúdo (copiado da função original)
    const scenarioName = document.getElementById('scenarioName').textContent || 'Nome do Cenário';
    const scenarioClient = document.getElementById('scenarioClient').textContent || 'Cliente';
    const scenarioEmpreendimento = document.getElementById('scenarioEmpreendimento').textContent || 'Empreendimento';
    const scenarioUnidade = document.getElementById('scenarioUnidade').textContent || 'Unidade';
    const scenarioArea = document.getElementById('scenarioArea').textContent || '- m²';
    const scenarioTMA = document.getElementById('scenarioTMA').textContent || '0%';
    
    // Informações do cenário
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações do Cenário', margin, yPosition);
    yPosition += 8;
    
    const infoData = [
        ['Nome do Cenário', scenarioName, 'Unidade', scenarioUnidade],
        ['Cliente', scenarioClient, 'Área Privativa', scenarioArea],
        ['Empreendimento', scenarioEmpreendimento, 'TMA Anual', scenarioTMA]
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
            0: { cellWidth: 35, fontStyle: 'bold' },
            1: { cellWidth: 55 },
            2: { cellWidth: 35, fontStyle: 'bold' },
            3: { cellWidth: 45 }
        },
        margin: { left: margin, right: margin }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
    
    // Indicadores financeiros
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Indicadores Financeiros Principais', margin, yPosition);
    yPosition += 8;
    
    const indicadores = [
        ['Desconto Nominal %', document.getElementById('descontoNominalPercent').textContent],
        ['Desconto Nominal R$', document.getElementById('descontoNominalReais').textContent],
        ['VPL Tabela', document.getElementById('vplTabela').textContent],
        ['VPL Proposta', document.getElementById('vplProposta').textContent],
        ['Delta VPL', document.getElementById('deltaVPL').textContent],
        ['% Delta VPL', document.getElementById('percentDeltaVPL').textContent]
    ];
    
    // Função para verificar se um valor é negativo (contém parênteses)
    const isNegativeValue = (value) => {
        return value && value.includes('(') && value.includes(')');
    };
    
    doc.autoTable({
        startY: yPosition,
        head: [['Indicador', 'Valor']],
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
            0: { cellWidth: 60, fontStyle: 'bold' },
            1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: function(data) {
            // Aplicar cor vermelha para valores negativos na coluna de valores (índice 1)
            if (data.column.index === 1 && data.section === 'body') {
                const cellValue = data.cell.text[0];
                if (isNegativeValue(cellValue)) {
                    data.cell.styles.textColor = [220, 38, 38]; // Vermelho (equivalente ao #dc2626)
                    data.cell.styles.fontStyle = 'bold';
                }
            }
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
    const valorPorMetroQuadrado = document.getElementById('valorPorMetroQuadrado').textContent || 'R$ 0,00';
    const valorPorMetroQuadradoProposta = document.getElementById('valorPorMetroQuadradoProposta').textContent || 'R$ 0,00';
    
    const resumoFinanceiro = [
        ['Valor Total Imóvel', valorTotalImovel],
        ['Valor Total Proposta', valorTotalProposta],
        ['Desconto Nominal', descontoNominalResumo],
        ['R$/m² Tabela', valorPorMetroQuadrado],
        ['R$/m² Proposta', valorPorMetroQuadradoProposta]
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
        didParseCell: function(data) {
            // Aplicar cor laranja para o "Valor Total Proposta" (linha índice 1)
            if (data.column.index === 1 && data.section === 'body' && data.row.index === 1) {
                data.cell.styles.textColor = [249, 115, 22]; // Laranja (equivalente ao orange-600)
                data.cell.styles.fontStyle = 'bold';
            }
            // Aplicar cor laranja para o "R$/m² Proposta" (linha índice 4)
            else if (data.column.index === 1 && data.section === 'body' && data.row.index === 4) {
                data.cell.styles.textColor = [249, 115, 22]; // Laranja (equivalente ao orange-600)
                data.cell.styles.fontStyle = 'bold';
            }
            // Aplicar cor vermelha para valores negativos na coluna de valores (índice 1)
            else if (data.column.index === 1 && data.section === 'body') {
                const cellValue = data.cell.text[0];
                if (isNegativeValue(cellValue)) {
                    data.cell.styles.textColor = [220, 38, 38]; // Vermelho (equivalente ao #dc2626)
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        margin: { left: margin, right: margin }
    });

    // Segunda página - Fluxo de caixa
    doc.addPage();
    await gerarSegundaPaginaPDF(doc, pageWidth, margin, dataHora, agora);
}

// Função para gerar a segunda página com o fluxo de caixa
async function gerarSegundaPaginaPDF(doc, pageWidth, margin, dataHora, agora) {
    const scenarioName = document.getElementById('scenarioName').textContent || 'Nome do Cenário';
    let yPosition = margin;
    
    // Cabeçalho da segunda página com logo (reduzido)
    doc.setFillColor(20, 184, 166);
    doc.rect(0, 0, pageWidth, 20, 'F'); // Reduzido de 30 para 20
    
    try {
        const logoBase64 = await getImageAsBase64('images/Logo-ModelAI-positiva.png');
        const logoWidth = 45; // Mesmo tamanho da primeira página
        const logoHeight = 12; // Proporcional
        const logoX = (pageWidth - logoWidth) / 2;
        const logoY = 4; // Centralizado no header de 20mm
        doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16); // Reduzido de 16 para combinar
        doc.setFont('helvetica', 'bold');
        const titulo = 'ModelAI';
        const tituloWidth = doc.getTextWidth(titulo);
        doc.text(titulo, (pageWidth - tituloWidth) / 2, 14); // Ajustado para header menor
    }
    
    yPosition = 30; // Ajustado de 40 para 30 (header menor)
    doc.setTextColor(0, 0, 0);
    
    // Título da seção
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Fluxo de Caixa Detalhado', margin, yPosition);
    yPosition += 10;
    
    // Período de análise - CORRIGIDO PARA USAR O FILTRO
    const periodoSelect = document.getElementById('periodoAnalise');
    const periodoSelecionado = periodoSelect ? periodoSelect.value : '12';
    const numPeriodos = parseInt(periodoSelecionado);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período de Análise: ${periodoSelecionado} meses`, margin, yPosition);
    yPosition += 10;
    
    // Coletar dados da tabela RESPEITANDO O FILTRO
    const fluxoTable = document.getElementById('fluxoCaixaDetalhado');
    const fluxoData = [];
    
    if (fluxoTable) {
        const rows = fluxoTable.querySelectorAll('tr');
        const maxRows = Math.min(rows.length, numPeriodos);
        
        console.log(`📊 Exportando ${maxRows} linhas de fluxo de caixa (período selecionado: ${periodoSelecionado})`);
        
        for (let i = 0; i < maxRows; i++) {
            const cells = rows[i].querySelectorAll('td');
            if (cells.length > 0) {
                const rowData = [];
                // Coletar todas as 11 colunas
                for (let j = 0; j < Math.min(cells.length, 11); j++) {
                    rowData.push(cells[j].textContent.trim());
                }
                fluxoData.push(rowData);
            }
        }
    }
    
    if (fluxoData.length > 0) {
        doc.autoTable({
            startY: yPosition,
            head: [['Mês', 'Tabela Inc', 'Entrada', 'Parcelas', 'Reforços', 'Nas Chaves', 'Proposta Cliente', 'Entrada', 'Parcelas', 'Reforços', 'Bens Móveis/Imóveis']],
            body: fluxoData,
            theme: 'striped',
            headStyles: {
                fillColor: [20, 184, 166], // Cor padrão teal sólida
                textColor: 255,
                fontSize: 7,
                fontStyle: 'bold',
                halign: 'center',
                cellPadding: 1
            },
            bodyStyles: {
                fontSize: 6,
                cellPadding: 1,
                overflow: 'linebreak',
                cellWidth: 'wrap'
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            columnStyles: {
                0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' }, // Mês
                1: { cellWidth: 20, halign: 'right', fontSize: 6 }, // Tabela Inc
                2: { cellWidth: 18, halign: 'right', fontSize: 6 }, // Entrada
                3: { cellWidth: 18, halign: 'right', fontSize: 6 }, // Parcelas
                4: { cellWidth: 18, halign: 'right', fontSize: 6 }, // Reforços
                5: { cellWidth: 18, halign: 'right', fontSize: 6 }, // Nas Chaves
                6: { cellWidth: 20, halign: 'right', fontSize: 6, fillColor: [255, 237, 213] }, // Proposta Cliente - laranja claro
                7: { cellWidth: 18, halign: 'right', fontSize: 6, fillColor: [255, 237, 213] }, // Entrada
                8: { cellWidth: 18, halign: 'right', fontSize: 6, fillColor: [255, 237, 213] }, // Parcelas
                9: { cellWidth: 18, halign: 'right', fontSize: 6, fillColor: [255, 237, 213] }, // Reforços
                10: { cellWidth: 20, halign: 'right', fontSize: 6, fillColor: [255, 237, 213] } // Bens Móveis
            },
            // Personalizar cores do cabeçalho por coluna
            didDrawCell: function (data) {
                if (data.section === 'head') {
                    if (data.column.index >= 6) {
                        // Colunas da Proposta Cliente (6-10) com cor laranja sólida
                        doc.setFillColor(249, 115, 22); // Laranja sólido
                        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                        
                        // Reescrever o texto em branco
                        doc.setTextColor(255, 255, 255);
                        doc.setFontSize(7);
                        doc.setFont('helvetica', 'bold');
                        const textX = data.cell.x + data.cell.width / 2;
                        const textY = data.cell.y + data.cell.height / 2 + 1;
                        doc.text(data.cell.text[0], textX, textY, { align: 'center' });
                    } else {
                        // Colunas da Tabela (0-5) com cor teal sólida
                        doc.setFillColor(20, 184, 166); // Teal sólido
                        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                        
                        // Reescrever o texto em branco
                        doc.setTextColor(255, 255, 255);
                        doc.setFontSize(7);
                        doc.setFont('helvetica', 'bold');
                        const textX = data.cell.x + data.cell.width / 2;
                        const textY = data.cell.y + data.cell.height / 2 + 1;
                        doc.text(data.cell.text[0], textX, textY, { align: 'center' });
                    }
                }
                
                // Formatação especial para valores monetários no corpo da tabela
                if (data.section === 'body' && data.column.index > 0) {
                    // Quebrar valores muito longos em múltiplas linhas se necessário
                    const cellText = data.cell.text[0];
                    if (cellText && cellText.length > 12) {
                        doc.setFontSize(5); // Fonte ainda menor para valores grandes
                    }
                }
            },
            margin: { left: 5, right: 5 }, // Margens menores para mais espaço
            pageBreak: 'auto',
            tableWidth: 'auto'
        });
    } else {
        doc.setFontSize(10);
        doc.text('Nenhum dado de fluxo de caixa disponível para exibição.', margin, yPosition);
    }
    
    // Finalizar PDF com rodapés e salvar
    finalizarPDF(doc, pageWidth, margin, dataHora, agora, scenarioName);
}

// Função para finalizar o PDF com rodapés e salvar
function finalizarPDF(doc, pageWidth, margin, dataHora, agora, scenarioName) {
    // Coletar dados da tabela para mostrar no console
    const fluxoTable = document.getElementById('fluxoCaixaDetalhado');
    let fluxoDataLength = 0;
    let periodoSelecionado = '12';
    
    if (fluxoTable) {
        const rows = fluxoTable.querySelectorAll('tr');
        const periodoSelect = document.getElementById('periodoAnalise');
        periodoSelecionado = periodoSelect ? periodoSelect.value : '12';
        const numPeriodos = parseInt(periodoSelecionado);
        fluxoDataLength = Math.min(rows.length, numPeriodos);
    }
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, doc.internal.pageSize.height - 20, pageWidth - margin, doc.internal.pageSize.height - 20);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        
        doc.text('ModelAI - Sistema de Análise Financeira', margin, doc.internal.pageSize.height - 12);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 20, doc.internal.pageSize.height - 12);
        
        const footerText = `Gerado em ${dataHora}`;
        const textWidth = doc.getTextWidth(footerText);
        doc.text(footerText, (pageWidth - textWidth) / 2, doc.internal.pageSize.height - 12);
    }
    
    // Salvar o arquivo
    const fileName = `ModelAI_Analise_${scenarioName.replace(/[^a-zA-Z0-9]/g, '_')}_${agora.toISOString().slice(0,10)}.pdf`;
    doc.save(fileName);
    
    
    console.log(`📊 Total de linhas exportadas: ${fluxoDataLength} (período: ${periodoSelecionado} meses)`);
    
    if (window.showAlert) {
        showAlert('success', `PDF "${fileName}" exportado com sucesso! (${fluxoDataLength} meses de dados)`);
    } else {
        alert(`PDF "${fileName}" exportado com sucesso! (${fluxoDataLength} meses de dados)`);
    }
}

// Substituir a função original pela nova
window.exportToPDF = exportToPDFWithLogo;
