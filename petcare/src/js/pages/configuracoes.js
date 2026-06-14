import { getCurrentUser } from '../auth.js';
import { showToast } from '../utils/helpers.js';

export async function renderConfiguracoes() {
    const container = document.getElementById('main-content');
    const user = getCurrentUser();

    const userName = user?.displayName || 'Usuário';
    const userEmail = user?.email || 'N/A';
    const userUid = user?.uid || 'N/A';
    const providerData = user?.providerData?.[0];
    const loginProvider = providerData?.providerId === 'google.com' ? 'Google' :
                          providerData?.providerId === 'password' ? 'Email/Senha' :
                          providerData?.providerId || 'N/A';
    const userPhoto = user?.photoURL || '';

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Configurações</h1>
            <p class="page-subtitle">Configurações do sistema</p>
        </div>

        <div class="settings-card">
            <div class="settings-header">
                <div class="settings-avatar">
                    ${userPhoto
                        ? `<img src="${userPhoto}" alt="Avatar" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">`
                        : '<span class="material-icons" style="font-size: 64px; color: var(--primary);">person</span>'
                    }
                </div>
                <h2 style="margin: 0.5rem 0 0.25rem;">${userName}</h2>
                <p style="color: var(--text-secondary); margin: 0;">${userEmail}</p>
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label class="form-label">Nome</label>
                    <input type="text" class="form-input" value="${userName}" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="text" class="form-input" value="${userEmail}" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">UID</label>
                    <input type="text" class="form-input" value="${userUid}" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">Provedor de Login</label>
                    <input type="text" class="form-input" value="${loginProvider}" readonly>
                </div>
            </div>
        </div>

        <div class="settings-card">
            <div class="card-header">
                <h3 class="card-title">
                    <span class="material-icons" style="vertical-align: middle; margin-right: 0.5rem;">info</span>
                    Informações do Sistema
                </h3>
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label class="form-label">Sistema</label>
                    <input type="text" class="form-input" value="PetCare - Sistema de Gerenciamento para Pet Shop" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">Versão</label>
                    <input type="text" class="form-input" value="1.0.0" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">Desenvolvedor</label>
                    <input type="text" class="form-input" value="PetCare Team" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">Projeto Firebase</label>
                    <input type="text" class="form-input" value="pet-care-98f16" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">Tecnologias</label>
                    <input type="text" class="form-input" value="HTML, CSS, JavaScript, Firebase (Firestore, Auth)" readonly>
                </div>
            </div>
        </div>

        <div class="settings-card">
            <div class="card-header">
                <h3 class="card-title">
                    <span class="material-icons" style="vertical-align: middle; margin-right: 0.5rem;">flash_on</span>
                    Ações Rápidas
                </h3>
            </div>
            <div class="card-body">
                <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
                    <button class="btn btn-primary" id="btn-clear-cache">
                        <span class="material-icons">cleaning_services</span>
                        Limpar Cache/Filtros
                    </button>
                    <a href="https://console.firebase.google.com/project/pet-care-98f16" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                        <span class="material-icons">open_in_new</span>
                        Console Firebase
                    </a>
                </div>
            </div>
        </div>
    `;

    // Clear cache button
    document.getElementById('btn-clear-cache').addEventListener('click', () => {
        try {
            localStorage.clear();
            sessionStorage.clear();
            showToast('Cache e filtros limpos com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao limpar cache:', error);
            showToast('Erro ao limpar cache', 'error');
        }
    });
}
