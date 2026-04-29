import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type OnboardingUiMessages = {
  title: string;
  subtitle: string;
  placeholder: string;
  button: string;
  confirmTitle: string;
  confirmSubtitle: string;
  confirmYes: string;
  confirmEdit: string;
};

const ONBOARDING_UI: Record<AppLocale, OnboardingUiMessages> = {
  es: {
    title: "¿Cómo te llamas?",
    subtitle: "El oráculo te saludará por tu nombre",
    placeholder: "Tu nombre",
    button: "Continuar",
    confirmTitle: "¿Es correcto tu nombre?",
    confirmSubtitle: "Así es como el oráculo te llamará",
    confirmYes: "Sí, es correcto",
    confirmEdit: "Quiero cambiarlo",
  },
  en: {
    title: "What's your name?",
    subtitle: "The oracle will greet you by name",
    placeholder: "Your name",
    button: "Continue",
    confirmTitle: "Is your name correct?",
    confirmSubtitle: "This is how the oracle will address you",
    confirmYes: "Yes, that's correct",
    confirmEdit: "I'd like to change it",
  },
  pt: {
    title: "Como te chamas?",
    subtitle: "O oráculo vai saudar-te pelo teu nome",
    placeholder: "O teu nome",
    button: "Continuar",
    confirmTitle: "O teu nome está correto?",
    confirmSubtitle: "É assim que o oráculo te chamará",
    confirmYes: "Sim, está correto",
    confirmEdit: "Quero mudá-lo",
  },
  fr: {
    title: "Comment vous appelez-vous ?",
    subtitle: "L'oracle vous saluera par votre nom",
    placeholder: "Votre nom",
    button: "Continuer",
    confirmTitle: "Votre nom est-il correct ?",
    confirmSubtitle: "C'est ainsi que l'oracle vous appellera",
    confirmYes: "Oui, c'est correct",
    confirmEdit: "Je veux le changer",
  },
  de: {
    title: "Wie heißt du?",
    subtitle: "Das Orakel wird dich mit deinem Namen begrüßen",
    placeholder: "Dein Name",
    button: "Weiter",
    confirmTitle: "Ist dein Name korrekt?",
    confirmSubtitle: "So wird das Orakel dich ansprechen",
    confirmYes: "Ja, das stimmt",
    confirmEdit: "Ich möchte ihn ändern",
  },
  it: {
    title: "Come ti chiami?",
    subtitle: "L'oracolo ti saluterà con il tuo nome",
    placeholder: "Il tuo nome",
    button: "Continua",
    confirmTitle: "Il tuo nome è corretto?",
    confirmSubtitle: "Così l'oracolo ti chiamerà",
    confirmYes: "Sì, è corretto",
    confirmEdit: "Voglio cambiarlo",
  },
  ja: {
    title: "お名前は何ですか？",
    subtitle: "神託はあなたの名前で挨拶します",
    placeholder: "あなたの名前",
    button: "続ける",
    confirmTitle: "名前は正しいですか？",
    confirmSubtitle: "神託はこのようにあなたを呼びます",
    confirmYes: "はい、正しいです",
    confirmEdit: "変更したいです",
  },
  zh: {
    title: "您叫什么名字？",
    subtitle: "神谕将用您的名字问候您",
    placeholder: "您的名字",
    button: "继续",
    confirmTitle: "您的名字正确吗？",
    confirmSubtitle: "神谕将这样称呼您",
    confirmYes: "是的，正确",
    confirmEdit: "我想更改",
  },
  ko: {
    title: "이름이 무엇인가요?",
    subtitle: "신탁이 이름으로 인사할 것입니다",
    placeholder: "이름",
    button: "계속",
    confirmTitle: "이름이 맞나요?",
    confirmSubtitle: "신탁이 이렇게 부를 것입니다",
    confirmYes: "네, 맞습니다",
    confirmEdit: "변경하고 싶습니다",
  },
  ar: {
    title: "ما اسمك؟",
    subtitle: "سيرحّب بك الأوراكل باسمك",
    placeholder: "اسمك",
    button: "متابعة",
    confirmTitle: "هل اسمك صحيح؟",
    confirmSubtitle: "هكذا سيناديك الأوراكل",
    confirmYes: "نعم، هذا صحيح",
    confirmEdit: "أريد تغييره",
  },
};

export function getOnboardingUiMessages(locale: AppLocale): OnboardingUiMessages {
  return ONBOARDING_UI[locale] ?? ONBOARDING_UI[DEFAULT_LOCALE];
}
