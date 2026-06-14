import { getAll, getById, create, update, remove } from '../services/firestore.js';
import { formatCurrency, showToast, confirmAction } from '../utils/helpers.js';

export async function renderServicos() {
    const container = document.getElementById('main-content');

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Serviços</h1>
            <p class="page-subtitle">Gerenciar serviços disponíveis</p>
        </div>

        <div class="actions-bar">
            <div class="search-box">
                <span class="material-icons">search</span>
                <input type="text" class="search-input" id="search-servicos" placeholder="Buscar serviços...">
            </div>
            <button class="btn btn-primary" id="btn-novo-servico">
                <span class="material-icons">add</span>
                Novo Serviço
            </button>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-container">
                    <table class="table" id="table-servicos">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Descrição</th>
                                <th>Valor</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-servicos">
                            <tr>
                                <td colspan="4" class="empty-state">
                                    <span class="material-icons empty-icon">content_cut</span>
                                    <p class="empty-text">Carregando serviços...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="modal-overlay" id="modal-servico">
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title" id="modal-servico-title">Novo Serviço</h2>
                    <button class="modal-close" id="modal-servico-close">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="form-servico">
                        <input type="hidden" id="servico-id">
                        <div class="form-group">
                            <label class="form-label" for="servico-nome">Nome do serviço</label>
                            <input type="text" class="form-input" id="servico-nome" placeholder="Nome do serviço" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="servico-descricao">Descrição</label>
                            <textarea class="form-textarea" id="servico-descricao" placeholder="Descreva o serviço" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="servico-valor">Valor</label>
                            <input type="number" class="form-input" id="servico-valor" step="0.01" min="0" placeholder="0,00" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="btn-cancel-servico">Cancelar</button>
                    <button class="btn btn-primary" id="btn-save-servico">Salvar</button>
                </div>
            </div>
        </div>
    `;

    let servicos = [];

    async function loadServicos() {
        try {
            servicos = await getAll('servicos');
            renderTable(servicos);
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            showToast(`Erro ao carregar serviços: ${error.message}`, 'error');
        }
    }

    function renderTable(data) {
        const tbody = document.getElementById('tbody-servicos');
        if (!tbody) return;

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        <span class="material-icons empty-icon">content_cut</span>
                        <p class="empty-text">Nenhum serviço encontrado</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.map(servico => `
            <tr>
                <td>${servico.nome || ''}</td>
                <td>${servico.descricao || ''}</td>
                <td>${formatCurrency(servico.valor)}</td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-outline" onclick="window._editServico('${servico.id}')">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window._deleteServico('${servico.id}')">
                        <span class="material-icons">delete</span>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    function openModal(title = 'Novo Serviço') {
        document.getElementById('modal-servico-title').textContent = title;
        document.getElementById('modal-servico').classList.add('active');
    }

    function closeModal() {
        document.getElementById('modal-servico').classList.remove('active');
        document.getElementById('form-servico').reset();
        document.getElementById('servico-id').value = '';
    }

    // Prevent native form submission
    const form = document.getElementById('form-servico');
    if (form) {
        form.addEventListener('submit', (e) => e.preventDefault());
    }

    // New service
    document.getElementById('btn-novo-servico').addEventListener('click', () => {
        closeModal();
        openModal('Novo Serviço');
    });

    // Close modal
    document.getElementById('modal-servico-close').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-servico').addEventListener('click', closeModal);
    document.getElementById('modal-servico').addEventListener('click', (e) => {
        if (e.target.id === 'modal-servico') closeModal();
    });

    // Save service
    document.getElementById('btn-save-servico').addEventListener('click', async () => {
        const id = document.getElementById('servico-id').value;
        const nome = document.getElementById('servico-nome').value.trim();
        const descricao = document.getElementById('servico-descricao').value.trim();
        const valor = parseFloat(document.getElementById('servico-valor').value) || 0;

        if (!nome) {
            showToast('Preencha o nome do serviço', 'error');
            return;
        }

        if (valor <= 0) {
            showToast('Informe um valor válido', 'error');
            return;
        }

        const data = { nome, descricao, valor, createdAt: new Date().toISOString() };

        try {
            closeModal();
            if (id) {
                await update('servicos', id, data);
                showToast('Serviço atualizado com sucesso!', 'success');
                const index = servicos.findIndex(s => s.id === id);
                if (index !== -1) {
                    servicos[index] = { id, ...data };
                }
            } else {
                const newId = await create('servicos', data);
                showToast('Serviço criado com sucesso!', 'success');
                servicos.unshift({ id: newId, ...data });
            }
            renderTable(servicos);
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            showToast(`Erro ao salvar serviço: ${error.message}`, 'error');
            await loadServicos();
        }
    });

    // Edit service
    window._editServico = async (id) => {
        try {
            const servico = await getById('servicos', id);
            if (!servico) {
                showToast('Serviço não encontrado', 'error');
                return;
            }
            document.getElementById('servico-id').value = id;
            document.getElementById('servico-nome').value = servico.nome || '';
            document.getElementById('servico-descricao').value = servico.descricao || '';
            document.getElementById('servico-valor').value = servico.valor || '';
            openModal('Editar Serviço');
        } catch (error) {
            console.error('Erro ao carregar serviço:', error);
            showToast(`Erro ao carregar serviço: ${error.message}`, 'error');
        }
    };

    // Delete service
    window._deleteServico = async (id) => {
        const confirmed = await confirmAction('Tem certeza que deseja excluir este serviço?');
        if (!confirmed) return;

        try {
            await remove('servicos', id);
            showToast('Serviço excluído com sucesso!', 'success');
            servicos = servicos.filter(s => s.id !== id);
            renderTable(servicos);
        } catch (error) {
            console.error('Erro ao excluir serviço:', error);
            showToast(`Erro ao excluir serviço: ${error.message}`, 'error');
        }
    };

    // Search
    document.getElementById('search-servicos').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = servicos.filter(s =>
            (s.nome || '').toLowerCase().includes(term) ||
            (s.descricao || '').toLowerCase().includes(term)
        );
        renderTable(filtered);
    });

    await loadServicos();
}
