/**
 * 2重振り子専用物理エンジン
 */
const DoublePendulum = {
    derivs(state, params) {
        const { theta1, omega1, theta2, omega2 } = state;
        const { g, l1, l2, damping } = params;
        const m1 = params.m1;
        const m2 = params.m2;

        const delta = theta2 - theta1;
        const den1 = (2 * m1 + m2 - m2 * Math.cos(2 * delta)) * l1;
        // 分母が0（全質量0など）の場合は加速度を0にする
        const dOmega1 = den1 === 0 ? 0 : (
            -g * (2 * m1 + m2) * Math.sin(theta1)
            - m2 * g * Math.sin(theta1 - 2 * delta)
            - 2 * Math.sin(delta) * m2 * (omega2 * omega2 * l2 + omega1 * omega1 * l1 * Math.cos(delta))
        ) / den1 - damping * omega1;

        const den2 = (2 * m1 + m2 - m2 * Math.cos(2 * delta)) * l2;
        const dOmega2 = den2 === 0 ? 0 : (
            2 * Math.sin(delta) * (
                omega1 * omega1 * l1 * (m1 + m2)
                + g * (m1 + m2) * Math.cos(theta1)
                + omega2 * omega2 * l2 * m2 * Math.cos(delta)
            )
        ) / den2 - damping * omega2;

        return { dTheta1: omega1, dOmega1, dTheta2: omega2, dOmega2 };
    },

    step(state, params, dt) {
        const k1 = this.derivs(state, params);
        
        const s2 = {
            theta1: state.theta1 + k1.dTheta1 * dt / 2,
            omega1: state.omega1 + k1.dOmega1 * dt / 2,
            theta2: state.theta2 + k1.dTheta2 * dt / 2,
            omega2: state.omega2 + k1.dOmega2 * dt / 2
        };
        const k2 = this.derivs(s2, params);

        const s3 = {
            theta1: state.theta1 + k2.dTheta1 * dt / 2,
            omega1: state.omega1 + k2.dOmega1 * dt / 2,
            theta2: state.theta2 + k2.dTheta2 * dt / 2,
            omega2: state.omega2 + k2.dOmega2 * dt / 2
        };
        const k3 = this.derivs(s3, params);

        const s4 = {
            theta1: state.theta1 + k3.dTheta1 * dt,
            omega1: state.omega1 + k3.dOmega1 * dt,
            theta2: state.theta2 + k3.dTheta2 * dt,
            omega2: state.omega2 + k3.dOmega2 * dt
        };
        const k4 = this.derivs(s4, params);

        state.theta1 += (dt / 6) * (k1.dTheta1 + 2 * k2.dTheta1 + 2 * k3.dTheta1 + k4.dTheta1);
        state.omega1 += (dt / 6) * (k1.dOmega1 + 2 * k2.dOmega1 + 2 * k3.dOmega1 + k4.dOmega1);
        state.theta2 += (dt / 6) * (k1.dTheta2 + 2 * k2.dTheta2 + 2 * k3.dTheta2 + k4.dTheta2);
        state.omega2 += (dt / 6) * (k1.dOmega2 + 2 * k2.dOmega2 + 2 * k3.dOmega2 + k4.dOmega2);
    }
};