'use strict';

const SUPABASE_URL = 'https://tmztuuwtgxkpxgvcjbel.supabase.co';
const SUPABASE_PUBLIC_KEY = 'sb_publishable_m6QhcUa1ZpHzvdAhJwL-RA_cLbPvdxW';

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

if (!tokenHash || tipo !== 'recovery') {
  mensaje.textContent = 'El enlace no es válido. Solicita uno nuevo desde la app.';
} else if (typeof supabase === 'undefined') {
  mensaje.textContent = 'No se pudo cargar la recuperación. Revisa tu conexión y vuelve a abrir el enlace.';
} else {
  const cliente = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  mensaje.textContent = 'Para continuar, valida tu enlace de recuperación.';
  verificar.hidden = false;

  verificar.addEventListener('click', async () => {
    verificar.disabled = true;
    mensaje.textContent = 'Validando el enlace…';

    try {
      const { data, error } = await cliente.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
      if (error || !data.session || !data.user) {
        mensaje.textContent = 'No se pudo validar el enlace. Puede haber vencido o existir un problema de conexión. Inténtalo de nuevo o solicita otro desde la app.';
        verificar.disabled = false;
        return;
      }

      window.history.replaceState(null, '', window.location.pathname);
      cuenta.textContent = data.user.email ? `Cuenta: ${data.user.email}` : 'Cuenta tutora verificada.';
      mensaje.textContent = 'Elige una contraseña nueva para esta cuenta.';
      verificar.hidden = true;
      formulario.hidden = false;
      contrasena.focus();
    } catch (error) {
      mensaje.textContent = 'No se pudo validar el enlace. Revisa tu conexión e inténtalo de nuevo.';
      verificar.disabled = false;
    }
  });

  formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (contrasena.value.length < 6) {
      mensaje.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (contrasena.value !== confirmacion.value) {
      mensaje.textContent = 'Las contraseñas no coinciden.';
      return;
    }

    guardar.disabled = true;
    mensaje.textContent = 'Actualizando tu contraseña…';

    try {
      const { error } = await cliente.auth.updateUser({ password: contrasena.value });
      if (error) {
        mensaje.textContent = `No se pudo actualizar la contraseña: ${error.message}`;
        guardar.disabled = false;
        return;
      }
    } catch (error) {
      mensaje.textContent = 'No se pudo actualizar la contraseña. Revisa tu conexión e inténtalo de nuevo.';
      guardar.disabled = false;
      return;
    }

    contrasena.value = '';
    confirmacion.value = '';
    formulario.hidden = true;
    try {
      const { error } = await cliente.auth.signOut({ scope: 'local' });
      mensaje.textContent = error
        ? 'Tu contraseña se actualizó, pero no se pudo cerrar la sesión de recuperación. Cierra esta pestaña antes de iniciar sesión.'
        : 'Tu contraseña se actualizó. Ya puedes iniciar sesión en la app.';
    } catch (error) {
      mensaje.textContent = 'Tu contraseña se actualizó, pero no se pudo cerrar la sesión de recuperación. Cierra esta pestaña antes de iniciar sesión.';
    }
  });
}
