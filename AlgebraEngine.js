export class AlgebraEngine {
  constructor(trigEngine) {
    this.trigEngine = trigEngine;
    this.configureMathJS();
  }

  configureMathJS() {
    math.config({ number: "number", precision: 14 });
    math.import(this.trigEngine.getTrigOverrides(), { override: true });
  }

normalize(rawText) {
    if (!rawText) return "";
    let expr = rawText
      .replace(/\u00A0/g, "")
      .replace(/÷/g, "/")
      .replace(/×/g, "*")
      .replace(/π/g, "pi")
      .replace(/√/g, "sqrt")
      .replace(/\*\*/g, "^")
      .replace(/\blog\(/g, "log10(") 
      .replace(/=+$/, "") // FIX BUG: Hapus tanda '=' jika ada di paling belakang string

    expr = expr.replace(/(\d)(\()/g, "$1*$2"); expr = expr.replace(/(\))(\d)/g, "$1*$2");
    expr = expr.replace(/(\d)(pi|sqrt|log10|ln|sin|cos|tan)/g, "$1*$2");

    expr = expr.replace(/sqrt([a-zA-Z0-9π]+)/g, "sqrt($1)");
    return expr;
  }

  evaluate(expr) {
    return math.evaluate(expr);
  }

  simplify(expr) {
    return math.simplify(expr).toString();
  }
}