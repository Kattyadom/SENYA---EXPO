# Publicar SENYA gratis, paso a paso

Preparado el 6 de septiembre de 2026. Todavía falta crear el servicio en tu cuenta, obtener su URL y comprobarlo con tus dispositivos. No necesitas comprar dominio. Los mensajes de la web permanecen en inglés.

## 1. Llevar la versión actual a GitHub Desktop

La carpeta actualizada es:
`C:\Users\Kattya\Documents\Codex\2026-09-05\tengo-mi-sitio-web-senya-en\outputs\SENYA`

1. Abre GitHub Desktop. En **File → Clone repository**, selecciona el repositorio original y una carpeta de destino. Si ya está clonado, selecciónalo en **Current repository**.
2. Si Desktop muestra cambios pendientes, guárdalos primero mediante un commit. Pulsa **Fetch origin** y **Pull origin** si aparece. Así evitas mezclar cambios anteriores con esta copia.
3. En **Current branch**, selecciona TU rama. Si no existe, usa **New branch**, escribe su nombre y créala desde la rama base acordada con tu equipo. No necesitas modificar main para publicar una prueba.
4. Pulsa **Repository → Show in Explorer**. Esta es la carpeta del repositorio en la que trabajarás desde ahora. Haz una copia de respaldo antes de reemplazar archivos.
5. Copia el CONTENIDO de la carpeta actualizada indicada arriba a esa carpeta del repositorio. Copia `EXPO`, `supabase`, `tests`, `server.cjs`, `package.json`, `package-lock.json`, `render.yaml`, `.gitignore`, `.env.example`, los documentos y el lanzador. Acepta reemplazar archivos correspondientes a SENYA después de respaldar tus cambios.
6. No copies `node_modules`, `.git` ni `.env`. No copies la carpeta exterior `SENYA`: `package.json` y `server.cjs` deben quedar directamente en la raíz del repositorio, junto a su `.git` existente. No borres otros archivos de tu equipo.
7. Regresa a Desktop y revisa **Changes**. No debe aparecer `.env`, contraseñas ni `node_modules`. Si ya estaban versionados en el repositorio original, `.gitignore` por sí solo no los retira: detente antes de publicar y revisamos ese caso.
8. Escribe como resumen `Prepare SENYA HTTPS test deployment`, pulsa **Commit to [tu rama]** y después **Push origin** o **Publish branch**.

Para seguir desarrollando, abre y edita esta carpeta del repositorio. Ya no alternes cambios entre ambas copias. El servidor local y Render son procesos separados: guardar un archivo local no actualiza Internet hasta hacer commit y push.

## 2. Crear el servicio gratuito en Render

1. Entra en https://render.com y crea tu cuenta; puedes vincular GitHub.
2. Selecciona **New → Web Service**, conecta el repositorio y elige la MISMA rama del paso anterior.
3. Configura los campos:

| Campo | Valor |
| --- | --- |
| Name | Un nombre disponible, por ejemplo senya-test |
| Language / Runtime | Node |
| Branch | Tu rama |
| Root Directory | Vacío, si copiaste como se indica arriba |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Instance Type | **Free** |
| Health Check Path | `/healthz` |

4. En **Environment**, agrega:

| Nombre | Valor |
| --- | --- |
| NODE_VERSION | `22` |
| SUPABASE_URL | La Project URL de tu proyecto Supabase |
| SUPABASE_PUBLISHABLE_KEY | La publishable key de ese mismo proyecto |

No uses los nombres `NEXT_PUBLIC_...`: este servidor usa los nombres anteriores. No necesitas añadir PORT; Render lo asigna. No necesitas crear otra base de datos ni volver a ejecutar las migraciones que ya aplicaste.

5. Confirma **Free** antes de crear el servicio y evita activar opciones pagadas. Espera a que el despliegue diga **Live**. Copia la URL que Render asigne, por ejemplo `https://senya-test-xxxx.onrender.com`; este ejemplo NO es una URL ya creada.
6. Abre esa dirección y después `/healthz`: debe mostrar `{"status":"ok"}`. Comprueba `/signin.html` y que se pueda iniciar sesión.

Incluí también `render.yaml` para creación mediante Blueprint; el procedimiento anterior es la alternativa manual, no debes crear ambos servicios.

Render proporciona HTTPS y soporta WebSockets. El plan gratuito puede tardar alrededor de un minuto en despertar tras 15 minutos sin tráfico. Tiene 750 horas gratuitas por workspace al mes y límites de transferencia/build. No hagas despliegues durante llamadas: un reinicio puede cortarlas. Los datos y certificados de SENYA siguen en Supabase, porque el disco gratuito de Render es temporal.

Fuente: https://render.com/docs/free y https://render.com/docs/websocket

## 3. Cambiar el retorno de Supabase

Espera a tener la dirección REAL de Render.

1. En Supabase, abre **Authentication → URL Configuration**.
2. Cambia **Site URL** a `https://TU-SERVICIO.onrender.com/signin.html`.
3. En **Redirect URLs**, agrega esa misma dirección completa y conserva `http://localhost:3000/signin.html` para el desarrollo local.
4. Guarda. Solicita un correo nuevo: los enlaces antiguos pueden seguir apuntando a localhost o haber caducado.
5. Abre el nuevo enlace en el teléfono. Debe llegar a SENYA por HTTPS, nunca a localhost. Comprueba tanto confirmación de registro como recuperación de contraseña.

Fuente: https://supabase.com/docs/guides/auth/redirect-urls

## 4. Correo externo sin comprar dominio: Gmail SMTP para pruebas

Puedes crear una cuenta gratuita de Gmail dedicada a SENYA. No necesitas Google Workspace. Usa una dirección que controles; el nombre visible puede ser SENYA.

1. En esa cuenta Google activa **Verificación en dos pasos**.
2. Abre https://myaccount.google.com/apppasswords y crea una contraseña de aplicación para `SENYA Supabase`. Si la opción no está disponible, no uses tu contraseña normal: algunas cuentas o políticas no permiten esta función y habrá que elegir otra cuenta/proveedor.
3. En Supabase abre **Authentication → Emails → SMTP Settings** y activa **Enable custom SMTP**.
4. Completa:

| Campo | Valor |
| --- | --- |
| Sender email address | La dirección Gmail completa que acabas de preparar |
| Sender name | SENYA |
| Host | smtp.gmail.com |
| Port | 465 |
| Minimum interval per user | 60 segundos |
| Username | La misma dirección Gmail completa |
| Password | La contraseña de APLICACIÓN de Google |

5. Guarda. La contraseña se introduce únicamente en Supabase; no va en GitHub, Render ni en el chat.
6. Solicita un solo registro nuevo con un correo externo que no pertenezca al equipo de Supabase. Revisa recibidos y spam, abre la confirmación y prueba el inicio de sesión. Después prueba recuperar contraseña. Si falla, revisa **Authentication → Audit Logs** para conocer el error antes de reenviar repetidamente.

El SMTP predeterminado de Supabase restringe destinatarios y permite pocos correos. Custom SMTP elimina esa dependencia, pero conserva límites propios (inicialmente 30 correos/hora en Supabase, configurables), además de los de Gmail. Esta opción está pensada para una prueba pequeña; no garantiza entrega ilimitada. El envío lo realiza Supabase: las restricciones SMTP del servidor gratuito de Render no intervienen aquí.

Fuentes: https://support.google.com/accounts/answer/185833?hl=en ; https://support.google.com/mail/answer/7104828?hl=en ; https://supabase.com/docs/guides/auth/auth-smtp

## 5. Probar llamadas entre dispositivos y redes distintas

1. Computadora en Wi-Fi: abre la dirección HTTPS e inicia sesión como intérprete aprobado. Activa su disponibilidad.
2. Teléfono: desactiva Wi-Fi y usa datos móviles. Abre la misma dirección HTTPS e inicia sesión como usuario.
3. Solicita asistencia con idioma/especialidad que coincidan. Acepta desde el intérprete y entra en la llamada en ambos dispositivos. Concede cámara y micrófono.
4. Comprueba imagen remota y audio en ambos sentidos durante al menos dos minutos; usa audífonos o separa los dispositivos para evitar eco.
5. Comprueba que cada botón controle SOLO su cámara/micrófono. Finaliza y verifica Completed en ambas cuentas.
6. Repite intercambiando las cuentas entre dispositivos. Repite también decline y una nueva solicitud.

Que funcione en una sola red no demuestra que vaya a funcionar con datos móviles. Si ambos ven su propia cámara pero nunca el video remoto, TURN es el siguiente paso; antes comprueba que ambos realmente entraron en la misma cita.

## 6. Activar TURN si hace falta

El código ya admite TURN por variables de entorno. Sin ellas utiliza STUN como antes. TURN retransmite audio/video cuando las redes no permiten conexión directa.

Open Relay de Metered ofrece actualmente 20 GB/mes gratuitos: https://www.metered.ca/tools/openrelay/ . Crea únicamente el plan gratuito y revisa su cuota; el video consume transferencia.

Obtén de su panel o respuesta de credenciales los valores de un servidor TURN: `urls`, `username` y `credential`. No confundas la API key con la contraseña TURN. En Render → Environment agrega:

| Variable | Contenido |
| --- | --- |
| TURN_URLS | URLs TURN suministradas por el proveedor, separadas por comas si comparten credenciales; incluye la opción TLS/TCP si la ofrece |
| TURN_USERNAME | username TURN |
| TURN_CREDENTIAL | credential TURN |
| TURN_FORCE_RELAY | false |

Guarda y espera el redespliegue. Vuelve a probar desde Wi-Fi y datos móviles. Para comprobar específicamente TURN, cambia temporalmente `TURN_FORCE_RELAY` a `true`, redespliega y prueba otra llamada: con este ajuste y TURN configurado, una llamada conectada demuestra que el relay funciona. Después vuelve a `false` para permitir conexión directa y ahorrar cuota.

El servidor entrega las credenciales TURN solo después de validar al participante de una cita. Como WebRTC las necesita en el navegador, no son invisibles para ese participante. Esta configuración manual requiere renovar credenciales si el proveedor las hace caducar; no configura renovación automática ni activa una suscripción.

## Estado de esta preparación

- Preparados: configuración Render, endpoint de salud, configuración TURN en las llamadas y esta guía.
- Verificados localmente: 12 pruebas automatizadas del proyecto.
- Pendientes de tus cuentas/dispositivos: push a la rama, servicio Live, URL de Supabase, credenciales SMTP/TURN y pruebas reales entre redes.
- No se ha publicado un sitio ni cambiado configuraciones externas desde esta preparación.
