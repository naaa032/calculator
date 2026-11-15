export class MatrixEngine {
  constructor() {
    this.configureMathJS();
  }

  configureMathJS() {
    math.config({ number: "number", precision: 14 });
  }

  /**
   * Validasi ukuran matriks sebelum operasi perkalian
   */
  validateDimensions(expr) {
    // Regex sederhana untuk mengekstrak pola 2D Array [[...], [...]]
    const matrixRegex = /\[\s*\[[\d\s,.\-+*\/]+\]\s*(,\s*\[[\d\s,.\-+*\/]+\]\s*)*\]/g;
    const matches = expr.match(matrixRegex);

    // Jika ada perkalian antara dua matriks
    if (matches && matches.length >= 2 && expr.includes("*")) {
      try {
        const matA = math.evaluate(matches[0]);
        const matB = math.evaluate(matches[1]);

        if (matA && matB) {
          const sizeA = math.size(matA); // [barisA, kolomA]
          const sizeB = math.size(matB); // [barisB, kolomB]

          const colsA = Array.isArray(sizeA) ? sizeA[1] : sizeA._data[1];
          const rowsB = Array.isArray(sizeB) ? sizeB[0] : sizeB._data[0];

          if (colsA !== rowsB) {
            return {
              valid: false,
              message: `Ukuran matriks tidak cocok untuk perkalian! (Matriks 1: ${sizeA[0]}x${colsA}, Matriks 2: ${rowsB}x${sizeB[1]}). Syarat: Kolom Matriks 1 (${colsA}) harus sama dengan Baris Matriks 2 (${rowsB}).`
            };
          }
        }
      } catch (e) {
        // Abaikan jika pemindaian manual gagal, biarkan math.evaluate yang menangani
      }
    }
    return { valid: true };
  }

  evaluate(expr) {
    if (!expr) return "";

    let cleanExpr = expr
      .replace(/÷/g, "/")
      .replace(/×/g, "*")
      .trim();

    // Cek validasi dimensi
    const validation = this.validateDimensions(cleanExpr);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    try {
      const result = math.evaluate(cleanExpr);

      if (result && (result.isMatrix || Array.isArray(result))) {
        const matrixArray = result.isMatrix ? result.toArray() : result;
        return this.formatMatrixOutput(matrixArray);
      }

      if (typeof result === "number") {
        return math.format(result, { precision: 12 });
      }

      return String(result);
    } catch (err) {
      console.error("Matrix Error:", err);
      throw err;
    }
  }

  formatMatrixOutput(arr) {
    if (!Array.isArray(arr)) return String(arr);
    return JSON.stringify(arr)
      .replace(/],/g, "],\n ")
      .replace(/\[\[/g, "[ [")
      .replace(/]]/g, "] ]");
  }
}