import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";
import { interpolate } from "./interpolate.js";

export type LoginPageUiMessages = {
  configErrorTitle: string;
  configErrorBody: string;
  brandSubtitle: string;
  tablistAria: string;
  signInTab: string;
  signUpTab: string;
  signInLead: string;
  signUpLead: string;
  emailLabel: string;
  passwordLabel: string;
  emailPlaceholder: string;
  passwordPlaceholderSignin: string;
  passwordPlaceholderSignup: string;
  forgotPassword: string;
  resendConfirmation: string;
  signingIn: string;
  signInSubmit: string;
  sending: string;
  registerSubmit: string;
  dividerOr: string;
  continueGoogle: string;
  legalConsentTitle: string;
  legalConsentIntro: string;
  legalConsentPendingScroll: string;
  legalConsentReady: string;
  legalConsentAccept: string;
  legalConsentCloseAria: string;
  legalConsentRequired: string;
  backToOracle: string;
  closeModalAria: string;
  modalVerifyTitle: string;
  modalExistsTitle: string;
  modalVerifyLine1: string;
  modalVerifyLine2: string;
  modalExistsLine1: string;
  modalExistsLine2: string;
  modalOk: string;
  errEmailNotConfirmed: string;
  errResendNeedEmail: string;
  errResetNeedEmail: string;
  msgResendOk: string;
  msgResetOk: string;
  errNetwork: string;
  errInvalidPayload: string;
  errRateLimited: string;
  errTurnstileFailed: string;
  errDisposableEmail: string;
  errEmailValidation: string;
  errSignUpFailedDefault: string;
  errEmailExistsDefault: string;
  errSupabaseNotConfigured: string;
  errRegisterDefault: string;
  errWeakPassword: string;
  errSignupDisabled: string;
  errSignupConfirmationFailed: string;
  errLegalConsentStoreFailed: string;
  errSignupAuthInternalError: string;
  showPasswordAria: string;
  hidePasswordAria: string;
};

const LOGIN_PAGE_UI: Record<AppLocale, LoginPageUiMessages> = {
  es: {
    configErrorTitle: "Acceso no disponible",
    configErrorBody: "Faltan {{urlKey}} o {{anonKey}} en el cliente.",
    brandSubtitle: "Lectura clásica con Zhu Xi y Wilhelm/Baynes.",
    tablistAria: "Acceso",
    signInTab: "Iniciar sesión",
    signUpTab: "Crear cuenta",
    signInLead:
      "Entra con el correo con el que te registraste (tras confirmar el enlace).",
    signUpLead:
      "Registro con validación de correo. Te pedimos una contraseña segura (mín. 8 caracteres).",
    emailLabel: "Correo electrónico",
    passwordLabel: "Contraseña",
    emailPlaceholder: "tu@correo.com",
    passwordPlaceholderSignin: "••••••••",
    passwordPlaceholderSignup: "Mínimo 8 caracteres",
    forgotPassword: "Olvidé mi contraseña",
    resendConfirmation: "Reenviar confirmación",
    signingIn: "Entrando…",
    signInSubmit: "Entrar",
    sending: "Enviando…",
    registerSubmit: "Registrarme",
    dividerOr: "o",
    continueGoogle: "Continuar con Google",
    legalConsentTitle: "Antes de crear tu cuenta",
    legalConsentIntro:
      "Para crear tu cuenta debes leer y aceptar la Política de Privacidad y los Términos del Servicio.",
    legalConsentPendingScroll:
      "Desplázate hasta el final para habilitar la aceptación.",
    legalConsentReady: "Ya puedes aceptar y continuar.",
    legalConsentAccept: "Aceptar y continuar",
    legalConsentCloseAria: "Cerrar ventana de aceptación",
    legalConsentRequired:
      "Debes aceptar la Política de Privacidad y los Términos del Servicio para crear tu cuenta.",
    backToOracle: "← Volver al oráculo",
    closeModalAria: "Cerrar",
    modalVerifyTitle: "Verifica tu cuenta por correo",
    modalExistsTitle: "Correo ya registrado",
    modalVerifyLine1: "Te enviamos un enlace de verificación a",
    modalVerifyLine2:
      "Abre tu correo, busca el mensaje (revisa spam/no deseado) y haz clic en el enlace para activar tu cuenta.",
    modalExistsLine1: "El correo",
    modalExistsLine2: "ya está registrado. Inicia sesión con ese correo.",
    modalOk: "Entendido",
    errEmailNotConfirmed:
      "Tu correo aún no está confirmado. Revisa tu bandeja y usa «Reenviar confirmación» si no lo recibiste.",
    errResendNeedEmail: "Escribe tu correo para reenviar la confirmación.",
    errResetNeedEmail:
      "Escribe tu correo para enviarte las instrucciones de restablecimiento.",
    msgResendOk:
      "Reenviamos el correo de confirmación. Revisa también tu carpeta de spam/no deseado.",
    msgResetOk:
      "Te enviamos instrucciones para restablecer tu contraseña. Revisa tu bandeja y spam/no deseado.",
    errNetwork: "Error de red. Inténtalo de nuevo.",
    errInvalidPayload: "Revisa el correo y la contraseña (mínimos requeridos).",
    errRateLimited:
      "Demasiados intentos desde esta red. Espera un poco e inténtalo de nuevo.",
    errTurnstileFailed:
      "Verificación anti‑bots fallida. Recarga la página e inténtalo de nuevo.",
    errDisposableEmail: "No se aceptan correos temporales o desechables.",
    errEmailValidation: "El correo no pasó la validación (dominio o MX).",
    errSignUpFailedDefault:
      "No se pudo crear la cuenta (¿correo ya registrado?).",
    errEmailExistsDefault:
      "Ese correo ya está registrado. Inicia sesión, reenvía confirmación o restablece contraseña.",
    errSupabaseNotConfigured: "El servidor no tiene Supabase configurado.",
    errRegisterDefault: "No se pudo registrar. Inténtalo de nuevo.",
    errWeakPassword:
      "La contraseña no cumple las reglas (mín. 8 caracteres, una mayúscula y un número). Si Supabase la rechaza por ser débil, elige otra más larga o distinta.",
    errSignupDisabled:
      "El registro por correo está deshabilitado en el servidor. Prueba «Continuar con Google» o contacta soporte.",
    errSignupConfirmationFailed:
      "No pudimos enviar el correo de confirmación (SMTP o límites del proveedor). Reintenta más tarde o usa «Continuar con Google» si ya registraste ese correo.",
    errLegalConsentStoreFailed:
      "La cuenta se creó pero no pudimos guardar la aceptación legal en la base de datos. Contacta soporte; puede hacer falta una migración o permisos en Supabase.",
    errSignupAuthInternalError:
      "Supabase Auth devolvió un fallo interno (unexpected_failure). Suele ser un trigger en la base al crear el usuario (p. ej. public.users o tokens). En el panel: Logs → Postgres; revisa errores al insertar en auth.users. Si ya usaste este correo con Google, inicia sesión con Google.",
    showPasswordAria: "Mostrar contraseña",
    hidePasswordAria: "Ocultar contraseña",
  },
  en: {
    configErrorTitle: "Sign-in unavailable",
    configErrorBody: "Missing {{urlKey}} or {{anonKey}} in the client.",
    brandSubtitle: "Classical reading with Zhu Xi and Wilhelm/Baynes.",
    tablistAria: "Sign in",
    signInTab: "Sign in",
    signUpTab: "Create account",
    signInLead:
      "Use the email you registered with (after confirming the link).",
    signUpLead:
      "Email verification required. Choose a strong password (min. 8 characters).",
    emailLabel: "Email",
    passwordLabel: "Password",
    emailPlaceholder: "you@example.com",
    passwordPlaceholderSignin: "••••••••",
    passwordPlaceholderSignup: "At least 8 characters",
    forgotPassword: "Forgot password",
    resendConfirmation: "Resend confirmation",
    signingIn: "Signing in…",
    signInSubmit: "Sign in",
    sending: "Sending…",
    registerSubmit: "Register",
    dividerOr: "or",
    continueGoogle: "Continue with Google",
    legalConsentTitle: "Before you create your account",
    legalConsentIntro:
      "To create your account, you must read and accept the Privacy Policy and Terms of Service.",
    legalConsentPendingScroll: "Scroll to the end to enable acceptance.",
    legalConsentReady: "You can now accept and continue.",
    legalConsentAccept: "Accept and continue",
    legalConsentCloseAria: "Close acceptance dialog",
    legalConsentRequired:
      "You must accept the Privacy Policy and Terms of Service to create your account.",
    backToOracle: "← Back to oracle",
    closeModalAria: "Close",
    modalVerifyTitle: "Verify your email",
    modalExistsTitle: "Email already registered",
    modalVerifyLine1: "We sent a verification link to",
    modalVerifyLine2:
      "Open your inbox (check spam) and click the link to activate your account.",
    modalExistsLine1: "The email",
    modalExistsLine2: "is already registered. Sign in with that email.",
    modalOk: "OK",
    errEmailNotConfirmed:
      "Your email is not confirmed yet. Check your inbox or use “Resend confirmation”.",
    errResendNeedEmail: "Enter your email to resend confirmation.",
    errResetNeedEmail: "Enter your email to receive reset instructions.",
    msgResendOk: "We resent the confirmation email. Check spam/junk as well.",
    msgResetOk:
      "We sent password reset instructions. Check your inbox and spam/junk.",
    errNetwork: "Network error. Please try again.",
    errInvalidPayload: "Check email and password (minimum requirements).",
    errRateLimited:
      "Too many attempts from this network. Wait a bit and try again.",
    errTurnstileFailed: "Bot check failed. Reload the page and try again.",
    errDisposableEmail:
      "Disposable or temporary email addresses are not accepted.",
    errEmailValidation: "Email did not pass validation (domain or MX).",
    errSignUpFailedDefault:
      "Could not create account (email already registered?).",
    errEmailExistsDefault:
      "That email is already registered. Sign in, resend confirmation, or reset password.",
    errSupabaseNotConfigured: "Supabase is not configured on the server.",
    errRegisterDefault: "Could not register. Please try again.",
    errWeakPassword:
      "Password does not meet the rules (min. 8 characters, one uppercase letter, one digit). If it is rejected as weak, choose a longer or different password.",
    errSignupDisabled:
      "Email sign-up is disabled on the server. Try “Continue with Google” or contact support.",
    errSignupConfirmationFailed:
      "We could not send the confirmation email (SMTP or provider limits). Try again later, or use “Continue with Google” if you already used this address.",
    errLegalConsentStoreFailed:
      "Your account was created but we could not store legal acceptance in the database. Contact support; a migration or Supabase permissions may be required.",
    errSignupAuthInternalError:
      "Supabase Auth returned an internal error (unexpected_failure). This is often a database trigger when creating the user (e.g. public.users or credits). In the dashboard: Logs → Postgres; look for errors on auth.users inserts. If you already use this email with Google, sign in with Google.",
    showPasswordAria: "Show password",
    hidePasswordAria: "Hide password",
  },
  pt: {
    configErrorTitle: "Acesso indisponível",
    configErrorBody: "Faltam {{urlKey}} ou {{anonKey}} no cliente.",
    brandSubtitle: "Leitura clássica com Zhu Xi e Wilhelm/Baynes.",
    tablistAria: "Acesso",
    signInTab: "Iniciar sessão",
    signUpTab: "Criar conta",
    signInLead:
      "Entra com o email com que te registaste (após confirmar a ligação).",
    signUpLead:
      "Registo com validação de email. Escolhe uma palavra-passe segura (mín. 8 caracteres).",
    emailLabel: "Email",
    passwordLabel: "Palavra-passe",
    emailPlaceholder: "tu@email.com",
    passwordPlaceholderSignin: "••••••••",
    passwordPlaceholderSignup: "Mínimo 8 caracteres",
    forgotPassword: "Esqueci a palavra-passe",
    resendConfirmation: "Reenviar confirmação",
    signingIn: "A entrar…",
    signInSubmit: "Entrar",
    sending: "A enviar…",
    registerSubmit: "Registar-me",
    dividerOr: "ou",
    continueGoogle: "Continuar com Google",
    legalConsentTitle: "Antes de criares a tua conta",
    legalConsentIntro:
      "Para criares a tua conta, deves ler e aceitar a Política de Privacidade e os Termos de Serviço.",
    legalConsentPendingScroll: "Desce até ao final para ativar a aceitação.",
    legalConsentReady: "Já podes aceitar e continuar.",
    legalConsentAccept: "Aceitar e continuar",
    legalConsentCloseAria: "Fechar janela de aceitação",
    legalConsentRequired:
      "Deves aceitar a Política de Privacidade e os Termos de Serviço para criar a conta.",
    backToOracle: "← Voltar ao oráculo",
    closeModalAria: "Fechar",
    modalVerifyTitle: "Verifica a tua conta por email",
    modalExistsTitle: "Email já registado",
    modalVerifyLine1: "Enviámos uma ligação de verificação para",
    modalVerifyLine2:
      "Abre o email (verifica spam) e clica na ligação para ativar a conta.",
    modalExistsLine1: "O email",
    modalExistsLine2: "já está registado. Inicia sessão com esse email.",
    modalOk: "Entendido",
    errEmailNotConfirmed:
      "O teu email ainda não foi confirmado. Verifica a caixa de entrada ou «Reenviar confirmação».",
    errResendNeedEmail: "Escreve o teu email para reenviar a confirmação.",
    errResetNeedEmail:
      "Escreve o teu email para receberes instruções de reposição.",
    msgResendOk: "Reenviámos o email de confirmação. Verifica também spam.",
    msgResetOk:
      "Enviámos instruções para repor a palavra-passe. Verifica inbox e spam.",
    errNetwork: "Erro de rede. Tenta novamente.",
    errInvalidPayload: "Verifica email e palavra-passe (requisitos mínimos).",
    errRateLimited: "Demasiadas tentativas desta rede. Espera e tenta de novo.",
    errTurnstileFailed: "Verificação anti-bot falhou. Recarrega a página.",
    errDisposableEmail: "Emails descartáveis ou temporários não são aceites.",
    errEmailValidation: "O email não passou na validação (domínio ou MX).",
    errSignUpFailedDefault:
      "Não foi possível criar a conta (email já registado?).",
    errEmailExistsDefault:
      "Esse email já está registado. Inicia sessão ou repõe a palavra-passe.",
    errSupabaseNotConfigured: "O servidor não tem Supabase configurado.",
    errRegisterDefault: "Não foi possível registar. Tenta novamente.",
    errWeakPassword:
      "A palavra-passe não cumpre as regras (mín. 8 caracteres, uma maiúscula e um dígito). Se for rejeitada por ser fraca, escolhe outra mais longa.",
    errSignupDisabled:
      "O registo por e-mail está desativado no servidor. Tenta «Continuar com Google» ou contacta o suporte.",
    errSignupConfirmationFailed:
      "Não foi possível enviar o e-mail de confirmação (SMTP ou limites do fornecedor). Tenta mais tarde ou usa «Continuar com Google» se já usaste este e-mail.",
    errLegalConsentStoreFailed:
      "A conta foi criada mas não foi possível guardar a aceitação legal na base de dados. Contacta o suporte; pode ser necessária uma migração ou permissões no Supabase.",
    errSignupAuthInternalError:
      "O Supabase Auth devolveu um erro interno (unexpected_failure). Muitas vezes é um trigger na base ao criar o utilizador. No painel: Logs → Postgres. Se já usaste este e-mail com o Google, inicia sessão com o Google.",
    showPasswordAria: "Mostrar palavra-passe",
    hidePasswordAria: "Ocultar palavra-passe",
  },
  fr: {
    configErrorTitle: "Connexion indisponible",
    configErrorBody: "Il manque {{urlKey}} ou {{anonKey}} côté client.",
    brandSubtitle: "Lecture classique avec Zhu Xi et Wilhelm/Baynes.",
    tablistAria: "Connexion",
    signInTab: "Se connecter",
    signUpTab: "Créer un compte",
    signInLead:
      "Utilisez l’e-mail avec lequel vous vous êtes inscrit (après confirmation).",
    signUpLead:
      "Vérification par e-mail. Mot de passe sécurisé (min. 8 caractères).",
    emailLabel: "E-mail",
    passwordLabel: "Mot de passe",
    emailPlaceholder: "vous@exemple.com",
    passwordPlaceholderSignin: "••••••••",
    passwordPlaceholderSignup: "Au moins 8 caractères",
    forgotPassword: "Mot de passe oublié",
    resendConfirmation: "Renvoyer la confirmation",
    signingIn: "Connexion…",
    signInSubmit: "Se connecter",
    sending: "Envoi…",
    registerSubmit: "M’inscrire",
    dividerOr: "ou",
    continueGoogle: "Continuer avec Google",
    legalConsentTitle: "Avant de créer votre compte",
    legalConsentIntro:
      "Pour créer votre compte, vous devez lire et accepter la Politique de confidentialité et les Conditions d'utilisation.",
    legalConsentPendingScroll:
      "Faites défiler jusqu'à la fin pour activer l'acceptation.",
    legalConsentReady: "Vous pouvez maintenant accepter et continuer.",
    legalConsentAccept: "Accepter et continuer",
    legalConsentCloseAria: "Fermer la fenêtre d'acceptation",
    legalConsentRequired:
      "Vous devez accepter la Politique de confidentialité et les Conditions d'utilisation pour créer votre compte.",
    backToOracle: "← Retour à l’oracle",
    closeModalAria: "Fermer",
    modalVerifyTitle: "Vérifiez votre e-mail",
    modalExistsTitle: "E-mail déjà enregistré",
    modalVerifyLine1: "Nous avons envoyé un lien de vérification à",
    modalVerifyLine2:
      "Ouvrez votre boîte (courrier indésirable inclus) et cliquez sur le lien.",
    modalExistsLine1: "L’e-mail",
    modalExistsLine2: "est déjà enregistré. Connectez-vous avec cet e-mail.",
    modalOk: "Compris",
    errEmailNotConfirmed:
      "Votre e-mail n’est pas encore confirmé. Vérifiez votre boîte ou renvoyez la confirmation.",
    errResendNeedEmail: "Saisissez votre e-mail pour renvoyer la confirmation.",
    errResetNeedEmail:
      "Saisissez votre e-mail pour recevoir les instructions de réinitialisation.",
    msgResendOk:
      "Nous avons renvoyé l’e-mail de confirmation. Vérifiez les spams.",
    msgResetOk:
      "Nous avons envoyé les instructions de réinitialisation. Vérifiez inbox et spam.",
    errNetwork: "Erreur réseau. Réessayez.",
    errInvalidPayload: "Vérifiez e-mail et mot de passe (exigences minimales).",
    errRateLimited: "Trop de tentatives. Patientez puis réessayez.",
    errTurnstileFailed: "Vérification anti-bot échouée. Rechargez la page.",
    errDisposableEmail: "Les e-mails jetables ne sont pas acceptés.",
    errEmailValidation: "L’e-mail n’a pas passé la validation (domaine ou MX).",
    errSignUpFailedDefault:
      "Impossible de créer le compte (e-mail déjà utilisé ?).",
    errEmailExistsDefault:
      "Cet e-mail est déjà enregistré. Connectez-vous ou réinitialisez le mot de passe.",
    errSupabaseNotConfigured: "Supabase n’est pas configuré sur le serveur.",
    errRegisterDefault: "Inscription impossible. Réessayez.",
    errWeakPassword:
      "Le mot de passe ne respecte pas les règles (min. 8 caractères, une majuscule et un chiffre). S’il est rejeté comme trop faible, choisissez-en un autre plus long.",
    errSignupDisabled:
      "L’inscription par e-mail est désactivée sur le serveur. Essayez « Continuer avec Google » ou contactez le support.",
    errSignupConfirmationFailed:
      "Impossible d’envoyer l’e-mail de confirmation (SMTP ou limites du fournisseur). Réessayez plus tard ou utilisez « Continuer avec Google » si cette adresse est déjà utilisée.",
    errLegalConsentStoreFailed:
      "Le compte a été créé mais l’acceptation légale n’a pas pu être enregistrée. Contactez le support ; une migration ou des droits Supabase peuvent être nécessaires.",
    errSignupAuthInternalError:
      "Supabase Auth a renvoyé une erreur interne (unexpected_failure), souvent due à un trigger lors de la création d’utilisateur. Tableau de bord : Logs → Postgres. Si vous utilisez déjà cet e-mail avec Google, connectez-vous avec Google.",
    showPasswordAria: "Afficher le mot de passe",
    hidePasswordAria: "Masquer le mot de passe",
  },
  de: {
    configErrorTitle: "Anmeldung nicht verfügbar",
    configErrorBody: "{{urlKey}} oder {{anonKey}} fehlen im Client.",
    brandSubtitle: "Klassische Lesung mit Zhu Xi und Wilhelm/Baynes.",
    tablistAria: "Anmeldung",
    signInTab: "Anmelden",
    signUpTab: "Konto erstellen",
    signInLead:
      "Mit der E-Mail anmelden, mit der Sie sich registriert haben (nach Bestätigung).",
    signUpLead:
      "Registrierung mit E-Mail-Bestätigung. Sicheres Passwort (mind. 8 Zeichen).",
    emailLabel: "E-Mail",
    passwordLabel: "Passwort",
    emailPlaceholder: "sie@beispiel.de",
    passwordPlaceholderSignin: "••••••••",
    passwordPlaceholderSignup: "Mindestens 8 Zeichen",
    forgotPassword: "Passwort vergessen",
    resendConfirmation: "Bestätigung erneut senden",
    signingIn: "Wird angemeldet…",
    signInSubmit: "Anmelden",
    sending: "Wird gesendet…",
    registerSubmit: "Registrieren",
    dividerOr: "oder",
    continueGoogle: "Mit Google fortfahren",
    legalConsentTitle: "Bevor Sie Ihr Konto anlegen",
    legalConsentIntro:
      "Um Ihr Konto zu erstellen, müssen Sie die Datenschutzerklärung und die Nutzungsbedingungen lesen und akzeptieren.",
    legalConsentPendingScroll:
      "Scrollen Sie bis zum Ende, um die Zustimmung zu aktivieren.",
    legalConsentReady: "Sie können jetzt akzeptieren und fortfahren.",
    legalConsentAccept: "Akzeptieren und fortfahren",
    legalConsentCloseAria: "Zustimmungsfenster schließen",
    legalConsentRequired:
      "Sie müssen Datenschutzerklärung und Nutzungsbedingungen akzeptieren, um Ihr Konto zu erstellen.",
    backToOracle: "← Zum Orakel",
    closeModalAria: "Schließen",
    modalVerifyTitle: "E-Mail bestätigen",
    modalExistsTitle: "E-Mail bereits registriert",
    modalVerifyLine1: "Wir haben einen Bestätigungslink gesendet an",
    modalVerifyLine2:
      "Öffnen Sie Ihr Postfach (Spam prüfen) und klicken Sie auf den Link.",
    modalExistsLine1: "Die E-Mail",
    modalExistsLine2: "ist bereits registriert. Melden Sie sich damit an.",
    modalOk: "Verstanden",
    errEmailNotConfirmed:
      "E-Mail noch nicht bestätigt. Posteingang prüfen oder Bestätigung erneut senden.",
    errResendNeedEmail: "E-Mail eingeben, um die Bestätigung erneut zu senden.",
    errResetNeedEmail: "E-Mail eingeben für Anweisungen zum Zurücksetzen.",
    msgResendOk: "Bestätigungs-E-Mail erneut gesendet. Spam-Ordner prüfen.",
    msgResetOk:
      "Anweisungen zum Zurücksetzen gesendet. Posteingang und Spam prüfen.",
    errNetwork: "Netzwerkfehler. Bitte erneut versuchen.",
    errInvalidPayload: "E-Mail und Passwort prüfen (Mindestanforderungen).",
    errRateLimited: "Zu viele Versuche. Kurz warten und erneut versuchen.",
    errTurnstileFailed: "Bot-Prüfung fehlgeschlagen. Seite neu laden.",
    errDisposableEmail: "Wegwerf-E-Mail-Adressen werden nicht akzeptiert.",
    errEmailValidation:
      "E-Mail hat die Validierung nicht bestanden (Domain oder MX).",
    errSignUpFailedDefault:
      "Konto konnte nicht erstellt werden (E-Mail schon registriert?).",
    errEmailExistsDefault:
      "Diese E-Mail ist bereits registriert. Anmelden oder Passwort zurücksetzen.",
    errSupabaseNotConfigured: "Supabase ist auf dem Server nicht konfiguriert.",
    errRegisterDefault: "Registrierung fehlgeschlagen. Bitte erneut versuchen.",
    errWeakPassword:
      "Das Passwort erfüllt die Regeln nicht (mind. 8 Zeichen, ein Großbuchstabe, eine Ziffer). Wenn es als zu schwach abgelehnt wird, wählen Sie ein längeres.",
    errSignupDisabled:
      "Die E-Mail-Registrierung ist auf dem Server deaktiviert. Versuchen Sie „Mit Google fortfahren“ oder kontaktieren Sie den Support.",
    errSignupConfirmationFailed:
      "Bestätigungs-E-Mail konnte nicht gesendet werden (SMTP oder Anbieterlimits). Später erneut versuchen oder „Mit Google fortfahren“, falls diese Adresse schon genutzt wurde.",
    errLegalConsentStoreFailed:
      "Das Konto wurde erstellt, aber die rechtliche Zustimmung konnte nicht in der Datenbank gespeichert werden. Bitte Support kontaktieren (Migration oder Supabase-Berechtigungen).",
    errSignupAuthInternalError:
      "Supabase Auth meldete einen internen Fehler (unexpected_failure), oft durch einen DB-Trigger bei der Nutzeranlage. Im Dashboard: Logs → Postgres. Wenn Sie diese E-Mail schon mit Google nutzen, mit Google anmelden.",
    showPasswordAria: "Passwort anzeigen",
    hidePasswordAria: "Passwort verbergen",
  },
  it: {
    configErrorTitle: "Accesso non disponibile",
    configErrorBody: "Mancano {{urlKey}} o {{anonKey}} nel client.",
    brandSubtitle: "Lettura classica con Zhu Xi e Wilhelm/Baynes.",
    tablistAria: "Accesso",
    signInTab: "Accedi",
    signUpTab: "Crea account",
    signInLead:
      "Usa l’email con cui ti sei registrato (dopo aver confermato il link).",
    signUpLead:
      "Registrazione con verifica email. Password sicura (min. 8 caratteri).",
    emailLabel: "Email",
    passwordLabel: "Password",
    emailPlaceholder: "tu@esempio.it",
    passwordPlaceholderSignin: "••••••••",
    passwordPlaceholderSignup: "Almeno 8 caratteri",
    forgotPassword: "Password dimenticata",
    resendConfirmation: "Reinvia conferma",
    signingIn: "Accesso in corso…",
    signInSubmit: "Accedi",
    sending: "Invio…",
    registerSubmit: "Registrati",
    dividerOr: "oppure",
    continueGoogle: "Continua con Google",
    legalConsentTitle: "Prima di creare il tuo account",
    legalConsentIntro:
      "Per creare il tuo account devi leggere e accettare l'Informativa sulla privacy e i Termini di servizio.",
    legalConsentPendingScroll:
      "Scorri fino alla fine per abilitare l'accettazione.",
    legalConsentReady: "Ora puoi accettare e continuare.",
    legalConsentAccept: "Accetta e continua",
    legalConsentCloseAria: "Chiudi la finestra di accettazione",
    legalConsentRequired:
      "Devi accettare l'Informativa sulla privacy e i Termini di servizio per creare l'account.",
    backToOracle: "← Torna all’oracolo",
    closeModalAria: "Chiudi",
    modalVerifyTitle: "Verifica la tua email",
    modalExistsTitle: "Email già registrata",
    modalVerifyLine1: "Abbiamo inviato un link di verifica a",
    modalVerifyLine2:
      "Apri la posta (controlla spam) e clicca sul link per attivare l’account.",
    modalExistsLine1: "L’email",
    modalExistsLine2: "è già registrata. Accedi con quell’email.",
    modalOk: "OK",
    errEmailNotConfirmed:
      "Email non ancora confermata. Controlla la posta o reinvia la conferma.",
    errResendNeedEmail: "Inserisci l’email per reinviare la conferma.",
    errResetNeedEmail: "Inserisci l’email per ricevere le istruzioni di reset.",
    msgResendOk:
      "Abbiamo reinviato l’email di conferma. Controlla anche lo spam.",
    msgResetOk:
      "Abbiamo inviato le istruzioni per reimpostare la password. Controlla inbox e spam.",
    errNetwork: "Errore di rete. Riprova.",
    errInvalidPayload: "Controlla email e password (requisiti minimi).",
    errRateLimited: "Troppi tentativi. Attendi e riprova.",
    errTurnstileFailed: "Verifica anti-bot non riuscita. Ricarica la pagina.",
    errDisposableEmail: "Email usa e getta non accettate.",
    errEmailValidation:
      "L’email non ha superato la validazione (dominio o MX).",
    errSignUpFailedDefault:
      "Impossibile creare l’account (email già registrata?).",
    errEmailExistsDefault:
      "Questa email è già registrata. Accedi o reimposta la password.",
    errSupabaseNotConfigured: "Supabase non è configurato sul server.",
    errRegisterDefault: "Registrazione non riuscita. Riprova.",
    errWeakPassword:
      "La password non rispetta le regole (min. 8 caratteri, una maiuscola e una cifra). Se viene rifiutata come debole, scegline un’altra più lunga.",
    errSignupDisabled:
      "La registrazione via email è disabilitata sul server. Prova «Continua con Google» o contatta il supporto.",
    errSignupConfirmationFailed:
      "Impossibile inviare l’email di conferma (SMTP o limiti del provider). Riprova più tardi o usa «Continua con Google» se hai già usato questo indirizzo.",
    errLegalConsentStoreFailed:
      "L’account è stato creato ma non è stato possibile salvare l’accettazione legale nel database. Contatta il supporto (migrazione o permessi su Supabase).",
    errSignupAuthInternalError:
      "Supabase Auth ha restituito un errore interno (unexpected_failure), spesso per un trigger sul DB alla creazione utente. Dashboard: Logs → Postgres. Se usi già questa email con Google, accedi con Google.",
    showPasswordAria: "Mostra password",
    hidePasswordAria: "Nascondi password",
  },
  ja: {
    configErrorTitle: "サインインできません",
    configErrorBody:
      "クライアントに {{urlKey}} または {{anonKey}} がありません。",
    brandSubtitle: "朱熹とウィルヘルム／ベインズによる古典的読み。",
    tablistAria: "サインイン",
    signInTab: "ログイン",
    signUpTab: "アカウント作成",
    signInLead:
      "登録したメールアドレスでログインしてください（確認リンク後）。",
    signUpLead:
      "メール確認が必要です。安全なパスワード（8文字以上）を設定してください。",
    emailLabel: "メールアドレス",
    passwordLabel: "パスワード",
    emailPlaceholder: "you@example.com",
    passwordPlaceholderSignin: "••••••••",
    passwordPlaceholderSignup: "8文字以上",
    forgotPassword: "パスワードを忘れた場合",
    resendConfirmation: "確認メールを再送",
    signingIn: "ログイン中…",
    signInSubmit: "ログイン",
    sending: "送信中…",
    registerSubmit: "登録する",
    dividerOr: "または",
    continueGoogle: "Googleで続行",
    legalConsentTitle: "アカウント作成前の確認",
    legalConsentIntro:
      "アカウントを作成するには、プライバシーポリシーと利用規約を読んで同意する必要があります。",
    legalConsentPendingScroll: "最後までスクロールすると同意できます。",
    legalConsentReady: "同意して続行できます。",
    legalConsentAccept: "同意して続行",
    legalConsentCloseAria: "同意画面を閉じる",
    legalConsentRequired:
      "アカウント作成にはプライバシーポリシーと利用規約への同意が必要です。",
    backToOracle: "← オラクルに戻る",
    closeModalAria: "閉じる",
    modalVerifyTitle: "メールでアカウントを確認",
    modalExistsTitle: "既に登録されたメール",
    modalVerifyLine1: "確認リンクを次に送信しました：",
    modalVerifyLine2:
      "受信トレイ（迷惑メールも）を確認し、リンクをクリックして有効化してください。",
    modalExistsLine1: "メール",
    modalExistsLine2:
      "は既に登録されています。そのメールでログインしてください。",
    modalOk: "了解",
    errEmailNotConfirmed:
      "メールが未確認です。受信トレイを確認するか確認メールを再送してください。",
    errResendNeedEmail:
      "確認メールを再送するにはメールアドレスを入力してください。",
    errResetNeedEmail:
      "リセット手順を送るにはメールアドレスを入力してください。",
    msgResendOk:
      "確認メールを再送しました。迷惑メールフォルダもご確認ください。",
    msgResetOk:
      "パスワード再設定の手順を送信しました。受信トレイと迷惑メールをご確認ください。",
    errNetwork: "ネットワークエラー。もう一度お試しください。",
    errInvalidPayload: "メールとパスワード（最低要件）をご確認ください。",
    errRateLimited:
      "試行回数が多すぎます。しばらくしてから再度お試しください。",
    errTurnstileFailed:
      "ボット確認に失敗しました。ページを再読み込みしてください。",
    errDisposableEmail: "使い捨てメールは受け付けていません。",
    errEmailValidation: "メールが検証に通りませんでした（ドメインまたはMX）。",
    errSignUpFailedDefault:
      "アカウントを作成できませんでした（既に登録済み？）。",
    errEmailExistsDefault:
      "このメールは既に登録されています。ログインするかパスワードを再設定してください。",
    errSupabaseNotConfigured: "サーバーに Supabase が設定されていません。",
    errRegisterDefault: "登録できませんでした。もう一度お試しください。",
    errWeakPassword:
      "パスワードが要件を満たしていません（8文字以上・大文字1文字・数字1文字）。脆弱と判定された場合は、より長く別のパスワードを選んでください。",
    errSignupDisabled:
      "メールでの新規登録はサーバー側で無効です。「Googleで続行」を試すかサポートへ連絡してください。",
    errSignupConfirmationFailed:
      "確認メールを送信できませんでした（SMTPまたは送信制限）。しばらくして再試行するか、同じアドレスで「Googleで続行」をお試しください。",
    errLegalConsentStoreFailed:
      "アカウントは作成されましたが、法的同意をデータベースに保存できませんでした。サポートに連絡してください（マイグレーションまたは Supabase の権限が必要な場合があります）。",
    errSignupAuthInternalError:
      "Supabase Auth が内部エラー（unexpected_failure）を返しました。多くの場合、ユーザー作成時の DB トリガーが原因です。ダッシュボードの Logs → Postgres を確認してください。同じメールで Google を使っている場合は Google でログインしてください。",
    showPasswordAria: "パスワードを表示",
    hidePasswordAria: "パスワードを非表示",
  },
  zh: {
    configErrorTitle: "无法登录",
    configErrorBody: "客户端缺少 {{urlKey}} 或 {{anonKey}}。",
    brandSubtitle: "朱熹变爻与卫礼贤/贝恩斯体系的经典解读。",
    tablistAria: "登录",
    signInTab: "登录",
    signUpTab: "创建账户",
    signInLead: "请使用注册时填写的邮箱（完成确认链接后）。",
    signUpLead: "需要邮箱验证。请设置安全密码（至少 8 位）。",
    emailLabel: "电子邮箱",
    passwordLabel: "密码",
    emailPlaceholder: "you@example.com",
    passwordPlaceholderSignin: "••••••••",
    passwordPlaceholderSignup: "至少 8 个字符",
    forgotPassword: "忘记密码",
    resendConfirmation: "重发确认邮件",
    signingIn: "正在登录…",
    signInSubmit: "登录",
    sending: "发送中…",
    registerSubmit: "注册",
    dividerOr: "或",
    continueGoogle: "使用 Google 继续",
    legalConsentTitle: "创建账户前的确认",
    legalConsentIntro: "创建账户前，你必须阅读并接受隐私政策和服务条款。",
    legalConsentPendingScroll: "请滚动到底部以启用接受按钮。",
    legalConsentReady: "现在可以接受并继续。",
    legalConsentAccept: "接受并继续",
    legalConsentCloseAria: "关闭确认窗口",
    legalConsentRequired: "创建账户前必须接受隐私政策和服务条款。",
    backToOracle: "← 返回占卜",
    closeModalAria: "关闭",
    modalVerifyTitle: "请验证邮箱",
    modalExistsTitle: "邮箱已注册",
    modalVerifyLine1: "我们已向以下地址发送验证链接：",
    modalVerifyLine2: "请打开邮箱（含垃圾邮件）并点击链接激活账户。",
    modalExistsLine1: "邮箱",
    modalExistsLine2: "已注册。请使用该邮箱登录。",
    modalOk: "好的",
    errEmailNotConfirmed: "邮箱尚未确认。请查收邮件或使用「重发确认邮件」。",
    errResendNeedEmail: "请输入邮箱以重发确认邮件。",
    errResetNeedEmail: "请输入邮箱以接收重置说明。",
    msgResendOk: "已重发确认邮件，请同时查看垃圾邮件文件夹。",
    msgResetOk: "已发送密码重置说明，请查看收件箱与垃圾邮件。",
    errNetwork: "网络错误，请重试。",
    errInvalidPayload: "请检查邮箱和密码（最低要求）。",
    errRateLimited: "尝试次数过多，请稍后再试。",
    errTurnstileFailed: "人机验证失败，请刷新页面。",
    errDisposableEmail: "不接受临时或一次性邮箱。",
    errEmailValidation: "邮箱未通过验证（域名或 MX）。",
    errSignUpFailedDefault: "无法创建账户（邮箱已注册？）。",
    errEmailExistsDefault: "该邮箱已注册。请登录或重置密码。",
    errSupabaseNotConfigured: "服务器未配置 Supabase。",
    errRegisterDefault: "注册失败，请重试。",
    errWeakPassword:
      "密码不符合规则（至少 8 位、含一个大写字母和一个数字）。若因密码过弱被拒，请换用更长或不同的密码。",
    errSignupDisabled:
      "服务器已禁用邮箱注册。请尝试「使用 Google 继续」或联系支持。",
    errSignupConfirmationFailed:
      "无法发送确认邮件（SMTP 或服务商限制）。请稍后再试；若该邮箱已用于 Google，请用「使用 Google 继续」。",
    errLegalConsentStoreFailed:
      "账户已创建，但未能将法律同意保存到数据库。请联系支持（可能需要迁移或调整 Supabase 权限）。",
    errSignupAuthInternalError:
      "Supabase Auth 返回内部错误（unexpected_failure），常见原因是创建用户时的数据库触发器。请在控制台查看 Logs → Postgres。若该邮箱已用于 Google，请用 Google 登录。",
    showPasswordAria: "显示密码",
    hidePasswordAria: "隐藏密码",
  },
  ko: {
    configErrorTitle: "로그인을 사용할 수 없음",
    configErrorBody: "클라이언트에 {{urlKey}} 또는 {{anonKey}}가 없습니다.",
    brandSubtitle: "주희와 윌헬름/베인스를 바탕으로 한 고전 해석.",
    tablistAria: "로그인",
    signInTab: "로그인",
    signUpTab: "계정 만들기",
    signInLead: "가입할 때 사용한 이메일로 로그인하세요(확인 링크 완료 후).",
    signUpLead:
      "이메일 인증이 필요합니다. 안전한 비밀번호(최소 8자)를 설정하세요.",
    emailLabel: "이메일",
    passwordLabel: "비밀번호",
    emailPlaceholder: "you@example.com",
    passwordPlaceholderSignin: "••••••••",
    passwordPlaceholderSignup: "최소 8자",
    forgotPassword: "비밀번호 찾기",
    resendConfirmation: "확인 메일 다시 보내기",
    signingIn: "로그인 중…",
    signInSubmit: "로그인",
    sending: "보내는 중…",
    registerSubmit: "가입하기",
    dividerOr: "또는",
    continueGoogle: "Google로 계속",
    legalConsentTitle: "계정을 만들기 전에",
    legalConsentIntro:
      "계정을 만들려면 개인정보 처리방침과 서비스 약관을 읽고 동의해야 합니다.",
    legalConsentPendingScroll: "끝까지 스크롤하면 동의할 수 있습니다.",
    legalConsentReady: "이제 동의하고 계속할 수 있습니다.",
    legalConsentAccept: "동의하고 계속",
    legalConsentCloseAria: "동의 창 닫기",
    legalConsentRequired:
      "계정을 만들려면 개인정보 처리방침과 서비스 약관에 동의해야 합니다.",
    backToOracle: "← 오라클로 돌아가기",
    closeModalAria: "닫기",
    modalVerifyTitle: "이메일로 계정 확인",
    modalExistsTitle: "이미 등록된 이메일",
    modalVerifyLine1: "다음 주소로 확인 링크를 보냈습니다:",
    modalVerifyLine2:
      "받은편지함(스팸 포함)을 확인하고 링크를 눌러 계정을 활성화하세요.",
    modalExistsLine1: "이메일",
    modalExistsLine2:
      "은(는) 이미 등록되어 있습니다. 해당 이메일로 로그인하세요.",
    modalOk: "확인",
    errEmailNotConfirmed:
      "이메일이 아직 확인되지 않았습니다. 받은편지함을 확인하거나 확인 메일을 다시 보내세요.",
    errResendNeedEmail: "확인 메일을 다시내려면 이메일을 입력하세요.",
    errResetNeedEmail: "재설정 안내를 받으려면 이메일을 입력하세요.",
    msgResendOk: "확인 메일을 다시 보냈습니다. 스팸함도 확인하세요.",
    msgResetOk:
      "비밀번호 재설정 안내를 보냈습니다. 받은편지함과 스팸함을 확인하세요.",
    errNetwork: "네트워크 오류입니다. 다시 시도하세요.",
    errInvalidPayload: "이메일과 비밀번호(최소 요건)를 확인하세요.",
    errRateLimited: "시도가 너무 많습니다. 잠시 후 다시 시도하세요.",
    errTurnstileFailed: "봇 확인에 실패했습니다. 페이지를 새로고침하세요.",
    errDisposableEmail: "일회용 이메일은 사용할 수 없습니다.",
    errEmailValidation: "이메일 검증에 실패했습니다(도메인 또는 MX).",
    errSignUpFailedDefault: "계정을 만들 수 없습니다(이미 등록된 이메일?).",
    errEmailExistsDefault:
      "이 이메일은 이미 등록되어 있습니다. 로그인하거나 비밀번호를 재설정하세요.",
    errSupabaseNotConfigured: "서버에 Supabase가 구성되어 있지 않습니다.",
    errRegisterDefault: "가입하지 못했습니다. 다시 시도하세요.",
    errWeakPassword:
      "비밀번호가 규칙을 충족하지 않습니다(최소 8자, 대문자 1개, 숫자 1개). 약한 비밀번호로 거절되면 더 길거나 다른 비밀번호를 선택하세요.",
    errSignupDisabled:
      "서버에서 이메일 가입이 비활성화되어 있습니다. «Google로 계속»을 시도하거나 지원팀에 문의하세요.",
    errSignupConfirmationFailed:
      "확인 메일을 보낼 수 없습니다(SMTP 또는 발송 제한). 잠시 후 다시 시도하거나, 해당 주소로 이미 가입했다면 «Google로 계속»을 사용하세요.",
    errLegalConsentStoreFailed:
      "계정은 생성되었으나 법적 동의를 데이터베이스에 저장하지 못했습니다. 지원팀에 문의하세요(마이그레이션 또는 Supabase 권한이 필요할 수 있습니다).",
    errSignupAuthInternalError:
      "Supabase Auth가 내부 오류(unexpected_failure)를 반환했습니다. 사용자 생성 시 DB 트리거 문제인 경우가 많습니다. 대시보드에서 Logs → Postgres를 확인하세요. 같은 이메일로 Google을 썼다면 Google로 로그인하세요.",
    showPasswordAria: "비밀번호 표시",
    hidePasswordAria: "비밀번호 숨기기",
  },
  ar: {
    configErrorTitle: "تسجيل الدخول غير متاح",
    configErrorBody: "{{urlKey}} أو {{anonKey}} مفقودان في العميل.",
    brandSubtitle: "قراءة كلاسيكية وفق Zhu Xi وWilhelm/Baynes.",
    tablistAria: "تسجيل الدخول",
    signInTab: "تسجيل الدخول",
    signUpTab: "إنشاء حساب",
    signInLead: "استخدم البريد الإلكتروني الذي سجّلت به (بعد تأكيد الرابط).",
    signUpLead:
      "التحقق من البريد الإلكتروني مطلوب. اختر كلمة مرور قوية (8 أحرف على الأقل).",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    emailPlaceholder: "you@example.com",
    passwordPlaceholderSignin: "••••••••",
    passwordPlaceholderSignup: "8 أحرف على الأقل",
    forgotPassword: "نسيت كلمة المرور",
    resendConfirmation: "إعادة إرسال التأكيد",
    signingIn: "جارٍ تسجيل الدخول…",
    signInSubmit: "تسجيل الدخول",
    sending: "جارٍ الإرسال…",
    registerSubmit: "تسجيل",
    dividerOr: "أو",
    continueGoogle: "المتابعة مع Google",
    legalConsentTitle: "قبل إنشاء حسابك",
    legalConsentIntro:
      "لإنشاء حسابك، يجب عليك قراءة وقبول سياسة الخصوصية وشروط الخدمة.",
    legalConsentPendingScroll: "مرّر للأسفل حتى النهاية لتفعيل القبول.",
    legalConsentReady: "يمكنك الآن القبول والمتابعة.",
    legalConsentAccept: "قبول والمتابعة",
    legalConsentCloseAria: "إغلاق نافذة القبول",
    legalConsentRequired:
      "يجب عليك قبول سياسة الخصوصية وشروط الخدمة لإنشاء حسابك.",
    backToOracle: "← العودة إلى الأوراكل",
    closeModalAria: "إغلاق",
    modalVerifyTitle: "تحقق من بريدك الإلكتروني",
    modalExistsTitle: "البريد الإلكتروني مسجّل بالفعل",
    modalVerifyLine1: "أرسلنا رابط تحقق إلى",
    modalVerifyLine2:
      "افتح بريدك الوارد (تحقق من البريد العشوائي) وانقر الرابط لتفعيل حسابك.",
    modalExistsLine1: "البريد الإلكتروني",
    modalExistsLine2: "مسجّل بالفعل. سجّل الدخول بهذا البريد.",
    modalOk: "حسنًا",
    errEmailNotConfirmed:
      "لم يتم تأكيد بريدك الإلكتروني بعد. تحقق من صندوق الوارد أو استخدم «إعادة إرسال التأكيد».",
    errResendNeedEmail: "أدخل بريدك الإلكتروني لإعادة إرسال التأكيد.",
    errResetNeedEmail: "أدخل بريدك الإلكتروني لتلقي تعليمات إعادة التعيين.",
    msgResendOk: "أعدنا إرسال بريد التأكيد. تحقق من البريد العشوائي أيضًا.",
    msgResetOk:
      "أرسلنا تعليمات إعادة تعيين كلمة المرور. تحقق من بريدك الوارد والبريد العشوائي.",
    errNetwork: "خطأ في الشبكة. يرجى المحاولة مجددًا.",
    errInvalidPayload:
      "تحقق من البريد الإلكتروني وكلمة المرور (الحد الأدنى المطلوب).",
    errRateLimited: "محاولات كثيرة جدًا. انتظر قليلًا وحاول مرة أخرى.",
    errTurnstileFailed:
      "فشل التحقق من الروبوتات. أعد تحميل الصفحة وحاول مرة أخرى.",
    errDisposableEmail:
      "عناوين البريد الإلكتروني المؤقتة أو القابلة للإلقاء غير مقبولة.",
    errEmailValidation: "لم يجتز البريد الإلكتروني التحقق (النطاق أو MX).",
    errSignUpFailedDefault:
      "تعذّر إنشاء الحساب (هل البريد الإلكتروني مسجّل بالفعل؟).",
    errEmailExistsDefault:
      "هذا البريد الإلكتروني مسجّل بالفعل. سجّل الدخول أو أعد تعيين كلمة المرور.",
    errSupabaseNotConfigured: "Supabase غير مهيأ على الخادم.",
    errRegisterDefault: "تعذّر التسجيل. يرجى المحاولة مجددًا.",
    errWeakPassword:
      "كلمة المرور لا تستوفي القواعد (8 أحرف على الأقل، حرف كبير واحد، رقم واحد). إذا رُفضت لضعفها، اختر كلمة مرور أطول أو مختلفة.",
    errSignupDisabled:
      "التسجيل بالبريد الإلكتروني معطّل على الخادم. جرّب «المتابعة مع Google» أو تواصل مع الدعم.",
    errSignupConfirmationFailed:
      "تعذّر إرسال بريد التأكيد (SMTP أو حدود المزود). أعد المحاولة لاحقًا أو استخدم «المتابعة مع Google» إذا كنت قد استخدمت هذا العنوان.",
    errLegalConsentStoreFailed:
      "تم إنشاء الحساب لكن تعذّر حفظ القبول القانوني في قاعدة البيانات. تواصل مع الدعم؛ قد تكون هناك حاجة لترحيل أو أذونات Supabase.",
    errSignupAuthInternalError:
      "أعاد Supabase Auth خطأً داخليًا (unexpected_failure)، وغالبًا ما يكون بسبب محفّز في قاعدة البيانات عند إنشاء المستخدم. في لوحة التحكم: Logs → Postgres. إذا كنت تستخدم هذا البريد مع Google، سجّل الدخول بـ Google.",
    showPasswordAria: "إظهار كلمة المرور",
    hidePasswordAria: "إخفاء كلمة المرور",
  },
  hi: {
    configErrorTitle: "कॉन्फ़िगरेशन त्रुटि",
    configErrorBody:
      "{{urlKey}} और {{anonKey}} कॉन्फ़िगर नहीं हैं। Vercel सेटिंग जाँचें।",
    brandSubtitle: "प्रामाणिक I Ching ओरेकल",
    tablistAria: "लॉग इन या खाता बनाएँ",
    signInTab: "लॉग इन करें",
    signUpTab: "खाता बनाएँ",
    signInLead: "जारी रखने के लिए अपना ईमेल और पासवर्ड दर्ज करें।",
    signUpLead: "परामर्श और इतिहास सहेजने के लिए खाता बनाएँ।",
    emailLabel: "ईमेल",
    passwordLabel: "पासवर्ड",
    emailPlaceholder: "आपका@उदाहरण.com",
    passwordPlaceholderSignin: "आपका पासवर्ड",
    passwordPlaceholderSignup: "पासवर्ड चुनें",
    forgotPassword: "पासवर्ड भूल गए?",
    resendConfirmation: "पुष्टि ईमेल पुनः भेजें",
    signingIn: "लॉग इन हो रहा है…",
    signInSubmit: "लॉग इन करें",
    sending: "भेजा जा रहा है…",
    registerSubmit: "खाता बनाएँ",
    dividerOr: "या",
    continueGoogle: "Google से जारी रखें",
    legalConsentTitle: "कानूनी सहमति",
    legalConsentIntro:
      "खाता बनाने से पहले सेवा की शर्तें और गोपनीयता नीति पढ़ें और स्वीकार करें।",
    legalConsentPendingScroll: "पूरी शर्तें देखने के लिए नीचे स्क्रॉल करें",
    legalConsentReady: "मैंने शर्तें पढ़ ली हैं",
    legalConsentAccept: "स्वीकार करें और खाता बनाएँ",
    legalConsentCloseAria: "कानूनी सहमति विंडो बंद करें",
    legalConsentRequired:
      "जारी रखने से पहले शर्तें पढ़ना और स्वीकार करना अनिवार्य है।",
    backToOracle: "ओरेकल पर वापस",
    closeModalAria: "विंडो बंद करें",
    modalVerifyTitle: "अपना ईमेल सत्यापित करें",
    modalExistsTitle: "खाता पहले से मौजूद है",
    modalVerifyLine1: "हमने आपके ईमेल पर पुष्टि लिंक भेजा है।",
    modalVerifyLine2: "इनबॉक्स और स्पैम फ़ोल्डर जाँचें।",
    modalExistsLine1: "इस ईमेल से पहले से खाता है।",
    modalExistsLine2: "लॉग इन करें या «पासवर्ड भूल गए» का उपयोग करें।",
    modalOk: "ठीक है",
    errEmailNotConfirmed:
      "आपका ईमेल अभी तक सत्यापित नहीं हुआ। इनबॉक्स जाँचें या पुष्टि ईमेल पुनः भेजें।",
    errResendNeedEmail: "पुनः भेजने के लिए अपना ईमेल दर्ज करें।",
    errResetNeedEmail: "पासवर्ड रीसेट के लिए अपना ईमेल दर्ज करें।",
    msgResendOk: "पुष्टि ईमेल भेजा गया। इनबॉक्स और स्पैम जाँचें।",
    msgResetOk: "पासवर्ड रीसेट लिंक भेजा गया। इनबॉक्स जाँचें।",
    errNetwork: "नेटवर्क त्रुटि। अपना कनेक्शन जाँचें और पुनः प्रयास करें।",
    errInvalidPayload: "अमान्य डेटा। इनपुट जाँचें और पुनः प्रयास करें।",
    errRateLimited: "बहुत अधिक अनुरोध। थोड़ी देर बाद पुनः प्रयास करें।",
    errTurnstileFailed:
      "मानव सत्यापन विफल। पृष्ठ पुनः लोड करें और पुनः प्रयास करें।",
    errDisposableEmail: "अस्थायी ईमेल पते स्वीकार नहीं किए जाते।",
    errEmailValidation:
      "यह ईमेल सत्यापित नहीं हो सका। पता जाँचें और पुनः प्रयास करें।",
    errSignUpFailedDefault: "खाता नहीं बन सका। पुनः प्रयास करें।",
    errEmailExistsDefault: "इस ईमेल से पहले से खाता है।",
    errSupabaseNotConfigured:
      "Supabase कॉन्फ़िगर नहीं है। सर्वर सेटिंग जाँचें।",
    errRegisterDefault: "पंजीकरण विफल। पुनः प्रयास करें।",
    errWeakPassword:
      "पासवर्ड कमज़ोर है। अक्षरों और अंकों का मिश्रण उपयोग करें।",
    errSignupDisabled: "पंजीकरण वर्तमान में बंद है।",
    errSignupConfirmationFailed:
      "पुष्टि ईमेल नहीं भेजा जा सका। पुनः प्रयास करें।",
    errLegalConsentStoreFailed:
      "कानूनी सहमति सहेजी नहीं जा सकी। पुनः प्रयास करें।",
    errSignupAuthInternalError:
      "प्रमाणीकरण में आंतरिक त्रुटि। पुनः प्रयास करें या सहायता से संपर्क करें।",
    showPasswordAria: "पासवर्ड दिखाएँ",
    hidePasswordAria: "पासवर्ड छिपाएँ",
  },
};

export function getLoginPageUiMessages(locale: AppLocale): LoginPageUiMessages {
  return LOGIN_PAGE_UI[locale] ?? LOGIN_PAGE_UI[DEFAULT_LOCALE];
}

export function formatLoginConfigErrorBody(m: LoginPageUiMessages): string {
  return interpolate(m.configErrorBody, {
    urlKey: "NEXT_PUBLIC_SUPABASE_URL",
    anonKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  });
}

export function formatLoginRegisterApiError(
  m: LoginPageUiMessages,
  data: {
    error?: string;
    reason?: string;
    message?: string;
    authCode?: string;
  },
): string {
  switch (data.error) {
    case "invalid_payload":
      return m.errInvalidPayload;
    case "rate_limited":
      return m.errRateLimited;
    case "turnstile_failed":
      return m.errTurnstileFailed;
    case "weak_password":
      return m.errWeakPassword;
    case "legal_consent_required":
      return m.legalConsentRequired;
    case "email_rejected":
      return data.reason === "disposable"
        ? m.errDisposableEmail
        : m.errEmailValidation;
    case "signup_disabled":
      return m.errSignupDisabled;
    case "signup_confirmation_failed":
      return m.errSignupConfirmationFailed;
    case "legal_consent_store_failed":
      return m.errLegalConsentStoreFailed;
    case "signup_auth_internal_error":
      return m.errSignupAuthInternalError;
    case "register_precheck_failed":
      return m.errRegisterDefault;
    case "sign_up_failed":
      return data.message ?? m.errSignUpFailedDefault;
    case "email_exists":
      return data.message ?? m.errEmailExistsDefault;
    case "supabase_not_configured":
      return m.errSupabaseNotConfigured;
    default:
      return data.message ?? m.errRegisterDefault;
  }
}
