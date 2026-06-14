import { getAll, create, update, remove } from '../services/firestore.js';
import { formatCPF, formatPhone, showToast, confirmAction, maskInput, validateCPF } from '../utils/helpers.js';

let clientesData = [];

async function loadClientes() {
    try {
        clientesData = await getAll('clientes');
        renderTable(clientesData);
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        showToast(`Erro ao carregar clientes: ${error.message}`, 'error');
    }
}

function renderTable(data) {
    const tbody = document.getElementById('clientes-table-body');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <div class="empty-icon"><span class="material-icons">people_outline</span></div>
                        <p class="empty-text">Nenhum cliente cadastrado</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(c => `
        <tr>
            <td>${c.nome || ''}</td>
            <td>${formatCPF(c.cpf || '')}</td>
            <td>${formatPhone(c.telefone || '')}</td>
            <td>${c.email || '—'}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-outline" onclick="window.__editCliente('${c.id}')">
                    <span class="material-icons">edit</span>
                </button>
                <button class="btn btn-sm btn-danger" onclick="window.__deleteCliente('${c.id}')">
                    <span class="material-icons">delete</span>
                </button>
            </td>
        </tr>
    `).join('');
}

function openModal(cliente = null) {
    const modal = document.getElementById('modal-cliente');
    const title = document.getElementById('modal-cliente-title');
    const form = document.getElementById('form-cliente');

    form.reset();
    document.getElementById('cliente-id').value = '';

    if (cliente) {
        title.textContent = 'Editar Cliente';
        document.getElementById('cliente-id').value = cliente.id;
        document.getElementById('cliente-nome').value = cliente.nome || '';
        document.getElementById('cliente-cpf').value = formatCPF(cliente.cpf || '');
        document.getElementById('cliente-telefone').value = formatPhone(cliente.telefone || '');
        document.getElementById('cliente-email').value = cliente.email || '';
        document.getElementById('cliente-endereco').value = cliente.endereco || '';
    } else {
        title.textContent = 'Novo Cliente';
    }

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('modal-cliente');
    modal.classList.remove('active');
}

function filterClientes(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
        renderTable(clientesData);
        return;
    }
    const filtered = clientesData.filter(c =>
        (c.nome || '').toLowerCase().includes(term) ||
        (c.cpf || '').includes(term) ||
        (c.telefone || '').includes(term) ||
        (c.email || '').toLowerCase().includes(term)
    );
    renderTable(filtered);
}

export async function renderClientes() {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Clientes</h1>
            <p class="page-subtitle">Gerenciar clientes cadastrados</p>
        </div>

        <div class="actions-bar">
            <div class="search-box">
                <span class="material-icons">search</span>
                <input type="text" class="search-input" id="search-clientes" placeholder="Buscar clientes...">
            </div>
            <button class="btn btn-primary" id="btn-novo-cliente">
                <span class="material-icons">add</span>
                Novo Cliente
            </button>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>Telefone</th>
                                <th>E-mail</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="clientes-table-body">
                            <tr><td colspan="5" style="text-align:center;">Carregando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="modal-overlay" id="modal-cliente">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title" id="modal-cliente-title">Novo Cliente</h3>
                    <button class="modal-close" id="modal-cliente-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="form-cliente">
                        <input type="hidden" id="cliente-id">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="cliente-nome">Nome completo</label>
                                <input type="text" class="form-input" id="cliente-nome" required placeholder="Nome do cliente">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="cliente-cpf">CPF</label>
                                <input type="text" class="form-input" id="cliente-cpf" required placeholder="000.000.000-00" maxlength="14">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="cliente-telefone">Telefone</label>
                                <input type="text" class="form-input" id="cliente-telefone" required placeholder="(00) 00000-0000" maxlength="15">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="cliente-email">E-mail</label>
                                <input type="email" class="form-input" id="cliente-email" placeholder="email@exemplo.com">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="cliente-endereco">Endereço</label>
                            <input type="text" class="form-input" id="cliente-endereco" placeholder="Endereço completo">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="btn-cancel-cliente">Cancelar</button>
                    <button class="btn btn-primary" id="btn-save-cliente">Salvar</button>
                </div>
            </div>
        </div>
    `;

    // Masks & Input Restrictions
    const cpfInput = document.getElementById('cliente-cpf');
    const phoneInput = document.getElementById('cliente-telefone');
    const nomeInput = document.getElementById('cliente-nome');
    
    if (cpfInput) maskInput(cpfInput, formatCPF);
    if (phoneInput) maskInput(phoneInput, formatPhone);
    if (nomeInput) {
        nomeInput.addEventListener('input', (e) => {
            // Allow only letters (including Portuguese accents) and spaces
            e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        });
    }

    // Prevent native form submission
    const form = document.getElementById('form-cliente');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    // Search
    document.getElementById('search-clientes').addEventListener('input', (e) => {
        filterClientes(e.target.value);
    });

    // New client button
    document.getElementById('btn-novo-cliente').addEventListener('click', () => {
        openModal();
    });

    // Close modal
    document.getElementById('modal-cliente-close').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-cliente').addEventListener('click', closeModal);
    document.getElementById('modal-cliente').addEventListener('click', (e) => {
        if (e.target.id === 'modal-cliente') closeModal();
    });

    // Save
    document.getElementById('btn-save-cliente').addEventListener('click', async () => {
        const nome = document.getElementById('cliente-nome').value.trim();
        const cpfRaw = document.getElementById('cliente-cpf').value.replace(/\D/g, '');
        const telefoneRaw = document.getElementById('cliente-telefone').value.replace(/\D/g, '');
        const email = document.getElementById('cliente-email').value.trim();
        const endereco = document.getElementById('cliente-endereco').value.trim();
        const id = document.getElementById('cliente-id').value;

        if (!nome) {
            showToast('Informe o nome do cliente', 'error');
            return;
        }
        if (!cpfRaw || cpfRaw.length !== 11) {
            showToast('Informe um CPF válido', 'error');
            return;
        }
        if (!validateCPF(cpfRaw)) {
            showToast('CPF inválido', 'error');
            return;
        }
        if (!telefoneRaw || telefoneRaw.length < 10) {
            showToast('Informe um telefone válido', 'error');
            return;
        }

        const data = {
            nome,
            cpf: cpfRaw,
            telefone: telefoneRaw,
            email,
            endereco
        };

        const btnSave = document.getElementById('btn-save-cliente');
        const originalText = btnSave.innerHTML;

        try {
            // Show loading state and keep modal open during save
            btnSave.disabled = true;
            btnSave.innerHTML = '<span class="loading-spinner"></span> Salvando...';

            console.log('Iniciando salvamento do cliente:', data);
            if (id) {
                await update('clientes', id, data);
                showToast('Cliente atualizado com sucesso!', 'success');
                const index = clientesData.findIndex(c => c.id === id);
                if (index !== -1) {
                    clientesData[index] = { id, ...data };
                }
            } else {
                const newId = await create('clientes', data);
                console.log('Cliente criado com ID:', newId);
                showToast('Cliente cadastrado com sucesso!', 'success');
                clientesData.unshift({ id: newId, ...data });
            }
            console.log('Nova lista de clientes em memória:', clientesData);
            
            // Render table first, then close modal
            renderTable(clientesData);
            closeModal();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            showToast(`Erro ao salvar cliente: ${error.message}`, 'error');
            await loadClientes();
        } finally {
            // Restore button state
            btnSave.disabled = false;
            btnSave.innerHTML = originalText;
        }
    });

    // Global edit/delete handlers
    window.__editCliente = (id) => {
        const cliente = clientesData.find(c => c.id === id);
        if (cliente) openModal(cliente);
    };

    window.__deleteCliente = async (id) => {
        const confirmed = await confirmAction('Deseja realmente excluir este cliente?');
        if (!confirmed) return;
        try {
            await remove('clientes', id);
            showToast('Cliente excluído com sucesso!', 'success');
            clientesData = clientesData.filter(c => c.id !== id);
            renderTable(clientesData);
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            showToast(`Erro ao excluir cliente: ${error.message}`, 'error');
        }
    };

    // Load data
    await loadClientes();
}
