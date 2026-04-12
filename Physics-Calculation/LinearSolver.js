/**
 * ガウスの消去法を用いて連立一次方程式 Ax = B を解きます
 */
function solveLinearSystem(matrix, rhs) {
  const size = rhs.length;
  const a = matrix.map((row) => row.slice());
  const b = rhs.slice();

  for (let col = 0; col < size; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < size; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) {
        pivot = row;
      }
    }

    const pivotValue = a[pivot][col];
    if (Math.abs(pivotValue) < 1e-15) {
      return new Array(size).fill(0);
    }

    if (pivot !== col) {
      [a[col], a[pivot]] = [a[pivot], a[col]];
      [b[col], b[pivot]] = [b[pivot], b[col]];
    }

    const inv = 1 / a[col][col];
    for (let j = col; j < size; j += 1) {
      a[col][j] *= inv;
    }
    b[col] *= inv;

    for (let row = 0; row < size; row += 1) {
      if (row === col) {
        continue;
      }
      const factor = a[row][col];
      if (factor === 0) {
        continue;
      }
      for (let j = col; j < size; j += 1) {
        a[row][j] -= factor * a[col][j];
      }
      b[row] -= factor * b[col];
    }
  }

  return b;
}