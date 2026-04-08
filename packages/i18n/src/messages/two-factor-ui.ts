import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";
import { interpolate } from "./interpolate.js";

export type TwoFactorUiMessages = {
  manageTitle: string;
  challengeTitle: string;
  closeDialogAria: string;
  challengeIntroTotp: string;
  challengeIntroEmail: string;
  setupMenuHint: string;
  setupTotpOnlyHint: string;
  setupEmailOnlyHint: string;
  badgeEmailCode: string;
  badgeTotp: string;
  authenticatorTotp: string;
  emailCode: string;
  chooseAnotherMethod: string;
  totpPlaceholderShort: string;
  totpSetupSteps: string;
  preparing: string;
  generateQr: string;
  totpPlaceholderLong: string;
  verify: string;
  challengeEmailBeforeSend: string;
  sendEmailHintManage: string;
  sending: string;
  sendEmailCode: string;
  emailCodePlaceholder: string;
  verifyEmail: string;
  recoveryOptionsIntro: string;
  iHaveRecoveryCodes: string;
  iDontHaveRecoveryCodes: string;
  recoveryCodePlaceholder: string;
  supportRecoveryBody: string;
  supportRecoverySubject: string;
  supportMailBody: string;
  contactSupportEmail: string;
  recoveryCodesShownOnce: string;
  recoveryAckCheckbox: string;
  infoTwoFaEnabledSaveCodes: string;
  acceptAndClose: string;
  /** Toast after user confirms they saved recovery codes and closes the modal. */
  modalAfterSaveCodes: string;
  validateRecoveryCode: string;
  continueWithVerification: string;
  cannotVerifyLink: string;
  tryCodeAgain: string;
  verify2faToContinue: string;
  twoFaRequiredByPolicy: string;
  signInFor2fa: string;
  enrollEncryptionKeyMissing: string;
  enrollAuthProviderMissing: string;
  enrollTryLater: string;
  confirmNotEnrolled: string;
  confirmEncryptionKeyMissing: string;
  confirmDecryptFailed: string;
  confirmTotpInvalid: string;
  confirmTryLater: string;
  sendSessionExpired: string;
  sendLocked: string;
  sendEmailNotConfiguredServer: string;
  emailDeliveryFailedReason: string;
  emailDeliveryFailedResendHint: string;
  sendTryLater: string;
  infoCodeSent: string;
  verifyEmailExpired: string;
  verifyEmailRequestFirst: string;
  verifyEmailInvalid: string;
  verifyEmailTryLater: string;
  disableFailed: string;
  disabledOk: string;
  challengeNeedRecovery: string;
  challengeNeedSixDigit: string;
  challengeSessionExpired: string;
  challengeLocked: string;
  challengeEmailMissing: string;
  challengeEmailExpired: string;
  challengeMethodNotLinked: string;
  challengeEmailServerMisconfig: string;
  challengeDecryptFailed: string;
  challengeInvalidWithRecovery: string;
  challengeInvalidCode: string;
  challengeVerifyFailed: string;
};

const TWO_FACTOR_UI: Record<AppLocale, TwoFactorUiMessages> = {
  es: {
    manageTitle: "Configuración de seguridad 2FA",
    challengeTitle: "Verificación 2FA requerida",
    closeDialogAria: "Cerrar ventana 2FA",
    challengeIntroTotp:
      "Para continuar en esta sesión, verifica tu cuenta con Authenticator (TOTP).",
    challengeIntroEmail: "Para continuar en esta sesión, verifica tu cuenta con código por email.",
    setupMenuHint: "Elige un solo método para configurarlo paso a paso.",
    setupTotpOnlyHint:
      "Solo Authenticator (TOTP). Usa «Elegir otro método» si prefieres el correo.",
    setupEmailOnlyHint:
      "Solo verificación por email. Usa «Elegir otro método» si prefieres Authenticator.",
    badgeEmailCode: "Código por email",
    badgeTotp: "Authenticator (TOTP)",
    authenticatorTotp: "Authenticator (TOTP)",
    emailCode: "Código por email",
    chooseAnotherMethod: "← Elegir otro método",
    totpPlaceholderShort: "Código TOTP (6 dígitos)",
    totpSetupSteps:
      "1) Pulsa «Generar QR»  2) Escaneálo con tu app Authenticator  3) Escribe el código de 6 dígitos.",
    preparing: "Preparando...",
    generateQr: "Generar QR",
    totpPlaceholderLong: "Código TOTP de 6 dígitos",
    verify: "Verificar",
    challengeEmailBeforeSend:
      "Pulsa «Enviar código por email» y revisa tu bandeja (y spam). Luego introduce los 6 dígitos.",
    sendEmailHintManage:
      "Pulsa «Enviar código por email», revisa tu bandeja y escribe el código de 6 dígitos.",
    sending: "Enviando...",
    sendEmailCode: "Enviar código por email",
    emailCodePlaceholder: "Código email (6 dígitos)",
    verifyEmail: "Verificar email",
    recoveryOptionsIntro:
      "¿No puedes verificarte? Usa tus códigos de recuperación o inicia recuperación por soporte.",
    iHaveRecoveryCodes: "Tengo mis códigos de recuperación",
    iDontHaveRecoveryCodes: "No tengo mis códigos",
    recoveryCodePlaceholder: "Código de recuperación",
    supportRecoveryBody:
      "Para recuperar el acceso, escribe a soporte desde tu email registrado. Te enviaremos pasos para verificar titularidad y restaurar acceso.",
    supportRecoverySubject: "Recuperación de acceso 2FA",
    supportMailBody:
      "Hola soporte,\n\nNo tengo mis códigos de recuperación y necesito restaurar acceso a mi cuenta.\nEmail de cuenta: {{email}}\n\nGracias.",
    contactSupportEmail: "Contactar soporte por email",
    recoveryCodesShownOnce:
      "Códigos de recuperación (se muestran una sola vez). Guárdalos en un lugar seguro:",
    recoveryAckCheckbox:
      "He guardado mis códigos de recuperación y entiendo que no se volverán a mostrar.",
    infoTwoFaEnabledSaveCodes: "2FA activado. Guarda estos códigos de recuperación antes de cerrar.",
    acceptAndClose: "Aceptar y cerrar",
    modalAfterSaveCodes: "2FA configurado correctamente.",
    validateRecoveryCode: "Validar código de recuperación",
    continueWithVerification: "Continuar con verificación",
    cannotVerifyLink: "¿No puedes verificarte?",
    tryCodeAgain: "Volver a intentar con código",
    verify2faToContinue: "Verifica 2FA para continuar.",
    twoFaRequiredByPolicy:
      "Tu cuenta tiene 2FA obligatorio en este entorno. Actívalo en Opciones > Seguridad.",
    signInFor2fa: "Inicia sesión para configurar la verificación en dos pasos.",
    enrollEncryptionKeyMissing:
      "2FA no está habilitado en servidor: falta configurar TOTP_ENCRYPTION_KEY.",
    enrollAuthProviderMissing: "2FA no disponible: falta configuración de Supabase en servidor.",
    enrollTryLater: "No se pudo iniciar 2FA ahora. Inténtalo de nuevo en unos minutos.",
    confirmNotEnrolled: "Primero activa 2FA con Authenticator para generar el QR.",
    confirmEncryptionKeyMissing:
      "2FA no está habilitado en servidor: falta configurar TOTP_ENCRYPTION_KEY.",
    confirmDecryptFailed: "No se pudo desencriptar el secreto 2FA en servidor. Reconfigura 2FA.",
    confirmTotpInvalid:
      "Código 2FA inválido o expirado. Revisa tu app Authenticator e inténtalo de nuevo.",
    confirmTryLater: "No se pudo verificar 2FA ahora. Inténtalo de nuevo.",
    sendSessionExpired: "Tu sesión expiró. Inicia sesión de nuevo.",
    sendLocked:
      "2FA bloqueado temporalmente por intentos fallidos. Espera 15 minutos e intenta de nuevo.",
    sendEmailNotConfiguredServer:
      "2FA por email no está habilitado en servidor. Revisa RESEND_API_KEY, TWO_FACTOR_EMAIL_FROM y TWO_FACTOR_EMAIL_CODE_SECRET.",
    emailDeliveryFailedReason: "No se pudo enviar el código por email: {{reason}}",
    emailDeliveryFailedResendHint:
      "No se pudo enviar el código por email. Verifica que TWO_FACTOR_EMAIL_FROM esté validado en Resend y que la API key sea correcta.",
    sendTryLater: "No se pudo enviar el código por email. Inténtalo de nuevo.",
    infoCodeSent: "Código enviado por email. Revisa bandeja principal y spam.",
    verifyEmailExpired: "El código por email expiró. Solicita uno nuevo.",
    verifyEmailRequestFirst: "Primero solicita el código por email.",
    verifyEmailInvalid: "Código por email inválido. Revisa tu bandeja e inténtalo de nuevo.",
    verifyEmailTryLater: "No se pudo verificar el código por email. Inténtalo de nuevo.",
    disableFailed: "No se pudo desactivar 2FA.",
    disabledOk: "2FA desactivado.",
    challengeNeedRecovery: "Ingresa un código de recuperación válido.",
    challengeNeedSixDigit: "Ingresa un código válido de 6 dígitos.",
    challengeSessionExpired: "Tu sesión expiró. Inicia sesión de nuevo.",
    challengeLocked:
      "2FA bloqueado temporalmente por intentos fallidos. Espera 15 minutos e intenta de nuevo.",
    challengeEmailMissing: "Primero envía el código por email.",
    challengeEmailExpired: "El código por email expiró. Solicita uno nuevo.",
    challengeMethodNotLinked: "Este método no está vinculado a tu cuenta.",
    challengeEmailServerMisconfig:
      "2FA por email no está configurado en servidor. Falta revisar Resend/variables.",
    challengeDecryptFailed:
      "No se pudo desencriptar el secreto 2FA en servidor. Reconfigura 2FA o revisa TOTP_ENCRYPTION_KEY.",
    challengeInvalidWithRecovery:
      "No pudimos validar el código. Puedes usar un código de recuperación o iniciar el proceso de soporte.",
    challengeInvalidCode: "Código 2FA inválido o expirado.",
    challengeVerifyFailed: "No se pudo verificar 2FA.",
  },
  en: {
    manageTitle: "2FA security setup",
    challengeTitle: "2FA verification required",
    closeDialogAria: "Close 2FA dialog",
    challengeIntroTotp: "To continue in this session, verify your account with Authenticator (TOTP).",
    challengeIntroEmail: "To continue in this session, verify your account with email code.",
    setupMenuHint: "Choose one method and configure it step by step.",
    setupTotpOnlyHint:
      'Authenticator (TOTP) only. Use “Choose another method” if you prefer email.',
    setupEmailOnlyHint:
      'Email verification only. Use “Choose another method” if you prefer Authenticator.',
    badgeEmailCode: "Email code",
    badgeTotp: "Authenticator (TOTP)",
    authenticatorTotp: "Authenticator (TOTP)",
    emailCode: "Email code",
    chooseAnotherMethod: "← Choose another method",
    totpPlaceholderShort: "TOTP code (6 digits)",
    totpSetupSteps:
      '1) Tap "Generate QR"  2) Scan it with your Authenticator app  3) Enter the 6-digit code.',
    preparing: "Preparing...",
    generateQr: "Generate QR",
    totpPlaceholderLong: "6-digit TOTP code",
    verify: "Verify",
    challengeEmailBeforeSend:
      'Tap «Send email code» and check your inbox (and spam). Then enter the 6-digit code.',
    sendEmailHintManage:
      'Tap "Send email code", check your inbox, and enter the 6-digit code.',
    sending: "Sending...",
    sendEmailCode: "Send email code",
    emailCodePlaceholder: "Email code (6 digits)",
    verifyEmail: "Verify email",
    recoveryOptionsIntro:
      "Can't verify? Use your recovery codes or start support recovery.",
    iHaveRecoveryCodes: "I have my recovery codes",
    iDontHaveRecoveryCodes: "I don't have my recovery codes",
    recoveryCodePlaceholder: "Recovery code",
    supportRecoveryBody:
      "To recover access, email support from your registered email. We'll send ownership verification steps and restore access.",
    supportRecoverySubject: "2FA account recovery",
    supportMailBody:
      "Hello support,\n\nI do not have my recovery codes and need to restore account access.\nAccount email: {{email}}\n\nThanks.",
    contactSupportEmail: "Contact support by email",
    recoveryCodesShownOnce:
      "Recovery codes (shown only once). Save them in a safe place:",
    recoveryAckCheckbox:
      "I saved my recovery codes and understand they will not be shown again.",
    infoTwoFaEnabledSaveCodes: "2FA enabled. Save these recovery codes before closing.",
    acceptAndClose: "Accept and close",
    modalAfterSaveCodes: "2FA configured successfully.",
    validateRecoveryCode: "Validate recovery code",
    continueWithVerification: "Continue with verification",
    cannotVerifyLink: "Can't verify?",
    tryCodeAgain: "Try code again",
    verify2faToContinue: "Verify 2FA to continue.",
    twoFaRequiredByPolicy:
      "Your account requires 2FA in this environment. Enable it in Options > Security.",
    signInFor2fa: "Sign in to set up two-step verification.",
    enrollEncryptionKeyMissing:
      "2FA is not enabled on the server: TOTP_ENCRYPTION_KEY is missing.",
    enrollAuthProviderMissing: "2FA unavailable: Supabase is not configured on the server.",
    enrollTryLater: "Could not start 2FA right now. Try again in a few minutes.",
    confirmNotEnrolled: "Enable 2FA with Authenticator first to generate the QR.",
    confirmEncryptionKeyMissing:
      "2FA is not enabled on the server: TOTP_ENCRYPTION_KEY is missing.",
    confirmDecryptFailed: "Could not decrypt the 2FA secret on the server. Reconfigure 2FA.",
    confirmTotpInvalid:
      "Invalid or expired 2FA code. Check your Authenticator app and try again.",
    confirmTryLater: "Could not verify 2FA right now. Try again.",
    sendSessionExpired: "Your session expired. Please sign in again.",
    sendLocked:
      "2FA is temporarily locked after failed attempts. Wait 15 minutes and try again.",
    sendEmailNotConfiguredServer:
      "Email 2FA is not enabled on the server. Check RESEND_API_KEY, TWO_FACTOR_EMAIL_FROM, and TWO_FACTOR_EMAIL_CODE_SECRET.",
    emailDeliveryFailedReason: "Could not send email code: {{reason}}",
    emailDeliveryFailedResendHint:
      "Could not send email code. Verify TWO_FACTOR_EMAIL_FROM is validated in Resend and the API key is correct.",
    sendTryLater: "Could not send email code. Try again.",
    infoCodeSent: "Code sent by email. Check inbox and spam folder.",
    verifyEmailExpired: "Email code expired. Request a new one.",
    verifyEmailRequestFirst: "Request the email code first.",
    verifyEmailInvalid: "Invalid email code. Check your inbox and try again.",
    verifyEmailTryLater: "Could not verify the email code. Try again.",
    disableFailed: "Could not disable 2FA.",
    disabledOk: "2FA disabled.",
    challengeNeedRecovery: "Enter a valid recovery code.",
    challengeNeedSixDigit: "Enter a valid 6-digit code.",
    challengeSessionExpired: "Your session expired. Please sign in again.",
    challengeLocked:
      "2FA is temporarily locked after failed attempts. Wait 15 minutes and try again.",
    challengeEmailMissing: "Send an email code first.",
    challengeEmailExpired: "Email code expired. Request a new one.",
    challengeMethodNotLinked: "This method is not linked to your account.",
    challengeEmailServerMisconfig:
      "Email 2FA is not configured on the server. Check Resend/environment variables.",
    challengeDecryptFailed:
      "Could not decrypt the 2FA secret on the server. Reconfigure 2FA or check TOTP_ENCRYPTION_KEY.",
    challengeInvalidWithRecovery:
      "We could not validate the code. You can use a recovery code or start support recovery.",
    challengeInvalidCode: "Invalid or expired 2FA code.",
    challengeVerifyFailed: "Could not verify 2FA.",
  },
  pt: {
    manageTitle: "Configuração de segurança 2FA",
    challengeTitle: "Verificação 2FA necessária",
    closeDialogAria: "Fechar janela 2FA",
    challengeIntroTotp:
      "Para continuar nesta sessão, verifica a tua conta com Authenticator (TOTP).",
    challengeIntroEmail: "Para continuar nesta sessão, verifica a tua conta com código por email.",
    setupMenuHint: "Escolhe um método e configura-o passo a passo.",
    setupTotpOnlyHint:
      "Apenas Authenticator (TOTP). Usa «Escolher outro método» se preferires email.",
    setupEmailOnlyHint:
      "Apenas verificação por email. Usa «Escolher outro método» se preferires Authenticator.",
    badgeEmailCode: "Código por email",
    badgeTotp: "Authenticator (TOTP)",
    authenticatorTotp: "Authenticator (TOTP)",
    emailCode: "Código por email",
    chooseAnotherMethod: "← Escolher outro método",
    totpPlaceholderShort: "Código TOTP (6 dígitos)",
    totpSetupSteps:
      "1) Toca «Gerar QR»  2) Escaneia com a app Authenticator  3) Introduz o código de 6 dígitos.",
    preparing: "A preparar...",
    generateQr: "Gerar QR",
    totpPlaceholderLong: "Código TOTP de 6 dígitos",
    verify: "Verificar",
    challengeEmailBeforeSend:
      "Toca «Enviar código por email» e verifica a caixa de entrada (e spam). Depois introduz os 6 dígitos.",
    sendEmailHintManage:
      "Toca «Enviar código por email», verifica a caixa de entrada e introduz o código de 6 dígitos.",
    sending: "A enviar...",
    sendEmailCode: "Enviar código por email",
    emailCodePlaceholder: "Código de email (6 dígitos)",
    verifyEmail: "Verificar email",
    recoveryOptionsIntro:
      "Não consegues verificar? Usa os códigos de recuperação ou inicia recuperação com o suporte.",
    iHaveRecoveryCodes: "Tenho os meus códigos de recuperação",
    iDontHaveRecoveryCodes: "Não tenho os meus códigos",
    recoveryCodePlaceholder: "Código de recuperação",
    supportRecoveryBody:
      "Para recuperar o acesso, contacta o suporte a partir do teu email registado. Enviaremos passos para verificar a titularidade.",
    supportRecoverySubject: "Recuperação de conta 2FA",
    supportMailBody:
      "Olá suporte,\n\nNão tenho códigos de recuperação e preciso de restaurar o acesso à conta.\nEmail da conta: {{email}}\n\nObrigado.",
    contactSupportEmail: "Contactar suporte por email",
    recoveryCodesShownOnce:
      "Códigos de recuperação (mostrados apenas uma vez). Guarda-os num local seguro:",
    recoveryAckCheckbox:
      "Guardei os meus códigos de recuperação e compreendo que não serão mostrados novamente.",
    infoTwoFaEnabledSaveCodes: "2FA ativado. Guarda estes códigos de recuperação antes de fechar.",
    acceptAndClose: "Aceitar e fechar",
    modalAfterSaveCodes: "2FA configurada com sucesso.",
    validateRecoveryCode: "Validar código de recuperação",
    continueWithVerification: "Continuar com verificação",
    cannotVerifyLink: "Não consegues verificar?",
    tryCodeAgain: "Tentar código novamente",
    verify2faToContinue: "Verifica a 2FA para continuar.",
    twoFaRequiredByPolicy:
      "A tua conta exige 2FA neste ambiente. Ativa em Opções > Segurança.",
    signInFor2fa: "Inicia sessão para configurar a verificação em dois passos.",
    enrollEncryptionKeyMissing:
      "2FA não está ativada no servidor: falta TOTP_ENCRYPTION_KEY.",
    enrollAuthProviderMissing: "2FA indisponível: Supabase não está configurado no servidor.",
    enrollTryLater: "Não foi possível iniciar a 2FA agora. Tenta novamente em alguns minutos.",
    confirmNotEnrolled: "Primeiro ativa a 2FA com Authenticator para gerar o QR.",
    confirmEncryptionKeyMissing:
      "2FA não está ativada no servidor: falta TOTP_ENCRYPTION_KEY.",
    confirmDecryptFailed: "Não foi possível desencriptar o segredo 2FA no servidor. Reconfigura a 2FA.",
    confirmTotpInvalid:
      "Código 2FA inválido ou expirado. Verifica a app Authenticator e tenta novamente.",
    confirmTryLater: "Não foi possível verificar a 2FA agora. Tenta novamente.",
    sendSessionExpired: "A tua sessão expirou. Inicia sessão novamente.",
    sendLocked:
      "2FA bloqueada temporariamente após tentativas falhadas. Espera 15 minutos e tenta novamente.",
    sendEmailNotConfiguredServer:
      "2FA por email não está ativada no servidor. Verifica RESEND_API_KEY, TWO_FACTOR_EMAIL_FROM e TWO_FACTOR_EMAIL_CODE_SECRET.",
    emailDeliveryFailedReason: "Não foi possível enviar o código por email: {{reason}}",
    emailDeliveryFailedResendHint:
      "Não foi possível enviar o código por email. Verifica se TWO_FACTOR_EMAIL_FROM está validado no Resend e se a API key está correta.",
    sendTryLater: "Não foi possível enviar o código por email. Tenta novamente.",
    infoCodeSent: "Código enviado por email. Verifica a caixa de entrada e spam.",
    verifyEmailExpired: "O código por email expirou. Solicita um novo.",
    verifyEmailRequestFirst: "Primeiro solicita o código por email.",
    verifyEmailInvalid: "Código por email inválido. Verifica a caixa de entrada e tenta novamente.",
    verifyEmailTryLater: "Não foi possível verificar o código por email. Tenta novamente.",
    disableFailed: "Não foi possível desativar a 2FA.",
    disabledOk: "2FA desativada.",
    challengeNeedRecovery: "Introduz um código de recuperação válido.",
    challengeNeedSixDigit: "Introduz um código válido de 6 dígitos.",
    challengeSessionExpired: "A tua sessão expirou. Inicia sessão novamente.",
    challengeLocked:
      "2FA bloqueada temporariamente após tentativas falhadas. Espera 15 minutos e tenta novamente.",
    challengeEmailMissing: "Primeiro envia o código por email.",
    challengeEmailExpired: "O código por email expirou. Solicita um novo.",
    challengeMethodNotLinked: "Este método não está associado à tua conta.",
    challengeEmailServerMisconfig:
      "2FA por email não está configurada no servidor. Verifica Resend/variáveis.",
    challengeDecryptFailed:
      "Não foi possível desencriptar o segredo 2FA no servidor. Reconfigura a 2FA ou verifica TOTP_ENCRYPTION_KEY.",
    challengeInvalidWithRecovery:
      "Não conseguimos validar o código. Podes usar um código de recuperação ou iniciar suporte.",
    challengeInvalidCode: "Código 2FA inválido ou expirado.",
    challengeVerifyFailed: "Não foi possível verificar a 2FA.",
  },
  fr: {
    manageTitle: "Configuration sécurité 2FA",
    challengeTitle: "Vérification 2FA requise",
    closeDialogAria: "Fermer la fenêtre 2FA",
    challengeIntroTotp:
      "Pour continuer cette session, vérifie ton compte avec Authenticator (TOTP).",
    challengeIntroEmail: "Pour continuer cette session, vérifie ton compte avec un code e-mail.",
    setupMenuHint: "Choisis une méthode et configure-la étape par étape.",
    setupTotpOnlyHint:
      "Authenticator (TOTP) uniquement. Utilise « Choisir une autre méthode » pour l’e-mail.",
    setupEmailOnlyHint:
      "Vérification par e-mail uniquement. Utilise « Choisir une autre méthode » pour Authenticator.",
    badgeEmailCode: "Code e-mail",
    badgeTotp: "Authenticator (TOTP)",
    authenticatorTotp: "Authenticator (TOTP)",
    emailCode: "Code e-mail",
    chooseAnotherMethod: "← Choisir une autre méthode",
    totpPlaceholderShort: "Code TOTP (6 chiffres)",
    totpSetupSteps:
      "1) Appuie sur « Générer le QR »  2) Scanne avec ton app Authenticator  3) Saisis le code à 6 chiffres.",
    preparing: "Préparation...",
    generateQr: "Générer le QR",
    totpPlaceholderLong: "Code TOTP à 6 chiffres",
    verify: "Vérifier",
    challengeEmailBeforeSend:
      "Appuie sur « Envoyer le code par e-mail » et vérifie ta boîte (et spam). Puis saisis les 6 chiffres.",
    sendEmailHintManage:
      "Appuie sur « Envoyer le code par e-mail », vérifie ta boîte et saisis le code à 6 chiffres.",
    sending: "Envoi...",
    sendEmailCode: "Envoyer le code par e-mail",
    emailCodePlaceholder: "Code e-mail (6 chiffres)",
    verifyEmail: "Vérifier l’e-mail",
    recoveryOptionsIntro:
      "Tu ne peux pas vérifier ? Utilise tes codes de récupération ou contacte le support.",
    iHaveRecoveryCodes: "J’ai mes codes de récupération",
    iDontHaveRecoveryCodes: "Je n’ai pas mes codes",
    recoveryCodePlaceholder: "Code de récupération",
    supportRecoveryBody:
      "Pour récupérer l’accès, écris au support depuis ton e-mail enregistré. Nous enverrons des étapes de vérification.",
    supportRecoverySubject: "Récupération de compte 2FA",
    supportMailBody:
      "Bonjour support,\n\nJe n’ai pas mes codes de récupération et dois restaurer l’accès.\nE-mail du compte : {{email}}\n\nMerci.",
    contactSupportEmail: "Contacter le support par e-mail",
    recoveryCodesShownOnce:
      "Codes de récupération (affichés une seule fois). Conserve-les en lieu sûr :",
    recoveryAckCheckbox:
      "J’ai sauvegardé mes codes et comprends qu’ils ne seront plus affichés.",
    infoTwoFaEnabledSaveCodes: "2FA activée. Sauvegarde ces codes avant de fermer.",
    acceptAndClose: "Accepter et fermer",
    modalAfterSaveCodes: "2FA configurée avec succès.",
    validateRecoveryCode: "Valider le code de récupération",
    continueWithVerification: "Continuer la vérification",
    cannotVerifyLink: "Tu ne peux pas vérifier ?",
    tryCodeAgain: "Réessayer avec un code",
    verify2faToContinue: "Vérifie la 2FA pour continuer.",
    twoFaRequiredByPolicy:
      "Ton compte exige la 2FA dans cet environnement. Active-la dans Options > Sécurité.",
    signInFor2fa: "Connecte-toi pour configurer la vérification en deux étapes.",
    enrollEncryptionKeyMissing:
      "2FA non activée sur le serveur : TOTP_ENCRYPTION_KEY manque.",
    enrollAuthProviderMissing: "2FA indisponible : Supabase n’est pas configuré sur le serveur.",
    enrollTryLater: "Impossible de démarrer la 2FA maintenant. Réessaie dans quelques minutes.",
    confirmNotEnrolled: "Active d’abord la 2FA avec Authenticator pour générer le QR.",
    confirmEncryptionKeyMissing:
      "2FA non activée sur le serveur : TOTP_ENCRYPTION_KEY manque.",
    confirmDecryptFailed: "Impossible de déchiffrer le secret 2FA sur le serveur. Reconfigure la 2FA.",
    confirmTotpInvalid:
      "Code 2FA invalide ou expiré. Vérifie ton app Authenticator et réessaie.",
    confirmTryLater: "Impossible de vérifier la 2FA maintenant. Réessaie.",
    sendSessionExpired: "Ta session a expiré. Reconnecte-toi.",
    sendLocked:
      "2FA temporairement verrouillée après échecs. Attends 15 minutes et réessaie.",
    sendEmailNotConfiguredServer:
      "2FA e-mail non activée sur le serveur. Vérifie RESEND_API_KEY, TWO_FACTOR_EMAIL_FROM et TWO_FACTOR_EMAIL_CODE_SECRET.",
    emailDeliveryFailedReason: "Impossible d’envoyer le code e-mail : {{reason}}",
    emailDeliveryFailedResendHint:
      "Impossible d’envoyer le code e-mail. Vérifie que TWO_FACTOR_EMAIL_FROM est validé dans Resend et que la clé API est correcte.",
    sendTryLater: "Impossible d’envoyer le code e-mail. Réessaie.",
    infoCodeSent: "Code envoyé par e-mail. Vérifie boîte de réception et spam.",
    verifyEmailExpired: "Le code e-mail a expiré. Demande-en un nouveau.",
    verifyEmailRequestFirst: "Demande d’abord le code e-mail.",
    verifyEmailInvalid: "Code e-mail invalide. Vérifie ta boîte et réessaie.",
    verifyEmailTryLater: "Impossible de vérifier le code e-mail. Réessaie.",
    disableFailed: "Impossible de désactiver la 2FA.",
    disabledOk: "2FA désactivée.",
    challengeNeedRecovery: "Saisis un code de récupération valide.",
    challengeNeedSixDigit: "Saisis un code valide à 6 chiffres.",
    challengeSessionExpired: "Ta session a expiré. Reconnecte-toi.",
    challengeLocked:
      "2FA temporairement verrouillée après échecs. Attends 15 minutes et réessaie.",
    challengeEmailMissing: "Envoie d’abord le code par e-mail.",
    challengeEmailExpired: "Le code e-mail a expiré. Demande-en un nouveau.",
    challengeMethodNotLinked: "Cette méthode n’est pas liée à ton compte.",
    challengeEmailServerMisconfig:
      "2FA e-mail non configurée sur le serveur. Vérifie Resend/variables.",
    challengeDecryptFailed:
      "Impossible de déchiffrer le secret 2FA sur le serveur. Reconfigure la 2FA ou vérifie TOTP_ENCRYPTION_KEY.",
    challengeInvalidWithRecovery:
      "Nous n’avons pas pu valider le code. Utilise un code de récupération ou le support.",
    challengeInvalidCode: "Code 2FA invalide ou expiré.",
    challengeVerifyFailed: "Impossible de vérifier la 2FA.",
  },
  de: {
    manageTitle: "2FA-Sicherheit einrichten",
    challengeTitle: "2FA-Verifizierung erforderlich",
    closeDialogAria: "2FA-Dialog schließen",
    challengeIntroTotp:
      "Um fortzufahren, verifiziere dein Konto mit Authenticator (TOTP).",
    challengeIntroEmail: "Um fortzufahren, verifiziere dein Konto per E-Mail-Code.",
    setupMenuHint: "Wähle eine Methode und richte sie Schritt für Schritt ein.",
    setupTotpOnlyHint:
      "Nur Authenticator (TOTP). Nutze „Andere Methode wählen“ für E-Mail.",
    setupEmailOnlyHint:
      "Nur E-Mail-Verifizierung. Nutze „Andere Methode wählen“ für Authenticator.",
    badgeEmailCode: "E-Mail-Code",
    badgeTotp: "Authenticator (TOTP)",
    authenticatorTotp: "Authenticator (TOTP)",
    emailCode: "E-Mail-Code",
    chooseAnotherMethod: "← Andere Methode wählen",
    totpPlaceholderShort: "TOTP-Code (6 Ziffern)",
    totpSetupSteps:
      "1) „QR generieren“ tippen  2) Mit Authenticator-App scannen  3) 6-stelligen Code eingeben.",
    preparing: "Wird vorbereitet...",
    generateQr: "QR generieren",
    totpPlaceholderLong: "6-stelliger TOTP-Code",
    verify: "Verifizieren",
    challengeEmailBeforeSend:
      "„E-Mail-Code senden“ tippen und Posteingang (und Spam) prüfen. Dann die 6 Ziffern eingeben.",
    sendEmailHintManage:
      "„E-Mail-Code senden“ tippen, Posteingang prüfen und 6-stelligen Code eingeben.",
    sending: "Wird gesendet...",
    sendEmailCode: "E-Mail-Code senden",
    emailCodePlaceholder: "E-Mail-Code (6 Ziffern)",
    verifyEmail: "E-Mail verifizieren",
    recoveryOptionsIntro:
      "Verifizierung nicht möglich? Nutze Wiederherstellungscodes oder den Support.",
    iHaveRecoveryCodes: "Ich habe meine Wiederherstellungscodes",
    iDontHaveRecoveryCodes: "Ich habe keine Wiederherstellungscodes",
    recoveryCodePlaceholder: "Wiederherstellungscode",
    supportRecoveryBody:
      "Zum Wiederherstellen schreibe vom registrierten E-Mail-Konto an den Support. Wir senden Schritte zur Inhaberschaftsprüfung.",
    supportRecoverySubject: "2FA-Kontowiederherstellung",
    supportMailBody:
      "Hallo Support,\n\nIch habe keine Wiederherstellungscodes und brauche Kontozugang.\nKonto-E-Mail: {{email}}\n\nDanke.",
    contactSupportEmail: "Support per E-Mail kontaktieren",
    recoveryCodesShownOnce:
      "Wiederherstellungscodes (nur einmal sichtbar). Sicher aufbewahren:",
    recoveryAckCheckbox:
      "Ich habe die Codes gespeichert und verstehe, dass sie nicht erneut angezeigt werden.",
    infoTwoFaEnabledSaveCodes: "2FA aktiviert. Speichere diese Codes vor dem Schließen.",
    acceptAndClose: "Akzeptieren und schließen",
    modalAfterSaveCodes: "2FA erfolgreich eingerichtet.",
    validateRecoveryCode: "Wiederherstellungscode prüfen",
    continueWithVerification: "Mit Verifizierung fortfahren",
    cannotVerifyLink: "Verifizierung nicht möglich?",
    tryCodeAgain: "Erneut mit Code versuchen",
    verify2faToContinue: "Bitte 2FA verifizieren, um fortzufahren.",
    twoFaRequiredByPolicy:
      "In dieser Umgebung ist 2FA Pflicht. Aktiviere sie unter Optionen > Sicherheit.",
    signInFor2fa: "Melde dich an, um die Zwei-Schritt-Verifizierung einzurichten.",
    enrollEncryptionKeyMissing:
      "2FA auf dem Server nicht aktiv: TOTP_ENCRYPTION_KEY fehlt.",
    enrollAuthProviderMissing: "2FA nicht verfügbar: Supabase ist auf dem Server nicht konfiguriert.",
    enrollTryLater: "2FA konnte jetzt nicht gestartet werden. Bitte später erneut versuchen.",
    confirmNotEnrolled: "Aktiviere zuerst 2FA mit Authenticator, um den QR zu erzeugen.",
    confirmEncryptionKeyMissing:
      "2FA auf dem Server nicht aktiv: TOTP_ENCRYPTION_KEY fehlt.",
    confirmDecryptFailed: "2FA-Geheimnis konnte auf dem Server nicht entschlüsselt werden. 2FA neu einrichten.",
    confirmTotpInvalid:
      "Ungültiger oder abgelaufener 2FA-Code. Authenticator-App prüfen und erneut versuchen.",
    confirmTryLater: "2FA konnte jetzt nicht verifiziert werden. Bitte erneut versuchen.",
    sendSessionExpired: "Sitzung abgelaufen. Bitte erneut anmelden.",
    sendLocked:
      "2FA nach Fehlversuchen vorübergehend gesperrt. 15 Minuten warten und erneut versuchen.",
    sendEmailNotConfiguredServer:
      "E-Mail-2FA auf dem Server nicht aktiv. Prüfe RESEND_API_KEY, TWO_FACTOR_EMAIL_FROM und TWO_FACTOR_EMAIL_CODE_SECRET.",
    emailDeliveryFailedReason: "E-Mail-Code konnte nicht gesendet werden: {{reason}}",
    emailDeliveryFailedResendHint:
      "E-Mail-Code konnte nicht gesendet werden. Prüfe TWO_FACTOR_EMAIL_FROM in Resend und den API-Key.",
    sendTryLater: "E-Mail-Code konnte nicht gesendet werden. Bitte erneut versuchen.",
    infoCodeSent: "Code per E-Mail gesendet. Posteingang und Spam prüfen.",
    verifyEmailExpired: "E-Mail-Code abgelaufen. Neu anfordern.",
    verifyEmailRequestFirst: "Zuerst den E-Mail-Code anfordern.",
    verifyEmailInvalid: "Ungültiger E-Mail-Code. Posteingang prüfen und erneut versuchen.",
    verifyEmailTryLater: "E-Mail-Code konnte nicht verifiziert werden. Bitte erneut versuchen.",
    disableFailed: "2FA konnte nicht deaktiviert werden.",
    disabledOk: "2FA deaktiviert.",
    challengeNeedRecovery: "Gültigen Wiederherstellungscode eingeben.",
    challengeNeedSixDigit: "Gültigen 6-stelligen Code eingeben.",
    challengeSessionExpired: "Sitzung abgelaufen. Bitte erneut anmelden.",
    challengeLocked:
      "2FA nach Fehlversuchen vorübergehend gesperrt. 15 Minuten warten und erneut versuchen.",
    challengeEmailMissing: "Zuerst den E-Mail-Code senden.",
    challengeEmailExpired: "E-Mail-Code abgelaufen. Neu anfordern.",
    challengeMethodNotLinked: "Diese Methode ist mit deinem Konto nicht verknüpft.",
    challengeEmailServerMisconfig:
      "E-Mail-2FA auf dem Server nicht konfiguriert. Resend/Umgebungsvariablen prüfen.",
    challengeDecryptFailed:
      "2FA-Geheimnis konnte nicht entschlüsselt werden. 2FA neu einrichten oder TOTP_ENCRYPTION_KEY prüfen.",
    challengeInvalidWithRecovery:
      "Code konnte nicht bestätigt werden. Wiederherstellungscode oder Support nutzen.",
    challengeInvalidCode: "Ungültiger oder abgelaufener 2FA-Code.",
    challengeVerifyFailed: "2FA konnte nicht verifiziert werden.",
  },
  it: {
    manageTitle: "Configurazione sicurezza 2FA",
    challengeTitle: "Verifica 2FA richiesta",
    closeDialogAria: "Chiudi finestra 2FA",
    challengeIntroTotp:
      "Per continuare in questa sessione, verifica l’account con Authenticator (TOTP).",
    challengeIntroEmail: "Per continuare in questa sessione, verifica l’account con codice email.",
    setupMenuHint: "Scegli un metodo e configuralo passo dopo passo.",
    setupTotpOnlyHint:
      "Solo Authenticator (TOTP). Usa «Scegli un altro metodo» per l’email.",
    setupEmailOnlyHint:
      "Solo verifica email. Usa «Scegli un altro metodo» per Authenticator.",
    badgeEmailCode: "Codice email",
    badgeTotp: "Authenticator (TOTP)",
    authenticatorTotp: "Authenticator (TOTP)",
    emailCode: "Codice email",
    chooseAnotherMethod: "← Scegli un altro metodo",
    totpPlaceholderShort: "Codice TOTP (6 cifre)",
    totpSetupSteps:
      "1) Tocca «Genera QR»  2) Scansiona con l’app Authenticator  3) Inserisci il codice a 6 cifre.",
    preparing: "Preparazione...",
    generateQr: "Genera QR",
    totpPlaceholderLong: "Codice TOTP a 6 cifre",
    verify: "Verifica",
    challengeEmailBeforeSend:
      "Tocca «Invia codice email» e controlla posta e spam. Poi inserisci le 6 cifre.",
    sendEmailHintManage:
      "Tocca «Invia codice email», controlla la posta e inserisci il codice a 6 cifre.",
    sending: "Invio...",
    sendEmailCode: "Invia codice email",
    emailCodePlaceholder: "Codice email (6 cifre)",
    verifyEmail: "Verifica email",
    recoveryOptionsIntro:
      "Non riesci a verificare? Usa i codici di recupero o contatta il supporto.",
    iHaveRecoveryCodes: "Ho i miei codici di recupero",
    iDontHaveRecoveryCodes: "Non ho i miei codici",
    recoveryCodePlaceholder: "Codice di recupero",
    supportRecoveryBody:
      "Per recuperare l’accesso, scrivi al supporto dall’email registrata. Invieremo passaggi per verificare la titolarità.",
    supportRecoverySubject: "Recupero account 2FA",
    supportMailBody:
      "Ciao supporto,\n\nNon ho i codici di recupero e devo ripristinare l’accesso.\nEmail account: {{email}}\n\nGrazie.",
    contactSupportEmail: "Contatta il supporto via email",
    recoveryCodesShownOnce:
      "Codici di recupero (mostrati una sola volta). Salvali in un posto sicuro:",
    recoveryAckCheckbox:
      "Ho salvato i codici e capisco che non verranno mostrati di nuovo.",
    infoTwoFaEnabledSaveCodes: "2FA attivata. Salva questi codici prima di chiudere.",
    acceptAndClose: "Accetta e chiudi",
    modalAfterSaveCodes: "2FA configurata correttamente.",
    validateRecoveryCode: "Valida codice di recupero",
    continueWithVerification: "Continua con la verifica",
    cannotVerifyLink: "Non riesci a verificare?",
    tryCodeAgain: "Riprova con il codice",
    verify2faToContinue: "Verifica la 2FA per continuare.",
    twoFaRequiredByPolicy:
      "Il tuo account richiede la 2FA in questo ambiente. Attivala in Opzioni > Sicurezza.",
    signInFor2fa: "Accedi per configurare la verifica in due passaggi.",
    enrollEncryptionKeyMissing:
      "2FA non attiva sul server: manca TOTP_ENCRYPTION_KEY.",
    enrollAuthProviderMissing: "2FA non disponibile: Supabase non configurato sul server.",
    enrollTryLater: "Impossibile avviare la 2FA ora. Riprova tra qualche minuto.",
    confirmNotEnrolled: "Attiva prima la 2FA con Authenticator per generare il QR.",
    confirmEncryptionKeyMissing:
      "2FA non attiva sul server: manca TOTP_ENCRYPTION_KEY.",
    confirmDecryptFailed: "Impossibile decifrare il segreto 2FA sul server. Riconfigura la 2FA.",
    confirmTotpInvalid:
      "Codice 2FA non valido o scaduto. Controlla l’app Authenticator e riprova.",
    confirmTryLater: "Impossibile verificare la 2FA ora. Riprova.",
    sendSessionExpired: "Sessione scaduta. Accedi di nuovo.",
    sendLocked:
      "2FA temporaneamente bloccata dopo tentativi falliti. Attendi 15 minuti e riprova.",
    sendEmailNotConfiguredServer:
      "2FA email non attiva sul server. Controlla RESEND_API_KEY, TWO_FACTOR_EMAIL_FROM e TWO_FACTOR_EMAIL_CODE_SECRET.",
    emailDeliveryFailedReason: "Impossibile inviare il codice email: {{reason}}",
    emailDeliveryFailedResendHint:
      "Impossibile inviare il codice email. Verifica TWO_FACTOR_EMAIL_FROM su Resend e la API key.",
    sendTryLater: "Impossibile inviare il codice email. Riprova.",
    infoCodeSent: "Codice inviato via email. Controlla posta e spam.",
    verifyEmailExpired: "Codice email scaduto. Richiedine uno nuovo.",
    verifyEmailRequestFirst: "Richiedi prima il codice email.",
    verifyEmailInvalid: "Codice email non valido. Controlla la posta e riprova.",
    verifyEmailTryLater: "Impossibile verificare il codice email. Riprova.",
    disableFailed: "Impossibile disattivare la 2FA.",
    disabledOk: "2FA disattivata.",
    challengeNeedRecovery: "Inserisci un codice di recupero valido.",
    challengeNeedSixDigit: "Inserisci un codice valido a 6 cifre.",
    challengeSessionExpired: "Sessione scaduta. Accedi di nuovo.",
    challengeLocked:
      "2FA temporaneamente bloccata dopo tentativi falliti. Attendi 15 minuti e riprova.",
    challengeEmailMissing: "Invia prima il codice email.",
    challengeEmailExpired: "Codice email scaduto. Richiedine uno nuovo.",
    challengeMethodNotLinked: "Questo metodo non è collegato al tuo account.",
    challengeEmailServerMisconfig:
      "2FA email non configurata sul server. Controlla Resend/variabili.",
    challengeDecryptFailed:
      "Impossibile decifrare il segreto 2FA sul server. Riconfigura la 2FA o controlla TOTP_ENCRYPTION_KEY.",
    challengeInvalidWithRecovery:
      "Non abbiamo potuto validare il codice. Usa un codice di recupero o il supporto.",
    challengeInvalidCode: "Codice 2FA non valido o scaduto.",
    challengeVerifyFailed: "Impossibile verificare la 2FA.",
  },
  ja: {
    manageTitle: "2FAセキュリティ設定",
    challengeTitle: "2FA確認が必要です",
    closeDialogAria: "2FAダイアログを閉じる",
    challengeIntroTotp: "このセッションを続けるには、Authenticator（TOTP）で確認してください。",
    challengeIntroEmail: "このセッションを続けるには、メールコードで確認してください。",
    setupMenuHint: "方法を1つ選び、手順どおりに設定してください。",
    setupTotpOnlyHint:
      "Authenticator（TOTP）のみ。メールの場合は「別の方法を選ぶ」を使ってください。",
    setupEmailOnlyHint:
      "メール確認のみ。Authenticatorの場合は「別の方法を選ぶ」を使ってください。",
    badgeEmailCode: "メールコード",
    badgeTotp: "Authenticator（TOTP）",
    authenticatorTotp: "Authenticator（TOTP）",
    emailCode: "メールコード",
    chooseAnotherMethod: "← 別の方法を選ぶ",
    totpPlaceholderShort: "TOTPコード（6桁）",
    totpSetupSteps:
      "1) 「QRを生成」をタップ  2) Authenticatorアプリでスキャン  3) 6桁のコードを入力",
    preparing: "準備中...",
    generateQr: "QRを生成",
    totpPlaceholderLong: "6桁のTOTPコード",
    verify: "確認",
    challengeEmailBeforeSend:
      "「メールでコードを送信」をタップし、受信トレイ（と迷惑メール）を確認してから6桁を入力してください。",
    sendEmailHintManage:
      "「メールでコードを送信」をタップし、受信トレイを確認して6桁のコードを入力してください。",
    sending: "送信中...",
    sendEmailCode: "メールでコードを送信",
    emailCodePlaceholder: "メールコード（6桁）",
    verifyEmail: "メールを確認",
    recoveryOptionsIntro:
      "確認できませんか？リカバリコードを使うか、サポートによる復旧を開始してください。",
    iHaveRecoveryCodes: "リカバリコードを持っている",
    iDontHaveRecoveryCodes: "リカバリコードがない",
    recoveryCodePlaceholder: "リカバリコード",
    supportRecoveryBody:
      "アクセスを回復するには、登録メールからサポートに連絡してください。本人確認の手順をお送りします。",
    supportRecoverySubject: "2FAアカウント復旧",
    supportMailBody:
      "サポート担当者様\n\nリカバリコードがなく、アカウントへのアクセスを回復したいです。\nアカウントメール: {{email}}\n\nよろしくお願いします。",
    contactSupportEmail: "メールでサポートに連絡",
    recoveryCodesShownOnce:
      "リカバリコード（一度だけ表示）。安全な場所に保存してください:",
    recoveryAckCheckbox:
      "リカバリコードを保存し、再表示されないことを理解しました。",
    infoTwoFaEnabledSaveCodes: "2FAを有効にしました。閉じる前にこれらのコードを保存してください。",
    acceptAndClose: "了解して閉じる",
    modalAfterSaveCodes: "2FAの設定が完了しました。",
    validateRecoveryCode: "リカバリコードを確認",
    continueWithVerification: "確認を続ける",
    cannotVerifyLink: "確認できませんか？",
    tryCodeAgain: "コードでもう一度試す",
    verify2faToContinue: "続けるには2FAを確認してください。",
    twoFaRequiredByPolicy:
      "この環境では2FAが必須です。オプション > セキュリティで有効にしてください。",
    signInFor2fa: "二段階認証を設定するにはサインインしてください。",
    enrollEncryptionKeyMissing:
      "サーバーで2FAが有効ではありません: TOTP_ENCRYPTION_KEY がありません。",
    enrollAuthProviderMissing: "2FAを利用できません: サーバーにSupabase設定がありません。",
    enrollTryLater: "2FAを開始できませんでした。数分後にもう一度お試しください。",
    confirmNotEnrolled: "まずAuthenticatorで2FAを有効にしてQRを生成してください。",
    confirmEncryptionKeyMissing:
      "サーバーで2FAが有効ではありません: TOTP_ENCRYPTION_KEY がありません。",
    confirmDecryptFailed: "サーバーで2FAシークレットを復号できませんでした。2FAを再設定してください。",
    confirmTotpInvalid:
      "2FAコードが無効または期限切れです。Authenticatorアプリを確認して再試行してください。",
    confirmTryLater: "2FAを確認できませんでした。再試行してください。",
    sendSessionExpired: "セッションの有効期限が切れました。再度サインインしてください。",
    sendLocked:
      "失敗が続いたため2FAが一時ロックされています。15分待ってから再試行してください。",
    sendEmailNotConfiguredServer:
      "サーバーでメール2FAが有効ではありません。RESEND_API_KEY、TWO_FACTOR_EMAIL_FROM、TWO_FACTOR_EMAIL_CODE_SECRETを確認してください。",
    emailDeliveryFailedReason: "メールコードを送信できませんでした: {{reason}}",
    emailDeliveryFailedResendHint:
      "メールコードを送信できませんでした。ResendでTWO_FACTOR_EMAIL_FROMが検証済みか、APIキーが正しいか確認してください。",
    sendTryLater: "メールコードを送信できませんでした。再試行してください。",
    infoCodeSent: "メールでコードを送信しました。受信トレイと迷惑メールを確認してください。",
    verifyEmailExpired: "メールコードの期限が切れました。新しく請求してください。",
    verifyEmailRequestFirst: "先にメールコードを請求してください。",
    verifyEmailInvalid: "メールコードが無効です。受信トレイを確認して再試行してください。",
    verifyEmailTryLater: "メールコードを確認できませんでした。再試行してください。",
    disableFailed: "2FAを無効にできませんでした。",
    disabledOk: "2FAを無効にしました。",
    challengeNeedRecovery: "有効なリカバリコードを入力してください。",
    challengeNeedSixDigit: "有効な6桁のコードを入力してください。",
    challengeSessionExpired: "セッションの有効期限が切れました。再度サインインしてください。",
    challengeLocked:
      "失敗が続いたため2FAが一時ロックされています。15分待ってから再試行してください。",
    challengeEmailMissing: "先にメールコードを送信してください。",
    challengeEmailExpired: "メールコードの期限が切れました。新しく請求してください。",
    challengeMethodNotLinked: "この方法はアカウントに紐づいていません。",
    challengeEmailServerMisconfig:
      "サーバーでメール2FAが設定されていません。Resend/環境変数を確認してください。",
    challengeDecryptFailed:
      "サーバーで2FAシークレットを復号できませんでした。2FAを再設定するかTOTP_ENCRYPTION_KEYを確認してください。",
    challengeInvalidWithRecovery:
      "コードを確認できませんでした。リカバリコードまたはサポート復旧を利用できます。",
    challengeInvalidCode: "2FAコードが無効または期限切れです。",
    challengeVerifyFailed: "2FAを確認できませんでした。",
  },
  zh: {
    manageTitle: "双重验证（2FA）安全设置",
    challengeTitle: "需要完成 2FA 验证",
    closeDialogAria: "关闭 2FA 窗口",
    challengeIntroTotp: "要继续此会话，请使用身份验证器（TOTP）验证账户。",
    challengeIntroEmail: "要继续此会话，请使用邮件验证码验证账户。",
    setupMenuHint: "选择一种方式并按步骤完成设置。",
    setupTotpOnlyHint: "仅身份验证器（TOTP）。若要用邮件，请选择「选择其他方式」。",
    setupEmailOnlyHint: "仅邮件验证。若要用身份验证器，请选择「选择其他方式」。",
    badgeEmailCode: "邮件验证码",
    badgeTotp: "身份验证器（TOTP）",
    authenticatorTotp: "身份验证器（TOTP）",
    emailCode: "邮件验证码",
    chooseAnotherMethod: "← 选择其他方式",
    totpPlaceholderShort: "TOTP 验证码（6 位）",
    totpSetupSteps: "1）点击「生成二维码」 2）用身份验证器应用扫描 3）输入 6 位验证码",
    preparing: "准备中...",
    generateQr: "生成二维码",
    totpPlaceholderLong: "6 位 TOTP 验证码",
    verify: "验证",
    challengeEmailBeforeSend: "点击「发送邮件验证码」，查看收件箱（及垃圾邮件），然后输入 6 位数字。",
    sendEmailHintManage: "点击「发送邮件验证码」，查看收件箱并输入 6 位验证码。",
    sending: "发送中...",
    sendEmailCode: "发送邮件验证码",
    emailCodePlaceholder: "邮件验证码（6 位）",
    verifyEmail: "验证邮件",
    recoveryOptionsIntro: "无法验证？使用恢复码或联系支持开始账户恢复。",
    iHaveRecoveryCodes: "我有恢复码",
    iDontHaveRecoveryCodes: "我没有恢复码",
    recoveryCodePlaceholder: "恢复码",
    supportRecoveryBody:
      "要恢复访问，请用注册邮箱联系支持。我们将发送身份验证步骤以恢复访问。",
    supportRecoverySubject: "2FA 账户恢复",
    supportMailBody:
      "您好支持团队，\n\n我没有恢复码，需要恢复账户访问。\n账户邮箱：{{email}}\n\n谢谢。",
    contactSupportEmail: "通过邮件联系支持",
    recoveryCodesShownOnce: "恢复码（仅显示一次）。请保存在安全位置：",
    recoveryAckCheckbox: "我已保存恢复码，并理解不会再次显示。",
    infoTwoFaEnabledSaveCodes: "已启用 2FA。关闭前请保存这些恢复码。",
    acceptAndClose: "确认并关闭",
    modalAfterSaveCodes: "2FA 已成功配置。",
    validateRecoveryCode: "验证恢复码",
    continueWithVerification: "继续验证",
    cannotVerifyLink: "无法验证？",
    tryCodeAgain: "用验证码重试",
    verify2faToContinue: "请完成 2FA 验证以继续。",
    twoFaRequiredByPolicy: "此环境要求启用 2FA。请在「选项 > 安全」中开启。",
    signInFor2fa: "请登录以设置两步验证。",
    enrollEncryptionKeyMissing: "服务器未启用 2FA：缺少 TOTP_ENCRYPTION_KEY。",
    enrollAuthProviderMissing: "2FA 不可用：服务器未配置 Supabase。",
    enrollTryLater: "暂时无法开始 2FA，请几分钟后再试。",
    confirmNotEnrolled: "请先用身份验证器启用 2FA 以生成二维码。",
    confirmEncryptionKeyMissing: "服务器未启用 2FA：缺少 TOTP_ENCRYPTION_KEY。",
    confirmDecryptFailed: "无法在服务器解密 2FA 密钥。请重新配置 2FA。",
    confirmTotpInvalid: "2FA 验证码无效或已过期。请检查身份验证器应用后重试。",
    confirmTryLater: "暂时无法验证 2FA，请重试。",
    sendSessionExpired: "会话已过期，请重新登录。",
    sendLocked: "多次失败后 2FA 已暂时锁定。请等待 15 分钟后再试。",
    sendEmailNotConfiguredServer:
      "服务器未启用邮件 2FA。请检查 RESEND_API_KEY、TWO_FACTOR_EMAIL_FROM 与 TWO_FACTOR_EMAIL_CODE_SECRET。",
    emailDeliveryFailedReason: "无法发送邮件验证码：{{reason}}",
    emailDeliveryFailedResendHint:
      "无法发送邮件验证码。请确认 TWO_FACTOR_EMAIL_FROM 已在 Resend 验证且 API 密钥正确。",
    sendTryLater: "无法发送邮件验证码，请重试。",
    infoCodeSent: "验证码已发送。请查看收件箱和垃圾邮件。",
    verifyEmailExpired: "邮件验证码已过期，请重新获取。",
    verifyEmailRequestFirst: "请先请求邮件验证码。",
    verifyEmailInvalid: "邮件验证码无效。请检查收件箱后重试。",
    verifyEmailTryLater: "无法验证邮件验证码，请重试。",
    disableFailed: "无法关闭 2FA。",
    disabledOk: "已关闭 2FA。",
    challengeNeedRecovery: "请输入有效的恢复码。",
    challengeNeedSixDigit: "请输入有效的 6 位验证码。",
    challengeSessionExpired: "会话已过期，请重新登录。",
    challengeLocked: "多次失败后 2FA 已暂时锁定。请等待 15 分钟后再试。",
    challengeEmailMissing: "请先发送邮件验证码。",
    challengeEmailExpired: "邮件验证码已过期，请重新获取。",
    challengeMethodNotLinked: "该方式未绑定到您的账户。",
    challengeEmailServerMisconfig: "服务器未配置邮件 2FA。请检查 Resend/环境变量。",
    challengeDecryptFailed:
      "无法在服务器解密 2FA 密钥。请重新配置 2FA 或检查 TOTP_ENCRYPTION_KEY。",
    challengeInvalidWithRecovery: "无法验证该码。可使用恢复码或联系支持恢复。",
    challengeInvalidCode: "2FA 验证码无效或已过期。",
    challengeVerifyFailed: "无法验证 2FA。",
  },
  ko: {
    manageTitle: "2FA 보안 설정",
    challengeTitle: "2FA 인증 필요",
    closeDialogAria: "2FA 창 닫기",
    challengeIntroTotp: "이 세션을 계속하려면 Authenticator(TOTP)로 계정을 확인하세요.",
    challengeIntroEmail: "이 세션을 계속하려면 이메일 코드로 계정을 확인하세요.",
    setupMenuHint: "방법 하나를 고르고 단계별로 설정하세요.",
    setupTotpOnlyHint:
      "Authenticator(TOTP)만 사용합니다. 이메일을 원하면 «다른 방법 선택»을 사용하세요.",
    setupEmailOnlyHint:
      "이메일 인증만 사용합니다. Authenticator를 원하면 «다른 방법 선택»을 사용하세요.",
    badgeEmailCode: "이메일 코드",
    badgeTotp: "Authenticator (TOTP)",
    authenticatorTotp: "Authenticator (TOTP)",
    emailCode: "이메일 코드",
    chooseAnotherMethod: "← 다른 방법 선택",
    totpPlaceholderShort: "TOTP 코드(6자리)",
    totpSetupSteps:
      "1) «QR 생성» 탭  2) Authenticator 앱으로 스캔  3) 6자리 코드 입력",
    preparing: "준비 중...",
    generateQr: "QR 생성",
    totpPlaceholderLong: "6자리 TOTP 코드",
    verify: "확인",
    challengeEmailBeforeSend:
      "«이메일로 코드 보내기»를 누르고 받은편지함(스팸 포함)을 확인한 뒤 6자리를 입력하세요.",
    sendEmailHintManage:
      "«이메일로 코드 보내기»를 누르고 받은편지함을 확인한 뒤 6자리 코드를 입력하세요.",
    sending: "보내는 중...",
    sendEmailCode: "이메일로 코드 보내기",
    emailCodePlaceholder: "이메일 코드(6자리)",
    verifyEmail: "이메일 확인",
    recoveryOptionsIntro:
      "인증이 어렵나요? 복구 코드를 사용하거나 지원 복구를 시작하세요.",
    iHaveRecoveryCodes: "복구 코드가 있습니다",
    iDontHaveRecoveryCodes: "복구 코드가 없습니다",
    recoveryCodePlaceholder: "복구 코드",
    supportRecoveryBody:
      "접근을 복구하려면 등록된 이메일로 지원팀에 문의하세요. 소유 확인 절차를 보내드립니다.",
    supportRecoverySubject: "2FA 계정 복구",
    supportMailBody:
      "지원팀 안녕하세요,\n\n복구 코드가 없어 계정 접근을 복구해야 합니다.\n계정 이메일: {{email}}\n\n감사합니다.",
    contactSupportEmail: "이메일로 지원 문의",
    recoveryCodesShownOnce:
      "복구 코드(한 번만 표시됩니다). 안전한 곳에 보관하세요:",
    recoveryAckCheckbox:
      "복구 코드를 저장했으며 다시 표시되지 않음을 이해합니다.",
    infoTwoFaEnabledSaveCodes: "2FA가 켜졌습니다. 닫기 전에 이 코드를 저장하세요.",
    acceptAndClose: "확인 후 닫기",
    modalAfterSaveCodes: "2FA 설정이 완료되었습니다.",
    validateRecoveryCode: "복구 코드 확인",
    continueWithVerification: "인증 계속",
    cannotVerifyLink: "인증이 안 되나요?",
    tryCodeAgain: "코드로 다시 시도",
    verify2faToContinue: "계속하려면 2FA를 확인하세요.",
    twoFaRequiredByPolicy:
      "이 환경에서는 2FA가 필요합니다. 옵션 > 보안에서 켜 주세요.",
    signInFor2fa: "2단계 인증을 설정하려면 로그인하세요.",
    enrollEncryptionKeyMissing:
      "서버에서 2FA가 켜져 있지 않습니다: TOTP_ENCRYPTION_KEY가 없습니다.",
    enrollAuthProviderMissing: "2FA를 사용할 수 없습니다: 서버에 Supabase 설정이 없습니다.",
    enrollTryLater: "지금은 2FA를 시작할 수 없습니다. 잠시 후 다시 시도하세요.",
    confirmNotEnrolled: "먼저 Authenticator로 2FA를 켜 QR을 생성하세요.",
    confirmEncryptionKeyMissing:
      "서버에서 2FA가 켜져 있지 않습니다: TOTP_ENCRYPTION_KEY가 없습니다.",
    confirmDecryptFailed: "서버에서 2FA 비밀을 복호화할 수 없습니다. 2FA를 다시 설정하세요.",
    confirmTotpInvalid:
      "2FA 코드가 잘못되었거나 만료되었습니다. Authenticator 앱을 확인 후 다시 시도하세요.",
    confirmTryLater: "지금은 2FA를 확인할 수 없습니다. 다시 시도하세요.",
    sendSessionExpired: "세션이 만료되었습니다. 다시 로그인하세요.",
    sendLocked:
      "실패가 반복되어 2FA가 일시 잠겼습니다. 15분 후 다시 시도하세요.",
    sendEmailNotConfiguredServer:
      "서버에서 이메일 2FA가 켜져 있지 않습니다. RESEND_API_KEY, TWO_FACTOR_EMAIL_FROM, TWO_FACTOR_EMAIL_CODE_SECRET을 확인하세요.",
    emailDeliveryFailedReason: "이메일 코드를 보낼 수 없습니다: {{reason}}",
    emailDeliveryFailedResendHint:
      "이메일 코드를 보낼 수 없습니다. Resend에서 TWO_FACTOR_EMAIL_FROM이 검증되었는지와 API 키가 맞는지 확인하세요.",
    sendTryLater: "이메일 코드를 보낼 수 없습니다. 다시 시도하세요.",
    infoCodeSent: "이메일로 코드를 보냈습니다. 받은편지함과 스팸을 확인하세요.",
    verifyEmailExpired: "이메일 코드가 만료되었습니다. 새로 요청하세요.",
    verifyEmailRequestFirst: "먼저 이메일 코드를 요청하세요.",
    verifyEmailInvalid: "이메일 코드가 올바르지 않습니다. 받은편지함을 확인 후 다시 시도하세요.",
    verifyEmailTryLater: "이메일 코드를 확인할 수 없습니다. 다시 시도하세요.",
    disableFailed: "2FA를 끌 수 없습니다.",
    disabledOk: "2FA가 꺼졌습니다.",
    challengeNeedRecovery: "유효한 복구 코드를 입력하세요.",
    challengeNeedSixDigit: "유효한 6자리 코드를 입력하세요.",
    challengeSessionExpired: "세션이 만료되었습니다. 다시 로그인하세요.",
    challengeLocked:
      "실패가 반복되어 2FA가 일시 잠겼습니다. 15분 후 다시 시도하세요.",
    challengeEmailMissing: "먼저 이메일 코드를 보내세요.",
    challengeEmailExpired: "이메일 코드가 만료되었습니다. 새로 요청하세요.",
    challengeMethodNotLinked: "이 방법은 계정에 연결되어 있지 않습니다.",
    challengeEmailServerMisconfig:
      "서버에 이메일 2FA가 설정되어 있지 않습니다. Resend/환경 변수를 확인하세요.",
    challengeDecryptFailed:
      "서버에서 2FA 비밀을 복호화할 수 없습니다. 2FA를 다시 설정하거나 TOTP_ENCRYPTION_KEY를 확인하세요.",
    challengeInvalidWithRecovery:
      "코드를 확인할 수 없습니다. 복구 코드를 사용하거나 지원 복구를 시작할 수 있습니다.",
    challengeInvalidCode: "2FA 코드가 잘못되었거나 만료되었습니다.",
    challengeVerifyFailed: "2FA를 확인할 수 없습니다.",
  },
};

export function getTwoFactorUiMessages(locale: AppLocale): TwoFactorUiMessages {
  return TWO_FACTOR_UI[locale] ?? TWO_FACTOR_UI[DEFAULT_LOCALE];
}

export function formatTwoFactorSupportMailBody(m: TwoFactorUiMessages, email: string): string {
  return interpolate(m.supportMailBody, { email });
}
