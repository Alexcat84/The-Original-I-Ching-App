/** Remove model-added boilerplate and trailing asterisk disclaimers from oracle text. */
export function stripInterpretationFluff(text: string): string {
  let t = text.trim();
  t = t.replace(/\n*\*[^*\n][\s\S]*?\*\s*$/, "").trim();
  const boiler: RegExp[] = [
    /(?:^|\n)(?:Es importante tener en cuenta|Debes tener presente|Cabe recordar|Ten en cuenta que|Es crucial entender|Recuerda que|No olvides que)[^\n]*\n?/gi,
    /(?:^|\n)(?:It is important to note|Please note that|Keep in mind that|Remember that)[^\n]*\n?/gi,
    /(?:^|\n)[^\n]*interpretación[^\n]*simbólica[^\n]*\n?/gi,
    /(?:^|\n)[^\n]*no debe considerarse[^\n]*predicción[^\n]*\n?/gi,
    /(?:^|\n)[^\n]*predicción certera[^\n]*\n?/gi,
  ];
  for (const r of boiler) t = t.replace(r, "\n");
  return t.replace(/\n{3,}/g, "\n\n").trim();
}
