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
