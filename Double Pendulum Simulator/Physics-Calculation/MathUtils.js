/**
 * 数学・汎用ユーティリティ
 */
function degToRad(degree) {
  return (degree * Math.PI) / 180;
}

function radToDeg(radian) {
  return (radian * 180) / Math.PI;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getLinkCount() {
  // params はグローバルスコープから参照
  return params.bobCount === 3 ? 3 : 2;
}