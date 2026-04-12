/**
 * 軌跡時間 無効化時（無限モード）用の計算ロジック
 * 時間経過による減衰を一切行わず、常に鮮明な表示を維持します。
 */
function getDisabledTrailStyle(i, lastIndex, isMonochrome) {
  // フェードアウト機能を無効化し、固定値を返します
  const alpha = isMonochrome ? 0.78 : 0.94;
  const lineScale = 1.2;
  return { alpha, lineScale };
}
