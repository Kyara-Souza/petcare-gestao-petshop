import { getAll, getById, create, update, remove } from '../services/firestore.js';
import { formatCurrency, formatDate, formatDateForInput, showToast, confirmAction } from '../utils/helpers.js';

export async function renderAtendimentos() {
    const container = document.getElementById('main-content');

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Atendimentos</h1>
            <p class="page-subtitle">Registrar e gerenciar atendimentos</p>
        </div>

        <div class="actions-bar">
            <div class="search-box">
                <span class="material-icons">search</span>
                <input type="text" class="search-input" id="search-atendimentos" placeholder="Buscar atendimentos...">
            </div>
            <button class="btn btn-primary" id="btn-novo-atendimento">
                <span class="material-icons">add</span>
                Novo Atendimento
            </button>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-container">
                    <table class="table" id="table-atendimentos">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Pet</th>
                                <th>Serviço</th>
                                <th>Valor</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-atendimentos">
                            <tr>
                                <td colspan="6" class="empty-state">
                                    <span class="material-icons empty-icon">pets</span>
                                    <p class="empty-text">Carregando atendimentos...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="modal-overlay" id="modal-atendimento">
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title" id="modal-atendimento-title">Novo Atendimento</h2>
                    <button class="modal-close" id="modal-atendimento-close">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="form-atendimento">
                        <input type="hidden" id="atend-id">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="atend-clienteId">Cliente</label>
                                <select class="form-select" id="atend-clienteId" required>
                                    <option value="">Selecione o cliente</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="atend-petId">Pet</label>
                                <select class="form-select" id="atend-petId" required>
                                    <option value="">Selecione o pet</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="atend-servicoId">Serviço</label>
                                <select class="form-select" id="atend-servicoId" required>
                                    <option value="">Selecione o serviço</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="atend-data">Data</label>
                                <input type="date" class="form-input" id="atend-data" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="atend-valor">Valor cobrado</label>
                                <input type="number" class="form-input" id="atend-valor" step="0.01" min="0" placeholder="0,00" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="atend-observacoes">Observações</label>
                            <textarea class="form-textarea" id="atend-observacoes" placeholder="Observações sobre o atendimento" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="btn-cancel-atendimento">Cancelar</button>
                    <button class="btn btn-primary" id="btn-save-atendimento">Salvar</button>
                </div>
            </div>
        </div>
    `;

    let atendimentos = [];
    let clientes = [];
    let pets = [];
    let servicos = [];

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

    async function loadAllData() {
        try {
            [atendimentos, clientes, pets, servicos] = await Promise.all([
                getAll('atendimentos'),
                getAll('clientes'),
                getAll('pets'),
                getAll('servicos')
            ]);
            renderTable(atendimentos);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showToast(`Erro ao carregar dados: ${error.message}`, 'error');
        }
    }

    function renderTable(data) {
        const tbody = document.getElementById('tbody-atendimentos');
        if (!tbody) return;
        const { clienteMap, petMap, servicoMap } = buildMaps();

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <span class="material-icons empty-icon">pets</span>
                        <p class="empty-text">Nenhum atendimento encontrado</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Sort by date descending
        const sorted = [...data].sort((a, b) => {
            const da = a.data || a.createdAt || '';
            const db = b.data || b.createdAt || '';
            return db.localeCompare(da);
        });

        tbody.innerHTML = sorted.map(atend => {
            const clienteNome = clienteMap[atend.clienteId]?.nome || 'N/A';
            const petNome = petMap[atend.petId]?.nome || 'N/A';
            const servicoNome = servicoMap[atend.servicoId]?.nome || 'N/A';

            return `
                <tr>
                    <td>${formatDate(atend.data)}</td>
                    <td>${clienteNome}</td>
                    <td>${petNome}</td>
                    <td>${servicoNome}</td>
                    <td>${formatCurrency(atend.valor)}</td>
                    <td class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="window._editAtendimento('${atend.id}')">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window._deleteAtendimento('${atend.id}')">
                            <span class="material-icons">delete</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function populateSelects() {
        const clienteSelect = document.getElementById('atend-clienteId');
        const servicoSelect = document.getElementById('atend-servicoId');

        clienteSelect.innerHTML = '<option value="">Selecione o cliente</option>' +
            clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');

        servicoSelect.innerHTML = '<option value="">Selecione o serviço</option>' +
            servicos.map(s => `<option value="${s.id}">${s.nome} - ${formatCurrency(s.valor)}</option>`).join('');
    }

    function filterPetsByCliente(clienteId) {
        const petSelect = document.getElementById('atend-petId');
        const filteredPets = clienteId
            ? pets.filter(p => p.clienteId === clienteId)
            : [];

        petSelect.innerHTML = '<option value="">Selecione o pet</option>' +
            filteredPets.map(p => `<option value="${p.id}">${p.nome} (${p.especie})</option>`).join('');
    }

    function openModal(title = 'Novo Atendimento') {
        populateSelects();
        document.getElementById('modal-atendimento-title').textContent = title;
        document.getElementById('modal-atendimento').classList.add('active');
    }

    function closeModal() {
        document.getElementById('modal-atendimento').classList.remove('active');
        document.getElementById('form-atendimento').reset();
        document.getElementById('atend-id').value = '';
        document.getElementById('atend-petId').innerHTML = '<option value="">Selecione o pet</option>';
    }

    // Cliente change -> filter pets
    document.getElementById('atend-clienteId').addEventListener('change', (e) => {
        filterPetsByCliente(e.target.value);
    });

    // Servico change -> auto-fill valor
    document.getElementById('atend-servicoId').addEventListener('change', (e) => {
        const servico = servicos.find(s => s.id === e.target.value);
        if (servico) {
            document.getElementById('atend-valor').value = servico.valor;
        }
    });

    // Prevent native form submission
    const form = document.getElementById('form-atendimento');
    if (form) {
        form.addEventListener('submit', (e) => e.preventDefault());
    }

    // New atendimento
    document.getElementById('btn-novo-atendimento').addEventListener('click', () => {
        closeModal();
        document.getElementById('atend-data').value = formatDateForInput(new Date());
        openModal('Novo Atendimento');
    });

    // Close modal
    document.getElementById('modal-atendimento-close').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-atendimento').addEventListener('click', closeModal);
    document.getElementById('modal-atendimento').addEventListener('click', (e) => {
        if (e.target.id === 'modal-atendimento') closeModal();
    });

    // Save atendimento
    document.getElementById('btn-save-atendimento').addEventListener('click', async () => {
        const id = document.getElementById('atend-id').value;
        const clienteId = document.getElementById('atend-clienteId').value;
        const petId = document.getElementById('atend-petId').value;
        const servicoId = document.getElementById('atend-servicoId').value;
        const data = document.getElementById('atend-data').value;
        const valor = parseFloat(document.getElementById('atend-valor').value) || 0;
        const observacoes = document.getElementById('atend-observacoes').value.trim();

        if (!clienteId || !petId || !servicoId || !data) {
            showToast('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        if (valor <= 0) {
            showToast('Informe um valor válido', 'error');
            return;
        }

        const record = {
            clienteId,
            petId,
            servicoId,
            data,
            valor,
            observacoes,
            createdAt: new Date().toISOString()
        };

        try {
            closeModal();
            if (id) {
                await update('atendimentos', id, record);
                showToast('Atendimento atualizado com sucesso!', 'success');
                const index = atendimentos.findIndex(a => a.id === id);
                if (index !== -1) {
                    atendimentos[index] = { id, ...record };
                }
            } else {
                const newId = await create('atendimentos', record);
                showToast('Atendimento registrado com sucesso!', 'success');
                atendimentos.unshift({ id: newId, ...record });
            }
            renderTable(atendimentos);
        } catch (error) {
            console.error('Erro ao salvar atendimento:', error);
            showToast(`Erro ao salvar atendimento: ${error.message}`, 'error');
            await loadAllData();
        }
    });

    // Edit atendimento
    window._editAtendimento = async (id) => {
        try {
            const atend = await getById('atendimentos', id);
            if (!atend) {
                showToast('Atendimento não encontrado', 'error');
                return;
            }

            openModal('Editar Atendimento');

            document.getElementById('atend-id').value = id;
            document.getElementById('atend-clienteId').value = atend.clienteId || '';

            // Trigger pet filtering and set value
            filterPetsByCliente(atend.clienteId);
            document.getElementById('atend-petId').value = atend.petId || '';

            document.getElementById('atend-servicoId').value = atend.servicoId || '';
            document.getElementById('atend-data').value = atend.data || '';
            document.getElementById('atend-valor').value = atend.valor || '';
            document.getElementById('atend-observacoes').value = atend.observacoes || '';
        } catch (error) {
            console.error('Erro ao carregar atendimento:', error);
            showToast(`Erro ao carregar atendimento: ${error.message}`, 'error');
        }
    };

    // Delete atendimento
    window._deleteAtendimento = async (id) => {
        const confirmed = await confirmAction('Tem certeza que deseja excluir este atendimento?');
        if (!confirmed) return;

        try {
            await remove('atendimentos', id);
            showToast('Atendimento excluído com sucesso!', 'success');
            atendimentos = atendimentos.filter(a => a.id !== id);
            renderTable(atendimentos);
        } catch (error) {
            console.error('Erro ao excluir atendimento:', error);
            showToast(`Erro ao excluir atendimento: ${error.message}`, 'error');
        }
    };

    // Search
    document.getElementById('search-atendimentos').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const { clienteMap, petMap, servicoMap } = buildMaps();

        const filtered = atendimentos.filter(atend => {
            const clienteNome = (clienteMap[atend.clienteId]?.nome || '').toLowerCase();
            const petNome = (petMap[atend.petId]?.nome || '').toLowerCase();
            const servicoNome = (servicoMap[atend.servicoId]?.nome || '').toLowerCase();
            const dataStr = (atend.data || '').toLowerCase();
            return clienteNome.includes(term) ||
                   petNome.includes(term) ||
                   servicoNome.includes(term) ||
                   dataStr.includes(term);
        });
        renderTable(filtered);
    });

    await loadAllData();
}
