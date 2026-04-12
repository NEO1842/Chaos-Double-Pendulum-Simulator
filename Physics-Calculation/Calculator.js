/**
 * 振り子システムの総エネルギー（運動エネルギー + 位置エネルギー）を計算します。
 * @param {Object} chain - computeChainKinematics から取得したリンク情報
 * @param {number} gravity - 重力加速度
 * @returns {number} 計算された総エネルギー
 */
function calculateTotalEnergy(chain, gravity) {
  let kinetic = 0;
  let potential = 0;
  let cumulativeLength = 0;

  for (let i = 0; i < chain.count; i++) {
    const mass = chain.masses[i];
    const vSq = (chain.vx[i] ?? 0) ** 2 + (chain.vy[i] ?? 0) ** 2;
    kinetic += 0.5 * mass * vSq;

    cumulativeLength += chain.lengths[i];
    const heightFromRest = cumulativeLength - (chain.y[i] ?? 0);
    potential += mass * gravity * heightFromRest;
  }
  return kinetic + potential;
}
