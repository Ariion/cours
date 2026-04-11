import { useEffect, useRef } from "react";

// Charge KaTeX depuis CDN si pas encore chargé
function loadKaTeX() {
  return new Promise((resolve) => {
    if (window.katex) { resolve(window.katex); return; }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    script.onload = () => {
      // Auto-render
      const script2 = document.createElement("script");
      script2.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js";
      script2.onload = () => resolve(window.katex);
      document.head.appendChild(script2);
    };
    document.head.appendChild(script);
  });
}

// Rendu d'une formule pure (bloc)
export function MathBlock({ formula }) {
  const ref = useRef(null);

  useEffect(() => {
    loadKaTeX().then(katex => {
      if (ref.current && formula) {
        try {
          katex.render(formula, ref.current, { displayMode: true, throwOnError: false });
        } catch (e) {
          ref.current.textContent = formula;
        }
      }
    });
  }, [formula]);

  return <span ref={ref} />;
}

// Rendu mixte texte + formules $...$
export default function MathRenderer({ formula, block = false }) {
  const ref = useRef(null);

  useEffect(() => {
    loadKaTeX().then(katex => {
      if (!ref.current || !formula) return;

      if (block) {
        try {
          katex.render(formula, ref.current, { displayMode: true, throwOnError: false });
        } catch (e) {
          ref.current.textContent = formula;
        }
        return;
      }

      // Mode inline : parse $...$ dans le texte
      const parts = formula.split(/(\$[^$]+\$)/g);
      ref.current.innerHTML = "";

      parts.forEach(part => {
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          const mathStr = part.slice(1, -1);
          const span = document.createElement("span");
          try {
            katex.render(mathStr, span, { displayMode: false, throwOnError: false });
          } catch (e) {
            span.textContent = part;
          }
          ref.current.appendChild(span);
        } else {
          const text = document.createTextNode(part);
          ref.current.appendChild(text);
        }
      });
    });
  }, [formula, block]);

  return <span ref={ref} style={{ lineHeight: 1.8 }} />;
}
