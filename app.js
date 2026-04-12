"use strict";

const canvas = document.getElementById("pendulumCanvas");
const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
const backgroundCanvas = document.createElement("canvas");
const backgroundCtx = backgroundCanvas.getContext("2d", { alpha: false });

const controls = {
  tabTwoBobs: document.getElementById("tabTwoBobs"),
  tabThreeBobs: document.getElementById("tabThreeBobs"),
  tabGuide: document.getElementById("tabGuide"),
  controlsPanel: document.getElementById("controlsPanel"),
  guideWindowOverlay: document.getElementById("guideWindowOverlay"),
  closeGuideWindow: document.getElementById("closeGuideWindow"),
  gravity: document.getElementById("gravity"),
  gravityValue: document.getElementById("gravityValue"),
  length1: document.getElementById("length1"),
  length1Value: document.getElementById("length1Value"),
  length2: document.getElementById("length2"),
  length2Value: document.getElementById("length2Value"),
  length3: document.getElementById("length3"),
  length3Value: document.getElementById("length3Value"),
  mass1: document.getElementById("mass1"),
  mass1Value: document.getElementById("mass1Value"),
  mass2: document.getElementById("mass2"),
  mass2Value: document.getElementById("mass2Value"),
  mass3: document.getElementById("mass3"),
  mass3Value: document.getElementById("mass3Value"),
  angle1: document.getElementById("angle1"),
  angle1Value: document.getElementById("angle1Value"),
  angle2: document.getElementById("angle2"),
  angle2Value: document.getElementById("angle2Value"),
  angle3: document.getElementById("angle3"),
  angle3Value: document.getElementById("angle3Value"),
  damping: document.getElementById("damping"),
  dampingValue: document.getElementById("dampingValue"),
  speed: document.getElementById("speed"),
  speedValue: document.getElementById("speedValue"),
  trailLength: document.getElementById("trailLength"),
  trailLengthValue: document.getElementById("trailLengthValue"),
  glowStrength: document.getElementById("glowStrength"),
  glowStrengthValue: document.getElementById("glowStrengthValue"),
  showTrail: document.getElementById("showTrail"),
  autoHue: document.getElementById("autoHue"),
  monochrome: document.getElementById("monochrome"),
  glowEffect: document.getElementById("glowEffect"),
  toggleRun: document.getElementById("toggleRun"),
  reset: document.getElementById("reset"),
  randomize: document.getElementById("randomize"),
  loadState: document.getElementById("loadState"),
  saveState: document.getElementById("saveState"),
  stateFileInput: document.getElementById("stateFileInput"),
  languageSelect: document.getElementById("languageSelect"),
  pauseIndicator: document.getElementById("pauseIndicator"),
  clearTrail: document.getElementById("clearTrail"),
  timeValue: document.getElementById("timeValue"),
  energyValue: document.getElementById("energyValue"),
  fpsValue: document.getElementById("fpsValue"),
  bobSpeedPanel: document.getElementById("bobSpeedPanel"),
  bobSpeedScaleMin: document.getElementById("bobSpeedScaleMin"),
  bobSpeedScaleMax: document.getElementById("bobSpeedScaleMax"),
  bobSpeedValueAvg: document.getElementById("bobSpeedValueAvg"),
  bobSpeedMarkerAvg: document.getElementById("bobSpeedMarkerAvg"),
  bobSpeedValueTip: document.getElementById("bobSpeedValueTip"),
  bobSpeedValue1: document.getElementById("bobSpeedValue1"),
  bobSpeedValue2: document.getElementById("bobSpeedValue2"),
  bobSpeedValue3: document.getElementById("bobSpeedValue3"),
  bobSpeedMarkerTip: document.getElementById("bobSpeedMarkerTip"),
  bobSpeedMarker1: document.getElementById("bobSpeedMarker1"),
  bobSpeedMarker2: document.getElementById("bobSpeedMarker2"),
  bobSpeedMarker3: document.getElementById("bobSpeedMarker3")
};

const params = {
  bobCount: 2,
  g: getInitialParam('gravity'),
  l1: getInitialParam('length1'),
  l2: getInitialParam('length2'),
  l3: getInitialParam('length3'),
  m1: getInitialParam('mass1'),
  m2: getInitialParam('mass2'),
  m3: getInitialParam('mass3'),
  damping: getInitialParam('damping'),
  speed: getInitialParam('speed'),
  trailLength: getInitialParam('trailLength'),
  glowStrength: getInitialParam('glowStrength'),
  infiniteTrail: false,
  showTrail: getInitialParam('showTrail'),
  autoHue: getInitialParam('autoHue'),
  monochrome: getInitialParam('monochrome'),
  glowEffect: getInitialParam('glowEffect')
};

const initial = {
  theta1: degToRad(getInitialParam('angle1')),
  theta2: degToRad(getInitialParam('angle2')),
  theta3: degToRad(getInitialParam('angle3'))
};

const state = {
  theta1: initial.theta1,
  omega1: 0,
  theta2: initial.theta2,
  omega2: 0,
  theta3: initial.theta3,
  omega3: 0
};

let running = true;
let trail = [];
let simTime = 0;
let initialEnergy = 0;
let lastEnergy = 0;
let lastSimTime = 0;
let fpsSmoothed = 60;
let previousTimestamp = performance.now();
let statsElapsed = 0;
let frameCount = 0;
let animationTick = 0;
let saveFeedbackTimeoutId = null;
let loadFeedbackTimeoutId = null;
let showCanvasFps = false;
let latestEndpointSpeed = 0;
let latestBobSpeeds = [0, 0, 0];
let latestTrailSpeedMin = 0;
let latestTrailSpeedMax = 1;
let hasTrailSpeedRange = false;

const STORAGE_KEY = "double-pendulum-controls-v1";
const MAX_FPS = 128;
const FRAME_INTERVAL_MS = 1000 / MAX_FPS;
const SAVED_RANGE_IDS = [
  "gravity",
  "length1",
  "length2",
  "length3",
  "mass1",
  "mass2",
  "mass3",
  "angle1",
  "angle2",
  "angle3",
  "damping",
  "speed",
  "trailLength",
  "glowStrength"
];
const SAVED_TOGGLE_IDS = ["showTrail", "autoHue", "monochrome", "glowEffect"];
const RANDOMIZE_RANGE_IDS_BASE = ["mass1", "mass2", "angle1", "angle2"];
const RANDOMIZE_RANGE_IDS_THREE = ["mass3", "angle3"];
const DYNAMIC_CSS_VARS = {
  bobCount: "--dp-bob-count",
  theta1Rad: "--dp-theta1-rad",
  theta2Rad: "--dp-theta2-rad",
  theta3Rad: "--dp-theta3-rad",
  theta1Deg: "--dp-theta1-deg",
  theta2Deg: "--dp-theta2-deg",
  theta3Deg: "--dp-theta3-deg",
  omega1: "--dp-omega1",
  omega2: "--dp-omega2",
  omega3: "--dp-omega3",
  x1: "--dp-x1",
  y1: "--dp-y1",
  x2: "--dp-x2",
  y2: "--dp-y2",
  x3: "--dp-x3",
  y3: "--dp-y3",
  vx1: "--dp-vx1",
  vy1: "--dp-vy1",
  vx2: "--dp-vx2",
  vy2: "--dp-vy2",
  vx3: "--dp-vx3",
  vy3: "--dp-vy3",
  speed1: "--dp-speed1",
  speed2: "--dp-speed2",
  speed3: "--dp-speed3",
  scale: "--dp-scale",
  simTime: "--dp-sim-time",
  energy: "--dp-energy",
  fps: "--dp-fps",
  running: "--dp-running"
};
const DEFAULT_LANGUAGE = "en";
let currentLanguage = DEFAULT_LANGUAGE;
let activeTab = "two";
let guideWindowOpen = false;

const I18N = {
  en: {
    pageTitle: "Double Pendulum Simulator",
    canvasLabel: "Double Pendulum Simulation",
    panelAriaLabel: "Simulation Settings",
    tabAriaLabel: "Simulation Tabs",
    languageLabel: "Language",
    languageEnglish: "English",
    languageJapanese: "日本語",
    heroKicker: "CHAOS STUDY",
    heroTitle: "Double Pendulum Simulator",
    heroSubtitle: "Tiny differences in initial conditions create wildly different paths.",
    panelNote: "Use each Reset button to restore that single item.",
    tabTwoBobs: "2 Bobs",
    tabThreeBobs: "3 Bobs",
    tabGuide: "Guide",
    guideWindowAria: "How To Use Window",
    guideTitle: "How To Use",
    guideClose: "Close",
    guideLine1: "Use `2 Bobs` and `3 Bobs` tabs to switch simulation mode.",
    guideLine2: "Click the canvas background to pause/resume.",
    guideLine3: "Press `R` for randomize and `F` to toggle FPS overlay.",
    guideLine4: "Save State creates a CSS file; Load State restores it.",
    labelGravity: "Gravity g",
    helpGravity: "Gravity acceleration. Higher means faster fall.",
    labelLength1: "Length L1",
    helpLength1: "Upper rod/string length.",
    labelLength2: "Length L2",
    helpLength2: "Lower rod/string length.",
    labelLength3: "Length L3",
    helpLength3: "Middle rod/string length (3-bob mode).",
    labelMass1: "Mass M1",
    helpMass1: "Upper bob mass.",
    labelMass2: "Mass M2",
    helpMass2: "Lower bob mass.",
    labelMass3: "Mass M3",
    helpMass3: "Middle bob mass (3-bob mode).",
    labelAngle1: "Initial Angle θ1",
    helpAngle1: "Upper initial angle (0° is downward, 0-360).",
    labelAngle2: "Initial Angle θ2",
    helpAngle2: "Lower initial angle (0° is downward, 0-360).",
    labelAngle3: "Initial Angle θ3",
    helpAngle3: "Middle initial angle (3-bob mode).",
    labelDamping: "Damping",
    helpDamping: "Air resistance strength. Higher stops faster.",
    labelSpeed: "Time Scale",
    helpSpeed: "Simulation playback speed.",
    labelTrailLength: "Trail Duration",
    helpTrailLength: "Trail lifetime in seconds. Higher leaves longer trails.",
    labelGlowStrength: "Glow Strength",
    helpGlowStrength: "Adjust the intensity of the glow effect.",
    resetSingle: "Reset",
    toggleShowTrail: "Show Trail",
    toggleAutoHue: "Auto Color Shift",
    toggleMonochrome: "Monochrome",
    toggleGlow: "Glow Effect",
    bobSpeedPanelTitle: "Bob Speeds",
    bobSpeedLabelTip: "Tip",
    bobSpeedLabel1: "Bob 1",
    bobSpeedLabel2: "Bob 2",
    bobSpeedLabel3: "Bob 3",
    btnPause: "Pause",
    btnResume: "Resume",
    btnReset: "Reset",
    btnRandomize: "Randomize",
    btnLoadState: "Load State File",
    btnSaveState: "Save State",
    btnClearTrail: "Clear Trail",
    statElapsed: "Elapsed",
    statEnergy: "Total Energy",
    statFps: "FPS",
    pauseIndicator: "Paused",
    feedbackSaved: "Saved + Downloaded",
    feedbackSaveFail: "Save Failed",
    feedbackLoaded: "Loaded",
    feedbackFormatError: "Invalid Format",
    feedbackLoadFail: "Load Failed"
  },
  ja: {
    pageTitle: "双連振り子シミュレーター",
    canvasLabel: "双連振り子シミュレーション",
    panelAriaLabel: "シミュレーション設定",
    tabAriaLabel: "シミュレーションタブ",
    languageLabel: "言語",
    languageEnglish: "English",
    languageJapanese: "日本語",
    heroKicker: "CHAOS STUDY",
    heroTitle: "双連振り子シミュレーター",
    heroSubtitle: "わずかな初期条件差で、軌跡は劇的に変化シマス。",
    panelTitle: "パラメータ",
    tabTwoBobs: "2個",
    tabThreeBobs: "3個",
    tabGuide: "使い方",
    guideWindowAria: "使い方ウィンドウ",
    guideTitle: "使い方",
    guideClose: "閉じる",
    guideLine1: "上の `2個` / `3個` タブでモードを切り替える。",
    guideLine2: "振り子画面の背景クリックで一時停止/再開。",
    guideLine3: "`R` キーでランダム、`F` キーでFPS表示を切り替え。",
    guideLine4: "状態を保存でCSS保存、状態ファイルを開くで復元できる。",
    labelGravity: "重力 g",
    helpGravity: "重力加速度。大きいほど速く落ちる。",
    labelLength1: "長さ L1",
    helpLength1: "上の振り子の糸の長さ。",
    labelLength2: "長さ L2",
    helpLength2: "下の振り子の糸の長さ。",
    labelLength3: "長さ L3",
    helpLength3: "3個モード用の真ん中の糸の長さ。",
    labelMass1: "質量 M1",
    helpMass1: "上の錘（おもり）の重さ。",
    labelMass2: "質量 M2",
    helpMass2: "下の錘（おもり）の重さ。",
    labelMass3: "質量 M3",
    helpMass3: "3個モード用の真ん中の錘の重さ。",
    labelAngle1: "初期角 θ1",
    helpAngle1: "上の振り子の初期角度（0°は真下、0〜360）。",
    labelAngle2: "初期角 θ2",
    helpAngle2: "下の振り子の初期角度（0°は真下、0〜360）。",
    labelAngle3: "初期角 θ3",
    helpAngle3: "3個モード用の真ん中の初期角度。",
    labelDamping: "減衰",
    helpDamping: "空気抵抗の強さ。大きいほど早く止まる。",
    labelSpeed: "時間倍率",
    helpSpeed: "シミュレーションの進行速度。",
    labelTrailLength: "軌跡時間",
    helpTrailLength: "軌跡が残る秒数。大きいほど残像が長くなる。",
    labelGlowStrength: "発光の強さ",
    helpGlowStrength: "発光エフェクトの輝きの強さを調整します。",
    resetSingle: "戻す",
    toggleShowTrail: "軌跡を表示",
    toggleAutoHue: "色を自動変化",
    toggleMonochrome: "モノクロ表示",
    toggleGlow: "発光エフェクト",
    bobSpeedPanelTitle: "玉ごとの速度",
    bobSpeedLabelTip: "先端",
    bobSpeedLabel1: "玉1",
    bobSpeedLabel2: "玉2",
    bobSpeedLabel3: "玉3",
    btnPause: "一時停止",
    btnResume: "再開",
    btnReset: "リセット",
    btnRandomize: "ランダム",
    btnLoadState: "状態ファイルを開く",
    btnSaveState: "状態を保存",
    btnClearTrail: "軌跡クリア",
    statElapsed: "経過時間",
    statEnergy: "総エネルギー",
    statFps: "FPS",
    pauseIndicator: "一時停止中",
    feedbackSaved: "保存してDL",
    feedbackSaveFail: "保存失敗",
    feedbackLoaded: "読込しました",
    feedbackFormatError: "形式エラー",
    feedbackLoadFail: "読込失敗"
  }
};

function getRandomizeRangeIds() {
  if (getLinkCount() === 3) {
    return [...RANDOMIZE_RANGE_IDS_BASE, ...RANDOMIZE_RANGE_IDS_THREE];
  }
  return RANDOMIZE_RANGE_IDS_BASE;
}

function syncTabUi() {
  if (controls.controlsPanel) {
    controls.controlsPanel.hidden = false;
  }
  if (controls.guideWindowOverlay) {
    controls.guideWindowOverlay.hidden = !guideWindowOpen;
    controls.guideWindowOverlay.style.display = guideWindowOpen ? "grid" : "none";
  }

  const guideSelected = guideWindowOpen;
  const states = [
    [controls.tabTwoBobs, !guideSelected && activeTab === "two"],
    [controls.tabThreeBobs, !guideSelected && activeTab === "three"],
    [controls.tabGuide, guideSelected]
  ];
  states.forEach(([button, selected]) => {
    if (!button) {
      return;
    }
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
  });
}

function setBobCount(nextCount, resetState = true) {
  const normalized = nextCount === 3 ? 3 : 2;
  const changed = params.bobCount !== normalized;
  params.bobCount = normalized;
  document.body.classList.toggle("three-bob-mode", normalized === 3);
  activeTab = normalized === 3 ? "three" : "two";
  syncTabUi();

  if (changed && resetState) {
    applyInitialState(true);
  }
}

function openGuideWindow() {
  guideWindowOpen = true;
  if (controls.guideWindowOverlay) {
    controls.guideWindowOverlay.hidden = false;
    controls.guideWindowOverlay.style.display = "grid";
  }
  syncTabUi();
}

function closeGuideWindow() {
  guideWindowOpen = false;
  if (controls.guideWindowOverlay) {
    controls.guideWindowOverlay.hidden = true;
    controls.guideWindowOverlay.style.display = "none";
  }
  syncTabUi();
}

function setActiveTab(nextTab, resetMode = true) {
  const normalized = nextTab === "three" ? "three" : nextTab === "guide" ? "guide" : "two";
  if (normalized === "guide") {
    openGuideWindow();
    return;
  }
  guideWindowOpen = false;
  setBobCount(normalized === "three" ? 3 : 2, resetMode);
}

function createGuideListItem(key) {
  const li = document.createElement("li");
  li.setAttribute("data-i18n", key);
  li.textContent = I18N[currentLanguage][key] ?? I18N.en[key] ?? "";
  return li;
}

function ensureGuideUiElements() {
  const tabHost = document.querySelector(".mode-tabs");
  if (!controls.tabGuide && tabHost) {
    const tab = document.createElement("button");
    tab.id = "tabGuide";
    tab.className = "mode-tab";
    tab.type = "button";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", "false");
    tab.setAttribute("data-i18n", "tabGuide");
    tab.textContent = I18N[currentLanguage].tabGuide ?? I18N.en.tabGuide;
    tabHost.appendChild(tab);
    controls.tabGuide = tab;
  }

  if (!controls.guideWindowOverlay) {
    const overlay = document.createElement("div");
    overlay.id = "guideWindowOverlay";
    overlay.className = "guide-window-overlay";
    overlay.hidden = true;

    const windowSection = document.createElement("section");
    windowSection.className = "guide-window";
    windowSection.setAttribute("role", "dialog");
    windowSection.setAttribute("aria-modal", "true");
    windowSection.setAttribute("data-i18n-aria-label", "guideWindowAria");
    windowSection.setAttribute("aria-label", I18N[currentLanguage].guideWindowAria ?? I18N.en.guideWindowAria);

    const head = document.createElement("div");
    head.className = "guide-window-head";

    const title = document.createElement("h3");
    title.setAttribute("data-i18n", "guideTitle");
    title.textContent = I18N[currentLanguage].guideTitle ?? I18N.en.guideTitle;

    const close = document.createElement("button");
    close.id = "closeGuideWindow";
    close.className = "guide-close";
    close.type = "button";
    close.setAttribute("data-i18n", "guideClose");
    close.textContent = I18N[currentLanguage].guideClose ?? I18N.en.guideClose;

    head.appendChild(title);
    head.appendChild(close);

    const list = document.createElement("ul");
    list.className = "guide-list";
    list.appendChild(createGuideListItem("guideLine1"));
    list.appendChild(createGuideListItem("guideLine2"));
    list.appendChild(createGuideListItem("guideLine3"));
    list.appendChild(createGuideListItem("guideLine4"));

    windowSection.appendChild(head);
    windowSection.appendChild(list);
    overlay.appendChild(windowSection);
    document.body.appendChild(overlay);

    controls.guideWindowOverlay = overlay;
    controls.closeGuideWindow = close;
  }
}

function t(key) {
  return I18N[currentLanguage][key] ?? I18N.en[key] ?? key;
}

function applyLanguage(nextLanguage) {
  const language = I18N[nextLanguage] ? nextLanguage : DEFAULT_LANGUAGE;
  currentLanguage = language;

  document.documentElement.lang = language;
  document.title = t("pageTitle");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (!key) {
      return;
    }
    element.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const key = element.getAttribute("data-i18n-aria-label");
    if (!key) {
      return;
    }
    element.setAttribute("aria-label", t(key));
  });

  if (controls.languageSelect && controls.languageSelect.value !== language) {
    controls.languageSelect.value = language;
  }

  setRunning(running);
  updateBobSpeedPanel();
}

function setSaveButtonFeedback(messageKey) {
  if (!controls.saveState) {
    return;
  }

  controls.saveState.textContent = t(messageKey);
  if (saveFeedbackTimeoutId !== null) {
    clearTimeout(saveFeedbackTimeoutId);
  }
  saveFeedbackTimeoutId = setTimeout(() => {
    controls.saveState.textContent = t("btnSaveState");
    saveFeedbackTimeoutId = null;
  }, 1200);
}

function setLoadButtonFeedback(messageKey) {
  if (!controls.loadState) {
    return;
  }

  controls.loadState.textContent = t(messageKey);
  if (loadFeedbackTimeoutId !== null) {
    clearTimeout(loadFeedbackTimeoutId);
  }
  loadFeedbackTimeoutId = setTimeout(() => {
    controls.loadState.textContent = t("btnLoadState");
    loadFeedbackTimeoutId = null;
  }, 1200);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readCssVariable(text, variableName) {
  const pattern = new RegExp(`${escapeRegExp(variableName)}\\s*:\\s*([^;\\n]+)`, "i");
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

function parseCssNumber(value) {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseStateCss(text) {
  const ranges = {};
  for (const id of SAVED_RANGE_IDS) {
    const value = readCssVariable(text, `--dp-${id}`);
    if (value !== null && value !== "") {
      ranges[id] = value;
    }
  }
  const legacyBobCount = readCssVariable(text, "--dp-bob-count") ?? readCssVariable(text, "--dp-bobCount");
  if (legacyBobCount !== null && legacyBobCount !== "") {
    ranges.bobCount = legacyBobCount;
  }

  const toggles = {};
  for (const id of SAVED_TOGGLE_IDS) {
    const value = readCssVariable(text, `--dp-${id}`);
    if (value === null) {
      continue;
    }
    const normalized = value.toLowerCase();
    toggles[id] = normalized === "1" || normalized === "true" || normalized === "on";
  }

  const dynamic = {};
  for (const [key, variableName] of Object.entries(DYNAMIC_CSS_VARS)) {
    const value = readCssVariable(text, variableName);
    if (value === null) {
      continue;
    }

    if (key === "running") {
      const normalized = value.toLowerCase();
      dynamic.running = normalized === "1" || normalized === "true" || normalized === "on";
      continue;
    }

    const numericValue = parseCssNumber(value);
    if (numericValue !== null) {
      dynamic[key] = numericValue;
    }
  }

  return { ranges, toggles, dynamic };
}

function collectDynamicSnapshot() {
  const chain = computeChainKinematics(state);
  const geometry = getGeometry();
  const vx1 = (chain.vx[0] ?? 0) * geometry.scale;
  const vy1 = (chain.vy[0] ?? 0) * geometry.scale;
  const vx2 = (chain.vx[1] ?? 0) * geometry.scale;
  const vy2 = (chain.vy[1] ?? 0) * geometry.scale;
  const vx3 = (chain.vx[2] ?? 0) * geometry.scale;
  const vy3 = (chain.vy[2] ?? 0) * geometry.scale;
  const speed1 = Math.hypot(vx1, vy1);
  const speed2 = Math.hypot(vx2, vy2);
  const speed3 = Math.hypot(vx3, vy3);

  return {
    bobCount: params.bobCount,
    theta1Rad: state.theta1,
    theta2Rad: state.theta2,
    theta3Rad: state.theta3,
    theta1Deg: radToDeg(state.theta1),
    theta2Deg: radToDeg(state.theta2),
    theta3Deg: radToDeg(state.theta3),
    omega1: state.omega1,
    omega2: state.omega2,
    omega3: state.omega3,
    x1: geometry.x1,
    y1: geometry.y1,
    x2: geometry.x2,
    y2: geometry.y2,
    x3: geometry.x3 ?? geometry.x2,
    y3: geometry.y3 ?? geometry.y2,
    vx1,
    vy1,
    vx2,
    vy2,
    vx3,
    vy3,
    speed1,
    speed2,
    speed3,
    scale: geometry.scale,
    simTime,
    energy: totalEnergy(),
    fps: fpsSmoothed,
    running
  };
}

function applyDynamicSnapshot(dynamic) {
  if (!dynamic || typeof dynamic !== "object") {
    return false;
  }

  let applied = false;
  if (Number.isFinite(dynamic.bobCount)) {
    setBobCount(dynamic.bobCount, false);
    applied = true;
  }
  if (Number.isFinite(dynamic.theta1Rad)) {
    state.theta1 = dynamic.theta1Rad;
    applied = true;
  }
  if (Number.isFinite(dynamic.theta2Rad)) {
    state.theta2 = dynamic.theta2Rad;
    applied = true;
  }
  if (Number.isFinite(dynamic.theta3Rad)) {
    state.theta3 = dynamic.theta3Rad;
    applied = true;
  }
  if (Number.isFinite(dynamic.omega1)) {
    state.omega1 = dynamic.omega1;
    applied = true;
  }
  if (Number.isFinite(dynamic.omega2)) {
    state.omega2 = dynamic.omega2;
    applied = true;
  }
  if (Number.isFinite(dynamic.omega3)) {
    state.omega3 = dynamic.omega3;
    applied = true;
  }
  if (Number.isFinite(dynamic.simTime)) {
    simTime = Math.max(0, dynamic.simTime);
    applied = true;
  }
  if (Number.isFinite(dynamic.fps)) {
    fpsSmoothed = Math.max(0, dynamic.fps);
  }
  if (typeof dynamic.running === "boolean") {
    setRunning(dynamic.running);
  }

  if (applied) {
    clearTrail();
    initialEnergy = totalEnergy();
    lastEnergy = initialEnergy;
    lastSimTime = simTime;
  }

  return applied;
}

function createCurrentPayload() {
  const ranges = {};
  for (const id of SAVED_RANGE_IDS) {
    if (controls[id]) {
      ranges[id] = controls[id].value;
    }
  }

  const toggles = {};
  for (const id of SAVED_TOGGLE_IDS) {
    if (controls[id]) {
      toggles[id] = controls[id].checked;
    }
  }

  return {
    ranges,
    toggles,
    dynamic: collectDynamicSnapshot(),
    savedAt: new Date().toISOString()
  };
}

function buildStateCss(payload) {
  const lines = [
    "/* Double Pendulum State File */",
    `/* savedAt: ${payload.savedAt} */`,
    "",
    ":root {"
  ];

  for (const id of SAVED_RANGE_IDS) {
    const value = payload.ranges[id];
    if (value !== undefined) {
      lines.push(`  --dp-${id}: ${value};`);
    }
  }

  for (const id of SAVED_TOGGLE_IDS) {
    const value = payload.toggles[id];
    if (typeof value === "boolean") {
      lines.push(`  --dp-${id}: ${value ? 1 : 0};`);
    }
  }

  const dynamic = payload.dynamic && typeof payload.dynamic === "object" ? payload.dynamic : {};
  lines.push("  /* dynamic snapshot */");
  for (const [key, variableName] of Object.entries(DYNAMIC_CSS_VARS)) {
    const value = dynamic[key];
    if (value === undefined || value === null) {
      continue;
    }

    if (key === "running") {
      lines.push(`  ${variableName}: ${value ? 1 : 0};`);
      continue;
    }

    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      continue;
    }
    lines.push(`  ${variableName}: ${numeric.toFixed(8)};`);
  }

  lines.push("}");
  lines.push("");
  return lines.join("\n");
}

function downloadStateCss(payload) {
  const cssText = buildStateCss(payload);
  const blob = new Blob([cssText], { type: "text/css;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().replace(/[:.]/g, "-");

  const link = document.createElement("a");
  link.href = url;
  link.download = `double-pendulum-state-${date}.css`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1500);
}

function applySavedControls(saved, resetAfterApply = false) {
  if (!saved || typeof saved !== "object") {
    return false;
  }

  const savedRanges = saved.ranges && typeof saved.ranges === "object" ? saved.ranges : {};
  let applied = false;
  if (savedRanges.bobCount !== undefined && savedRanges.bobCount !== null) {
    const parsedBobCount = Number(savedRanges.bobCount);
    if (Number.isFinite(parsedBobCount)) {
      setBobCount(parsedBobCount, false);
      applied = true;
    }
  }
  for (const id of SAVED_RANGE_IDS) {
    const control = controls[id];
    const rawValue = savedRanges[id];
    if (!control || rawValue === undefined || rawValue === null) {
      continue;
    }
    control.value = String(rawValue);
    if (control instanceof HTMLSelectElement) {
      control.dispatchEvent(new Event("change"));
    } else {
      control.dispatchEvent(new Event("input"));
    }
    applied = true;
  }

  const savedToggles = saved.toggles && typeof saved.toggles === "object" ? saved.toggles : {};
  for (const id of SAVED_TOGGLE_IDS) {
    const control = controls[id];
    const rawValue = savedToggles[id];
    if (!control || typeof rawValue !== "boolean") {
      continue;
    }
    control.checked = rawValue;
    control.dispatchEvent(new Event("change"));
    applied = true;
  }

  const dynamicApplied = applyDynamicSnapshot(saved.dynamic);
  if (dynamicApplied) {
    return true;
  }

  if (applied && resetAfterApply) {
    applyInitialState(true);
  }
  return applied || dynamicApplied;
}

function loadSavedControls() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return false;
    }
    const parsed = JSON.parse(raw);
    return applySavedControls(parsed, true);
  } catch (_error) {
    // ignore invalid storage entries
    return false;
  }
}

function saveCurrentControls() {
  const payload = createCurrentPayload();

  let downloaded = false;
  try {
    downloadStateCss(payload);
    downloaded = true;
  } catch (_error) {
    downloaded = false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (_error) {
    // keep working even if localStorage is unavailable
  }

  setSaveButtonFeedback(downloaded ? "feedbackSaved" : "feedbackSaveFail");
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  // ラズパイ5向け：DPRを1.2に制限してGPU負荷を激減させる
  const dpr = clamp(window.devicePixelRatio || 1, 1, 1.2);
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));

  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  rebuildBackground(width, height);

  clearTrail();
}

function rebuildBackground(width, height) {
  backgroundCanvas.width = width;
  backgroundCanvas.height = height;

  const gradient = backgroundCtx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgb(10 24 36)");
  gradient.addColorStop(0.45, "rgb(5 15 24)");
  gradient.addColorStop(1, "rgb(2 8 12)");
  backgroundCtx.fillStyle = gradient;
  backgroundCtx.fillRect(0, 0, width, height);
}


function getBobRadius(mass, scale) {
  return clamp(8 + Math.cbrt(mass) * 4 + scale * 0.004, 8, 20);
}

function getGeometry() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const chain = computeChainKinematics(state);
  const totalLength = chain.lengths.reduce((sum, value) => sum + value, 0);
  const bobRadiusEstimate = clamp(8 + Math.cbrt(Math.max(...chain.masses)) * 4, 8, 20);
  const edgePadding = 20;
  const safeHalfWidth = Math.max(0, width * 0.5 - edgePadding - bobRadiusEstimate);
  const safeHalfHeight = Math.max(0, height * 0.5 - edgePadding - bobRadiusEstimate);
  const reachableRadius = Math.min(safeHalfWidth, safeHalfHeight);
  const scale = totalLength > 0 ? Math.max(0, reachableRadius / totalLength) : 0;

  const pivotX = width * 0.5;
  const pivotY = height * 0.5;

  const points = chain.x.map((x, index) => ({
    x: pivotX + x * scale,
    y: pivotY + chain.y[index] * scale
  }));

  const x1 = points[0]?.x ?? pivotX;
  const y1 = points[0]?.y ?? pivotY;
  const x2 = points[1]?.x ?? x1;
  const y2 = points[1]?.y ?? y1;
  const x3 = points[2]?.x;
  const y3 = points[2]?.y;
  const endPoint = points[points.length - 1] ?? { x: x2, y: y2 };

  return {
    width,
    height,
    pivotX,
    pivotY,
    x1,
    y1,
    x2,
    y2,
    x3,
    y3,
    endX: endPoint.x,
    endY: endPoint.y,
    points,
    linkCount: chain.count,
    scale
  };
}

function clearTrail() {
  trail = [];
  hasTrailSpeedRange = false;
}

function toggleInfiniteTrail() {
  params.infiniteTrail = !params.infiniteTrail;
  const slider = controls.trailLength;
  const valueDisplay = controls.trailLengthValue;
  // スライダーの親要素（ラベル等を含むコンテナ）をグレーアウト対象にする
  const container = slider.parentElement;

  if (params.infiniteTrail) {
    slider.disabled = true;
    if (container) {
      container.style.opacity = "0.5";
      container.style.color = "#888";
      container.style.pointerEvents = "none";
    }
    if (valueDisplay) valueDisplay.textContent = "∞";
  } else {
    slider.disabled = false;
    if (container) {
      container.style.opacity = "1";
      container.style.color = "";
      container.style.pointerEvents = "auto";
    }
    if (valueDisplay) valueDisplay.textContent = `${params.trailLength.toFixed(1)} s`;
    clearTrail(); // 解除時に軌跡をクリア
  }
}

function syncPerformanceClass() {
  document.body.classList.toggle("performance-mode", params.performanceMode);
}

function trimTrailByDuration(referenceTime = simTime) {
  if (trail.length === 0 || params.infiniteTrail) {
    return;
  }

  const safeDuration = Math.max(0, params.trailLength);
  const cutoff = referenceTime - safeDuration;
  let removeCount = 0;

  while (removeCount < trail.length && trail[removeCount].time < cutoff) {
    removeCount += 1;
  }

  if (removeCount > 0) {
    trail.splice(0, removeCount);
  }
}

function updateTrail(point) {
  if (!params.showTrail) {
    return;
  }

  const pointTime = Number.isFinite(point.time) ? point.time : simTime;
  trail.push({ px: point.px, py: point.py, speed: point.speed, time: pointTime });
  trimTrailByDuration(pointTime);
}

function totalEnergy() {
  const chain = computeChainKinematics(state);

  let kinetic = 0;
  let potential = 0;
  let cumulativeLength = 0;

  for (let i = 0; i < chain.count; i++) {
    const mass = chain.masses[i];
    // 運動エネルギー: K = 1/2 * m * v^2
    const vSq = (chain.vx[i] ?? 0) ** 2 + (chain.vy[i] ?? 0) ** 2;
    kinetic += 0.5 * mass * vSq;

    // 各おもりのぶら下がり位置（静止位置）を基準(0)とするよう計算
    // y座標は下向きが正。cumulativeLengthは、そのおもりが真下にある時のy座標。
    cumulativeLength += chain.lengths[i];
    const heightFromRest = cumulativeLength - (chain.y[i] ?? 0);
    potential += mass * params.g * heightFromRest;
  }

  return kinetic + potential;
}

function drawBackground(width, height) {
  if (backgroundCanvas.width !== width || backgroundCanvas.height !== height) {
    rebuildBackground(width, height);
  }
  ctx.drawImage(backgroundCanvas, 0, 0, width, height);
}

function speedToTrailHue(speed) {
  const ratio = clamp(speed / 20.0, 0, 1);
  return ratio * 280;
}

function getSpeedReference() {
  const lengthScale = Math.max(0.25, params.l1 + params.l2 + (getLinkCount() === 3 ? params.l3 : 0));
  const gravityScale = Math.max(0.1, params.g);
  return Math.sqrt(lengthScale * gravityScale) * 2.4;
}

function speedToPendulumHue(speed) {
  const ratio = clamp(speed / 20.0, 0, 1);
  return ratio * 280;
}

function drawTrail() {
  if (!params.showTrail || trail.length < 2) {
    hasTrailSpeedRange = false;
    return;
  }

  const stride = Math.max(1, Math.floor(trail.length / 1000));
  const lastIndex = trail.length - 1;
  let minSpeed = Infinity;
  let maxSpeed = -Infinity;

  const geo = getGeometry();
  const getX = (p) => geo.pivotX + p.px * geo.scale;
  const getY = (p) => geo.pivotY + p.py * geo.scale;

  for (let i = 0; i <= lastIndex; i += stride) {
    const speed = trail[i].speed;
    if (speed < minSpeed) {
      minSpeed = speed;
    }
    if (speed > maxSpeed) {
      maxSpeed = speed;
    }
  }
  if (lastIndex % stride !== 0) {
    const speed = trail[lastIndex].speed;
    minSpeed = Math.min(minSpeed, speed);
    maxSpeed = Math.max(maxSpeed, speed);
  }
  if (!Number.isFinite(minSpeed) || !Number.isFinite(maxSpeed)) {
    minSpeed = 0;
    maxSpeed = 1;
  }
  latestTrailSpeedMin = Math.max(0, minSpeed);
  latestTrailSpeedMax = Math.max(latestTrailSpeedMin, maxSpeed);
  hasTrailSpeedRange = true;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const drawSegmentAt = (i) => {
    const prevIndex = Math.max(0, i - stride);
    const nextIndex = Math.min(lastIndex, i + stride);
    const prev = trail[prevIndex];
    const current = trail[i];
    const next = trail[nextIndex];

    // 外部ファイル（Trail-Duration/）の計算ロジックを使用
    const style = params.infiniteTrail 
      ? getDisabledTrailStyle(i, lastIndex, params.monochrome)
      : getEnabledTrailStyle(i, lastIndex, params.monochrome);
    
    const { alpha, lineScale } = style;
    const px = getX(current), py = getY(current);
    const startX = prevIndex === 0 ? getX(prev) : (getX(prev) + px) * 0.5;
    const startY = prevIndex === 0 ? getY(prev) : (getY(prev) + py) * 0.5;
    const endX = nextIndex === lastIndex ? getX(next) : (px + getX(next)) * 0.5;
    const endY = nextIndex === lastIndex ? getY(next) : (py + getY(next)) * 0.5;

    ctx.lineWidth = 2.1 * lineScale;

    if (params.monochrome) {
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = `rgba(228, 236, 240, ${alpha.toFixed(3)})`;
    } else {
      const hueMid = params.autoHue ? speedToTrailHue(current.speed, minSpeed, maxSpeed) : 194;
      
      // Hue-Calculatorの個別ファイルから設定を取得
      const colorSettings = params.glowEffect ? getGlowEnabledSettings(hueMid, alpha, params.glowStrength) : getGlowDisabledSettings();

      ctx.shadowBlur = colorSettings.shadowBlur;
      ctx.shadowColor = colorSettings.shadowColor;
      // 彩度を100%に引き上げ、輝度を調整して「濃い」発色を実現
      ctx.strokeStyle = params.glowEffect 
        ? `hsla(${hueMid}, 100%, 50%, ${alpha})` 
        : `hsla(${hueMid}, 100%, 50%, ${alpha})`;
    }

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(px, py, endX, endY);
    ctx.stroke();
  };

  for (let i = stride; i <= lastIndex; i += stride) {
    drawSegmentAt(i);
  }
  if (lastIndex % stride !== 0) {
    drawSegmentAt(lastIndex);
  }

  ctx.restore();
}

function drawBob(x, y, radius, baseHue, lightness) {
  ctx.save();

  const settings = params.glowEffect 
    ? getGlowEnabledSettings(baseHue, 1.0, params.glowStrength) 
    : getGlowDisabledSettings();

  // 玉自体の発光（shadowBlur）を無効化してシンプルかつ軽量に
  ctx.shadowBlur = 0;

  // 単色塗りに変更
  ctx.fillStyle = params.monochrome 
    ? "hsl(205, 15%, 70%)" 
    : `hsl(${baseHue}, ${settings.saturation}%, ${lightness}%)`;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // 控えめな白いエッジを追加して形をはっきりさせる
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.stroke();
  ctx.restore();
}

function updateGlowStrengthUI() {
  const container = document.getElementById("glowStrengthContainer");
  if (container) {
    container.style.opacity = params.glowEffect ? "1" : "0.5";
    container.style.pointerEvents = params.glowEffect ? "auto" : "none";
  }
}

function drawPendulum(geometry) {
  const { pivotX, pivotY, points, scale } = geometry;
  const chain = computeChainKinematics(state);
  latestEndpointSpeed = Math.max(0, chain.speed[chain.count - 1] ?? 0);
  latestBobSpeeds[0] = Math.max(0, chain.speed[0] ?? 0);
  latestBobSpeeds[1] = Math.max(0, chain.speed[1] ?? 0);
  latestBobSpeeds[2] = Math.max(0, chain.speed[2] ?? 0);
  const hues = chain.speed.map((speed) => (params.autoHue ? speedToPendulumHue(speed) : 194));
  const rodHue =
    hues.length > 0 ? hues.reduce((sum, hueValue) => sum + hueValue, 0) / hues.length : 194;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const anchorPoints = [{ x: pivotX, y: pivotY }, ...points];
  if (params.monochrome) {
    if (params.monochrome) {
      ctx.strokeStyle = "rgba(222, 233, 240, 0.92)";
    }
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(anchorPoints[0].x, anchorPoints[0].y);
    for (let i = 1; i < anchorPoints.length; i += 1) {
      ctx.lineTo(anchorPoints[i].x, anchorPoints[i].y);
    }
    ctx.stroke();
  } else {
    ctx.lineWidth = 2.6;
    for (let i = 1; i < anchorPoints.length; i += 1) {
      const start = anchorPoints[i - 1];
      const end = anchorPoints[i];
      const startHue = hues[Math.max(0, i - 2)] ?? rodHue;
      const endHue = hues[i - 1] ?? rodHue;
      const segHue = (startHue + endHue) * 0.5;
      const segmentGradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
      segmentGradient.addColorStop(0, `hsla(${startHue.toFixed(1)}, 70%, 82%, 0.85)`);
      segmentGradient.addColorStop(1, `hsla(${endHue.toFixed(1)}, 80%, 68%, 0.9)`);
      ctx.strokeStyle = segmentGradient;
      ctx.shadowColor = `hsla(${segHue.toFixed(1)}, 85%, 68%, 0.35)`;
      ctx.shadowBlur = params.glowEffect ? 8 * params.glowStrength : 0;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }

  ctx.fillStyle = "rgba(228, 248, 255, 0.95)";
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 4.3, 0, Math.PI * 2);
  ctx.fill();

  const radius = chain.masses.map((mass) => getBobRadius(mass, scale));
  if (points[0]) {
    drawBob(points[0].x, points[0].y, radius[0], hues[0] ?? 194, 58);
  }
  if (points[1]) {
    drawBob(points[1].x, points[1].y, radius[1], hues[1] ?? 194, 56);
  }
  if (points[2]) {
    drawBob(points[2].x, points[2].y, radius[2], hues[2] ?? 194, 54);
  }
  ctx.restore();
}

function draw() {
  const geometry = getGeometry();
  drawBackground(geometry.width, geometry.height);
  drawTrail();
  drawPendulum(geometry);
  updateBobSpeedPanel();
  drawCanvasFps(geometry);
}

function fpsTextColor(fps) {
  if (fps <= 24) {
    return "#ff5f5f";
  }
  if (fps <= 60) {
    return "#ffd356";
  }
  return "#64e57f";
}

function drawCanvasFps(geometry) {
  if (!showCanvasFps) {
    return;
  }

  const fpsValue = clamp(Math.round(fpsSmoothed), 0, MAX_FPS);
  const label = `FPS ${fpsValue}`;
  const x = geometry.width - 14;
  const y = geometry.height - 12;

  ctx.save();
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.font = "600 14px Sora, 'Noto Sans JP', sans-serif";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(4, 10, 16, 0.78)";
  ctx.strokeText(label, x, y);
  ctx.fillStyle = fpsTextColor(fpsValue);
  ctx.fillText(label, x, y);
  ctx.restore();
}

function formatSpeedValue(speed) {
  return speed.toFixed(3);
}

function getCurrentSpeedScaleMax() {
  const usingTrailRange = hasTrailSpeedRange && params.showTrail;
  let maxSpeed = usingTrailRange ? latestTrailSpeedMax : getSpeedReference();
  if (!Number.isFinite(maxSpeed)) {
    maxSpeed = 1;
  }
  return Math.max(1e-6, maxSpeed);
}

function updateBobSpeedPanel() {
  if (!controls.bobSpeedPanel) {
    return;
  }

  const scaleMax = 20.0;
  const count = getLinkCount();

  // 目盛りラベルの更新 (0, 5, 10, 15, 20)
  [0, 5, 10, 15, 20].forEach(val => {
    const el = document.getElementById(`bobSpeedScale${val}`);
    if (el) el.textContent = val.toString();
  });

  // 最小・最大表示も単純な数値に更新
  if (controls.bobSpeedScaleMin) controls.bobSpeedScaleMin.textContent = "0";
  if (controls.bobSpeedScaleMax) controls.bobSpeedScaleMax.textContent = "20";

  const totalSpeed = latestBobSpeeds.slice(0, count).reduce((sum, s) => sum + Math.max(0, s || 0), 0);
  const avgSpeed = count > 0 ? totalSpeed / count : 0;
  const tipSpeed = latestEndpointSpeed;

  /**
   * マーカーの状態を更新
   */
  const updateMarker = (marker, speed, valueEl, isVisible = true) => {
    if (!marker) return;
    
    if (!isVisible) {
      marker.style.display = "none";
      if (valueEl) valueEl.textContent = "-";
      return;
    }
    marker.style.display = "block";

    const ratio = clamp(speed / scaleMax, 0, 1);
    marker.style.left = `${(ratio * 100).toFixed(2)}%`;

    if (params.monochrome) {
      marker.style.background = "rgba(220, 230, 236, 0.95)";
      marker.style.boxShadow = "none";
    } else {
      // 振り子の色設定と同期させる (Auto Color Shiftがオフなら194/青)
      // 振り子の玉と同じ計算式で色を同期
      const hue = params.autoHue ? speedToPendulumHue(speed) : 194;
      marker.style.background = `hsl(${hue}, 93%, 58%)`;
      marker.style.boxShadow = `0 0 12px hsla(${hue}, 95%, 65%, 0.7)`;
      if (valueEl) valueEl.style.color = `hsl(${hue}, 100%, 82%)`;
    }

    if (valueEl) {
      valueEl.textContent = formatSpeedValue(speed);
    }
  };

  // 各マーカーの更新
  updateMarker(controls.bobSpeedMarkerAvg, avgSpeed, controls.bobSpeedValueAvg);
  updateMarker(controls.bobSpeedMarkerTip, tipSpeed, controls.bobSpeedValueTip);
  updateMarker(controls.bobSpeedMarker1, latestBobSpeeds[0], controls.bobSpeedValue1);
  updateMarker(controls.bobSpeedMarker2, latestBobSpeeds[1], controls.bobSpeedValue2);
  updateMarker(controls.bobSpeedMarker3, latestBobSpeeds[2], controls.bobSpeedValue3, count === 3);
}

function refreshStats(dt) {
  frameCount += 1;
  statsElapsed += dt;

  const statsInterval = 0.09;
  if (statsElapsed < statsInterval) {
    return;
  }

  const instantFps = clamp(frameCount / statsElapsed, 0, MAX_FPS);
  fpsSmoothed = clamp(fpsSmoothed * 0.7 + instantFps * 0.3, 0, MAX_FPS);
  frameCount = 0;
  statsElapsed = 0;

  const currentE = totalEnergy();

  // シミュレーション上の1秒あたりのエネルギー変化量 (Power) を計算
  const simDt = simTime - lastSimTime;
  let rateText = "0.000";
  if (simDt > 0) {
    const rate = (currentE - lastEnergy) / simDt;
    rateText = (rate > 0 ? "+" : (rate < -0.0005 ? "" : "")) + rate.toFixed(3);
    // 0付近で+がつかないように調整し、正の値のときのみ+を表示します
    rateText = (rate > 0.0005 ? "+" : "") + rate.toFixed(3);
    // 数値的な微小振動（ジッター）を抑えるため、0.0005以上の変化がある場合のみ符号を制御します
    const sign = rate > 0.0005 ? "+" : "";
    rateText = sign + rate.toFixed(3);
  }
  lastEnergy = currentE;
  lastSimTime = simTime;

  controls.timeValue.textContent = `${simTime.toFixed(1)} s`;
  controls.energyValue.innerHTML = `<span style="font-size: 0.85em; opacity: 0.6; margin-right: 4px;">${rateText}/s</span>${currentE.toFixed(3)}`;
  controls.fpsValue.textContent = Math.round(fpsSmoothed).toString();
  updateBobSpeedPanel();
}

function applyInitialState(resetTime) {
  state.theta1 = initial.theta1;
  state.theta2 = initial.theta2;
  state.theta3 = initial.theta3;
  state.omega1 = 0;
  state.omega2 = 0;
  state.omega3 = 0;

  if (resetTime) {
    simTime = 0;
  }
  initialEnergy = totalEnergy();
  lastEnergy = initialEnergy;
  lastSimTime = simTime;

  clearTrail();
}

function bindSlider(input, output, formatter, onInput) {
  const update = () => {
    const value = Number(input.value);
    onInput(value);
    output.textContent = formatter(value);
    if (!running) {
      initialEnergy = totalEnergy();
      lastEnergy = initialEnergy;
      lastSimTime = simTime;
    }
    updateBobSpeedPanel();
  };

  input.addEventListener("input", update);
  input.addEventListener("change", update);
  update();
}

function setRunning(nextRunning) {
  running = nextRunning;
  controls.toggleRun.textContent = running ? t("btnPause") : t("btnResume");
  canvas.classList.toggle("is-paused", !running);
  if (controls.pauseIndicator) {
    controls.pauseIndicator.hidden = running;
    controls.pauseIndicator.textContent = t("pauseIndicator");
  }
}

ensureGuideUiElements();
setActiveTab("two", false);
controls.tabTwoBobs.addEventListener("click", () => {
  setActiveTab("two", true);
});
controls.tabThreeBobs.addEventListener("click", () => {
  setActiveTab("three", true);
});
if (controls.tabGuide) {
  controls.tabGuide.addEventListener("click", () => {
    setActiveTab("guide", false);
  });
}
if (controls.closeGuideWindow) {
  controls.closeGuideWindow.addEventListener("click", () => {
    closeGuideWindow();
  });
}
if (controls.guideWindowOverlay) {
  controls.guideWindowOverlay.addEventListener("click", (event) => {
    if (event.target === controls.guideWindowOverlay) {
      closeGuideWindow();
    }
  });
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  if (target.closest("#closeGuideWindow")) {
    event.preventDefault();
    event.stopPropagation();
    closeGuideWindow();
    return;
  }

  if (target.closest("#tabGuide")) {
    event.preventDefault();
    setActiveTab("guide", false);
  }
});

bindSlider(controls.gravity, controls.gravityValue, (v) => v.toFixed(3), (v) => {
  params.g = v;
});

bindSlider(controls.length1, controls.length1Value, (v) => `${v.toFixed(3)} m`, (v) => {
  params.l1 = v;
});

bindSlider(controls.length2, controls.length2Value, (v) => `${v.toFixed(3)} m`, (v) => {
  params.l2 = v;
});

bindSlider(controls.length3, controls.length3Value, (v) => `${v.toFixed(3)} m`, (v) => {
  params.l3 = v;
});

bindSlider(controls.mass1, controls.mass1Value, (v) => `${v.toFixed(2)} kg`, (v) => {
  params.m1 = v;
});

bindSlider(controls.mass2, controls.mass2Value, (v) => `${v.toFixed(2)} kg`, (v) => {
  params.m2 = v;
});

bindSlider(controls.mass3, controls.mass3Value, (v) => `${v.toFixed(2)} kg`, (v) => {
  params.m3 = v;
});

bindSlider(controls.angle1, controls.angle1Value, (v) => `${v.toFixed(1)}°`, (v) => {
  initial.theta1 = degToRad(v);
  if (!running) {
    state.theta1 = initial.theta1;
    state.omega1 = 0;
    clearTrail();
  }
});

bindSlider(controls.angle2, controls.angle2Value, (v) => `${v.toFixed(1)}°`, (v) => {
  initial.theta2 = degToRad(v);
  if (!running) {
    state.theta2 = initial.theta2;
    state.omega2 = 0;
    clearTrail();
  }
});

bindSlider(controls.angle3, controls.angle3Value, (v) => `${v.toFixed(1)}°`, (v) => {
  initial.theta3 = degToRad(v);
  if (!running && getLinkCount() === 3) {
    state.theta3 = initial.theta3;
    state.omega3 = 0;
    clearTrail();
  }
});

bindSlider(controls.damping, controls.dampingValue, (v) => v.toFixed(5), (v) => {
  params.damping = v;
});

bindSlider(controls.speed, controls.speedValue, (v) => `${v.toFixed(3)}x`, (v) => {
  params.speed = v;
});

bindSlider(controls.glowStrength, controls.glowStrengthValue, (v) => v.toFixed(1), (v) => {
  params.glowStrength = v;
});

bindSlider(controls.trailLength, controls.trailLengthValue, (v) => `${v.toFixed(1)} s`, (v) => {
  const min = Number(controls.trailLength.min);
  const max = Number(controls.trailLength.max);
  const safeValue = clamp(v, min, max);
  params.trailLength = safeValue;
  if (safeValue !== v) {
    controls.trailLength.value = safeValue.toFixed(1);
  }
  trimTrailByDuration(simTime);
});

document.querySelectorAll(".param-reset").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const targetId = button.getAttribute("data-target");
    if (!targetId) {
      return;
    }

    const targetInput = document.getElementById(targetId);
    if (!targetInput) {
      return;
    }

    if (targetInput instanceof HTMLSelectElement) {
      const defaultOption = Array.from(targetInput.options).find((option) => option.defaultSelected) ?? targetInput.options[0];
      if (defaultOption) {
        targetInput.value = defaultOption.value;
      }
      targetInput.dispatchEvent(new Event("change"));
      return;
    } else {
      targetInput.value = targetInput.defaultValue;
    }
    targetInput.dispatchEvent(new Event("input"));
  });
});

controls.showTrail.addEventListener("change", (event) => {
  params.showTrail = event.target.checked;
  if (!params.showTrail) {
    clearTrail();
  }
  updateBobSpeedPanel();
});

controls.autoHue.addEventListener("change", (event) => {
  params.autoHue = event.target.checked;
  updateBobSpeedPanel();
});

controls.monochrome.addEventListener("change", (event) => {
  params.monochrome = event.target.checked;
  updateBobSpeedPanel();
});

controls.glowEffect.addEventListener("change", (event) => {
  params.glowEffect = event.target.checked;
  statsElapsed = 0;
  frameCount = 0;
  updateGlowStrengthUI();
  updateBobSpeedPanel();
});

controls.toggleRun.addEventListener("click", () => {
  setRunning(!running);
});

controls.reset.addEventListener("click", () => {
  applyInitialState(true);
});

function randomizeRangeControl(control) {
  const min = Number(control.min);
  const max = Number(control.max);
  const step = Number(control.step) || 1;
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return;
  }

  let value = min + Math.random() * (max - min);
  if (step > 0) {
    value = min + Math.round((value - min) / step) * step;
  }
  value = clamp(value, min, max);

  const stepText = String(control.step);
  const decimals = stepText.includes(".") ? stepText.split(".")[1].length : 0;
  control.value = value.toFixed(decimals);
  control.dispatchEvent(new Event("input"));
}

function triggerRandomize() {
  getRandomizeRangeIds().map((id) => controls[id]).forEach(randomizeRangeControl);
  applyInitialState(true);
}

controls.randomize.addEventListener("click", () => {
  triggerRandomize();
});

controls.languageSelect.addEventListener("change", (event) => {
  applyLanguage(event.target.value);
});

controls.loadState.addEventListener("click", () => {
  controls.stateFileInput.click();
});

controls.stateFileInput.addEventListener("change", async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = parseStateCss(text);
    const applied = applySavedControls(parsed, true);
    if (applied) {
      setLoadButtonFeedback("feedbackLoaded");
    } else {
      setLoadButtonFeedback("feedbackFormatError");
    }
  } catch (_error) {
    setLoadButtonFeedback("feedbackLoadFail");
  } finally {
    event.target.value = "";
  }
});

controls.saveState.addEventListener("click", () => {
  saveCurrentControls();
});

controls.clearTrail.addEventListener("click", () => {
  clearTrail();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeGuideWindow();
  }

  if (event.defaultPrevented || event.repeat || event.isComposing) {
    return;
  }
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  const target = event.target;
  if (target instanceof HTMLElement) {
    const tag = target.tagName;
    if (
      target.isContentEditable ||
      (tag === "INPUT" && target.type !== "range") ||
      tag === "TEXTAREA" ||
      tag === "SELECT"
    ) {
      return;
    }
  }

  if (event.code === "KeyT" || event.key === "t" || event.key === "T") {
    event.preventDefault();
    toggleInfiniteTrail();
    return;
  }

  if (event.code === "KeyR" || event.key === "r" || event.key === "R") {
    event.preventDefault();
    triggerRandomize();
    return;
  }

  if (event.code === "KeyG" || event.key === "g" || event.key === "G") {
    event.preventDefault();
    params.glowEffect = !params.glowEffect;
    controls.glowEffect.checked = params.glowEffect;
    updateGlowStrengthUI();
    return;
  }

  if (event.code === "KeyF" || event.key === "f" || event.key === "F") {
    event.preventDefault();
    showCanvasFps = !showCanvasFps;
    return;
  }

  if (event.code === "KeyC" || event.key === "c" || event.key === "C") {
    event.preventDefault();
    clearTrail();
    return;
  }
});

canvas.addEventListener("click", () => {
  setRunning(!running);
});

applyLanguage(DEFAULT_LANGUAGE);
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
setRunning(running);
initialEnergy = totalEnergy();
lastEnergy = initialEnergy;
lastSimTime = simTime;

function animate(now) {
  const elapsedMs = now - previousTimestamp;
  if (elapsedMs < FRAME_INTERVAL_MS) {
    requestAnimationFrame(animate);
    return;
  }

  const frameDt = Math.min(elapsedMs / 1000, 0.05);
  previousTimestamp = now - (elapsedMs % FRAME_INTERVAL_MS);
  animationTick += 1;

  if (running) {
    const scaledDt = frameDt * params.speed;
    const stepTarget = 0.001;
    const steps = Math.max(1, Math.ceil(scaledDt / stepTarget));
    const subDt = scaledDt / steps;

    for (let i = 0; i < steps; i += 1) {
      rk4Step(subDt);
    }

    simTime += scaledDt;

    const chain = computeChainKinematics(state);
    const endpointIndex = chain.count - 1;
    updateTrail({ px: chain.x[endpointIndex], py: chain.y[endpointIndex], speed: chain.speed[endpointIndex], time: simTime });
  }

  draw();
  refreshStats(frameDt);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
