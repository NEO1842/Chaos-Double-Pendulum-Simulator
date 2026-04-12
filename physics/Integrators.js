/**
 * 数値積分（RK4 / Semi-Implicit Euler）
 */
function combine(base, delta, factor) {
  return {
    theta1: base.theta1 + delta.dTheta1 * factor,
    omega1: base.omega1 + delta.dOmega1 * factor,
    theta2: base.theta2 + delta.dTheta2 * factor,
    omega2: base.omega2 + delta.dOmega2 * factor,
    theta3: base.theta3 + delta.dTheta3 * factor,
    omega3: base.omega3 + delta.dOmega3 * factor
  };
}

function rk4Step(dt) {
  const k1 = derivatives(state);
  const k2 = derivatives(combine(state, k1, dt * 0.5));
  const k3 = derivatives(combine(state, k2, dt * 0.5));
  const k4 = derivatives(combine(state, k3, dt));

  state.theta1 += (dt / 6) * (k1.dTheta1 + 2 * k2.dTheta1 + 2 * k3.dTheta1 + k4.dTheta1);
  state.omega1 += (dt / 6) * (k1.dOmega1 + 2 * k2.dOmega1 + 2 * k3.dOmega1 + k4.dOmega1);
  state.theta2 += (dt / 6) * (k1.dTheta2 + 2 * k2.dTheta2 + 2 * k3.dTheta2 + k4.dTheta2);
  state.omega2 += (dt / 6) * (k1.dOmega2 + 2 * k2.dOmega2 + 2 * k3.dOmega2 + k4.dOmega2);
  state.theta3 += (dt / 6) * (k1.dTheta3 + 2 * k2.dTheta3 + 2 * k3.dTheta3 + k4.dTheta3);
  state.omega3 += (dt / 6) * (k1.dOmega3 + 2 * k2.dOmega3 + 2 * k3.dOmega3 + k4.dOmega3);
}

function semiImplicitEulerStep(dt) {
  const slope = derivatives(state);
  state.omega1 += slope.dOmega1 * dt;
  state.omega2 += slope.dOmega2 * dt;
  state.omega3 += slope.dOmega3 * dt;
  state.theta1 += state.omega1 * dt;
  state.theta2 += state.omega2 * dt;
  state.theta3 += state.omega3 * dt;
}