/**
 * 運動方程式から加速度（角加速度）を導出します
 */
function derivatives(inputState) {
  const chain = computeChainKinematics(inputState);
  const { count, lengths, masses, theta, omega } = chain;

  const massSuffix = new Array(count).fill(0);
  let massAccum = 0;
  for (let i = count - 1; i >= 0; i -= 1) {
    massAccum += masses[i];
    // 極小値補正を撤廃し、入力値をそのまま使用
    massSuffix[i] = massAccum;
  }

  const massMatrix = Array.from({ length: count }, () => new Array(count).fill(0));
  for (let i = 0; i < count; i += 1) {
    for (let j = 0; j < count; j += 1) {
      const sharedMass = massSuffix[Math.max(i, j)];
      massMatrix[i][j] = sharedMass * lengths[i] * lengths[j] * Math.cos(theta[i] - theta[j]);
    }
  }

  const dMass = Array.from({ length: count }, () =>
    Array.from({ length: count }, () => new Array(count).fill(0))
  );
  for (let i = 0; i < count; i += 1) {
    for (let j = 0; j < count; j += 1) {
      if (i === j) continue;
      const sharedMass = massSuffix[Math.max(i, j)];
      const coeff = sharedMass * lengths[i] * lengths[j] * Math.sin(theta[i] - theta[j]);
      dMass[i][i][j] = -coeff;
      dMass[j][i][j] = coeff;
    }
  }

  const coriolis = new Array(count).fill(0);
  for (let i = 0; i < count; i += 1) {
    for (let j = 0; j < count; j += 1) {
      for (let k = 0; k < count; k += 1) {
        const gamma = 0.5 * (dMass[k][i][j] + dMass[j][i][k] - dMass[i][j][k]);
        coriolis[i] += gamma * omega[j] * omega[k];
      }
    }
  }

  const gravityForces = new Array(count).fill(0);
  for (let i = 0; i < count; i += 1) {
    gravityForces[i] = massSuffix[i] * params.g * lengths[i] * Math.sin(theta[i]);
  }

  const rhs = new Array(count);
  for (let i = 0; i < count; i += 1) {
    rhs[i] = -(coriolis[i] + gravityForces[i]);
  }

  // 変数名を alpha から accelerations に変更し、衝突とエラーを回避
  const accelerations = solveLinearSystem(massMatrix, rhs) || new Array(count).fill(0);

  for (let i = 0; i < count; i += 1) {
    accelerations[i] -= params.damping * omega[i];
  }

  return {
    dTheta1: omega[0] ?? 0,
    dOmega1: accelerations[0] ?? 0,
    dTheta2: omega[1] ?? 0,
    dOmega2: accelerations[1] ?? 0,
    dTheta3: count === 3 ? omega[2] ?? 0 : 0,
    dOmega3: count === 3 ? accelerations[2] ?? 0 : 0
  };
}