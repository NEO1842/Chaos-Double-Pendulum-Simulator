/**
 * 軌跡時間 有効時用の計算ロジック
 * 時間の経過（配列内の位置）に応じて、透明度と太さを徐々に減少させます。
 */
function getEnabledTrailStyle(i, lastIndex, isMonochrome) {
  const ageRatio = i / lastIndex;
  const fade = Math.pow(ageRatio, 1.45);
  const alpha = isMonochrome ? 0.03 + fade * 0.75 : 0.04 + fade * 0.9;
  const lineScale = 0.65 + fade * 0.55;
  return { alpha, lineScale };
}
