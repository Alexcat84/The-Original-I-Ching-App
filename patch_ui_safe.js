const fs = require('fs');
let code = fs.readFileSync('apps/web/src/app/page.tsx', 'utf8');

const handleFn = `
  const handleTranslatorChange = (id: "wilhelm" | "legge" | "zhouyi" | "master_combined") => {
    if (isAdmin) {
      setError(null);
      setTranslatorId(id);
      return;
    }
    if (id === "legge" && tier === "free") {
      setError("Este traductor requiere el pack Seeker. Visita la sección de Packs para desbloquearlo.");
      return;
    }
    if (id === "zhouyi" && ["free", "seeker"].includes(tier)) {
      setError("Este traductor requiere el pack Practitioner. Visita la sección de Packs para desbloquearlo.");
      return;
    }
    if (id === "master_combined" && ["free", "seeker", "practitioner"].includes(tier)) {
      setError("Este traductor requiere el pack Master. Visita la sección de Packs para desbloquearlo.");
      return;
    }
    setError(null);
    setTranslatorId(id);
  };
`;

code = code.replace(
  /const \[translatorId, setTranslatorId\] = useState<\s*"wilhelm" \| "legge" \| "zhouyi" \| "master_combined"\s*>\("wilhelm"\);/,
  `const [translatorId, setTranslatorId] = useState<\n      "wilhelm" | "legge" | "zhouyi" | "master_combined"\n    >("wilhelm");\n${handleFn}`
);

code = code.replace(
  /onClick=\{\(\) => setTranslatorId\("wilhelm"\)\}/,
  'onClick={() => handleTranslatorChange("wilhelm")}'
);

code = code.replace(
  /className=\{`oracle-toggle-option \$\{translatorId === "zhouyi" \? "is-active" : ""\}`\}/,
  'className={`oracle-toggle-option ${translatorId === "zhouyi" ? "is-active" : ""} ${!isAdmin && ["free", "seeker"].includes(tier) ? "is-locked" : ""}`}'
);
code = code.replace(
  /onClick=\{\(\) => setTranslatorId\("zhouyi"\)\}/,
  'onClick={() => handleTranslatorChange("zhouyi")}'
);
code = code.replace(
  /<span>Zhou Yi<\/span>/,
  '<span>Zhou Yi</span>{!isAdmin && ["free", "seeker"].includes(tier) && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, marginLeft: 4, opacity: 0.6, display: "inline-block", verticalAlign: "middle", marginTop: -2 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}'
);

code = code.replace(
  /className=\{`oracle-toggle-option \$\{translatorId === "legge" \? "is-active" : ""\}`\}/,
  'className={`oracle-toggle-option ${translatorId === "legge" ? "is-active" : ""} ${!isAdmin && tier === "free" ? "is-locked" : ""}`}'
);
code = code.replace(
  /onClick=\{\(\) => setTranslatorId\("legge"\)\}/,
  'onClick={() => handleTranslatorChange("legge")}'
);
code = code.replace(
  /<span>Legge<\/span>/,
  '<span>Legge</span>{!isAdmin && tier === "free" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, marginLeft: 4, opacity: 0.6, display: "inline-block", verticalAlign: "middle", marginTop: -2 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}'
);

code = code.replace(
  /className=\{`oracle-toggle-option \$\{translatorId === "master_combined" \? "is-active" : ""\}`\}/,
  'className={`oracle-toggle-option ${translatorId === "master_combined" ? "is-active" : ""} ${!isAdmin && ["free", "seeker", "practitioner"].includes(tier) ? "is-locked" : ""}`}'
);
code = code.replace(
  /onClick=\{\(\) =>\s*setTranslatorId\("master_combined"\)\s*\}/,
  'onClick={() => handleTranslatorChange("master_combined")}'
);
code = code.replace(
  /<span className="oracle-toggle-master-label">\s*\{chrome\.translatorMasterCombined\}\s*<\/span>/,
  '<span className="oracle-toggle-master-label" style={{ display: "inline-flex", alignItems: "center" }}>{chrome.translatorMasterCombined}<span style={{ fontSize: "0.75em", opacity: 0.8, marginLeft: 4, fontWeight: "normal" }}>(2 tokens)</span></span>{!isAdmin && ["free", "seeker", "practitioner"].includes(tier) && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, marginLeft: 4, opacity: 0.6, display: "inline-block", verticalAlign: "middle", marginTop: -2 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}'
);

fs.writeFileSync('apps/web/src/app/page.tsx', code);
console.log("Patch applied!");
