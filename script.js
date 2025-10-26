const display = document.getElementById("display");
const buttons = Array.from(document.querySelectorAll(".buttons button"));
const btnEquals = document.getElementById("equals");
const btnToggle = document.getElementById("toggleFrac");
const btnDEL = document.getElementById("DEL");

let showFraction = false;

// Konfigurasi math.js
math.config({ number: "number", precision: 14 });

// Override trig functions -> pakai derajat
math.import({
  sin: x => Math.sin((Number(x) * Math.PI) / 180),
  cos: x => Math.cos((Number(x) * Math.PI) / 180),
  tan: x => Math.tan((Number(x) * Math.PI) / 180),
  cot: x => 1 / Math.tan((Number(x) * Math.PI) / 180),
  sec: x => 1 / Math.cos((Number(x) * Math.PI) / 180),
  csc: x => 1 / Math.sin((Number(x) * Math.PI) / 180)
}, { override: true });

display.focus();

function getDisplayText() {
  return display.textContent || "";
}
function setDisplayText(txt) {
  display.textContent = String(txt);
  placeCaretAtEnd(display);
}

function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function insertTextAtCaret(text) {
  const sel = window.getSelection();
  if (!sel.rangeCount) {
    display.textContent += text;
    placeCaretAtEnd(display);
    return;
  }
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  display.focus();
}

function normalizeExpr(raw) {
  if (!raw) return "";
  let expr = raw
    .replace(/\u00A0/g, "")
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt") 
    .replace(/\*\*/g, "^")
    .trim();

  expr = expr.replace(/sqrt([a-zA-Z0-9π]+)/g, "sqrt($1)");

  return expr;
}


// Fungsi konversi ke pecahan campuran
function toMixedFraction(num) {
  try {
    if (!isFinite(num)) return String(num);
    const frac = math.fraction(num);
    const n = frac.n, d = frac.d;
    if (d === 1) return `${n}`;
    const whole = Math.trunc(n / d);
    const rem = Math.abs(n % d);
    if (whole === 0) return `${n}/${d}`;
    return `${whole} ${rem}/${d}`;
  } catch {
    return String(num);
  }
}

// 🔹 Fungsi utama evaluasi
function evaluateCurrent() {
  const raw = getDisplayText();
  const expr = normalizeExpr(raw);
  if (!expr) return;

  const specialTrigExact = {
    "sin(0)": "0", "sin(30)": "1/2", "sin(45)": "√2/2", "sin(60)": "√3/2", "sin(90)": "1",
    "cos(0)": "1", "cos(30)": "√3/2", "cos(45)": "√2/2", "cos(60)": "1/2", "cos(90)": "0",
    "tan(0)": "0", "tan(30)": "√3/3", "tan(45)": "1", "tan(60)": "√3", "tan(90)": "Tidak terdefinisi",
    "csc(30)": "2", "csc(45)": "√2", "csc(60)": "2/√3", "csc(90)": "1",
    "sec(60)": "2", "sec(45)": "√2", "sec(30)": "2/√3", "sec(0)": "1",
    "cot(30)": "√3", "cot(45)": "1", "cot(60)": "1/√3"
  };

  const key = expr.replace(/\s+/g, "");
  if (specialTrigExact[key]) {
    setDisplayText(specialTrigExact[key]);
    return;
  }

  try {
    const result = math.evaluate(expr);

    if (typeof result === "number" && isFinite(result)) {
      if (showFraction) {
        try {
          const frac = math.fraction(result);
          const gcd = math.gcd(frac.n, frac.d);
          const n = frac.n / gcd;
          const d = frac.d / gcd;
          const out = (d === 1) ? `${n}` : `${n}/${d}`;
          setDisplayText(out);
        } catch {
          setDisplayText(toMixedFraction(result));
        }
      } else {
        setDisplayText(math.format(result, { precision: 12 }));
      }
    } else {
      // non-numeric (symbolic)
      const simp = math.simplify(result);
      setDisplayText(simp.toString());
    }
  } catch (err) {
    console.error("evaluateCurrent error:", err);
    setDisplayText("Error");
  }
}

// Animasi tombol
function animateButton(btnEl) {
  if (!btnEl) return;
  btnEl.classList.add("active-key");
  setTimeout(() => btnEl.classList.remove("active-key"), 150);
}

buttons.forEach(btn => {
  const txt = btn.textContent.trim();
  btn.addEventListener("click", () => {
    if (btn === btnEquals || btn === btnToggle || btn === btnDEL) return;

    if (txt === "C") {
      setDisplayText("");
      animateButton(btn);
      return;
    }

    if (/^(sin|cos|tan|csc|sec|cot|log|ln)$/.test(txt)) {
      insertTextAtCaret(txt + "(");
    } else {
      insertTextAtCaret(txt);
    }
    animateButton(btn);
  });
});

btnEquals.addEventListener("click", () => {
  evaluateCurrent();
  animateButton(btnEquals);
});

btnToggle.addEventListener("click", (e) => {
  showFraction = !showFraction;
  evaluateCurrent();
  animateButton(e.target);
});

btnDEL.addEventListener("click", () => {
  const txt = getDisplayText();
  setDisplayText(txt.slice(0, -1));
  animateButton(btnDEL);
});

document.addEventListener("keydown", (e) => {
  if (document.activeElement !== display) display.focus();
  const key = e.key;

  if (key === "(") {
    const txt = getDisplayText();
    if (txt.endsWith("sqrt")) {
      e.preventDefault();
      const newTxt = txt.slice(0, -4) + "√";
      setDisplayText(newTxt);
      animateButton(buttons.find(b => b.textContent.trim() === "√"));
      return;
    }
  }

  if (key === "*") {
    e.preventDefault();
    insertTextAtCaret("×");
    animateButton(buttons.find(b => b.textContent.trim() === "×"));
    return;
  }

  if (key === "/") {
    e.preventDefault();
    insertTextAtCaret("÷");
    animateButton(buttons.find(b => b.textContent.trim() === "÷"));
    return;
  }

  const keyMap = {
    '*': '×',
    '/': '÷',
    '+': '+',
    '-': '-',
    '(': '(',
    ')': ')',
    'Enter': '=',
    '.': '.',
  };

  const btnEl = buttons.find(b => 
    b.textContent.trim() === (keyMap[key] || key)
  );

  if (btnEl) animateButton(btnEl);

  if (key === "Enter") {
    e.preventDefault();
    evaluateCurrent();
    return;
  }

  if (key === "Tab") {
    e.preventDefault();
    showFraction = !showFraction;
    evaluateCurrent();
    return;
  }

  if (key === "Backspace") {
    e.preventDefault();
    const txt = getDisplayText();
    setDisplayText(txt.slice(0, -1));
    return;
  }

  if (key === "Delete" || key === "Insert") {
    e.preventDefault();
    setDisplayText("");
    return;
  }
});
