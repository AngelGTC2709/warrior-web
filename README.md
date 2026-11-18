# warrior-web

## Recuperación de contraseña

Publica `restablecer.html` y `restablecer.js` junto con `styles.css` en GitHub Pages.
La página usa la URL y la clave pública del proyecto Supabase; nunca coloques una
clave `service_role` o `sb_secret_` en estos archivos.

En Supabase, abre **Authentication → Email Templates → Reset Password** y usa
este enlace en el correo:

```html
<a href="https://warriorkids.win/restablecer.html?token_hash={{ .TokenHash }}&amp;type=recovery">
  Restablecer contraseña
</a>
```

La app debe conservar su URL de redirección permitida en **Authentication → URL
Configuration → Redirect URLs**, aunque el enlace de esta plantilla abra la
página web directamente. Para enviar correos a usuarios fuera del equipo del
proyecto, configura SMTP personalizado en Supabase.

Después de publicar y configurar la plantilla, solicita un correo desde la app y
prueba el enlace completo. El botón **Continuar** valida el enlace; una vez
validado, no se puede volver a usar. Si se recarga la página durante el cambio,
solicita un enlace nuevo desde la app.
