export class CalculusEngine {
  evaluate(expr) {
    if (!expr) return "";
    let clean = expr.replace(/÷/g, "/").replace(/×/g, "*").trim();

    // Format penulisan turunan: derivative('x^2 + 2x', 'x') atau d/dx(x^2)
    if (clean.startsWith("d/dx(") && clean.endsWith(")")) {
      clean = clean.slice(5, -1);
    }

    try {
      // Hitung turunan terhadap variabel x
      const res = math.derivative(clean, 'x');
      return res.toString();
    } catch (err) {
      console.error("Calculus Error:", err);
      throw new Error("Format Turunan Salah. Contoh: x^3 + 2x");
    }
  }
}