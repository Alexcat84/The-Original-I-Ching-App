const fs = require('fs');

let code = fs.readFileSync('packages/i18n/src/messages/guia-page-ui.ts', 'utf8');

const interfaceNewProps = `  s1Heading: string;
  s1Iching: string;
  s1Bones: string;
  s2Heading: string;
  s2TranslatorsTitle: string;
  s2Translators: string;
  s2TokensTitle: string;
  s2Tokens: string;
  s2SecurityTitle: string;
  s2Security: string;
  s3Heading: string;
  s3NewSessionTitle: string;
  s3NewSession: string;
  s3HistoryTitle: string;
  s3History: string;
  s5Heading: string;
  s5AutoTitle: string;
  s5Auto: string;
  s5ManualTitle: string;
  s5Manual: string;
  s6Heading: string;
  s6LibraryTitle: string;
  s6Library: string;
  s6DocsTitle: string;
  s6Docs: string;`;

// 1. Añadimos las propiedades a GuiaPageUiMessages
code = code.replace(/export type GuiaPageUiMessages = \{([\s\S]*?)\};/, (match, p1) => {
  return `export type GuiaPageUiMessages = {${p1}\n${interfaceNewProps}\n};`;
});

// 2. Definimos las traducciones reales a inyectar en todos los diccionarios (con sus comas correspondientes)
const objInject = `    s1Heading: "Modos de Consulta (Selector Principal)",
    s1Iching: "Lectura por hexagramas y líneas mutantes para reflexión profunda y preguntas abiertas.",
    s1Bones: "Lectura de sí/no basada en patrones de grietas para validar decisiones y dirección inmediata.",
    s2Heading: "El Panel de Opciones (Centro de Control)",
    s2TranslatorsTitle: "Selector de Traductores",
    s2Translators: "Tu herramienta para elegir el linaje de sabiduría de tu consulta. Los niveles se activan según tu pack actual.",
    s2TokensTitle: "Centro de Tokens",
    s2Tokens: "Gestión de tu saldo acumulable y acceso a la adquisición de nuevos niveles de maestría.",
    s2SecurityTitle: "Seguridad (2FA)",
    s2Security: "Configuración de autenticación de dos factores para proteger la privacidad de tu cuenta.",
    s3Heading: "Sesiones y Mensajes (Gestión de Chats)",
    s3NewSessionTitle: "Nueva Sesión",
    s3NewSession: "Inicia un chat limpio con su propia continuidad temática.",
    s3HistoryTitle: "Historial de Chats",
    s3History: "Acceso a tus consultas previas, interpretaciones e imágenes. Permite revisar o eliminar hilos específicos.",
    translatorsHeading: "Los Pilares de la Sabiduría (Traductores)",
    translatorsWilhelm: "Interpretación psicológica y poética (Nivel Free/Seeker).",
    translatorsLegge: "Enfoque estructural e histórico (Nivel Seeker).",
    translatorsZhouyi: "El texto canónico puro en chino tradicional (Nivel Practitioner).",
    translatorsMaster: "Síntesis magistral personalizada de los tres linajes para un veredicto definitivo (Nivel Master).",
    s5Heading: "Métodos de Lanzamiento",
    s5AutoTitle: "Automático",
    s5Auto: "El sistema genera las líneas mediante el algoritmo ritual en el servidor.",
    s5ManualTitle: "Manual",
    s5Manual: "Asistente interactivo para ingresar tus propias tiradas físicas (Monedas o Varillas).",
    s6Heading: "Biblioteca y Documentación",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta directa de los 64 hexagramas y obras.",
    s6DocsTitle: "Documentación",
    s6Docs: "Acceso a las Notas del Método, Políticas de Privacidad y Términos de Servicio.",
`;

// 3. Removemos las keys actuales de translators* si existen para no duplicarlas y generar errores.
code = code.replace(/translatorsHeading:\s*"[^"]*",\s*/g, '');
code = code.replace(/translatorsWilhelm:\s*"[^"]*",\s*/g, '');
code = code.replace(/translatorsLegge:\s*"[^"]*",\s*/g, '');
code = code.replace(/translatorsZhouyi:\s*"[^"]*",\s*/g, '');
code = code.replace(/translatorsMaster:\s*"[^"]*",\s*/g, '');

// 4. Inyectamos objInject justo antes de que cierre el objeto de cada idioma.
// Localizamos el último campo que es promptLengthHint en cada objeto de idioma:
code = code.replace(/(promptLengthHint:\s*"[^"]*",)/g, (match) => {
  return match + '\n' + objInject;
});

fs.writeFileSync('packages/i18n/src/messages/guia-page-ui.ts', code);
console.log("guia-page-ui.ts actualizado de forma segura!");
