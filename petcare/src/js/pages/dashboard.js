import { getAll } from '../services/firestore.js';
import { formatCurrency, formatDate, showToast } from '../utils/helpers.js';

let chartAtendimentosMes = null;
let chartFaturamentoMes = null;
let chartServicos = null;

const mesesPT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getMonthKey(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key) {
    const [year, month] = key.split('-');
    return `${mesesPT[parseInt(month) - 1]}/${year.slice(2)}`;
}

function getLast6Months() {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months;
}

function destroyCharts() {
    if (chartAtendimentosMes) { chartAtendimentosMes.destroy(); chartAtendimentosMes = null; }
    if (chartFaturamentoMes) { chartFaturamentoMes.destroy(); chartFaturamentoMes = null; }
    if (chartServicos) { chartServicos.destroy(); chartServicos = null; }
}

const chartColors = [
    '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4',
    '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b'
];

export async function renderDashboard() {
    destroyCharts();

    const content = document.getElementById('main-content');
    content.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Dashboard</h1>
            <p class="page-subtitle">Visão geral do seu negócio</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card blue">
                <div class="stat-icon"><span class="material-icons">people</span></div>
                <div class="stat-info">
                    <span class="stat-value" id="stat-clientes">0</span>
                    <span class="stat-label">Clientes</span>
                </div>
            </div>
            <div class="stat-card green">
                <div class="stat-icon"><span class="material-icons">pets</span></div>
                <div class="stat-info">
                    <span class="stat-value" id="stat-pets">0</span>
                    <span class="stat-label">Pets</span>
                </div>
            </div>
            <div class="stat-card purple">
                <div class="stat-icon"><span class="material-icons">assignment</span></div>
                <div class="stat-info">
                    <span class="stat-value" id="stat-atendimentos">0</span>
                    <span class="stat-label">Atendimentos</span>
                </div>
            </div>
            <div class="stat-card orange">
                <div class="stat-icon"><span class="material-icons">attach_money</span></div>
                <div class="stat-info">
                    <span class="stat-value" id="stat-faturamento">R$ 0,00</span>
                    <span class="stat-label">Faturamento Total</span>
                </div>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-card">
                <div class="chart-header"><h3 class="chart-title">Atendimentos por Mês</h3></div>
                <div class="chart-body" style="height: 280px;"><canvas id="chart-atendimentos-mes"></canvas></div>
            </div>
            <div class="chart-card">
                <div class="chart-header"><h3 class="chart-title">Faturamento por Mês</h3></div>
                <div class="chart-body" style="height: 280px;"><canvas id="chart-faturamento-mes"></canvas></div>
            </div>
            <div class="chart-card">
                <div class="chart-header"><h3 class="chart-title">Serviços Mais Realizados</h3></div>
                <div class="chart-body" style="height: 280px;"><canvas id="chart-servicos"></canvas></div>
            </div>
        </div>

        <div class="card" style="margin-top: 1.5rem;">
            <div class="card-header">
                <h3 class="card-title">Atividade Recente</h3>
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
                        <tbody id="recent-activity-body">
                            <tr><td colspan="5" style="text-align:center;">Carregando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    try {
        const [clientes, pets, atendimentos, servicos] = await Promise.all([
            getAll('clientes'),
            getAll('pets'),
            getAll('atendimentos'),
            getAll('servicos')
        ]);

        // Stats
        const faturamento = atendimentos.reduce((sum, a) => sum + (parseFloat(a.valor) || 0), 0);
        const elClientes = document.getElementById('stat-clientes');
        const elPets = document.getElementById('stat-pets');
        const elAtendimentos = document.getElementById('stat-atendimentos');
        const elFaturamento = document.getElementById('stat-faturamento');

        if (elClientes) elClientes.textContent = clientes.length;
        if (elPets) elPets.textContent = pets.length;
        if (elAtendimentos) elAtendimentos.textContent = atendimentos.length;
        if (elFaturamento) elFaturamento.textContent = formatCurrency(faturamento);

        // Lookup maps
        const clientesMap = {};
        clientes.forEach(c => { clientesMap[c.id] = c.nome; });
        const petsMap = {};
        pets.forEach(p => { petsMap[p.id] = p.nome; });
        const servicosMap = {};
        servicos.forEach(s => { servicosMap[s.id] = s.nome; });

        // Charts data preparation
        const last6 = getLast6Months();
        const atendimentosPorMes = {};
        const faturamentoPorMes = {};
        const servicoCount = {};

        last6.forEach(m => { atendimentosPorMes[m] = 0; faturamentoPorMes[m] = 0; });

        atendimentos.forEach(a => {
            const key = getMonthKey(a.data);
            if (atendimentosPorMes[key] !== undefined) {
                atendimentosPorMes[key]++;
                faturamentoPorMes[key] += parseFloat(a.valor) || 0;
            }
            const sid = a.servicoId;
            servicoCount[sid] = (servicoCount[sid] || 0) + 1;
        });

        const labels6 = last6.map(getMonthLabel);

        // Chart defaults
        const fontFamily = "'Poppins', sans-serif";

        // Bar chart - Atendimentos por Mês
        const ctxBar = document.getElementById('chart-atendimentos-mes');
        if (ctxBar) {
            chartAtendimentosMes = new Chart(ctxBar.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels6,
                    datasets: [{
                        label: 'Atendimentos',
                        data: last6.map(m => atendimentosPorMes[m]),
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderColor: '#6366f1',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            ticks: { font: { family: fontFamily } },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                font: { family: fontFamily },
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }

        // Line chart - Faturamento por Mês
        const ctxLine = document.getElementById('chart-faturamento-mes');
        if (ctxLine) {
            chartFaturamentoMes = new Chart(ctxLine.getContext('2d'), {
                type: 'line',
                data: {
                    labels: labels6,
                    datasets: [{
                        label: 'Faturamento',
                        data: last6.map(m => faturamentoPorMes[m]),
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#22c55e',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            ticks: { font: { family: fontFamily } },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                font: { family: fontFamily },
                                callback: (val) => 'R$ ' + val.toLocaleString('pt-BR')
                            }
                        }
                    }
                }
            });
        }

        // Doughnut chart - Serviços Mais Realizados
        const servicoIds = Object.keys(servicoCount).sort((a, b) => servicoCount[b] - servicoCount[a]);
        const servicoLabels = servicoIds.map(id => servicosMap[id] || 'Desconhecido');
        const servicoData = servicoIds.map(id => servicoCount[id]);

        const ctxDoughnut = document.getElementById('chart-servicos');
        if (ctxDoughnut) {
            chartServicos = new Chart(ctxDoughnut.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: servicoLabels,
                    datasets: [{
                        data: servicoData,
                        backgroundColor: chartColors.slice(0, servicoLabels.length),
                        borderWidth: 0,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: { family: fontFamily, size: 12 },
                                padding: 16,
                                usePointStyle: true,
                                pointStyleWidth: 10
                            }
                        }
                    }
                }
            });
        }

        // Recent activity table
        const tbody = document.getElementById('recent-activity-body');
        const sorted = [...atendimentos].sort((a, b) => {
            const da = new Date(a.data || a.createdAt);
            const db = new Date(b.data || b.createdAt);
            return db - da;
        });
        const recent = sorted.slice(0, 5);
 
        if (tbody) {
            if (recent.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5">
                            <div class="empty-state">
                                <div class="empty-icon"><span class="material-icons">event_note</span></div>
                                <p class="empty-text">Nenhum atendimento registrado</p>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = recent.map(a => `
                    <tr>
                        <td>${formatDate(a.data)}</td>
                        <td>${clientesMap[a.clienteId] || '—'}</td>
                        <td>${petsMap[a.petId] || '—'}</td>
                        <td>${servicosMap[a.servicoId] || '—'}</td>
                        <td>${formatCurrency(parseFloat(a.valor) || 0)}</td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showToast(`Erro ao carregar dashboard: ${error.message}`, 'error');
    }
}
