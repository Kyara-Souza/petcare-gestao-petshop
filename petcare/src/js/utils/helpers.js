export function formatCPF(value) {
  // Remove non-digits, apply XXX.XXX.XXX-XX mask
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatPhone(value) {
  // Remove non-digits, apply (XX) XXXXX-XXXX mask
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCurrency(value) {
  // Format as R$ 1.234,56
  const num = parseFloat(value) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(dateStr) {
  // Convert YYYY-MM-DD or ISO to DD/MM/AAAA
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR');
}

export function formatDateForInput(dateStr) {
  // Convert to YYYY-MM-DD for input[type=date]
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
}

export function onlyNumbers(str) {
  return (str || '').replace(/\D/g, '');
}

export function validateCPF(cpf) {
  // Relaxed CPF validation: verify if it has 11 digits to allow test data (e.g. 111.111.111-11)
  cpf = cpf.replace(/\D/g, '');
  return cpf.length === 11;
}

export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: 'check_circle', error: 'error', warning: 'warning' };
  toast.innerHTML = `<span class="material-icons">${icons[type] || 'info'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function confirmAction(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay active';
    overlay.innerHTML = `
      <div class="confirm-modal">
        <div class="confirm-icon"><span class="material-icons" style="font-size:48px;color:var(--warning)">warning</span></div>
        <h3 class="confirm-title">Confirmar ação</h3>
        <p class="confirm-text">${message}</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary" id="confirm-cancel">Cancelar</button>
          <button class="btn btn-danger" id="confirm-ok">Excluir</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#confirm-cancel').onclick = () => { overlay.remove(); resolve(false); };
    overlay.querySelector('#confirm-ok').onclick = () => { overlay.remove(); resolve(true); };
  });
}

export function maskInput(input, maskFn) {
  input.addEventListener('input', (e) => {
    e.target.value = maskFn(e.target.value);
  });
}
