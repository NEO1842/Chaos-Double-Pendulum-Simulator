/**
 * 軌跡時間 有効時用の計算ロジック
 * 時間の経過（配列内の位置）に応じて、透明度と太さを徐々に減少させます。
 */
function getEnabledTrailStyle(i, lastIndex, isMonochrome) {
  const ageRatio = i / lastIndex;
  const fade = Math.pow(ageRatio, 1.6);
  const alpha = fade * (isMonochrome ? 0.8 : 0.95);
  const lineScale = 0.1 + fade * 1.1;
  return { alpha, lineScale };
}
