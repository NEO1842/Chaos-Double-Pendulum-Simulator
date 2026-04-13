/**
 * 3重振り子専用物理エンジン
 */
const TriplePendulum = {
    derivs(state, params) {
        const { theta1, omega1, theta2, omega2, theta3, omega3 } = state;
        // 極小値補正を撤廃
        const m1 = params.m1;
        const m2 = params.m2;
        const m3 = params.m3;
        const { l1, l2, l3, g, damping } = params;

        // 質量行列の係数
        const M11 = (m1 + m2 + m3) * l1;
        const M12 = (m2 + m3) * l2 * Math.cos(theta1 - theta2);
        const M13 = m3 * l3 * Math.cos(theta1 - theta3);
        
        const M21 = (m2 + m3) * l1 * Math.cos(theta1 - theta2);
        const M22 = (m2 + m3) * l2;
        const M23 = m3 * l3 * Math.cos(theta2 - theta3);

        const M31 = m3 * l1 * Math.cos(theta1 - theta3);
        const M32 = m3 * l2 * Math.cos(theta2 - theta3);
        const M33 = m3 * l3;

        // 右辺（重力とコリオリ力）
        const f1 = -(m2 + m3) * l2 * omega2 * omega2 * Math.sin(theta1 - theta2)
                   - m3 * l3 * omega3 * omega3 * Math.sin(theta1 - theta3)
                   - (m1 + m2 + m3) * g * Math.sin(theta1);

        const f2 = (m2 + m3) * l1 * omega1 * omega1 * Math.sin(theta1 - theta2)
                   - m3 * l3 * omega3 * omega3 * Math.sin(theta2 - theta3)
                   - (m2 + m3) * g * Math.sin(theta2);

        const f3 = m3 * l1 * omega1 * omega1 * Math.sin(theta1 - theta3)
                   + m3 * l2 * omega2 * omega2 * Math.sin(theta2 - theta3)
                   - m3 * g * Math.sin(theta3);

        // クラメルの公式または掃き出し法で加速度を解く（ここでは簡易行列解法）
        const det = M11 * (M22 * M33 - M23 * M32) - M12 * (M21 * M33 - M23 * M31) + M13 * (M21 * M32 - M22 * M31);
        
        if (Math.abs(det) < 1e-15) return { dTheta1: 0, dOmega1: 0, dTheta2: 0, dOmega2: 0, dTheta3: 0, dOmega3: 0 };

        const dOmega1 = (f1 * (M22 * M33 - M23 * M32) - M12 * (f2 * M33 - M23 * f3) + M13 * (f2 * M32 - M22 * f3)) / det - damping * omega1;
        const dOmega2 = (M11 * (f2 * M33 - M23 * f3) - f1 * (M21 * M33 - M23 * M31) + M13 * (M21 * f3 - f2 * M31)) / det - damping * omega2;
        const dOmega3 = (M11 * (M22 * f3 - f2 * M32) - M12 * (M21 * f3 - f2 * M31) + f1 * (M21 * M32 - M22 * M31)) / det - damping * omega3;

        return { dTheta1: omega1, dOmega1, dTheta2: omega2, dOmega2, dTheta3: omega3, dOmega3 };
    },

    step(state, params, dt) {
        const k1 = this.derivs(state, params);
        const k2 = this.derivs(this.nextState(state, k1, dt / 2), params);
        const k3 = this.derivs(this.nextState(state, k2, dt / 2), params);
        const k4 = this.derivs(this.nextState(state, k3, dt), params);

        state.theta1 += (dt / 6) * (k1.dTheta1 + 2 * k2.dTheta1 + 2 * k3.dTheta1 + k4.dTheta1);
        state.omega1 += (dt / 6) * (k1.dOmega1 + 2 * k2.dOmega1 + 2 * k3.dOmega1 + k4.dOmega1);
        state.theta2 += (dt / 6) * (k1.dTheta2 + 2 * k2.dTheta2 + 2 * k3.dTheta2 + k4.dTheta2);
        state.omega2 += (dt / 6) * (k1.dOmega2 + 2 * k2.dOmega2 + 2 * k3.dOmega2 + k4.dOmega2);
        state.theta3 += (dt / 6) * (k1.dTheta3 + 2 * k2.dTheta3 + 2 * k3.dTheta3 + k4.dTheta3);
        state.omega3 += (dt / 6) * (k1.dOmega3 + 2 * k2.dOmega3 + 2 * k3.dOmega3 + k4.dOmega3);
    },

    nextState(s, k, dt) {
        return {
            theta1: s.theta1 + k.dTheta1 * dt, omega1: s.omega1 + k.dOmega1 * dt,
            theta2: s.theta2 + k.dTheta2 * dt, omega2: s.omega2 + k.dOmega2 * dt,
            theta3: s.theta3 + k.dTheta3 * dt, omega3: s.omega3 + k.dOmega3 * dt
        };
    }
};