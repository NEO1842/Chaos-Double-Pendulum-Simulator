/**
 * 角度情報から各ボブの座標と速度を計算します（順運動学）
 */
function computeChainKinematics(inputState) {
  const count = getLinkCount();
  const lengths = [params.l1, params.l2, params.l3];
  const masses = [params.m1, params.m2, params.m3];
  const theta = [inputState.theta1, inputState.theta2, inputState.theta3];
  const omega = [inputState.omega1, inputState.omega2, inputState.omega3];

  const x = new Array(count);
  const y = new Array(count);
  const vx = new Array(count);
  const vy = new Array(count);
  const speed = new Array(count);

  let px = 0;
  let py = 0;
  let pvx = 0;
  let pvy = 0;
  for (let i = 0; i < count; i += 1) {
    const length = lengths[i];
    const angle = theta[i];
    const angVel = omega[i];

    px += Math.sin(angle) * length;
    py += Math.cos(angle) * length;
    pvx += Math.cos(angle) * angVel * length;
    pvy += -Math.sin(angle) * angVel * length;

    x[i] = px;
    y[i] = py;
    vx[i] = pvx;
    vy[i] = pvy;
    speed[i] = Math.hypot(pvx, pvy);
  }

  return {
    count,
    lengths: lengths.slice(0, count),
    masses: masses.slice(0, count),
    theta: theta.slice(0, count),
    omega: omega.slice(0, count),
    x,
    y,
    vx,
    vy,
    speed
  };
}