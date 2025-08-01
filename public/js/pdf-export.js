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
    console.log('🔍 Iniciando exportação PDF com logo');
    
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
            console.log('✅ Logo adicionada com sucesso ao PDF');
            
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
    const scenarioTMA = document.getElementById('scenarioTMA').textContent || '0%';
    
    // Informações do cenário
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações do Cenário', margin, yPosition);
    yPosition += 8;
    
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
    
    // Indicadores financeiros
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Indicadores Financeiros Principais', margin, yPosition);
    yPosition += 8;
    
    const indicadores = [
        ['Desconto Nominal %', document.getElementById('descontoNominalPercent').textContent, '(Valor Proposta/Valor Imóvel)-1'],
        ['Desconto Nominal R$', document.getElementById('descontoNominalReais').textContent, 'Valor Imóvel - Valor Proposta'],
        ['VPL Tabela', document.getElementById('vplTabela').textContent, 'VPL(TMA_mês;Fluxo_mês1:mês250)'],
        ['VPL Proposta', document.getElementById('vplProposta').textContent, 'VPL(TMA_mês;Proposta_mês1:mês250)'],
        ['Delta VPL', document.getElementById('deltaVPL').textContent, 'VPL Proposta - VPL Tabela'],
        ['% Delta VPL', document.getElementById('percentDeltaVPL').textContent, 'SEERRO(Delta_VPL/VPL_Tabela;0)']
    ];
    
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
    const tmaMensal = document.getElementById('tmaMensal').textContent || '0%';
    
    const resumoFinanceiro = [
        ['Valor Total Imóvel', valorTotalImovel],
        ['Valor Total Proposta', valorTotalProposta],
        ['TMA Mensal', tmaMensal]
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
    
    // Segunda página - Fluxo de caixa
    doc.addPage();
    yPosition = margin;
    
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
    
    // Rodapé
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
    
    console.log('✅ PDF exportado com sucesso:', fileName);
    console.log(`📊 Total de linhas exportadas: ${fluxoData.length} (período: ${periodoSelecionado} meses)`);
    
    if (window.showAlert) {
        showAlert('success', `PDF "${fileName}" exportado com sucesso! (${fluxoData.length} meses de dados)`);
    } else {
        alert(`PDF "${fileName}" exportado com sucesso! (${fluxoData.length} meses de dados)`);
    }
}

// Substituir a função original pela nova
window.exportToPDF = exportToPDFWithLogo;
