/**
 * 発光エフェクト有効時のカラー設定
 */
function getGlowEnabledSettings(hue, alpha, strength = 1.0) {
  return {
    shadowBlur: 25 * strength,
    shadowColor: `hsla(${hue.toFixed(1)}, 100%, 65%, ${Math.min(0.8, alpha).toFixed(3)})`,
    saturation: 88,
    lightness: 56,
    // 発光時は少し透明度を調整して光を強調
    alphaMultiplier: 1.0
  };
}