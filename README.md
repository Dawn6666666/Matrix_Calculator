# Matrix Calculator (Exact Rational)

Pure frontend matrix calculator with exact rational arithmetic. Supports common linear algebra operations and step-by-step RREF.

## Features

- Exact fractions (integer / fraction / decimal input)
- A + B, A - B, A x B, transpose, determinant, inverse, adjugate, rank, power
- Solve linear system A x = b
- RREF for A and augmented (A|B)
- Markdown + LaTeX rendering (MathJax)
- LaTeX output copy

## Usage

Open `index.html` in a browser, input matrices, choose an operation, and click **计算**.

Input format:
- Rows separated by newlines or semicolons
- Columns separated by spaces or commas
- Supports integers, fractions (e.g. `3/4`), and decimals (e.g. `0.125`)

## Notes

- Math rendering uses CDN (MathJax + markdown-it), so internet is required for formulas.
- For large matrices, exact fractions may grow quickly and become slow.

---

# 矩阵计算器（精确分数）

纯前端矩阵计算器，使用精确分数计算，支持常见线性代数运算与 RREF 步骤展示。

## 功能

- 精确分数（支持整数 / 分数 / 小数输入）
- A + B、A - B、A x B、转置、行列式、逆矩阵、伴随矩阵、秩、幂
- 解线性方程组 A x = b
- A 的行最简式（RREF）与增广矩阵 (A|B) 的行最简式
- Markdown + LaTeX 渲染（MathJax）
- LaTeX 输出复制

## 使用方法

直接在浏览器中打开 `index.html`，输入矩阵，选择运算并点击 **计算**。

输入格式：
- 行用换行或分号分隔
- 列用空格或逗号分隔
- 支持整数、分数（例如 `3/4`）、小数（例如 `0.125`）

## 说明

- 公式渲染依赖 CDN（MathJax + markdown-it），需要联网。
- 大矩阵可能导致分数膨胀，计算会变慢。
