# Activar la cuenta administradora separada

No vuelvas a ejecutar las migraciones 001 ni 002.

1. Abre `supabase/003_admin.sql`, copia todo y ejecútalo en una consulta nueva de Supabase → SQL Editor, una sola vez. Agrega permisos de administración, revisión de solicitudes y lectura privada de certificados.
2. En Supabase → Authentication → Users → Add user, elige **Create new user**, no Send invitation. Usa un correo distinto de tus dos cuentas de prueba y una contraseña propia. Para esta cuenta inicial bajo tu control puedes marcar Auto Confirm User. No necesita SMTP para crearla. No compartas la contraseña.
3. Copia el ID de esa cuenta recién creada. En SQL Editor abre otra consulta y ejecuta lo siguiente, sustituyendo el texto entre comillas por ese ID:

```sql
update public.profiles
set role = 'admin'
where id = 'PEGA_AQUI_EL_ID_DE_LA_CUENTA_NUEVA'::uuid
  and role = 'user'
returning id, first_name, role;
```

Debe devolver exactamente una fila con role `admin`. Si no devuelve filas, comprueba el ID. No cambies el ID por el de tu cuenta de usuario o intérprete.

4. Abre http://localhost:3000/signin.html en una ventana distinta de las cuentas de prueba e inicia sesión. Se abrirá `admin.html` automáticamente. No se puede crear un administrador desde el registro público de Senya.
5. En Pending review, abre el certificado, revisa el perfil y marca que lo revisaste. Pulsa **Approve interpreter**, o escribe un motivo y pulsa **Reject application**.

Las cuentas ya aprobadas manualmente aparecen en Approved. El panel revisa solicitudes pendientes; no cambia retroactivamente el estado de una llamada ni revoca intérpretes que están trabajando. El intérprete debe recargar su dashboard después de ser aprobado y activar Available.

Los certificados requieren iniciar sesión como su dueño o como administrador. No se volvieron públicos. Las decisiones quedan registradas con el ID del administrador y su fecha. La clave pública que usa Senya no permite convertir una cuenta en administradora.

La migración y los permisos se probaron localmente en PostgreSQL/PGlite. Falta ejecutar la migración en tu Supabase y comprobar el acceso con tu nueva cuenta. Crear un dominio no es necesario para esta activación.
