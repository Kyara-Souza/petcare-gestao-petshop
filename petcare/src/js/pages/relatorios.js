import { getAll } from '../services/firestore.js';
import { formatCurrency, formatDate, showToast } from '../utils/helpers.js';

export async function renderRelatorios() {
    const container = document.getElementById('main-content');

    // Default dates: first day of current month to today
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDefault = firstDay.toISOString().split('T')[0];
    const endDefault = today.toISOString().split('T')[0];

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Relatórios</h1>
            <p class="page-subtitle">Análise e exportação de dados</p>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="report-filters">
                    <div class="form-group">
                        <label class="form-label" for="report-start">Data Início</label>
                        <input type="date" class="form-input" id="report-start" value="${startDefault}">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="report-end">Data Fim</label>
                        <input type="date" class="form-input" id="report-end" value="${endDefault}">
                    </div>
                    <button class="btn btn-primary" id="btn-filtrar">
                        <span class="material-icons">filter_list</span>
                        Filtrar
                    </button>
                    <button class="btn btn-success" id="btn-export-pdf">
                        <span class="material-icons">picture_as_pdf</span>
                        Exportar PDF
                    </button>
                </div>
            </div>
        </div>

        <div class="stats-grid" id="report-stats">
            <div class="stat-card blue">
                <div class="stat-icon">
                    <span class="material-icons">people</span>
                </div>
                <div class="stat-info">
                    <span class="stat-value" id="stat-clientes">0</span>
                    <span class="stat-label">Total Clientes</span>
                </div>
            </div>
            <div class="stat-card green">
                <div class="stat-icon">
                    <span class="material-icons">pets</span>
                </div>
                <div class="stat-info">
                    <span class="stat-value" id="stat-pets">0</span>
                    <span class="stat-label">Total Pets</span>
                </div>
            </div>
            <div class="stat-card purple">
                <div class="stat-icon">
                    <span class="material-icons">assignment</span>
                </div>
                <div class="stat-info">
                    <span class="stat-value" id="stat-atendimentos">0</span>
                    <span class="stat-label">Total Atendimentos</span>
                </div>
            </div>
            <div class="stat-card orange">
                <div class="stat-icon">
                    <span class="material-icons">attach_money</span>
                </div>
                <div class="stat-info">
                    <span class="stat-value" id="stat-faturamento">R$ 0,00</span>
                    <span class="stat-label">Faturamento Total</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Resumo por Serviço</h3>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Serviço</th>
                                <th>Quantidade</th>
                                <th>Faturamento</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-resumo-servicos">
                            <tr>
                                <td colspan="3" class="empty-state">
                                    <p class="empty-text">Carregando...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Atendimentos Detalhados</h3>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Pet</th>
                                <th>Serviço</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-detalhes">
                            <tr>
                                <td colspan="5" class="empty-state">
                                    <p class="empty-text">Carregando...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    let clientes = [];
    let pets = [];
    let servicos = [];
    let atendimentos = [];
    let filteredAtendimentos = [];

    // Build lookup maps
    function buildMaps() {
        const clienteMap = {};
        const petMap = {};
        const servicoMap = {};
        clientes.forEach(c => clienteMap[c.id] = c);
        pets.forEach(p => petMap[p.id] = p);
        servicos.forEach(s => servicoMap[s.id] = s);
        return { clienteMap, petMap, servicoMap };
    }

    function filterByDate() {
        const startDate = document.getElementById('report-start').value;
        const endDate = document.getElementById('report-end').value;

        filteredAtendimentos = atendimentos.filter(a => {
            const data = a.data || '';
            return data >= startDate && data <= endDate;
        });

        updateStats();
        renderServiceSummary();
        renderDetailTable();
    }

    function updateStats() {
        const totalFaturamento = filteredAtendimentos.reduce((sum, a) => sum + (parseFloat(a.valor) || 0), 0);

        const elClientes = document.getElementById('stat-clientes');
        const elPets = document.getElementById('stat-pets');
        const elAtendimentos = document.getElementById('stat-atendimentos');
        const elFaturamento = document.getElementById('stat-faturamento');

        if (elClientes) elClientes.textContent = clientes.length;
        if (elPets) elPets.textContent = pets.length;
        if (elAtendimentos) elAtendimentos.textContent = filteredAtendimentos.length;
        if (elFaturamento) elFaturamento.textContent = formatCurrency(totalFaturamento);
    }

    function renderServiceSummary() {
        const tbody = document.getElementById('tbody-resumo-servicos');
        if (!tbody) return;
        const { servicoMap } = buildMaps();

        // Aggregate by service
        const summary = {};
        filteredAtendimentos.forEach(a => {
            const sid = a.servicoId;
            if (!summary[sid]) {
                summary[sid] = { nome: servicoMap[sid]?.nome || 'N/A', count: 0, total: 0 };
            }
            summary[sid].count++;
            summary[sid].total += parseFloat(a.valor) || 0;
        });

        const rows = Object.values(summary);

        if (rows.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="empty-state">
                        <p class="empty-text">Nenhum dado para o período selecionado</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = rows.map(row => `
            <tr>
                <td>${row.nome}</td>
                <td>${row.count}</td>
                <td>${formatCurrency(row.total)}</td>
            </tr>
        `).join('');
    }

    function renderDetailTable() {
        const tbody = document.getElementById('tbody-detalhes');
        if (!tbody) return;
        const { clienteMap, petMap, servicoMap } = buildMaps();

        if (filteredAtendimentos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <p class="empty-text">Nenhum atendimento no período selecionado</p>
                    </td>
                </tr>
            `;
            return;
        }

        const sorted = [...filteredAtendimentos].sort((a, b) => {
            const da = a.data || '';
            const db = b.data || '';
            return db.localeCompare(da);
        });

        tbody.innerHTML = sorted.map(atend => `
            <tr>
                <td>${formatDate(atend.data)}</td>
                <td>${clienteMap[atend.clienteId]?.nome || 'N/A'}</td>
                <td>${petMap[atend.petId]?.nome || 'N/A'}</td>
                <td>${servicoMap[atend.servicoId]?.nome || 'N/A'}</td>
                <td>${formatCurrency(atend.valor)}</td>
            </tr>
        `).join('');
    }

    function exportPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const startDate = document.getElementById('report-start').value;
            const endDate = document.getElementById('report-end').value;
            const { clienteMap, petMap, servicoMap } = buildMaps();

            // Title
            doc.setFontSize(18);
            doc.text('PetCare - Relatório', 14, 22);
            doc.setFontSize(11);
            doc.text(`Período: ${startDate} a ${endDate}`, 14, 32);

            // Summary stats
            const totalFaturamento = filteredAtendimentos.reduce((sum, a) => sum + (parseFloat(a.valor) || 0), 0);
            doc.text(`Total de Atendimentos: ${filteredAtendimentos.length}`, 14, 40);
            doc.text(`Faturamento Total: ${formatCurrency(totalFaturamento)}`, 14, 46);

            // Service summary table
            const summary = {};
            filteredAtendimentos.forEach(a => {
                const sid = a.servicoId;
                if (!summary[sid]) {
                    summary[sid] = { nome: servicoMap[sid]?.nome || 'N/A', count: 0, total: 0 };
                }
                summary[sid].count++;
                summary[sid].total += parseFloat(a.valor) || 0;
            });

            const serviceSummaryData = Object.values(summary).map(row => [
                row.nome,
                row.count.toString(),
                formatCurrency(row.total)
            ]);

            doc.autoTable({
                head: [['Serviço', 'Quantidade', 'Faturamento']],
                body: serviceSummaryData,
                startY: 55,
                theme: 'grid',
                styles: { font: 'helvetica', fontSize: 10 },
                headStyles: { fillColor: [59, 130, 246] }
            });

            // Detailed table
            const sorted = [...filteredAtendimentos].sort((a, b) => {
                const da = a.data || '';
                const db = b.data || '';
                return db.localeCompare(da);
            });

            const detailData = sorted.map(atend => [
                formatDate(atend.data),
                clienteMap[atend.clienteId]?.nome || 'N/A',
                petMap[atend.petId]?.nome || 'N/A',
                servicoMap[atend.servicoId]?.nome || 'N/A',
                formatCurrency(atend.valor)
            ]);

            doc.autoTable({
                head: [['Data', 'Cliente', 'Pet', 'Serviço', 'Valor']],
                body: detailData,
                startY: doc.lastAutoTable.finalY + 15,
                theme: 'grid',
                styles: { font: 'helvetica', fontSize: 10 },
                headStyles: { fillColor: [59, 130, 246] }
            });

            doc.save('petcare-relatorio.pdf');
            showToast('Relatório exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            showToast('Erro ao exportar PDF. Verifique se a biblioteca jsPDF está carregada.', 'error');
        }
    }

    // Event listeners
    document.getElementById('btn-filtrar').addEventListener('click', filterByDate);
    document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);

    // Load all data
    try {
        [clientes, pets, servicos, atendimentos] = await Promise.all([
            getAll('clientes'),
            getAll('pets'),
            getAll('servicos'),
            getAll('atendimentos')
        ]);
        filterByDate();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast(`Erro ao carregar dados do relatório: ${error.message}`, 'error');
    }
}
