export class FractionFormatter {
  static toFractionString(number) {
    if (!isFinite(number)) return String(number);
    try {
      const frac = math.fraction(number);
      const isNegative = number < 0;
      const n = Math.abs(frac.n);
      const d = Math.abs(frac.d);
      const gcd = math.gcd(n, d);

      const finalN = n / gcd;
      const finalD = d / gcd;

      if (finalD === 1) return isNegative ? `-${finalN}` : `${finalN}`;
      return isNegative ? `-${finalN}/${finalD}` : `${finalN}/${finalD}`;
    } catch {
      return String(number);
    }
  }

  static toMixedFractionString(number) {
    if (!isFinite(number)) return String(number);
    try {
      const frac = math.fraction(number);
      const isNegative = number < 0;
      const n = Math.abs(frac.n);
      const d = Math.abs(frac.d);

      if (d === 1) return isNegative ? `-${n}` : `${n}`;

      const whole = Math.floor(n / d);
      const rem = n % d;

      if (whole === 0) return isNegative ? `-${rem}/${d}` : `${rem}/${d}`;
      if (rem === 0) return isNegative ? `-${whole}` : `${whole}`;

      return isNegative ? `-${whole} ${rem}/${d}` : `${whole} ${rem}/${d}`;
    } catch {
      return String(number);
    }
  }
}