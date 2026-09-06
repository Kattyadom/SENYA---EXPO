# Validación de esta entrega

## Resultado

6 pruebas automatizadas de Node aprobadas y 13 comprobaciones de PostgreSQL local aprobadas.

## PostgreSQL local (PGlite 0.3.14)

Las dos migraciones se ejecutaron completas sobre un PostgreSQL de prueba con roles `anon` y `authenticated`, `auth.uid()` y tablas auxiliares de Auth/Storage simuladas.

Se comprobó:

1. Ejecución de ambas migraciones sin errores.
2. Selección por idioma, especialidad y experiencia.
3. Exclusión de intérpretes ya reservados.
4. Una cuenta ajena no ve la solicitud ni puede aceptarla.
5. Los clientes no pueden aprobar su perfil ni invocar directamente el asignador interno.
6. Rechazar reasigna al siguiente intérprete compatible.
7. Aceptar crea una sola sesión; una segunda aceptación falla.
8. Inicio y finalización actualizan los estados.
9. Una solicitud sin candidatos se asigna cuando un intérprete se pone disponible.
10. Vencimiento de oferta reasigna a otro candidato.
11. La sala de una cita futura no puede abrirse antes de tiempo.
12. Los intérpretes desconectados quedan excluidos.
13. Un intérprete no puede crear solicitudes de usuario y se rechazan horarios pasados.

## Servidor y archivos

`node --test tests/server.test.cjs`: 6 pruebas aprobadas. Verifica las rutas principales, el aviso de configuración ausente, protección de archivos del servidor, rechazo de conexiones Socket.IO sin autenticación, sintaxis de los scripts modificados y existencia de scripts/estilos enlazados.

## Pendiente de validación externa

No se configuró un proyecto real de Supabase porque todavía no existe. No se probaron correos de confirmación, almacenamiento de certificados en Supabase real, videollamadas entre dispositivos, redes con TURN ni despliegue HTTPS. No se realizó inspección visual/interacción automatizada en navegador. La vista local responde, pero las páginas privadas requieren iniciar sesión tras configurar Supabase.
