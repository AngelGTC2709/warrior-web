'use strict';

const SUPABASE_URL = 'https://tmztuuwtgxkpxgvcjbel.supabase.co';
const SUPABASE_PUBLIC_KEY = 'sb_publishable_m6QhcUa1ZpHzvdAhJwL-RA_cLbPvdxW';

// Inicializar iconos y tema compartido con index.html
if (window.lucide) lucide.createIcons();

const root = document.documentElement;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} }
};
const savedTheme = store.get('wk-theme');
if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;

document.getElementById('themeBtn')?.addEventListener('click', () => {
  const isDark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = isDark ? 'light' : 'dark';
  store.set('wk-theme', root.dataset.theme);
});

// Botones de mostrar/ocultar contraseña
document.querySelectorAll('.auth-eye').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.innerHTML = isPassword ? '<i data-lucide="eye-off"></i>' : '<i data-lucide="eye"></i>';
    if (window.lucide) lucide.createIcons();
  });
});

const mensaje = document.getElementById('mensaje');
const verificar = document.getElementById('verificar');
const formulario = document.getElementById('formulario');
const cuenta = document.getElementById('cuenta');
const contrasena = document.getElementById('contrasena');
const confirmacion = document.getElementById('confirmacion');
const guardar = document.getElementById('guardar');
const parametros = new URLSearchParams(window.location.search);
const tokenHash = parametros.get('token_hash');
const tipo = parametros.get('type');

function setEstado(texto, estado = 'info') {
  mensaje.textContent = texto;
  mensaje.dataset.state = estado;
}

if (!tokenHash || tipo !== 'recovery') {
  setEstado('El enlace no es válido. Solicita uno nuevo desde la app.', 'error');
} else if (typeof supabase === 'undefined') {
  setEstado('No se pudo cargar la recuperación. Revisa tu conexión y vuelve a abrir el enlace.', 'error');
} else {
  const cliente = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  setEstado('Para continuar, valida tu enlace de recuperación.', 'info');
  verificar.hidden = false;

  verificar.addEventListener('click', async () => {
    verificar.disabled = true;
    setEstado('Validando el enlace…', 'info');

    try {
      const { data, error } = await cliente.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
      if (error || !data.session || !data.user) {
        setEstado('No se pudo validar el enlace. Puede haber vencido o existir un problema de conexión. Inténtalo de nuevo o solicita otro desde la app.', 'error');
        verificar.disabled = false;
        return;
      }

      window.history.replaceState(null, '', window.location.pathname);
      cuenta.textContent = data.user.email ? `Cuenta: ${data.user.email}` : 'Cuenta tutora verificada.';
      setEstado('Elige una contraseña nueva para esta cuenta.', 'ok');
      verificar.hidden = true;
      formulario.hidden = false;
      contrasena.focus();
    } catch (error) {
      setEstado('No se pudo validar el enlace. Revisa tu conexión e inténtalo de nuevo.', 'error');
      verificar.disabled = false;
    }
  });

  formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (contrasena.value.length < 6) {
      setEstado('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    if (contrasena.value !== confirmacion.value) {
      setEstado('Las contraseñas no coinciden.', 'error');
      return;
    }

    guardar.disabled = true;
    setEstado('Actualizando tu contraseña…', 'info');

    try {
      const { error } = await cliente.auth.updateUser({ password: contrasena.value });
      if (error) {
        setEstado(`No se pudo actualizar la contraseña: ${error.message}`, 'error');
        guardar.disabled = false;
        return;
      }
    } catch (error) {
      setEstado('No se pudo actualizar la contraseña. Revisa tu conexión e inténtalo de nuevo.', 'error');
      guardar.disabled = false;
      return;
    }

    contrasena.value = '';
    confirmacion.value = '';
    formulario.hidden = true;
    try {
      const { error } = await cliente.auth.signOut({ scope: 'local' });
      if (error) {
        setEstado('Tu contraseña se actualizó, pero no se pudo cerrar la sesión de recuperación. Cierra esta pestaña antes de iniciar sesión.', 'error');
      } else {
        setEstado('Tu contraseña se actualizó. Ya puedes iniciar sesión en la app.', 'ok');
      }
    } catch (error) {
      setEstado('Tu contraseña se actualizó, pero no se pudo cerrar la sesión de recuperación. Cierra esta pestaña antes de iniciar sesión.', 'error');
    }
  });
}