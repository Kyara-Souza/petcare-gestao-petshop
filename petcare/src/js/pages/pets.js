import { getAll, create, update, remove } from '../services/firestore.js';
import { showToast, confirmAction } from '../utils/helpers.js';

let petsData = [];
let clientesData = [];

const speciesIcons = {
    'Cão': '🐕',
    'Gato': '🐈',
    'Ave': '🐦',
    'Peixe': '🐟',
    'Roedor': '🐹',
    'Réptil': '🦎',
    'Outro': '🐾'
};

function getSpeciesIcon(especie) {
    return speciesIcons[especie] || '🐾';
}

function getClienteNome(clienteId) {
    const cliente = clientesData.find(c => c.id === clienteId);
    return cliente ? cliente.nome : '—';
}

async function loadPets() {
    try {
        [petsData, clientesData] = await Promise.all([
            getAll('pets'),
            getAll('clientes')
        ]);
        renderTable(petsData);
    } catch (error) {
        console.error('Erro ao carregar pets:', error);
        showToast(`Erro ao carregar pets: ${error.message}`, 'error');
    }
}

function renderTable(data) {
    const tbody = document.getElementById('pets-table-body');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-icon"><span class="material-icons">pets</span></div>
                        <p class="empty-text">Nenhum pet cadastrado</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(p => `
        <tr>
            <td>${getSpeciesIcon(p.especie)} ${p.nome || ''}</td>
            <td>${p.especie || '—'}</td>
            <td>${p.raca || '—'}</td>
            <td>${p.idade || '—'}</td>
            <td>${getClienteNome(p.clienteId)}</td>
            <td class="table-actions">
                <button class="btn btn-sm btn-outline" onclick="window.__editPet('${p.id}')">
                    <span class="material-icons">edit</span>
                </button>
                <button class="btn btn-sm btn-danger" onclick="window.__deletePet('${p.id}')">
                    <span class="material-icons">delete</span>
                </button>
            </td>
        </tr>
    `).join('');
}

function populateClienteSelect() {
    const select = document.getElementById('pet-clienteId');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um cliente</option>' +
        clientesData.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
}

function openModal(pet = null) {
    const modal = document.getElementById('modal-pet');
    const title = document.getElementById('modal-pet-title');
    const form = document.getElementById('form-pet');

    form.reset();
    document.getElementById('pet-id').value = '';
    populateClienteSelect();

    if (pet) {
        title.textContent = 'Editar Pet';
        document.getElementById('pet-id').value = pet.id;
        document.getElementById('pet-nome').value = pet.nome || '';
        document.getElementById('pet-especie').value = pet.especie || '';
        document.getElementById('pet-raca').value = pet.raca || '';
        document.getElementById('pet-idade').value = pet.idade || '';
        document.getElementById('pet-sexo').value = pet.sexo || '';
        document.getElementById('pet-peso').value = pet.peso || '';
        document.getElementById('pet-clienteId').value = pet.clienteId || '';
    } else {
        title.textContent = 'Novo Pet';
    }

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('modal-pet');
    modal.classList.remove('active');
}

function filterPets(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
        renderTable(petsData);
        return;
    }
    const filtered = petsData.filter(p =>
        (p.nome || '').toLowerCase().includes(term) ||
        (p.especie || '').toLowerCase().includes(term) ||
        (p.raca || '').toLowerCase().includes(term) ||
        getClienteNome(p.clienteId).toLowerCase().includes(term)
    );
    renderTable(filtered);
}

export async function renderPets() {
    const content = document.getElementById('main-content');
    content.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Pets</h1>
            <p class="page-subtitle">Gerenciar pets cadastrados</p>
        </div>

        <div class="actions-bar">
            <div class="search-box">
                <span class="material-icons">search</span>
                <input type="text" class="search-input" id="search-pets" placeholder="Buscar pets...">
            </div>
            <button class="btn btn-primary" id="btn-novo-pet">
                <span class="material-icons">add</span>
                Novo Pet
            </button>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Espécie</th>
                                <th>Raça</th>
                                <th>Idade</th>
                                <th>Dono</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="pets-table-body">
                            <tr><td colspan="6" style="text-align:center;">Carregando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="modal-overlay" id="modal-pet">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title" id="modal-pet-title">Novo Pet</h3>
                    <button class="modal-close" id="modal-pet-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="form-pet">
                        <input type="hidden" id="pet-id">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="pet-nome">Nome do pet</label>
                                <input type="text" class="form-input" id="pet-nome" required placeholder="Nome do pet">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="pet-especie">Espécie</label>
                                <select class="form-select" id="pet-especie" required>
                                    <option value="">Selecione</option>
                                    <option value="Cão">Cão</option>
                                    <option value="Gato">Gato</option>
                                    <option value="Ave">Ave</option>
                                    <option value="Peixe">Peixe</option>
                                    <option value="Roedor">Roedor</option>
                                    <option value="Réptil">Réptil</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="pet-raca">Raça</label>
                                <input type="text" class="form-input" id="pet-raca" placeholder="Raça do pet">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="pet-idade">Idade</label>
                                <input type="text" class="form-input" id="pet-idade" placeholder="Ex: 3 anos">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="pet-sexo">Sexo</label>
                                <select class="form-select" id="pet-sexo">
                                    <option value="">Selecione</option>
                                    <option value="Macho">Macho</option>
                                    <option value="Fêmea">Fêmea</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="pet-peso">Peso</label>
                                <input type="text" class="form-input" id="pet-peso" placeholder="Ex: 5.5 kg">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="pet-clienteId">Cliente responsável</label>
                            <select class="form-select" id="pet-clienteId" required>
                                <option value="">Selecione um cliente</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="btn-cancel-pet">Cancelar</button>
                    <button class="btn btn-primary" id="btn-save-pet">Salvar</button>
                </div>
            </div>
        </div>
    `;

    // Prevent native form submission
    const form = document.getElementById('form-pet');
    if (form) {
        form.addEventListener('submit', (e) => e.preventDefault());
    }

    // Search
    document.getElementById('search-pets').addEventListener('input', (e) => {
        filterPets(e.target.value);
    });

    // New pet button
    document.getElementById('btn-novo-pet').addEventListener('click', () => {
        openModal();
    });

    // Close modal
    document.getElementById('modal-pet-close').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-pet').addEventListener('click', closeModal);
    document.getElementById('modal-pet').addEventListener('click', (e) => {
        if (e.target.id === 'modal-pet') closeModal();
    });

    // Save
    document.getElementById('btn-save-pet').addEventListener('click', async () => {
        const nome = document.getElementById('pet-nome').value.trim();
        const especie = document.getElementById('pet-especie').value;
        const raca = document.getElementById('pet-raca').value.trim();
        const idade = document.getElementById('pet-idade').value.trim();
        const sexo = document.getElementById('pet-sexo').value;
        const peso = document.getElementById('pet-peso').value.trim();
        const clienteId = document.getElementById('pet-clienteId').value;
        const id = document.getElementById('pet-id').value;

        if (!nome) {
            showToast('Informe o nome do pet', 'error');
            return;
        }
        if (!especie) {
            showToast('Selecione a espécie', 'error');
            return;
        }
        if (!clienteId) {
            showToast('Selecione o cliente responsável', 'error');
            return;
        }

        const data = {
            nome,
            especie,
            raca,
            idade,
            sexo,
            peso,
            clienteId
        };

        const btnSave = document.getElementById('btn-save-pet');
        const originalText = btnSave.innerHTML;

        try {
            // Show loading state and keep modal open during save
            btnSave.disabled = true;
            btnSave.innerHTML = '<span class="loading-spinner"></span> Salvando...';

            if (id) {
                await update('pets', id, data);
                showToast('Pet atualizado com sucesso!', 'success');
                const index = petsData.findIndex(p => p.id === id);
                if (index !== -1) {
                    petsData[index] = { id, ...data };
                }
            } else {
                const newId = await create('pets', data);
                showToast('Pet cadastrado com sucesso!', 'success');
                petsData.unshift({ id: newId, ...data });
            }
            renderTable(petsData);
            closeModal();
        } catch (error) {
            console.error('Erro ao salvar pet:', error);
            showToast(`Erro ao salvar pet: ${error.message}`, 'error');
            await loadPets();
        } finally {
            // Restore button state
            btnSave.disabled = false;
            btnSave.innerHTML = originalText;
        }
    });

    // Global edit/delete handlers
    window.__editPet = async (id) => {
        // Refresh clientes before opening modal
        try {
            clientesData = await getAll('clientes');
        } catch (e) {
            console.error('Erro ao carregar clientes:', e);
        }
        const pet = petsData.find(p => p.id === id);
        if (pet) openModal(pet);
    };

    window.__deletePet = async (id) => {
        const confirmed = await confirmAction('Deseja realmente excluir este pet?');
        if (!confirmed) return;
        try {
            await remove('pets', id);
            showToast('Pet excluído com sucesso!', 'success');
            petsData = petsData.filter(p => p.id !== id);
            renderTable(petsData);
        } catch (error) {
            console.error('Erro ao excluir pet:', error);
            showToast(`Erro ao excluir pet: ${error.message}`, 'error');
        }
    };

    // Load data
    await loadPets();
}
