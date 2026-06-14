import { setupAuth, loginWithEmail, registerWithEmail, loginWithGoogle, logout } from './auth.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderClientes } from './pages/clientes.js';
import { renderPets } from './pages/pets.js';
import { renderServicos } from './pages/servicos.js';
import { renderAtendimentos } from './pages/atendimentos.js';
import { renderRelatorios } from './pages/relatorios.js';
import { renderConfiguracoes } from './pages/configuracoes.js';

// Route map: page name → render function
const routes = {
  dashboard: renderDashboard,
  clientes: renderClientes,
  pets: renderPets,
  servicos: renderServicos,
  atendimentos: renderAtendimentos,
  relatorios: renderRelatorios,
  configuracoes: renderConfiguracoes
};

// Page titles for the header
const pageTitles = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  pets: 'Pets',
  servicos: 'Serviços',
  atendimentos: 'Atendimentos',
  relatorios: 'Relatórios',
  configuracoes: 'Configurações'
};

let currentPage = 'dashboard';

/**
 * Navigate to a page: update sidebar active state, title, render content, and close mobile sidebar.
 */
function navigateTo(page) {
  currentPage = page;

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) {
      item.classList.add('active');
    }
  });

  // Update page title
  const titleEl = document.getElementById('current-page-title');
  if (titleEl) {
    titleEl.textContent = pageTitles[page] || page;
  }

  // Render the page
  if (routes[page]) {
    routes[page]();
  }

  // Close sidebar on mobile
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

// ── Toggle Login and Register screens ────────────────────────────────
const linkShowRegister = document.getElementById('link-show-register');
const linkShowLogin = document.getElementById('link-show-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

if (linkShowRegister && linkShowLogin && loginForm && registerForm) {
  linkShowRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  });

  linkShowLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  });
}

// ── Login form handler ──────────────────────────────────────────────
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    loginWithEmail(email, password);
  });
}

// ── Register form handler ───────────────────────────────────────────
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    registerWithEmail(email, password, name);
  });
}

// ── Google login button ─────────────────────────────────────────────
const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
  btnGoogle.addEventListener('click', () => {
    loginWithGoogle();
  });
}

// ── Logout button ───────────────────────────────────────────────────
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    logout();
  });
}

// ── Sidebar navigation ─────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    if (page) navigateTo(page);
  });
});

// ── Mobile menu toggle ──────────────────────────────────────────────
const menuToggle = document.getElementById('menu-toggle');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
  });
}

// ── Sidebar overlay click to close ──────────────────────────────────
const sidebarOverlay = document.getElementById('sidebar-overlay');
if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  });
}

// ── Auth state listener ─────────────────────────────────────────────
setupAuth(
  // onLogin
  (user) => {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';

    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    if (userName) userName.textContent = user.displayName || 'Usuário';
    if (userEmail) userEmail.textContent = user.email;

    if (user.photoURL) {
      const avatar = document.getElementById('user-avatar');
      if (avatar) {
        avatar.src = user.photoURL;
        avatar.style.display = 'block';
      }
    }

    navigateTo('dashboard');
  },
  // onLogout
  () => {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
  }
);
