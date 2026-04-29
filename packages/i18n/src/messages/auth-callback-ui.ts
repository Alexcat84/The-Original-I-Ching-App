import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type AuthCallbackUiMessages = {
  verifying: string;
};

const AUTH_CALLBACK_UI: Record<AppLocale, AuthCallbackUiMessages> = {
  es: {
    verifying:
      "Verificando acceso… si vienes del correo, estamos finalizando la confirmación o el restablecimiento.",
  },
  en: {
    verifying: "Verifying access… if you arrived from email, we are finishing confirmation or password reset.",
  },
  pt: {
    verifying:
      "A verificar o acesso… se vieste do email, estamos a concluir a confirmação ou a reposição da palavra-passe.",
  },
  fr: {
    verifying:
      "Vérification de l’accès… si vous venez de l’e-mail, nous finalisons la confirmation ou la réinitialisation.",
  },
  de: {
    verifying:
      "Zugriff wird geprüft… wenn Sie über die E-Mail kommen, schließen wir Bestätigung oder Passwortzurücksetzung ab.",
  },
  it: {
    verifying:
      "Verifica dell’accesso… se arrivi dall’email, stiamo completando la conferma o il ripristino della password.",
  },
  ja: {
    verifying: "アクセスを確認しています… メールからの場合は確認またはパスワード再設定を完了しています。",
  },
  zh: {
    verifying: "正在验证访问… 若您从邮件进入，我们正在完成确认或密码重置。",
  },
  ko: {
    verifying: "접속을 확인하는 중… 이메일에서 오셨다면 확인 또는 비밀번호 재설정을 마무리하고 있습니다.",
  },
  ar: {
    verifying: "جارٍ التحقق من الوصول… إذا أتيت من البريد الإلكتروني، نحن نُنهي التأكيد أو إعادة تعيين كلمة المرور.",
  },
};

export function getAuthCallbackUiMessages(locale: AppLocale): AuthCallbackUiMessages {
  return AUTH_CALLBACK_UI[locale] ?? AUTH_CALLBACK_UI[DEFAULT_LOCALE];
}
