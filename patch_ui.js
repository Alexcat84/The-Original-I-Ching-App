const fs = require('fs');

let content = fs.readFileSync('apps/web/src/app/page.tsx', 'utf8');

const oldBlock = `<div className="oracle-toggle-options-row">
                                <button
                                  type="button"
                                  className={\`oracle-toggle-option \${translatorId === "wilhelm" ? "is-active" : ""}\`}
                                  onClick={() => setTranslatorId("wilhelm")}
                                  disabled={loading}
                                >
                                  <span>Wilhelm</span>
                                </button>
                                <button
                                  type="button"
                                  className={\`oracle-toggle-option \${translatorId === "zhouyi" ? "is-active" : ""}\`}
                                  onClick={() => setTranslatorId("zhouyi")}
                                  disabled={loading}
                                >
                                  <span>Zhou Yi</span>
                                </button>
                                <button
                                  type="button"
                                  className={\`oracle-toggle-option \${translatorId === "legge" ? "is-active" : ""}\`}
                                  onClick={() => setTranslatorId("legge")}
                                  disabled={loading}
                                >
                                  <span>Legge</span>
                                </button>
                                <button
                                  type="button"
                                  className={\`oracle-toggle-option \${translatorId === "master_combined" ? "is-active" : ""}\`}
                                  onClick={() =>
                                    setTranslatorId("master_combined")
                                  }
                                  disabled={loading}
                                >
                                  <span className="oracle-toggle-master-label">
                                    {chrome.translatorMasterCombined}
                                  </span>
                                </button>
                              </div>`;

const newBlock = `<div className="oracle-toggle-options-row">
                                <button
                                  type="button"
                                  className={\`oracle-toggle-option \${translatorId === "wilhelm" ? "is-active" : ""}\`}
                                  onClick={() => { setError(null); setTranslatorId("wilhelm"); }}
                                  disabled={loading}
                                >
                                  <span>Wilhelm</span>
                                </button>
                                <button
                                  type="button"
                                  className={\`oracle-toggle-option \${translatorId === "zhouyi" ? "is-active" : ""} \${!isAdmin && ["free", "seeker"].includes(tier) ? "is-locked" : ""}\`}
                                  onClick={() => {
                                    if (!isAdmin && ["free", "seeker"].includes(tier)) {
                                      setError("Este traductor requiere un pack superior. Revisa la secci\\u00F3n de Packs para desbloquearlo.");
                                    } else {
                                      setError(null);
                                      setTranslatorId("zhouyi");
                                    }
                                  }}
                                  disabled={loading}
                                >
                                  <span>Zhou Yi</span>
                                  {!isAdmin && ["free", "seeker"].includes(tier) && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, marginLeft: 4, opacity: 0.6, display: "inline-block", verticalAlign: "middle", marginTop: -2 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className={\`oracle-toggle-option \${translatorId === "legge" ? "is-active" : ""} \${!isAdmin && tier === "free" ? "is-locked" : ""}\`}
                                  onClick={() => {
                                    if (!isAdmin && tier === "free") {
                                      setError("Este traductor requiere un pack superior. Revisa la secci\\u00F3n de Packs para desbloquearlo.");
                                    } else {
                                      setError(null);
                                      setTranslatorId("legge");
                                    }
                                  }}
                                  disabled={loading}
                                >
                                  <span>Legge</span>
                                  {!isAdmin && tier === "free" && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, marginLeft: 4, opacity: 0.6, display: "inline-block", verticalAlign: "middle", marginTop: -2 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className={\`oracle-toggle-option \${translatorId === "master_combined" ? "is-active" : ""} \${!isAdmin && ["free", "seeker", "practitioner"].includes(tier) ? "is-locked" : ""}\`}
                                  onClick={() => {
                                    if (!isAdmin && ["free", "seeker", "practitioner"].includes(tier)) {
                                      setError("Este traductor requiere un pack superior. Revisa la secci\\u00F3n de Packs para desbloquearlo.");
                                    } else {
                                      setError(null);
                                      setTranslatorId("master_combined");
                                    }
                                  }}
                                  disabled={loading}
                                >
                                  <span className="oracle-toggle-master-label" style={{ display: "inline-flex", alignItems: "center" }}>
                                    {chrome.translatorMasterCombined}
                                    <span style={{ fontSize: "0.75em", opacity: 0.8, marginLeft: 4, fontWeight: "normal" }}>(2 tokens)</span>
                                  </span>
                                  {!isAdmin && ["free", "seeker", "practitioner"].includes(tier) && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, marginLeft: 4, opacity: 0.6, display: "inline-block", verticalAlign: "middle", marginTop: -2 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                  )}
                                </button>
                              </div>`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync('apps/web/src/app/page.tsx', content);

console.log("Done");
