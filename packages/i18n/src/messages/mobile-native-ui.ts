import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

/** Strings shown only in the Expo / React Native shell (dialogs, sharing). */
export type MobileNativeUiMessages = {
  imageSavedTitle: string;
  imageSavedBody: string;
  permissionDeniedTitle: string;
  permissionDeniedBody: string;
  fileSaveErrorTitle: string;
  fileSaveErrorBody: string;
  fileSavedTitle: string;
  fileSavedBody: string;
  ok: string;
  cancel: string;
  sharePdfTitle: string;
  deleteConfirm: string;
};

const MOBILE_NATIVE_UI: Record<AppLocale, MobileNativeUiMessages> = {
  es: {
    imageSavedTitle: "Imagen guardada",
    imageSavedBody: "Se guardó en tu galería.",
    permissionDeniedTitle: "Permiso denegado",
    permissionDeniedBody:
      "Necesitamos acceso a tu galería para guardar imágenes.",
    fileSaveErrorTitle: "Error",
    fileSaveErrorBody: "No se pudo guardar el archivo.",
    fileSavedTitle: "Archivo guardado",
    fileSavedBody: "El PDF se guardó en tu dispositivo.",
    ok: "OK",
    cancel: "Cancelar",
    sharePdfTitle: "Compartir PDF",
    deleteConfirm: "¿Eliminar esta conversación de forma permanente?",
  },
  en: {
    imageSavedTitle: "Image saved",
    imageSavedBody: "Saved to your gallery.",
    permissionDeniedTitle: "Permission denied",
    permissionDeniedBody: "We need gallery access to save images.",
    fileSaveErrorTitle: "Error",
    fileSaveErrorBody: "Could not save the file.",
    fileSavedTitle: "File saved",
    fileSavedBody: "The PDF was saved to your device.",
    ok: "OK",
    cancel: "Cancel",
    sharePdfTitle: "Share PDF",
    deleteConfirm: "Delete this conversation permanently?",
  },
  pt: {
    imageSavedTitle: "Imagem guardada",
    imageSavedBody: "Guardada na sua galeria.",
    permissionDeniedTitle: "Permissão negada",
    permissionDeniedBody:
      "Precisamos de acesso à galeria para guardar imagens.",
    fileSaveErrorTitle: "Erro",
    fileSaveErrorBody: "No fue posible guardar o ficheiro.",
    fileSavedTitle: "Ficheiro guardado",
    fileSavedBody: "O PDF foi guardado no seu dispositivo.",
    ok: "OK",
    cancel: "Cancelar",
    sharePdfTitle: "Partilhar PDF",
    deleteConfirm: "Eliminar esta conversa permanentemente?",
  },
  fr: {
    imageSavedTitle: "Image enregistrée",
    imageSavedBody: "Enregistrée dans votre galerie.",
    permissionDeniedTitle: "Autorisation refusée",
    permissionDeniedBody:
      "L’accès à la galerie est nécessaire pour enregistrer les images.",
    fileSaveErrorTitle: "Erreur",
    fileSaveErrorBody: "Impossible d’enregistrer le fichier.",
    fileSavedTitle: "Fichier enregistré",
    fileSavedBody: "Le PDF a été enregistré sur votre appareil.",
    ok: "OK",
    cancel: "Annuler",
    sharePdfTitle: "Partager le PDF",
    deleteConfirm: "Supprimer définitivement cette conversation ?",
  },
  de: {
    imageSavedTitle: "Bild gespeichert",
    imageSavedBody: "In Ihrer Galerie gespeichert.",
    permissionDeniedTitle: "Berechtigung verweigert",
    permissionDeniedBody:
      "Für das Speichern von Bildern ist Galeriezugriff nötig.",
    fileSaveErrorTitle: "Fehler",
    fileSaveErrorBody: "Datei konnte nicht gespeichert werden.",
    fileSavedTitle: "Datei gespeichert",
    fileSavedBody: "Das PDF wurde auf Ihrem Gerät gespeichert.",
    ok: "OK",
    cancel: "Abbrechen",
    sharePdfTitle: "PDF teilen",
    deleteConfirm: "Diese Konversation dauerhaft löschen?",
  },
  it: {
    imageSavedTitle: "Immagine salvata",
    imageSavedBody: "Salvata nella galleria.",
    permissionDeniedTitle: "Permesso negato",
    permissionDeniedBody:
      "Serve l’accesso alla galleria para salvare le immagini.",
    fileSaveErrorTitle: "Errore",
    fileSaveErrorBody: "Imposibile salvare il file.",
    fileSavedTitle: "File salvato",
    fileSavedBody: "Il PDF è stato salvato sul tuo dispositivo.",
    ok: "OK",
    cancel: "Annulla",
    sharePdfTitle: "Condividi PDF",
    deleteConfirm: "Eliminare definitivamente questa conversazione?",
  },
  ja: {
    imageSavedTitle: "画像を保存しました",
    imageSavedBody: "ギャラリーに保存しました。",
    permissionDeniedTitle: "許可がありません",
    permissionDeniedBody:
      "画像を保存するにはギャラリーへのアクセスが必要です。",
    fileSaveErrorTitle: "エラー",
    fileSaveErrorBody: "ファイルを保存できませんでした。",
    fileSavedTitle: "ファイルを保存しました",
    fileSavedBody: "PDFをデバイスに保存しました。",
    ok: "OK",
    cancel: "キャンセル",
    sharePdfTitle: "PDFを共有",
    deleteConfirm: "この会話を完全に削除しますか？",
  },
  zh: {
    imageSavedTitle: "图片已保存",
    imageSavedBody: "已保存到相册。",
    permissionDeniedTitle: "权限被拒绝",
    permissionDeniedBody: "保存图片需要访问相册。",
    fileSaveErrorTitle: "错误",
    fileSaveErrorBody: "无法保存文件。",
    fileSavedTitle: "文件已保存",
    fileSavedBody: "PDF 已保存到您的设备。",
    ok: "确定",
    cancel: "取消",
    sharePdfTitle: "分享 PDF",
    deleteConfirm: "要永久删除此对话吗？",
  },
  ko: {
    imageSavedTitle: "이미지 저장됨",
    imageSavedBody: "갤러리에 저장되었습니다.",
    permissionDeniedTitle: "권한 거부됨",
    permissionDeniedBody: "이미지를 저장하려면 갤러리 접근이 필요합니다.",
    fileSaveErrorTitle: "오류",
    fileSaveErrorBody: "파일을 저장할 수 없습니다.",
    fileSavedTitle: "파일 저장됨",
    fileSavedBody: "PDF가 기기에 저장되었습니다.",
    ok: "확인",
    cancel: "취소",
    sharePdfTitle: "PDF 공유",
    deleteConfirm: "이 대화를 영구적으로 삭제할까요?",
  },
  ar: {
    imageSavedTitle: "تم حفظ الصورة",
    imageSavedBody: "تم الحفظ في معرض الصور.",
    permissionDeniedTitle: "الإذن مرفوض",
    permissionDeniedBody: "نحتاج إلى الوصول إلى المعرض لحفظ الصور.",
    fileSaveErrorTitle: "خطأ",
    fileSaveErrorBody: "تعذّر حفظ الملف.",
    fileSavedTitle: "تم حفظ الملف",
    fileSavedBody: "تم حفظ ملف PDF على جهازك.",
    ok: "حسنًا",
    cancel: "إلغاء",
    sharePdfTitle: "مشاركة PDF",
    deleteConfirm: "هل تريد حذف هذه المحادثة نهائيًا؟",
  },
  hi: {
    imageSavedTitle: "छवि सहेजी गई",
    imageSavedBody: "आपकी गैलरी में सहेजा गया।",
    permissionDeniedTitle: "अनुमति अस्वीकृत",
    permissionDeniedBody: "छवियाँ सहेजने के लिए गैलरी पहुँच आवश्यक है।",
    fileSaveErrorTitle: "त्रुटि",
    fileSaveErrorBody: "फ़ाइल सहेजी नहीं जा सकी।",
    fileSavedTitle: "फ़ाइल सहेजी गई",
    fileSavedBody: "PDF आपके डिवाइस पर सहेजा गया था।",
    ok: "ठीक है",
    cancel: "रद्द करें",
    sharePdfTitle: "PDF साझा करें",
    deleteConfirm: "क्या आप इस वार्तालाप को स्थायी रूप से हटाना चाहते हैं?",
  },
};

export function getMobileNativeUiMessages(
  locale: AppLocale,
): MobileNativeUiMessages {
  return MOBILE_NATIVE_UI[locale] ?? MOBILE_NATIVE_UI[DEFAULT_LOCALE];
}
