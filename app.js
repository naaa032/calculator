import { TrigEngine } from './TrigEngine.js';
import { AlgebraEngine } from './AlgebraEngine.js';
import { FractionFormatter } from './FractionFormatter.js';
import { MatrixEngine } from './MatrixEngine.js';
import { CalculusEngine } from './CalculusEngine.js';

class CalculatorApp {
  constructor() {
    this.trigEngine = new TrigEngine();
    this.algebraEngine = new AlgebraEngine(this.trigEngine);
    this.matrixEngine = new MatrixEngine();
    this.calculusEngine = new CalculusEngine();
    
    this.showFraction = false;
    this.calcMode = 'standar';
    this.isResultShown = false;

    // Data Preset Pintas & Contoh per Mode
    this.modePresets = {
      standar: {
        title: "Pintas Aritmatika",
        example: "sin(30) + sqrt(16)",
        templates: [
          { label: "x²", value: "^2" },
          { label: "x³", value: "^3" },
          { label: "1/x", value: "1/(" },
          { label: "%", value: "%" },
          { label: "|x|", value: "abs(" },
          { label: "fact", value: "factorial(" }
        ]
      },
      aljabar: {
        title: "Pintas Aljabar",
        example: "2x + 5x - 3",
        templates: [
          { label: "x", value: "x" },
          { label: "y", value: "y" },
          { label: "x²", value: "x^2" },
          { label: "(a+b)", value: "(" },
          { label: "simplify", value: "simplify(" },
          { label: "=", value: "=" }
        ]
      },
      matriks: {
        title: "Pintas Matriks",
        example: "det([[1,2],[3,4]])",
        templates: [
          { label: "+ 2x2", value: "[[0,0],[0,0]]" },
          { label: "+ 3x3", value: "[[0,0,0],[0,0,0],[0,0,0]]" },
          { label: "det", value: "det(" },
          { label: "inv", value: "inv(" },
          { label: "trans", value: "transpose(" },
          { label: "[ ]", value: "[" }
        ]
      },
      kalkulus: {
        title: "Pintas Kalkulus",
        example: "d/dx(x^3 + 2x)",
        templates: [
          { label: "d/dx", value: "d/dx(" },
          { label: "x^n", value: "x^" },
          { label: "sin(x)", value: "sin(x)" },
          { label: "cos(x)", value: "cos(x)" },
          { label: "e^x", value: "e^x" },
          { label: "ln(x)", value: "ln(x)" }
        ]
      }
    };

    this.initDOM();
    this.bindEvents();
    this.updateHelperPanel();
  }

  initDOM() {
    this.display = document.getElementById("display");
    // Hanya ambil tombol di dalam grid utama kalkulator (agar tidak bentrok dengan tombol pintas)
    this.buttons = Array.from(document.querySelectorAll(".calculator .buttons button"));
    this.btnEquals = document.getElementById("equals");
    this.btnToggle = document.getElementById("toggleFrac");
    this.btnDEL = document.getElementById("DEL");
    
    this.modeCards = Array.from(document.querySelectorAll(".mode-card"));
    this.modeIndicator = document.getElementById("modeIndicator");
    
    this.helperTitle = document.getElementById("helperTitle");
    this.quickTemplateGrid = document.getElementById("quickTemplateGrid");
    this.exampleCode = document.getElementById("exampleCode");

    this.display.focus();
  }

  getDisplayText() {
    return this.display.textContent || "";
  }

  setDisplayText(txt) {
    this.display.textContent = String(txt);
    this.placeCaretAtEnd();
  }

  placeCaretAtEnd() {
    this.display.focus();
    if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
      const range = document.createRange();
      range.selectNodeContents(this.display);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  handleAutoReset(textInput) {
    if (this.isResultShown) {
      const isOperator = /^[+×÷^\-*\/]$/.test(textInput.trim());
      if (!isOperator) {
        this.display.textContent = "";
      }
      this.isResultShown = false;
    }
  }

  // PINTAS TERTENTU: BERHASIL DITAMBAHKAN VIA FUNCTION INI
  insertTextAtCaret(text) {
    this.handleAutoReset(text);

    const sel = window.getSelection();
    if (!sel.rangeCount || !this.display.contains(sel.anchorNode)) {
      this.display.textContent += text;
      this.placeCaretAtEnd();
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
    this.display.focus();
  }

  deleteAtCaret() {
    this.display.focus();
    const sel = window.getSelection();
    if (!sel.rangeCount || !this.display.contains(sel.anchorNode)) {
      const txt = this.getDisplayText();
      this.setDisplayText(txt.slice(0, -1));
      return;
    }

    const range = sel.getRangeAt(0);
    if (!range.collapsed) {
      range.deleteContents();
      return;
    }

    const node = range.startContainer;
    const offset = range.startOffset;

    if (node.nodeType === Node.TEXT_NODE && offset > 0) {
      const text = node.nodeValue;
      node.nodeValue = text.slice(0, offset - 1) + text.slice(offset);
      
      const newRange = document.createRange();
      newRange.setStart(node, offset - 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } else if (node === this.display && offset > 0) {
      const childNode = node.childNodes[offset - 1];
      if (childNode) childNode.remove();
    }
  }

  updateHelperPanel() {
    const preset = this.modePresets[this.calcMode] || this.modePresets.standar;
    
    if (this.helperTitle) this.helperTitle.textContent = preset.title;
    if (this.exampleCode) this.exampleCode.textContent = preset.example;
    
    if (this.quickTemplateGrid) {
      this.quickTemplateGrid.innerHTML = "";

      preset.templates.forEach(tmpl => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tmpl-btn";
        btn.textContent = tmpl.label;
        
        // Memastikan event listener pintas berjalan saat diklik
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          this.insertTextAtCaret(tmpl.value);
        });
        
        this.quickTemplateGrid.appendChild(btn);
      });
    }
  }

  evaluateCurrent() {
    const raw = this.getDisplayText();
    if (!raw) return;

    this.isResultShown = true;

    if (this.calcMode === 'kalkulus') {
      try {
        const result = this.calculusEngine.evaluate(raw);
        this.setDisplayText(result);
      } catch (err) {
        this.setDisplayText(err.message || "Error Kalkulus");
      }
      return;
    }

    if (this.calcMode === 'aljabar') {
      const expr = this.algebraEngine.normalize(raw);
      try {
        const result = this.algebraEngine.simplify(expr);
        this.setDisplayText(result);
      } catch (err) {
        this.setDisplayText("Error Aljabar");
      }
      return;
    }

    if (this.calcMode === 'matriks') {
      try {
        const result = this.matrixEngine.evaluate(raw);
        this.setDisplayText(result);
      } catch (err) {
        this.setDisplayText(err.message || "Error Matriks");
      }
      return;
    }

    const expr = this.algebraEngine.normalize(raw);
    const exactTrig = this.trigEngine.getExactValue(expr);
    if (exactTrig) {
      this.setDisplayText(exactTrig);
      return;
    }

    try {
      const result = this.algebraEngine.evaluate(expr);

      if (typeof result === "number") {
        if (!isFinite(result)) {
          this.setDisplayText("Tidak terdefinisi");
          return;
        }

        if (this.showFraction) {
          try {
            this.setDisplayText(FractionFormatter.toFractionString(result));
          } catch {
            this.setDisplayText(FractionFormatter.toMixedFractionString(result));
          }
        } else {
          this.setDisplayText(math.format(result, { precision: 12 }));
        }
      } else {
        this.setDisplayText(this.algebraEngine.simplify(result));
      }
    } catch (err) {
      console.error("Calculation Error:", err);
      this.setDisplayText("Error");
    }
  }

  animateButton(btnEl) {
    if (!btnEl) return;
    btnEl.classList.add("active-key");
    setTimeout(() => btnEl.classList.remove("active-key"), 150);
  }

  bindEvents() {
    // Handling input manual pada elemen display
    this.display.addEventListener("beforeinput", (e) => {
      if (this.isResultShown && e.data) {
        this.handleAutoReset(e.data);
      }
    });

    // Handling Switch Mode Sidebar
    this.modeCards.forEach(card => {
      card.addEventListener("click", () => {
        this.modeCards.forEach(c => c.classList.remove("active"));
        card.classList.add("active");

        const selectedMode = card.getAttribute("data-mode");
        this.calcMode = selectedMode;

        const titleNode = card.querySelector(".mode-title");
        const title = titleNode ? titleNode.textContent.trim() : selectedMode;
        
        if (this.modeIndicator) {
          this.modeIndicator.textContent = `Mode: ${title}`;
        }

        this.updateHelperPanel();
      });
    });

    // Handling Tombol UI Utamanya
    this.buttons.forEach(btn => {
      const txt = btn.textContent.trim();
      btn.addEventListener("click", () => {
        if (btn === this.btnEquals || btn === this.btnToggle || btn === this.btnDEL) return;

        if (txt === "C") {
          this.setDisplayText("");
          this.isResultShown = false;
          this.animateButton(btn);
          return;
        }

        if (/^(sin|cos|tan|csc|sec|cot|log|ln)$/.test(txt)) {
          this.insertTextAtCaret(txt + "(");
        } else {
          this.insertTextAtCaret(txt);
        }
        this.animateButton(btn);
      });
    });

    this.btnEquals.addEventListener("click", () => {
      this.evaluateCurrent();
      this.animateButton(this.btnEquals);
    });

    this.btnToggle.addEventListener("click", (e) => {
      this.showFraction = !this.showFraction;
      this.evaluateCurrent();
      this.animateButton(e.target);
    });

    this.btnDEL.addEventListener("click", () => {
      this.deleteAtCaret();
      this.animateButton(this.btnDEL);
    });

    // Event Listener Keyboard Fisik Lengkap
    document.addEventListener("keydown", (e) => {
      if (document.activeElement !== this.display) {
        this.display.focus();
      }

      const key = e.key;

      if (["Shift", "Control", "Alt", "Meta", "CapsLock", "NumLock"].includes(key)) {
        return;
      }

      if (key === "Enter" || key === "=") {
        e.preventDefault();
        this.evaluateCurrent();
        this.animateButton(this.btnEquals);
        return;
      }

      if (key === "Backspace") {
        e.preventDefault();
        this.deleteAtCaret();
        this.animateButton(this.btnDEL);
        return;
      }

      if (key === "Delete" || key === "Insert") {
        e.preventDefault();
        this.setDisplayText("");
        this.isResultShown = false;
        this.animateButton(this.buttons.find(b => b.textContent.trim() === "C"));
        return;
      }

      if (key === "Tab") {
        e.preventDefault();
        this.showFraction = !this.showFraction;
        this.evaluateCurrent();
        this.animateButton(this.btnToggle);
        return;
      }

      let charToInsert = null;

      if (key === "*") charToInsert = "×";
      else if (key === "/") charToInsert = "÷";
      else if (key.toLowerCase() === "r") charToInsert = "√";
      else if (key.toLowerCase() === "p") charToInsert = "π";
      else if (/^[0-9.+\-^()xXyY,\[\]]$/.test(key)) charToInsert = key;

      if (charToInsert !== null) {
        e.preventDefault();
        this.insertTextAtCaret(charToInsert);

        const matchedBtn = this.buttons.find(b => {
          const t = b.textContent.trim();
          return t === charToInsert || (charToInsert === "×" && t === "×") || (charToInsert === "÷" && t === "÷");
        });
        if (matchedBtn) this.animateButton(matchedBtn);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new CalculatorApp();
});