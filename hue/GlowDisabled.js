/**
 * 発光エフェクト無効時のカラー設定
 */
// 静的オブジェクトとして定義し、再利用する
const SHARED_GLOW_OFF_SETTINGS = {
  shadowBlur: 0,
  shadowColor: "transparent",
  saturation: 82,
  lightness: 54,
  alphaMultiplier: 0.85,
  globalCompositeOperation: 'source-over', // 通常の描画モードに戻す
  lineCap: 'round',
  lineJoin: 'round'
};

function getGlowDisabledSettings() {
  return SHARED_GLOW_OFF_SETTINGS;
}