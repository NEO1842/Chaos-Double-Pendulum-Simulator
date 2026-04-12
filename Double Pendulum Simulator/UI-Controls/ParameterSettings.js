/**
 * シミュレーターの各種パラメータ初期構成
 * フォルダ構造を維持すれば、環境を問わず動作します。
 */
const UI_PARAMETER_CONFIG = {
  ranges: {
    gravity:      { default: 9.810, min: 0,    max: 20,   step: 0.001 },
    length1:      { default: 1.300, min: 0.1,  max: 5,    step: 0.001 },
    length2:      { default: 1.100, min: 0.1,  max: 5,    step: 0.001 },
    length3:      { default: 1.000, min: 0.1,  max: 5,    step: 0.001 },
    mass1:        { default: 2.20,  min: 0.1,  max: 10,   step: 0.01  },
    mass2:        { default: 1.80,  min: 0.1,  max: 10,   step: 0.01  },
    mass3:        { default: 1.00,  min: 0.1,  max: 10,   step: 0.01  },
    angle1:       { default: 125.0, min: 0,    max: 360,  step: 0.1   },
    angle2:       { default: 340.0, min: 0,    max: 360,  step: 0.1   },
    angle3:       { default: 0.0,   min: 0,    max: 360,  step: 0.1   },
    damping:      { default: 0.002, min: 0,    max: 0.1,  step: 0.00001 },
    speed:        { default: 1.000, min: 0,    max: 5,    step: 0.001 },
    trailLength:  { default: 12.0,  min: 0.1,  max: 100,  step: 0.1   },
    glowStrength: { default: 1.0,   min: 0,    max: 5,    step: 0.1   }
  },
  toggles: {
    showTrail:    true,
    autoHue:      true,
    monochrome:   false,
    glowEffect:   true
  },
  language: "en"
};

/**
 * どの環境でも同じ値を返すポータブルな初期値ゲッター
 */
function getInitialParam(id) {
  const range = UI_PARAMETER_CONFIG.ranges[id];
  if (range) return range.default;
  
  const toggle = UI_PARAMETER_CONFIG.toggles[id];
  return toggle !== undefined ? toggle : null;
}