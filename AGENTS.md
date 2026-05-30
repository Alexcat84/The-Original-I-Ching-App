## Learned User Preferences
- Prefiere que el agente continúe desde el estado actual del proyecto sin reanalizar desde cero cuando hay contexto previo.
- Suele pedir ejecución directa ("procede", "hazlo") en lugar de planes extensos.
- Solicita con frecuencia `commit` y `push` tras cerrar un bloque funcional para validarlo en despliegue.
- Suele validar móvil con APK local (Gradle, p. ej. assembleDebug) y reserva EAS o subidas a Play para cuando lo pide expresamente.
- Valora respuestas y UX homogéneas en el idioma del usuario, evitando mezcla ES/EN; vigila regresiones donde la UI vuelve a inglés en paralelo en APK/WebView y en el chat web.
- Prioriza una experiencia visual cuidada y de alta calidad por encima de entregas mínimas funcionales.
- Prefiere implementaciones reales sobre mocks cuando ya existen credenciales y presupuesto para proveedores.
- Cuando se sustituye WebView por UI nativa, exige paridad funcional completa (auth, 2FA, chats, docs, compras, etc.) y rechaza entregas a medias.

## Learned Workspace Facts
- El workspace corresponde a `The Original I Ching App` y el producto combina consultas de I Ching con generación de imágenes.
- La privacidad es requisito central: chats e imágenes deben ser privados por usuario autenticado y no exponerse públicamente.
- La persistencia de chats e imágenes debe ser server-side/DB; no debe depender de almacenamiento local efímero para datos de usuario.
- El flujo de imágenes incluye overlays de texto chino y marca de agua; cambios de tipografía/render pueden romper la salida visual.
- Los prompts enviados al proveedor de imagen pasan por compactación/recorte de longitud (`compactPrompt` en web); las restricciones que no puedan perderse (p. ej. negativas / sin caligrafía decorativa) deben ir al inicio de lo que construye `buildImagePrompt`, no solo al final del string. La categoría `family_home` en `packages/image-engine` puede sesgar hacia tropos de interior/patio; si la composición se repite fuera de contexto, revisar clasificación de categoría, tema y negativo compacto.
- El proyecto usa pruebas de QA visual frecuentes con capturas para validar regresiones en UI y render de imágenes.
- El cliente Android (`apps/mobile`) carga la experiencia web en un `WebView`; la UI y el login dependen del despliegue remoto, no solo del APK. La URL efectiva debe alinearse entre `app.config.js` (`extra.apiUrl`, embebido en release) y `EXPO_PUBLIC_*` / Metro en desarrollo; si difieren, el dispositivo puede cargar otro host (p. ej. staging vs producción).
- El JavaScript inyectado en el WebView (`INJECTED_JS` en `apps/mobile`) puede aplicar CSS con `!important` que sobrescribe estilos del sitio remoto; si la UI no refleja un deploy nuevo, conviene revisar esas reglas además de la URL y la caché del WebView.
- Si un APK recién compilada sigue mostrando cabeceras duplicadas u offsets raros tras desinstalar versiones anteriores, el front remoto puede haber cambiado nombres de clase o estructura DOM; hay que alinear los selectores del JS inyectado con el DOM desplegado, no asumir solo caché o binario viejo.
- Los requisitos de Google Play (p. ej. subir `targetSdkVersion`) pueden introducir regresiones de UI o de pantalla completa solo en Android aunque la web desplegada se vea y funcione bien.
- Las regresiones de idioma o locale pueden reproducirse a la vez en el chat web y en la shell móvil (WebView); conviene validar ambas superficies antes de atribuir el fallo solo al APK o al binario.
- La duración percibida del ritual de lanzamiento (manual/auto) depende de `apps/web/src/lib/iching-ritual-timing.ts` y de los env públicos `NEXT_PUBLIC_ICHING_RITUAL_*` (presupuesto objetivo, techo por tick, pesos de fase, clamp del budget respecto a la duración medida de `/api/consult`); si los tiempos no cuadran con lo esperado, contrastar esos valores con el stream SSE real de la consulta, no solo los temporizadores de UI.
- Al añadir un idioma nuevo, seguir el checklist en [`docs/workflows/I18N_GUIDE.md`](docs/workflows/I18N_GUIDE.md) (`packages/i18n`, `page.tsx`, mobile, backend Claude, SEO).
