export class TrigEngine {
  constructor() {
    this.specialExactMap = {
      "sin(0)": "0", "sin(30)": "1/2", "sin(45)": "√2/2", "sin(60)": "√3/2", "sin(90)": "1",
      "cos(0)": "1", "cos(30)": "√3/2", "cos(45)": "√2/2", "cos(60)": "1/2", "cos(90)": "0",
      "tan(0)": "0", "tan(30)": "√3/3", "tan(45)": "1", "tan(60)": "√3", "tan(90)": "Tidak terdefinisi",
      "csc(30)": "2", "csc(45)": "√2", "csc(60)": "2/√3", "csc(90)": "1",
      "sec(60)": "2", "sec(45)": "√2", "sec(30)": "2/√3", "sec(0)": "1",
      "cot(30)": "√3", "cot(45)": "1", "cot(60)": "1/√3"
    };
  }

  getTrigOverrides() {
    const toRad = deg => (Number(deg) * Math.PI) / 180;
    return {
      sin: x => Math.sin(toRad(x)),
      cos: x => Math.cos(toRad(x)),
      tan: x => Math.tan(toRad(x)),
      cot: x => 1 / Math.tan(toRad(x)),
      sec: x => 1 / Math.cos(toRad(x)),
      csc: x => 1 / Math.sin(toRad(x))
    };
  }

  getExactValue(expr) {
    const key = expr.replace(/\s+/g, "");
    return this.specialExactMap[key] || null;
  }
}