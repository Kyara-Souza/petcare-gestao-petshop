import { auth } from './firebase-config.js';
import { showToast } from './utils/helpers.js';

let currentUser = null;

export function getCurrentUser() {
  return currentUser;
}

export function setupAuth(onLogin, onLogout) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      onLogin(user);
    } else {
      currentUser = null;
      onLogout();
    }
  });
}

export async function loginWithEmail(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    showToast('Login realizado com sucesso!', 'success');
  } catch (error) {
    console.error('Login error:', error);
    let msg = 'Erro ao fazer login';
    if (error.code === 'auth/user-not-found') msg = 'Usuário não encontrado';
    else if (error.code === 'auth/wrong-password') msg = 'Senha incorreta';
    else if (error.code === 'auth/invalid-email') msg = 'E-mail inválido';
    else if (error.code === 'auth/invalid-credential') msg = 'Credenciais inválidas';
    else msg = `Erro ao entrar: ${error.message} (${error.code})`;
    showToast(msg, 'error');
    throw error;
  }
}

export async function registerWithEmail(email, password, name) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await userCredential.user.updateProfile({
      displayName: name
    });
    showToast('Conta criada com sucesso!', 'success');
  } catch (error) {
    console.error('Registration error:', error);
    let msg = 'Erro ao criar conta';
    if (error.code === 'auth/email-already-in-use') msg = 'Este e-mail já está em uso';
    else if (error.code === 'auth/invalid-email') msg = 'E-mail inválido';
    else if (error.code === 'auth/weak-password') msg = 'A senha deve ter pelo menos 6 caracteres';
    else msg = `Erro ao criar conta: ${error.message} (${error.code})`;
    showToast(msg, 'error');
    throw error;
  }
}

export async function loginWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
    showToast('Login com Google realizado!', 'success');
  } catch (error) {
    console.error('Google login error:', error);
    if (error.code !== 'auth/popup-closed-by-user') {
      showToast(`Erro ao entrar com Google: ${error.message} (${error.code})`, 'error');
    }
    throw error;
  }
}

export async function logout() {
  try {
    await auth.signOut();
    showToast('Logout realizado', 'success');
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Erro ao fazer logout', 'error');
  }
}
