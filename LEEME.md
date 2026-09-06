# SENYA — citas e intérpretes

Se conserva el sitio HTML/CSS/JavaScript original. El servidor Node existente ahora valida las sesiones de llamada y separa sus salas. Supabase guarda cuentas, perfiles, solicitudes y sesiones.

## Activación

1. Crea un proyecto en https://supabase.com/dashboard y espera a que termine de prepararse.
2. En SQL Editor ejecuta **supabase/001_citas.sql** y luego **supabase/002_profiles.sql**, una sola vez y en ese orden, en el proyecto nuevo.
3. Copia `.env.example` como `.env` en esta carpeta. Completa `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` con la URL del proyecto y su clave pública publishable (o anon). No uses una clave secret ni service_role.
4. Con Node.js 22 o superior, abre una terminal en esta carpeta y ejecuta `npm ci` y después `npm start`. Abre http://localhost:3000. No abras los HTML con doble clic ni con Live Server: las llamadas y la configuración usan el servidor Node.
5. Configura en Supabase Auth la URL del sitio y la confirmación por correo. Crea una cuenta de usuario y otra de intérprete desde el sitio y confirma sus correos. Las cuentas del prototipo guardadas en el navegador deben registrarse de nuevo.
6. El intérprete entra a su perfil y sube su certificado. Un responsable revisa el archivo en Storage → certificates y los datos de `interpreter_profiles`. Solo tras esa revisión, cambia `verification_status` a `verified` en el editor de tablas. Un intérprete no puede aprobarse a sí mismo.
7. El intérprete abre su dashboard y activa Available. El usuario elige un servicio, idioma, especialidad y horario y envía la solicitud.

## Flujo implementado

- La solicitud espera hasta encontrar un intérprete verificado, conectado y disponible, con el idioma y la especialidad exactos.
- Entre compatibles se prioriza experiencia; en empate, quien lleva más tiempo sin asignación.
- Solo el intérprete asignado recibe la oferta. Tiene 90 segundos para aceptar o rechazar.
- Rechazo o vencimiento: se busca otro candidato y no se vuelve a ofrecer esa misma solicitud al intérprete que la rechazó. Si no hay candidatos, permanece en espera.
- Aceptación: se crea una sesión única. Usuario e intérprete pueden entrar a la misma sala autenticada.
- Cancelar o finalizar libera al intérprete. Una cuenta ajena no puede consultar ni modificar la cita.
- Se comprueba la cola cada cinco segundos mientras las pantallas están abiertas. No son notificaciones push ni Supabase Realtime. Un dashboard sin actividad durante 45 segundos deja de recibir nuevas asignaciones.
- Las citas programadas abren su sala diez minutos antes. Esta primera versión reserva al intérprete desde la aceptación hasta cancelación o finalización: no incluye agenda de múltiples reservas futuras por intérprete.
- El dashboard comparte CSS, tipografía, colores, tarjetas y preferencia de tema con el perfil del usuario. Se eliminaron las solicitudes ficticias del dashboard.
- La certificación se sube después de confirmar el correo e iniciar sesión, a un contenedor privado. La foto de usuario permanece como preferencia local del dispositivo.

## Comprobación

`npm test` comprueba rutas, archivos privados, rechazo de llamadas sin autenticación, sintaxis y recursos locales.

También se ejecutaron ambas migraciones y pruebas de transiciones/permisos en PostgreSQL local mediante PGlite, con el esquema de Auth y Storage simulado. El informe está en `VALIDACION.md`. Esto no sustituye la prueba final sobre tu proyecto de Supabase y dos dispositivos.

## Publicación y videollamadas

Hace falta un alojamiento para Node.js con Socket.IO/WebSocket y HTTPS. Conservé la arquitectura existente; este paquete no está publicado. El servidor no debe exponerse como un sitio únicamente estático.

Las cámaras requieren HTTPS fuera de localhost. WebRTC usa STUN; algunas redes móviles o corporativas necesitan además un servidor TURN. Debe configurarse y comprobarse con las redes donde usarán SENYA antes de dar por validada la videollamada en producción. La integración con Supabase real, la entrega de correos y una llamada entre dos dispositivos quedan pendientes de crear/configurar el proyecto.

Referencias de implementación: https://supabase.com/docs/guides/database/functions y https://supabase.com/docs/guides/database/postgres/row-level-security
