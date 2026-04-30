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
  ok: string;
  cancel: string;
  sharePdfTitle: string;
};

const MOBILE_NATIVE_UI: Record<AppLocale, MobileNativeUiMessages> = {
  es: {
    imageSavedTitle: "Imagen guardada",
    imageSavedBody: "Se guardó en tu galería.",
    permissionDeniedTitle: "Permiso denegado",
    permissionDeniedBody: "Necesitamos acceso a tu galería para guardar imágenes.",
    fileSaveErrorTitle: "Error",
    fileSaveErrorBody: "No se pudo guardar el archivo.",
    ok: "OK",
    cancel: "Cancelar",
    sharePdfTitle: "Compartir PDF",
  },
  en: {
    imageSavedTitle: "Image saved",
    imageSavedBody: "Saved to your gallery.",
    permissionDeniedTitle: "Permission denied",
    permissionDeniedBody: "We need gallery access to save images.",
    fileSaveErrorTitle: "Error",
    fileSaveErrorBody: "Could not save the file.",
    ok: "OK",
    cancel: "Cancel",
    sharePdfTitle: "Share PDF",
  },
  pt: {
    imageSavedTitle: "Imagem guardada",
    imageSavedBody: "Guardada na sua galeria.",
    permissionDeniedTitle: "Permissão negada",
    permissionDeniedBody: "Precisamos de acesso à galeria para guardar imagens.",
    fileSaveErrorTitle: "Erro",
    fileSaveErrorBody: "Não foi possível guardar o ficheiro.",
    ok: "OK",
    cancel: "Cancelar",
    sharePdfTitle: "Partilhar PDF",
  },
  fr: {
    imageSavedTitle: "Image enregistrée",
    imageSavedBody: "Enregistrée dans votre galerie.",
    permissionDeniedTitle: "Autorisation refusée",
    permissionDeniedBody: "L’accès à la galerie est nécessaire pour enregistrer les images.",
    fileSaveErrorTitle: "Erreur",
    fileSaveErrorBody: "Impossible d’enregistrer le fichier.",
    ok: "OK",
    cancel: "Annuler",
    sharePdfTitle: "Partager le PDF",
  },
  de: {
    imageSavedTitle: "Bild gespeichert",
    imageSavedBody: "In Ihrer Galerie gespeichert.",
    permissionDeniedTitle: "Berechtigung verweigert",
    permissionDeniedBody: "Für das Speichern von Bildern ist Galeriezugriff nötig.",
    fileSaveErrorTitle: "Fehler",
    fileSaveErrorBody: "Datei konnte nicht gespeichert werden.",
    ok: "OK",
    cancel: "Abbrechen",
    sharePdfTitle: "PDF teilen",
  },
  it: {
    imageSavedTitle: "Immagine salvata",
    imageSavedBody: "Salvata nella galleria.",
    permissionDeniedTitle: "Permesso negato",
    permissionDeniedBody: "Serve l’accesso alla galleria per salvare le immagini.",
    fileSaveErrorTitle: "Errore",
    fileSaveErrorBody: "Impossibile salvare il file.",
    ok: "OK",
    cancel: "Annulla",
    sharePdfTitle: "Condividi PDF",
  },
  ja: {
    imageSavedTitle: "画像を保存しました",
    imageSavedBody: "ギャラリーに保存しました。",
    permissionDeniedTitle: "許可がありません",
    permissionDeniedBody: "画像を保存するにはギャラリーへのアクセスが必要です。",
    fileSaveErrorTitle: "エラー",
    fileSaveErrorBody: "ファイルを保存できませんでした。",
    ok: "OK",
    cancel: "キャンセル",
    sharePdfTitle: "PDFを共有",
  },
  zh: {
    imageSavedTitle: "图片已保存",
    imageSavedBody: "已保存到相册。",
    permissionDeniedTitle: "权限被拒绝",
    permissionDeniedBody: "保存图片需要访问相册。",
    fileSaveErrorTitle: "错误",
    fileSaveErrorBody: "无法保存文件。",
    ok: "确定",
    cancel: "取消",
    sharePdfTitle: "分享 PDF",
  },
  ko: {
    imageSavedTitle: "이미지 저장됨",
    imageSavedBody: "갤러리에 저장되었습니다.",
    permissionDeniedTitle: "권한 거부됨",
    permissionDeniedBody: "이미지를 저장하려면 갤러리 접근이 필요합니다.",
    fileSaveErrorTitle: "오류",
    fileSaveErrorBody: "파일을 저장할 수 없습니다.",
    ok: "확인",
    cancel: "취소",
    sharePdfTitle: "PDF 공유",
  },
  ar: {
    imageSavedTitle: "تم حفظ الصورة",
    imageSavedBody: "تم الحفظ في معرض الصور.",
    permissionDeniedTitle: "الإذن مرفوض",
    permissionDeniedBody: "نحتاج إلى الوصول إلى المعرض لحفظ الصور.",
    fileSaveErrorTitle: "خطأ",
    fileSaveErrorBody: "تعذّر حفظ الملف.",
    ok: "حسنًا",
    cancel: "إلغاء",
    sharePdfTitle: "مشاركة PDF",
  },
  hi: {
    imageSavedTitle: "छवि सहेजी गई",
    imageSavedBody: "आपकी गैलरी में सहेजा गया।",
    permissionDeniedTitle: "अनुमति अस्वीकृत",
    permissionDeniedBody: "छवियाँ सहेजने के लिए गैलरी पहुँच आवश्यक है।",
    fileSaveErrorTitle: "त्रुटि",
    fileSaveErrorBody: "फ़ाइल सहेजी नहीं जा सकी।",
    ok: "ठीक है",
    cancel: "रद्द करें",
    sharePdfTitle: "PDF साझा करें",
  },
};

export function getMobileNativeUiMessages(locale: AppLocale): MobileNativeUiMessages {
  return MOBILE_NATIVE_UI[locale] ?? MOBILE_NATIVE_UI[DEFAULT_LOCALE];
}
