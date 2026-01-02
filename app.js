function absBigInt(x) {
  return x < 0n ? -x : x;
}

function gcd(a, b) {
  a = absBigInt(a);
  b = absBigInt(b);
  while (b !== 0n) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

class Fraction {
  constructor(n, d = 1n) {
    if (d === 0n) {
      throw new Error("分母不能为 0");
    }
    if (d < 0n) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    this.n = n / g;
    this.d = d / g;
  }

  static zero() {
    return new Fraction(0n, 1n);
  }

  static one() {
    return new Fraction(1n, 1n);
  }

  static fromString(raw) {
    const s = raw.trim();
    if (!s) {
      throw new Error("存在空元素");
    }
    if (s.includes("/")) {
      const parts = s.split("/");
      if (parts.length !== 2) {
        throw new Error(`非法分数：${s}`);
      }
      const n = BigInt(parts[0]);
      const d = BigInt(parts[1]);
      return new Fraction(n, d);
    }
    if (s.includes(".")) {
      const neg = s.startsWith("-");
      const clean = neg ? s.slice(1) : s;
      const parts = clean.split(".");
      if (parts.length !== 2) {
        throw new Error(`非法小数：${s}`);
      }
      const whole = parts[0] === "" ? "0" : parts[0];
      const frac = parts[1];
      const scale = 10n ** BigInt(frac.length);
      const num = BigInt(whole + frac);
      return new Fraction(neg ? -num : num, scale);
    }
    return new Fraction(BigInt(s), 1n);
  }

  isZero() {
    return this.n === 0n;
  }

  neg() {
    return new Fraction(-this.n, this.d);
  }

  add(other) {
    return new Fraction(this.n * other.d + other.n * this.d, this.d * other.d);
  }

  sub(other) {
    return new Fraction(this.n * other.d - other.n * this.d, this.d * other.d);
  }

  mul(other) {
    return new Fraction(this.n * other.n, this.d * other.d);
  }

  div(other) {
    if (other.n === 0n) {
      throw new Error("除以 0");
    }
    return new Fraction(this.n * other.d, this.d * other.n);
  }

  toString() {
    if (this.d === 1n) {
      return this.n.toString();
    }
    return `${this.n.toString()}/${this.d.toString()}`;
  }
}

function cloneMatrix(A) {
  return A.map((row) => row.map((x) => new Fraction(x.n, x.d)));
}

function parseMatrix(text) {
  const rows = text
    .trim()
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (rows.length === 0) {
    throw new Error("矩阵为空");
  }
  const matrix = rows.map((line) => {
    const tokens = line.split(/[\s,]+/).filter(Boolean);
    if (tokens.length === 0) {
      throw new Error("存在空行");
    }
    return tokens.map((t) => Fraction.fromString(t));
  });
  const cols = matrix[0].length;
  for (const row of matrix) {
    if (row.length !== cols) {
      throw new Error("每行列数必须一致");
    }
  }
  return matrix;
}

function matrixDims(A) {
  return { rows: A.length, cols: A[0].length };
}

function identity(n) {
  const I = [];
  for (let i = 0; i < n; i += 1) {
    const row = [];
    for (let j = 0; j < n; j += 1) {
      row.push(i === j ? Fraction.one() : Fraction.zero());
    }
    I.push(row);
  }
  return I;
}

function addMatrix(A, B) {
  const { rows, cols } = matrixDims(A);
  const { rows: r2, cols: c2 } = matrixDims(B);
  if (rows !== r2 || cols !== c2) {
    throw new Error("A 和 B 的尺寸必须相同");
  }
  const out = [];
  for (let i = 0; i < rows; i += 1) {
    const row = [];
    for (let j = 0; j < cols; j += 1) {
      row.push(A[i][j].add(B[i][j]));
    }
    out.push(row);
  }
  return out;
}

function subMatrix(A, B) {
  const { rows, cols } = matrixDims(A);
  const { rows: r2, cols: c2 } = matrixDims(B);
  if (rows !== r2 || cols !== c2) {
    throw new Error("A 和 B 的尺寸必须相同");
  }
  const out = [];
  for (let i = 0; i < rows; i += 1) {
    const row = [];
    for (let j = 0; j < cols; j += 1) {
      row.push(A[i][j].sub(B[i][j]));
    }
    out.push(row);
  }
  return out;
}

function mulMatrix(A, B) {
  const { rows, cols } = matrixDims(A);
  const { rows: r2, cols: c2 } = matrixDims(B);
  if (cols !== r2) {
    throw new Error("A 的列数必须等于 B 的行数");
  }
  const out = [];
  for (let i = 0; i < rows; i += 1) {
    const row = [];
    for (let j = 0; j < c2; j += 1) {
      let sum = Fraction.zero();
      for (let k = 0; k < cols; k += 1) {
        sum = sum.add(A[i][k].mul(B[k][j]));
      }
      row.push(sum);
    }
    out.push(row);
  }
  return out;
}

function transpose(A) {
  const { rows, cols } = matrixDims(A);
  const out = [];
  for (let j = 0; j < cols; j += 1) {
    const row = [];
    for (let i = 0; i < rows; i += 1) {
      row.push(A[i][j]);
    }
    out.push(row);
  }
  return out;
}

function det(A) {
  const { rows, cols } = matrixDims(A);
  if (rows !== cols) {
    throw new Error("det 只适用于方阵");
  }
  const M = cloneMatrix(A);
  let sign = Fraction.one();
  for (let i = 0; i < rows; i += 1) {
    let pivot = i;
    while (pivot < rows && M[pivot][i].isZero()) {
      pivot += 1;
    }
    if (pivot === rows) {
      return Fraction.zero();
    }
    if (pivot !== i) {
      const tmp = M[i];
      M[i] = M[pivot];
      M[pivot] = tmp;
      sign = sign.neg();
    }
    for (let r = i + 1; r < rows; r += 1) {
      if (M[r][i].isZero()) {
        continue;
      }
      const factor = M[r][i].div(M[i][i]);
      for (let c = i; c < cols; c += 1) {
        M[r][c] = M[r][c].sub(factor.mul(M[i][c]));
      }
    }
  }
  let out = sign;
  for (let i = 0; i < rows; i += 1) {
    out = out.mul(M[i][i]);
  }
  return out;
}

function rref(A) {
  const M = cloneMatrix(A);
  const { rows, cols } = matrixDims(M);
  let lead = 0;
  const pivotCols = [];
  for (let r = 0; r < rows; r += 1) {
    if (lead >= cols) {
      break;
    }
    let i = r;
    while (i < rows && M[i][lead].isZero()) {
      i += 1;
    }
    if (i === rows) {
      lead += 1;
      r -= 1;
      continue;
    }
    if (i !== r) {
      const tmp = M[r];
      M[r] = M[i];
      M[i] = tmp;
    }
    const pivot = M[r][lead];
    for (let c = 0; c < cols; c += 1) {
      M[r][c] = M[r][c].div(pivot);
    }
    for (let rr = 0; rr < rows; rr += 1) {
      if (rr === r) {
        continue;
      }
      if (M[rr][lead].isZero()) {
        continue;
      }
      const factor = M[rr][lead];
      for (let c = 0; c < cols; c += 1) {
        M[rr][c] = M[rr][c].sub(factor.mul(M[r][c]));
      }
    }
    pivotCols.push(lead);
    lead += 1;
  }
  return { M, pivotCols };
}

function rank(A) {
  const { M } = rref(A);
  let r = 0;
  for (const row of M) {
    if (row.some((x) => !x.isZero())) {
      r += 1;
    }
  }
  return r;
}

function inverse(A) {
  const { rows, cols } = matrixDims(A);
  if (rows !== cols) {
    throw new Error("逆矩阵只适用于方阵");
  }
  const I = identity(rows);
  const aug = A.map((row, i) => row.concat(I[i]));
  const { M } = rref(aug);
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      const expected = i === j ? Fraction.one() : Fraction.zero();
      if (M[i][j].n !== expected.n || M[i][j].d !== expected.d) {
        throw new Error("矩阵不可逆");
      }
    }
  }
  return M.map((row) => row.slice(rows));
}

function inverseWithSteps(A) {
  const { rows, cols } = matrixDims(A);
  if (rows !== cols) {
    throw new Error("逆矩阵只适用于方阵");
  }
  const I = identity(rows);
  const aug = A.map((row, i) => row.concat(I[i]));
  const { M, steps } = rrefWithSteps(aug);
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      const expected = i === j ? Fraction.one() : Fraction.zero();
      if (M[i][j].n !== expected.n || M[i][j].d !== expected.d) {
        throw new Error("矩阵不可逆");
      }
    }
  }
  return { inverse: M.map((row) => row.slice(rows)), steps };
}

function adjugate(A) {
  const d = det(A);
  if (d.isZero()) {
    throw new Error("矩阵奇异，伴随矩阵仍存在，但请用余子式法求解");
  }
  const inv = inverse(A);
  const { rows, cols } = matrixDims(inv);
  const out = [];
  for (let i = 0; i < rows; i += 1) {
    const row = [];
    for (let j = 0; j < cols; j += 1) {
      row.push(inv[i][j].mul(d));
    }
    out.push(row);
  }
  return out;
}

function power(A, n) {
  const { rows, cols } = matrixDims(A);
  if (rows !== cols) {
    throw new Error("幂运算只适用于方阵");
  }
  if (n === 0) {
    return identity(rows);
  }
  if (n < 0) {
    return power(inverse(A), -n);
  }
  let result = identity(rows);
  let base = cloneMatrix(A);
  let exp = n;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = mulMatrix(result, base);
    }
    base = mulMatrix(base, base);
    exp = Math.floor(exp / 2);
  }
  return result;
}

function isZeroRow(row, upto) {
  for (let i = 0; i < upto; i += 1) {
    if (!row[i].isZero()) {
      return false;
    }
  }
  return true;
}

function rrefWithSteps(A) {
  const M = cloneMatrix(A);
  const { rows, cols } = matrixDims(M);
  let lead = 0;
  const pivotCols = [];
  const steps = [];

  function pushStep(desc) {
    steps.push({ desc, matrix: cloneMatrix(M) });
  }

  for (let r = 0; r < rows; r += 1) {
    if (lead >= cols) {
      break;
    }
    let i = r;
    while (i < rows && M[i][lead].isZero()) {
      i += 1;
    }
    if (i === rows) {
      lead += 1;
      r -= 1;
      continue;
    }
    if (i !== r) {
      const tmp = M[r];
      M[r] = M[i];
      M[i] = tmp;
      pushStep(`交换 R${r + 1} 与 R${i + 1}`);
    }
    const pivot = M[r][lead];
    if (!(pivot.n === 1n && pivot.d === 1n)) {
      for (let c = 0; c < cols; c += 1) {
        M[r][c] = M[r][c].div(pivot);
      }
      pushStep(`R${r + 1} \u2190 R${r + 1} / ${fractionToLatex(pivot)}`);
    }
    for (let rr = 0; rr < rows; rr += 1) {
      if (rr === r) {
        continue;
      }
      if (M[rr][lead].isZero()) {
        continue;
      }
      const factor = M[rr][lead];
      for (let c = 0; c < cols; c += 1) {
        M[rr][c] = M[rr][c].sub(factor.mul(M[r][c]));
      }
      pushStep(`R${rr + 1} \u2190 R${rr + 1} - (${fractionToLatex(factor)}) R${r + 1}`);
    }
    pivotCols.push(lead);
    lead += 1;
  }
  return { M, pivotCols, steps };
}

function solve(A, B) {
  const { rows, cols } = matrixDims(A);
  const { rows: br, cols: bc } = matrixDims(B);
  if (rows !== br) {
    throw new Error("A 的行数必须等于 b 的行数");
  }
  const aug = A.map((row, i) => row.concat(B[i]));
  const { M, pivotCols, steps } = rrefWithSteps(aug);

  for (let i = 0; i < rows; i += 1) {
    if (isZeroRow(M[i], cols)) {
      for (let j = cols; j < cols + bc; j += 1) {
        if (!M[i][j].isZero()) {
          return { status: "inconsistent", rref: M, steps, pivotCols };
        }
      }
    }
  }
  if (pivotCols.length < cols) {
    return { status: "infinite", rref: M, steps, pivotCols };
  }
  const sol = M.map((row) => row.slice(cols));
  return { status: "unique", solution: sol, steps, pivotCols };
}

function fractionToLatex(frac) {
  if (frac.d === 1n) {
    return frac.n.toString();
  }
  if (frac.n < 0n) {
    return `-\\frac{${absBigInt(frac.n).toString()}}{${frac.d.toString()}}`;
  }
  return `\\frac{${frac.n.toString()}}{${frac.d.toString()}}`;
}

function matrixToLatex(A) {
  const rows = A.map((row) => row.map((cell) => fractionToLatex(cell)).join(" & "));
  return `\\begin{bmatrix}${rows.join(" \\\\ ")}\\end{bmatrix}`;
}

function matrixToLatexAugmented(A, leftCols) {
  const totalCols = A[0].length;
  const rightCols = totalCols - leftCols;
  const leftSpec = "c".repeat(leftCols);
  const rightSpec = "c".repeat(rightCols);
  const colSpec = rightCols > 0 ? `${leftSpec}|${rightSpec}` : leftSpec;
  const rows = A.map((row) => row.map((cell) => fractionToLatex(cell)).join(" & "));
  return `\\left[\\begin{array}{${colSpec}}${rows.join(" \\\\ ")}\\end{array}\\right]`;
}

function matrixToLatexFromStrings(rows) {
  return `\\begin{bmatrix}${rows.join(" \\\\ ")}\\end{bmatrix}`;
}

function matrixToTable(A, splitAfter) {
  const table = document.createElement("table");
  table.className = "matrix";
  for (const row of A) {
    const tr = document.createElement("tr");
    row.forEach((cell, idx) => {
      const td = document.createElement("td");
      td.textContent = cell.toString();
      if (typeof splitAfter === "number" && idx === splitAfter) {
        td.classList.add("split-left");
      }
      tr.appendChild(td);
    });
    table.appendChild(tr);
  }
  return table;
}

function latexTitleFor(title) {
  const map = {
    "A + B": "A + B",
    "A - B": "A - B",
    "A × B": "A \\times B",
    "A^T": "A^T",
    "det(A)": "\\det(A)",
    "A^{-1}": "A^{-1}",
    "adj(A)": "\\operatorname{adj}(A)",
    "rank(A)": "\\operatorname{rank}(A)",
    "解 x": "x"
  };
  return map[title] || title.replace("×", "\\times");
}

const md = window.markdownit ? window.markdownit({ html: false, breaks: false }) : null;
let lastLatex = "";
let lastMarkdown = "";

function renderMarkdown(text) {
  const render = document.getElementById("resultRender");
  if (!render) {
    return;
  }
  if (md) {
    const htmlParts = text.split(/(\$\$[\s\S]*?\$\$)/g).map((part) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        return `<div class="math-block">${part}</div>`;
      }
      return md.render(part);
    });
    render.innerHTML = htmlParts.join("");
  } else {
    render.textContent = text;
  }
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise([render]);
  }
}

function showError(msg) {
  const resultBody = document.getElementById("resultBody");
  const resultError = document.getElementById("resultError");
  const latexOutput = document.getElementById("latexOutput");
  resultBody.innerHTML = "";
  resultError.textContent = "错误：" + msg;
  latexOutput.textContent = "";
  renderMarkdown("");
  lastLatex = "";
  lastMarkdown = "";
}

function showMatrixResult(title, matrix, latexTitle, splitAfter) {
  const resultBody = document.getElementById("resultBody");
  const resultError = document.getElementById("resultError");
  const latexOutput = document.getElementById("latexOutput");
  resultBody.innerHTML = "";
  resultError.textContent = "";
  const label = document.createElement("div");
  label.textContent = "结果（表格）";
  resultBody.appendChild(label);
  resultBody.appendChild(matrixToTable(matrix, splitAfter));

  const latexLabel = latexTitle || latexTitleFor(title);
  const latex = `\\[\n${latexLabel} = ${matrixToLatex(matrix)}\n\\]`;
  lastLatex = latex;
  latexOutput.textContent = latex;
  lastMarkdown = `**结果**\n\n$$\n${latexLabel} = ${matrixToLatex(matrix)}\n$$`;
  renderMarkdown(lastMarkdown);
}

function showScalarResult(title, value, latexTitle) {
  const resultBody = document.getElementById("resultBody");
  const resultError = document.getElementById("resultError");
  const latexOutput = document.getElementById("latexOutput");
  resultBody.innerHTML = "";
  resultError.textContent = "";
  const label = document.createElement("div");
  label.textContent = `结果（数值）：${value.toString()}`;
  resultBody.appendChild(label);

  const valueLatex = fractionToLatex(value);
  const latexLabel = latexTitle || latexTitleFor(title);
  const latex = `\\[\n${latexLabel} = ${valueLatex}\n\\]`;
  lastLatex = latex;
  latexOutput.textContent = latex;
  lastMarkdown = `**结果**\n\n$$\n${latexLabel} = ${valueLatex}\n$$`;
  renderMarkdown(lastMarkdown);
}

function stepsToMarkdown(steps, leftCols) {
  if (!steps.length) {
    return "";
  }
  let out = "**行变换步骤（RREF）**\n";
  steps.forEach((step, i) => {
    const matrixLatex = leftCols ? matrixToLatexAugmented(step.matrix, leftCols) : matrixToLatex(step.matrix);
    out += `\n${i + 1}. ${step.desc}\n\n$$\n${matrixLatex}\n$$\n`;
  });
  return out;
}

function stepsToLatex(steps, leftCols) {
  if (!steps.length) {
    return "";
  }
  let out = "\\[\n\\begin{aligned}\n\\textbf{行变换步骤（RREF）}\\\\\n";
  steps.forEach((step, i) => {
    const mathDesc = stepDescToLatex(step.desc);
    const matrixLatex = leftCols ? matrixToLatexAugmented(step.matrix, leftCols) : matrixToLatex(step.matrix);
    out += `\\text{${i + 1}. } & ${mathDesc}\\\\\n`;
    out += `& ${matrixLatex}\\\\\n`;
  });
  out += "\\end{aligned}\n\\]\n";
  return out;
}

function stepDescToLatex(desc) {
  let out = desc;
  out = out.replace(/←/g, "\\leftarrow");
  out = out.replace(/R(\\d+)/g, "R_{$1}");
  return out;
}

function parameterizeSolution(rrefM, cols, bc, pivotCols) {
  if (bc !== 1) {
    return "多右端的参数化解暂未展开，已给出 RREF 过程。";
  }
  const freeCols = [];
  for (let c = 0; c < cols; c += 1) {
    if (!pivotCols.includes(c)) {
      freeCols.push(c);
    }
  }
  const paramNames = freeCols.map((_, i) => `t_{${i + 1}}`);
  let text = "**参数化解**\n";
  if (freeCols.length === 0) {
    text += "\n无自由变量。";
    return text;
  }
  text += "\n自由变量：";
  text += freeCols.map((col, i) => `x_{${col + 1}} = ${paramNames[i]}`).join(", ");

  const exprs = new Array(cols).fill("0");
  freeCols.forEach((col, i) => {
    exprs[col] = paramNames[i];
  });

  for (let r = 0; r < rrefM.length; r += 1) {
    const row = rrefM[r];
    let pivotCol = -1;
    for (let c = 0; c < cols; c += 1) {
      if (!row[c].isZero()) {
        pivotCol = c;
        break;
      }
    }
    if (pivotCol === -1) {
      continue;
    }
    let expr = fractionToLatex(row[cols]);
    for (let i = 0; i < freeCols.length; i += 1) {
      const fc = freeCols[i];
      if (row[fc].isZero()) {
        continue;
      }
      const coef = row[fc];
      const coefLatex = fractionToLatex(coef.n < 0n ? coef.neg() : coef);
      const term = coefLatex === "1" ? paramNames[i] : `${coefLatex} ${paramNames[i]}`;
      expr += coef.n > 0n ? ` - ${term}` : ` + ${term}`;
    }
    exprs[pivotCol] = expr;
  }

  const vectorLatex = matrixToLatexFromStrings(exprs.map((e) => e));
  text += `\n\n$$\nx = ${vectorLatex}\n$$`;
  return text;
}

function parameterizeSolutionLatex(rrefM, cols, bc, pivotCols) {
  if (bc !== 1) {
    return "\\textbf{参数化解}\\\\多右端的参数化解暂未展开，已给出 RREF 过程。";
  }
  const freeCols = [];
  for (let c = 0; c < cols; c += 1) {
    if (!pivotCols.includes(c)) {
      freeCols.push(c);
    }
  }
  const paramNames = freeCols.map((_, i) => `t_{${i + 1}}`);
  if (freeCols.length === 0) {
    return "\\textbf{参数化解}\\\\无自由变量。";
  }
  const freeText = freeCols.map((col, i) => `x_{${col + 1}} = ${paramNames[i]}`).join(", ");

  const exprs = new Array(cols).fill("0");
  freeCols.forEach((col, i) => {
    exprs[col] = paramNames[i];
  });

  for (let r = 0; r < rrefM.length; r += 1) {
    const row = rrefM[r];
    let pivotCol = -1;
    for (let c = 0; c < cols; c += 1) {
      if (!row[c].isZero()) {
        pivotCol = c;
        break;
      }
    }
    if (pivotCol === -1) {
      continue;
    }
    let expr = fractionToLatex(row[cols]);
    for (let i = 0; i < freeCols.length; i += 1) {
      const fc = freeCols[i];
      if (row[fc].isZero()) {
        continue;
      }
      const coef = row[fc];
      const coefLatex = fractionToLatex(coef.n < 0n ? coef.neg() : coef);
      const term = coefLatex === "1" ? paramNames[i] : `${coefLatex} ${paramNames[i]}`;
      expr += coef.n > 0n ? ` - ${term}` : ` + ${term}`;
    }
    exprs[pivotCol] = expr;
  }

  const vectorLatex = matrixToLatexFromStrings(exprs.map((e) => e));
  return `\\textbf{参数化解}\\\\\\[${freeText}\\]\\\\\\[x = ${vectorLatex}\\]`;
}

function updatePowerVisibility() {
  const op = document.getElementById("operation").value;
  const powerWrap = document.getElementById("powerWrap");
  powerWrap.style.display = op === "pow" ? "block" : "none";
}

function compute() {
  const op = document.getElementById("operation").value;
  const aText = document.getElementById("matrixA").value;
  const bText = document.getElementById("matrixB").value;
  try {
    const A = parseMatrix(aText);
    const B = bText.trim() ? parseMatrix(bText) : null;

    if (op === "add") {
      if (!B) {
        throw new Error("需要输入矩阵 B");
      }
      showMatrixResult("A + B", addMatrix(A, B));
      return;
    }
    if (op === "sub") {
      if (!B) {
        throw new Error("需要输入矩阵 B");
      }
      showMatrixResult("A - B", subMatrix(A, B));
      return;
    }
    if (op === "mul") {
      if (!B) {
        throw new Error("需要输入矩阵 B");
      }
      showMatrixResult("A × B", mulMatrix(A, B));
      return;
    }
    if (op === "transpose") {
      showMatrixResult("A^T", transpose(A));
      return;
    }
    if (op === "det") {
      showScalarResult("det(A)", det(A));
      return;
    }
    if (op === "inv") {
      const invResult = inverseWithSteps(A);
      showMatrixResult("A^{-1}", invResult.inverse, "A^{-1}");
      const stepsMarkdown = stepsToMarkdown(invResult.steps || [], matrixDims(A).cols);
      const stepsLatex = stepsToLatex(invResult.steps || [], matrixDims(A).cols);
      if (stepsMarkdown) {
        lastMarkdown += `\n\n${stepsMarkdown}`;
        renderMarkdown(lastMarkdown);
      }
      if (stepsLatex) {
        lastLatex = `${lastLatex}\n${stepsLatex}`;
        document.getElementById("latexOutput").textContent = lastLatex;
      }
      return;
    }
    if (op === "adj") {
      showMatrixResult("adj(A)", adjugate(A));
      return;
    }
    if (op === "rank") {
      const r = rank(A);
      showScalarResult("rank(A)", new Fraction(BigInt(r), 1n));
      return;
    }
    if (op === "rref") {
      const rrefResult = rrefWithSteps(A);
      showMatrixResult("A 的行最简式", rrefResult.M, "RREF(A)");
      const stepsMarkdown = stepsToMarkdown(rrefResult.steps || []);
      const stepsLatex = stepsToLatex(rrefResult.steps || []);
      if (stepsMarkdown) {
        lastMarkdown += `\n\n${stepsMarkdown}`;
        renderMarkdown(lastMarkdown);
      }
      if (stepsLatex) {
        lastLatex = `${lastLatex}\n${stepsLatex}`;
        document.getElementById("latexOutput").textContent = lastLatex;
      }
      return;
    }
    if (op === "rref_aug") {
      if (!B) {
        throw new Error("需要输入矩阵 B");
      }
      const { rows: ar } = matrixDims(A);
      const { rows: br } = matrixDims(B);
      if (ar !== br) {
        throw new Error("A 和 B 的行数必须一致");
      }
      const aug = A.map((row, i) => row.concat(B[i]));
      const rrefResult = rrefWithSteps(aug);
      showMatrixResult("增广矩阵 (A|B) 的行最简式", rrefResult.M, "RREF(A|B)", matrixDims(A).cols);
      const augLatex = `\\[\nRREF(A|B) = ${matrixToLatexAugmented(rrefResult.M, matrixDims(A).cols)}\n\\]`;
      lastLatex = augLatex;
      document.getElementById("latexOutput").textContent = lastLatex;
      lastMarkdown = `**结果**\n\n$$\nRREF(A|B) = ${matrixToLatexAugmented(rrefResult.M, matrixDims(A).cols)}\n$$`;
      renderMarkdown(lastMarkdown);
      const stepsMarkdown = stepsToMarkdown(rrefResult.steps || [], matrixDims(A).cols);
      const stepsLatex = stepsToLatex(rrefResult.steps || [], matrixDims(A).cols);
      if (stepsMarkdown) {
        lastMarkdown += `\n\n${stepsMarkdown}`;
        renderMarkdown(lastMarkdown);
      }
      if (stepsLatex) {
        lastLatex = `${lastLatex}\n${stepsLatex}`;
        document.getElementById("latexOutput").textContent = lastLatex;
      }
      return;
    }
    if (op === "pow") {
      const nRaw = document.getElementById("power").value.trim();
      const n = Number(nRaw);
      if (!Number.isInteger(n)) {
        throw new Error("幂 n 必须是整数");
      }
      showMatrixResult(`A^${n}`, power(A, n));
      return;
    }
    if (op === "solve") {
      if (!B) {
        throw new Error("需要输入向量 b（或矩阵 B）");
      }
      const result = solve(A, B);
      const stepsMarkdown = stepsToMarkdown(result.steps || [], matrixDims(A).cols);
      const stepsLatex = stepsToLatex(result.steps || [], matrixDims(A).cols);
      if (result.status === "unique") {
        showMatrixResult("解 x", result.solution, "x");
        lastMarkdown += `\n\n${stepsMarkdown}`;
        renderMarkdown(lastMarkdown);
        lastLatex = `${lastLatex}\n${stepsLatex}`;
        document.getElementById("latexOutput").textContent = lastLatex;
        return;
      }
      if (result.status === "inconsistent") {
        showError("方程组无解（增广矩阵出现矛盾行）。");
        lastMarkdown = `**方程组无解**\n\n${stepsMarkdown}`;
        renderMarkdown(lastMarkdown);
        lastLatex = `${stepsLatex}\\text{方程组无解。}`;
        document.getElementById("latexOutput").textContent = lastLatex;
        return;
      }
      if (result.status === "infinite") {
        showError("方程组有无穷多解（存在自由变量）。");
        const param = parameterizeSolution(result.rref, matrixDims(A).cols, matrixDims(B).cols, result.pivotCols);
        lastMarkdown = `**方程组有无穷多解**\n\n${stepsMarkdown}\n\n${param}`;
        renderMarkdown(lastMarkdown);
        lastLatex = `${stepsLatex}${parameterizeSolutionLatex(result.rref, matrixDims(A).cols, matrixDims(B).cols, result.pivotCols)}`;
        document.getElementById("latexOutput").textContent = lastLatex;
        return;
      }
    }
  } catch (err) {
    showError(err.message || String(err));
  }
}

updatePowerVisibility();

document.getElementById("operation").addEventListener("change", updatePowerVisibility);
document.getElementById("compute").addEventListener("click", compute);
document.getElementById("copyLatex").addEventListener("click", () => {
  if (!lastLatex) {
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(lastLatex);
  }
});
