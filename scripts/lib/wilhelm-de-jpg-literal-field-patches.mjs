/**
 * JPG-verified field patches (AUD-DAT-W-07) — hex-specific literal overrides.
 * Only fields confirmed against 300 DPI scan.
 * QA code: AU-FID-W-030 · v1.0.0
 */

/** @type {Record<number, Record<string, string>>} */
export const JPG_LITERAL_FIELD_PATCHES = {
  33: {
    image_oraculo:
      "Unter dem Himmel ist der Berg: das Bild des Rückzugs. So\nhält der Edle den Gemeinen fern: nicht zornig, sondern gemessen.",
    L4_b_comentario:
      "Der Edle zieht sich freiwillig zurück, das bringt dem Gemeinen Niedergang.\nHier ist der Eintritt in das obere Halbzeichen vollzogen. Da der Himmel\nstark ist, haben alle drei oberen Striche einen ungehemmten Rückzug. Hier\nist die Trennungslinie. Indem der Edle sich nach oben zurückzieht, bleibt\nder Gemeine allein unten. Das ist für ihn schlimm — nicht für den Edlen —,\ndenn er kann sich nicht selbst regieren.",
    L5_b_comentario:
      '„Freundlicher Rückzug. Beharrlichkeit bringt Heil";\nweil dadurch der Wille eine richtige Entscheidung trifft.\nDer Wille ist hier in Beziehung zum Willen der Sechs auf zweitem Platz,\nda die beiden Striche sich entsprechen. Dort der starke Wille, festzuhalten\nwas für die Gemeinen gut ist —, hier der klare Wille, beharrlich zu blei-\nben und sich nicht halten zu lassen.\nEine andre Erklärung bei Dschou I Hong Giä verdient Erwähnung, daß es\nsich hier nur um einen inneren Rückzug handle, während man äußerlich an\nseinem Posten bleibt, um den Rückschlag vorzubereiten.',
    L6_b_comentario:
      '„Heiterer Rückzug. Alles ist fördernd";\nweil nämlich kein Zweifel mehr möglich ist.\nMan weiß hier genau, was man zu tun hat. Unter solchen Umständen ist\ndie Durchführung des Entschlusses nicht schwer.',
  },
  64: {
    L6_b_comentario:
      'Wenn man beim Weintrinken sein Haupt naß macht, so kennt\nman eben keine Mäßigkeit.\nDer obere Strich ist stark und an sich günstig. Durch das Zeichen Kan, zu\ndessen oberem Strich er in Beziehung steht, wird das Bild des Weins gege-\nben. Auch hier kommt wie im vorigen Zeichen das Bild des Hauptes herein,\ndas begossen wird. Aber es ist nur eine Möglichkeit, eine Gefahr, vor der\nman sich schützen kann.\nSo ist am Abschluß des Buchs der Wandlungen eine Verzahnung stehen-\ngelassen, die zu neuer Gestaltung und neuem Werden führt. Derselbe Ge-\ndanke kommt übrigens auch bei den vermischten Zeichen zum Ausdruck,\nwenn sie das Zeichen Guai „der Durchbruch" an den Schluß stellen und mit\ndem Satz schließen:\nDer Durchbruch bedeutet Entschlossenheit. Das Starke wen-\ndet sich entschlossen gegen das Schwache. Des Edlen Weg\nist im Aufsteigen, des Gemeinen Weg führt in Trauer.',
  },
};
