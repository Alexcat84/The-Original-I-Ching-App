## Learned User Preferences
- Prefiere que el agente continúe desde el estado actual del proyecto sin reanalizar desde cero cuando hay contexto previo.
- Suele pedir ejecución directa ("procede", "hazlo") en lugar de planes extensos.
- Solicita con frecuencia `commit` y `push` tras cerrar un bloque funcional para validarlo en despliegue.
- Valora respuestas y UX homogéneas en el idioma del usuario, evitando mezcla ES/EN.
- Prioriza una experiencia visual cuidada y de alta calidad por encima de entregas mínimas funcionales.
- Prefiere implementaciones reales sobre mocks cuando ya existen credenciales y presupuesto para proveedores.

## Learned Workspace Facts
- El workspace corresponde a `The Original I Ching App` y el producto combina consultas de I Ching con generación de imágenes.
- La privacidad es requisito central: chats e imágenes deben ser privados por usuario autenticado y no exponerse públicamente.
- La persistencia de chats e imágenes debe ser server-side/DB; no debe depender de almacenamiento local efímero para datos de usuario.
- El flujo de imágenes incluye overlays de texto chino y marca de agua; cambios de tipografía/render pueden romper la salida visual.
- El proyecto usa pruebas de QA visual frecuentes con capturas para validar regresiones en UI y render de imágenes.
