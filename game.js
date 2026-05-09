const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const stackEl = document.querySelector("#stackCount");
const livesEl = document.querySelector("#lives");
const comboEl = document.querySelector("#combo");
const highScoreEl = document.querySelector("#highScore");
const powerStatusEl = document.querySelector("#powerStatus");
const overlay = document.querySelector("#overlay");
const overlayText = document.querySelector("#overlayText");
const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");
const soundToggle = document.querySelector("#soundToggle");

let W = canvas.width;
let H = canvas.height;
let phoneLayout = false;
setCanvasSizeForViewport();

const keys = new Set();
const DEBUG_MODE = new URLSearchParams(window.location.search).has("debug");
const MAX_DROPS = 18;
const FOOD_SCALE = 0.72;
const STACK_STEP = 7;
const PLATE_STACK_OFFSET = 34;
const DESSERT_BASE_DURATION = 16;
const POWER_HITBOX_SIZE = 64;
const POWER_VISUAL_SIZE = 78;
const INGREDIENT_SPRITE_COUNT = 13;
const INGREDIENT_CELL_W = 192;
const INGREDIENT_CELL_H = 128;
const HAZARD_POWER_SPRITE_COUNT = 7;
const HAZARD_POWER_CELL_W = 160;
const HAZARD_POWER_CELL_H = 128;
const PLAYER_SPRITE_FRAMES = 4;
const VOLCANO_SMOKE_FRAMES = 36;
const VOLCANO_ERUPTION_FRAMES = 36;
const ASSET_VERSION = 2;
const VOLCANO_PLACEMENT_STORAGE_KEY = "sandwichStackVolcanoPlacementV2";
const WALK_FRAME_OFFSETS = [
  { x: 0, y: 0 },
  { x: 14.5, y: 0 },
  { x: 19, y: 1 },
  { x: 11, y: 0 }
];
const IDLE_FRAME_OFFSETS = [
  { x: 0, y: 0 },
  { x: 14, y: 0 },
  { x: 27, y: 0 },
  { x: 28, y: 0 }
];
const playerSprite = new Image();
playerSprite.src = "assets/player-spritesheet.png?v=1";
playerSprite.onload = () => draw();
const playerIdleSprite = new Image();
playerIdleSprite.src = "assets/player-idle-spritesheet.png?v=1";
playerIdleSprite.onload = () => draw();
const ingredientSprite = new Image();
ingredientSprite.src = "assets/ingredient-spritesheet.png?v=4";
ingredientSprite.onload = () => draw();
const hazardPowerSprite = new Image();
hazardPowerSprite.src = "assets/hazard-power-spritesheet.png?v=1";
hazardPowerSprite.onload = () => draw();
const backgroundImage = new Image();
backgroundImage.src = `assets/background/volcano-island.png?v=${ASSET_VERSION}`;
backgroundImage.onload = () => draw();
const itemImages = loadNamedImages({
  bread: "assets/items/bread.png",
  lettuce: "assets/items/lettuce.png",
  cheese: "assets/items/cheese.png",
  tomato: "assets/items/tomato.png",
  patty: "assets/items/patty.png",
  pickle: "assets/items/pickle.png",
  "chocolate cake": "assets/items/chocolate-cake.png",
  "vanilla cake": "assets/items/vanilla-cake.png",
  "strawberry cake": "assets/items/strawberry-cake.png",
  "red velvet cake": "assets/items/red-velvet-cake.png",
  "blueberry frosting": "assets/items/blueberry-frosting.png",
  "mint frosting": "assets/items/mint-frosting.png",
  "cherry frosting": "assets/items/cherry-frosting.png"
});
const hazardImages = loadNamedImages({
  boot: "assets/hazards/boot.png",
  fishbone: "assets/hazards/fishbone.png",
  bug: "assets/hazards/bug.png"
});
const powerImages = loadNamedImages({
  slow: "assets/powers/slow.png",
  magnet: "assets/powers/magnet.png",
  double: "assets/powers/double.png",
  shield: "assets/powers/shield.png"
});
const effectImages = loadNamedImages({
  lavaSpark: "assets/effects/lava-spark.png",
  ember: "assets/effects/ember.png",
  smokePuff: "assets/effects/smoke-puff.png",
  glint: "assets/effects/glint.png"
});
const volcanoAnimationImages = loadNamedImages({
  smoke: "assets/volcano/smoke-flow-36-premium-spritesheet.png",
  eruption: "assets/volcano/eruption-36-premium-spritesheet.png"
});
const VOLCANO_SMOKE_FRAME_BOUNDS = [
  { left: 48, right: 368, top: 108, bottom: 752 },
  { left: 48, right: 368, top: 108, bottom: 752 },
  { left: 48, right: 368, top: 108, bottom: 752 },
  { left: 48, right: 366, top: 108, bottom: 750 },
  { left: 50, right: 366, top: 108, bottom: 750 },
  { left: 50, right: 364, top: 108, bottom: 750 },
  { left: 50, right: 364, top: 108, bottom: 750 },
  { left: 52, right: 364, top: 108, bottom: 750 },
  { left: 52, right: 362, top: 108, bottom: 750 },
  { left: 52, right: 362, top: 108, bottom: 748 },
  { left: 52, right: 364, top: 108, bottom: 748 },
  { left: 52, right: 364, top: 108, bottom: 748 },
  { left: 52, right: 364, top: 108, bottom: 748 },
  { left: 52, right: 366, top: 108, bottom: 748 },
  { left: 52, right: 366, top: 108, bottom: 748 },
  { left: 52, right: 368, top: 108, bottom: 748 },
  { left: 52, right: 370, top: 108, bottom: 746 },
  { left: 52, right: 370, top: 108, bottom: 746 },
  { left: 54, right: 370, top: 108, bottom: 746 },
  { left: 54, right: 370, top: 108, bottom: 746 },
  { left: 54, right: 370, top: 108, bottom: 746 },
  { left: 56, right: 370, top: 108, bottom: 746 },
  { left: 56, right: 368, top: 108, bottom: 746 },
  { left: 56, right: 368, top: 108, bottom: 746 },
  { left: 56, right: 368, top: 108, bottom: 748 },
  { left: 58, right: 366, top: 108, bottom: 748 },
  { left: 58, right: 366, top: 108, bottom: 748 },
  { left: 56, right: 366, top: 108, bottom: 748 },
  { left: 56, right: 366, top: 108, bottom: 748 },
  { left: 54, right: 366, top: 108, bottom: 748 },
  { left: 52, right: 368, top: 108, bottom: 748 },
  { left: 50, right: 368, top: 108, bottom: 750 },
  { left: 50, right: 368, top: 108, bottom: 750 },
  { left: 48, right: 370, top: 108, bottom: 750 },
  { left: 46, right: 370, top: 108, bottom: 750 },
  { left: 48, right: 368, top: 108, bottom: 750 }
];
const VOLCANO_ERUPTION_FRAME_BOUNDS = [
  { left: 48, right: 408, top: 92, bottom: 756 },
  { left: 48, right: 406, top: 90, bottom: 756 },
  { left: 48, right: 404, top: 86, bottom: 756 },
  { left: 48, right: 404, top: 84, bottom: 754 },
  { left: 46, right: 408, top: 82, bottom: 754 },
  { left: 44, right: 412, top: 80, bottom: 752 },
  { left: 44, right: 414, top: 82, bottom: 750 },
  { left: 46, right: 418, top: 82, bottom: 750 },
  { left: 46, right: 418, top: 84, bottom: 750 },
  { left: 48, right: 418, top: 88, bottom: 748 },
  { left: 50, right: 418, top: 90, bottom: 748 },
  { left: 50, right: 418, top: 94, bottom: 748 },
  { left: 50, right: 418, top: 98, bottom: 748 },
  { left: 52, right: 418, top: 100, bottom: 750 },
  { left: 52, right: 418, top: 102, bottom: 752 },
  { left: 52, right: 418, top: 104, bottom: 752 },
  { left: 54, right: 416, top: 104, bottom: 754 },
  { left: 56, right: 414, top: 104, bottom: 754 },
  { left: 56, right: 414, top: 102, bottom: 754 },
  { left: 56, right: 414, top: 100, bottom: 756 },
  { left: 54, right: 412, top: 98, bottom: 756 },
  { left: 52, right: 410, top: 94, bottom: 756 },
  { left: 48, right: 408, top: 90, bottom: 756 },
  { left: 44, right: 408, top: 86, bottom: 756 },
  { left: 40, right: 408, top: 84, bottom: 756 },
  { left: 36, right: 412, top: 82, bottom: 754 },
  { left: 34, right: 414, top: 80, bottom: 754 },
  { left: 32, right: 416, top: 80, bottom: 752 },
  { left: 34, right: 416, top: 82, bottom: 752 },
  { left: 36, right: 416, top: 84, bottom: 750 },
  { left: 38, right: 414, top: 86, bottom: 750 },
  { left: 40, right: 414, top: 90, bottom: 748 },
  { left: 44, right: 410, top: 94, bottom: 748 },
  { left: 46, right: 408, top: 98, bottom: 748 },
  { left: 50, right: 406, top: 100, bottom: 748 },
  { left: 50, right: 408, top: 102, bottom: 750 }
];

const INGREDIENT_SPRITES = {
  bread: 0,
  lettuce: 1,
  cheese: 2,
  tomato: 3,
  patty: 4,
  pickle: 5,
  "chocolate cake": 6,
  "vanilla cake": 7,
  "strawberry cake": 8,
  "red velvet cake": 9,
  "blueberry frosting": 10,
  "mint frosting": 11,
  "cherry frosting": 12
};

const HAZARD_POWER_SPRITES = {
  boot: 0,
  fishbone: 1,
  bug: 2,
  slow: 3,
  magnet: 4,
  double: 5,
  shield: 6
};

function loadNamedImages(paths) {
  const images = {};
  for (const [name, src] of Object.entries(paths)) {
    const image = new Image();
    image.src = `${src}?v=${ASSET_VERSION}`;
    image.onload = () => draw();
    images[name] = image;
  }
  return images;
}

const goodItems = [
  { name: "bread", points: 20, color: "#e9b766", edge: "#a5672e", h: 22 },
  { name: "lettuce", points: 35, color: "#5dbb52", edge: "#267a3e", h: 18 },
  { name: "cheese", points: 30, color: "#ffd84c", edge: "#d79f20", h: 18 },
  { name: "tomato", points: 40, color: "#e24b41", edge: "#9f272a", h: 18 },
  { name: "patty", points: 45, color: "#76513c", edge: "#3e271e", h: 20 },
  { name: "pickle", points: 50, color: "#7db64c", edge: "#3f7d32", h: 16 }
];

const badItems = [
  { name: "boot", color: "#34343d", edge: "#16161b", h: 36 },
  { name: "fishbone", color: "#dfe8e6", edge: "#64706f", h: 24 },
  { name: "bug", color: "#493323", edge: "#1f1510", h: 24 }
];

const powerItems = [
  { name: "slow", label: "Slow", color: "#65c9ff", edge: "#266b8e", h: 34 },
  { name: "magnet", label: "Magnet", color: "#ff7fb2", edge: "#a72760", h: 34 },
  { name: "double", label: "2x", color: "#ffd84c", edge: "#b47716", h: 34 },
  { name: "shield", label: "Shield", color: "#9ee493", edge: "#2c8a5e", h: 34 }
];

const levels = [
  { name: "Beach Walk", score: 0, speed: 150, minDelay: 0.52, badChance: 0.13, powerChance: 0.085, tint: "#68c8d6" },
  { name: "Boardwalk Rush", score: 5000, speed: 178, minDelay: 0.47, badChance: 0.17, powerChance: 0.08, tint: "#f5c56b" },
  { name: "Sunset Sprint", score: 14000, speed: 208, minDelay: 0.42, badChance: 0.21, powerChance: 0.078, tint: "#ef8f73" },
  { name: "Volcano Run", score: 30000, speed: 240, minDelay: 0.37, badChance: 0.25, powerChance: 0.074, tint: "#ff7a2d" },
  { name: "Moonlit Market", score: 56000, speed: 274, minDelay: 0.34, badChance: 0.29, powerChance: 0.07, tint: "#9aa7ff" },
  { name: "Island Legend", score: 92000, speed: 312, minDelay: 0.32, badChance: 0.32, powerChance: 0.068, tint: "#8de1b2" }
];

const dessertItems = [
  { name: "chocolate cake", points: 180, color: "#6d3f2a", edge: "#3c2117", h: 24, group: "dessert" },
  { name: "vanilla cake", points: 170, color: "#f5d68a", edge: "#bb8847", h: 24, group: "dessert" },
  { name: "strawberry cake", points: 190, color: "#f08b9f", edge: "#b44361", h: 24, group: "dessert" },
  { name: "red velvet cake", points: 320, color: "#9f1f2f", edge: "#5c111a", h: 26, group: "redVelvet" },
  { name: "blueberry frosting", points: 260, color: "#9aa7ff", edge: "#5862b6", h: 18, group: "frosting" },
  { name: "mint frosting", points: 240, color: "#8de1b2", edge: "#3c9b73", h: 18, group: "frosting" },
  { name: "cherry frosting", points: 280, color: "#ff5d6c", edge: "#b82238", h: 18, group: "frosting" }
];

let audioCtx;
let audioUnavailable = false;
let muted = false;
let state = makeState();
let lastTime = 0;
let frameNow = 0;
let animationId = 0;
let pointerTarget = null;
let lastBeepTime = -1;
let highScore = loadHighScore();
let volcanoEditMode = false;
let volcanoDrag = null;
let volcanoPlacement = loadVolcanoPlacement();

window.addEventListener("error", (event) => {
  state.running = false;
  state.paused = false;
  overlayText.textContent = `Game error: ${event.message}`;
  startButton.textContent = "Restart";
  overlay.classList.remove("hidden");
});

function makeState() {
  return {
    running: false,
    paused: false,
    over: false,
    score: 0,
    sandwichScore: 0,
    combo: 0,
    comboTimer: 0,
    scorePops: [],
    landBursts: [],
    plateBounce: 0,
    catchTilt: 0,
    stackSway: 0,
    touchActive: false,
    touchX: W / 2,
    touchHintTimer: 5,
    touchRipple: 0,
    goal: makeGoal(0),
    goalsDone: 0,
    levelIndex: 0,
    levelToastTimer: 0,
    lastPowerText: "",
    lives: 3,
    stack: [],
    drops: [],
    spawnTimer: 0,
    difficultyTimer: 0,
    mode: "sandwich",
    modeTimer: 0,
    modeDuration: 0,
    nextDessertScore: 10000,
    dessertRounds: 0,
    dessertScore: 0,
    pendingDessert: false,
    tripleFlash: 0,
    screenShake: 0,
    effects: {
      slow: 0,
      magnet: 0,
      double: 0,
      shield: 0
    },
    speed: 150,
    player: {
      x: W / 2,
      y: getPlayerY(),
      w: getPlayerWidth(),
      h: 30,
      vx: 0,
      facing: 1
    },
    messageTimer: 0,
    message: ""
  };
}

function startGame() {
  state = makeState();
  state.running = true;
  state.paused = false;
  overlay.classList.add("hidden");
  updateHud();
  lastTime = performance.now();
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(loop);
  beep(330, 0.06, "triangle", 0.04);
}

function endGame() {
  state.running = false;
  state.paused = false;
  state.over = true;
  saveHighScore();
  overlayText.textContent = `Final score: ${state.score}. Tallest stack: ${state.stack.length}.`;
  startButton.textContent = "Play again";
  overlay.classList.remove("hidden");
  beep(120, 0.18, "sawtooth", 0.03);
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  frameNow = now;
  if (!state.paused) {
    update(dt);
    draw();
  }
  if (state.running) animationId = requestAnimationFrame(loop);
}

function update(dt) {
  if (state.pendingDessert && state.lives > 0 && !state.over) {
    state.pendingDessert = false;
    triggerDessertRound();
    return;
  }

  const player = state.player;
  const move = (keys.has("ArrowRight") || keys.has("d") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("a") ? 1 : 0);
  const targetSpeed = move * 520;

  if (pointerTarget !== null) {
    const delta = pointerTarget - player.x;
    player.vx = clamp(delta * 8, -620, 620);
    if (Math.abs(delta) < 5) player.vx = 0;
    else player.facing = delta > 0 ? 1 : -1;
  } else {
    player.vx += (targetSpeed - player.vx) * Math.min(1, dt * 12);
    if (move !== 0) player.facing = move > 0 ? 1 : -1;
  }

  player.x = clamp(player.x + player.vx * dt, getPlayerMinX(), getPlayerMaxX());

  state.spawnTimer -= dt;
  state.difficultyTimer += dt;
  state.messageTimer = Math.max(0, state.messageTimer - dt);
  state.levelToastTimer = Math.max(0, state.levelToastTimer - dt);
  state.tripleFlash = Math.max(0, state.tripleFlash - dt);
  state.screenShake = Math.max(0, state.screenShake - dt);
  state.comboTimer = Math.max(0, state.comboTimer - dt);
  if (state.comboTimer <= 0) state.combo = 0;
  updateEffects(dt);
  updateLevelProgress();
  updateScorePops(dt);
  updateLandBursts(dt);
  state.plateBounce = Math.max(0, state.plateBounce - dt);
  state.catchTilt *= Math.pow(0.015, dt);
  state.stackSway *= Math.pow(0.035, dt);
  state.touchHintTimer = Math.max(0, state.touchHintTimer - dt);
  state.touchRipple = Math.max(0, state.touchRipple - dt);

  if (state.difficultyTimer > 8) {
    state.difficultyTimer = 0;
    state.speed += 10;
  }

  if (state.spawnTimer <= 0) {
    spawnDrop();
    state.spawnTimer = getSpawnDelay();
  }

  for (const drop of state.drops) {
    drop.y += drop.vy * dt;
    drop.angle += drop.spin * dt;
  }

  for (let i = state.drops.length - 1; i >= 0; i--) {
    const drop = state.drops[i];
    if (!drop) continue;
    if (hitCatcher(drop)) {
      collect(drop);
      if (state.drops[i] === drop) state.drops.splice(i, 1);
      if (state.over) break;
    } else if (drop.y - drop.h > H) {
      state.drops.splice(i, 1);
    }
  }

  if (state.mode === "dessert") {
    state.modeTimer -= dt;
    if (state.modeTimer <= 0) finishDessertRound();
  }
}

function spawnDrop() {
  const dessertMode = state.mode === "dessert";
  const level = getLevelSettings();
  const isBad = !dessertMode && Math.random() < level.badChance;
  const isPower = !dessertMode && !isBad && Math.random() < level.powerChance;
  const template = isPower ? randomFrom(powerItems) : (dessertMode ? randomFrom(dessertItems) : randomFrom(isBad ? badItems : goodItems));
  const width = isBad ? randomBetween(46, 70) : (isPower ? POWER_HITBOX_SIZE : randomBetween(62, 94));
  const speed = getEffectiveDropSpeed();

  if (state.drops.length >= getMaxDrops()) state.drops.shift();

  state.drops.push({
    ...template,
    kind: isBad ? "bad" : (isPower ? "power" : (dessertMode ? "dessert" : "good")),
    x: randomBetween(width / 2 + 16, W - width / 2 - 16),
    y: -50,
    w: width,
    h: template.h * (isBad || isPower ? 1 : FOOD_SCALE),
    vy: ((dessertMode ? speed + 78 : speed) + randomBetween(10, 95)) * getDropSpeedMultiplier() * getMobileFallMultiplier(),
    angle: randomBetween(-0.2, 0.2),
    spin: isPower ? randomBetween(-0.38, 0.38) : randomBetween(-0.8, 0.8),
    pulseSeed: Math.random() * Math.PI * 2
  });
}

function hitCatcher(drop) {
  const stackCenterX = state.player.x + getPlateStackOffset();
  if (state.effects.magnet > 0 && drop.kind !== "bad") {
    const pullZone = Math.abs(drop.x - stackCenterX) < 185 && drop.y > 120;
    if (pullZone) drop.x += (stackCenterX - drop.x) * 0.08;
  }
  const stackTop = state.player.y - Math.min(state.stack.length * STACK_STEP, 136);
  const catchY = stackTop + 8;
  const horizontal = Math.abs(drop.x - stackCenterX) < (state.player.w + drop.w) * 0.43;
  const vertical = drop.y + drop.h / 2 > catchY - 10 && drop.y - drop.h / 2 < catchY + 18;
  return horizontal && vertical;
}

function getPlateStackOffset() {
  return (state.player.facing || 1) * PLATE_STACK_OFFSET;
}

function getPlayerWidth() {
  return phoneLayout ? 142 : 150;
}

function getPlayerY() {
  return H - (phoneLayout ? 154 : 148);
}

function getPlayerMinX(player = state.player) {
  return player.w / 2 + (phoneLayout ? 18 : 12);
}

function getPlayerMaxX(player = state.player) {
  return W - player.w / 2 - (phoneLayout ? 18 : 12);
}

function getMaxDrops() {
  return phoneLayout ? 14 : MAX_DROPS;
}

function getMobileFallMultiplier() {
  return phoneLayout ? 1.18 : 1;
}

function getBoardwalkY() {
  return H - (phoneLayout ? 250 : 126);
}

function collect(drop) {
  if (drop.kind === "bad") {
    if (state.effects.shield > 0) {
      state.effects.shield = 0;
      state.combo = 0;
      state.message = "Shield saved!";
      state.messageTimer = 1;
      addScorePop("Saved", drop.x, drop.y, "#fff8e8");
      beep(520, 0.08, "triangle", 0.035, true);
      updateHud();
      return;
    }
    state.lives -= 1;
    state.stack = state.stack.slice(0, Math.max(0, state.stack.length - 5));
    state.combo = 0;
    state.message = "Yuck!";
    state.messageTimer = 0.8;
    beep(92, 0.12, "square", 0.04);
    if (state.lives <= 0) endGame();
  } else if (drop.kind === "power") {
    activatePower(drop.name);
    advanceGoal("power", 1);
  } else {
    const stackCenterX = state.player.x + getPlateStackOffset();
    const landingOffset = clamp((drop.x - stackCenterX) / Math.max(54, state.player.w * 0.48), -1, 1);
    const layerOffset = landingOffset * clamp(drop.w * 0.22, 7, 17);
    const cleanCatch = Math.abs(landingOffset) < 0.2;
    state.combo += 1;
    state.comboTimer = 3.2;
    state.plateBounce = 0.22;
    state.catchTilt = landingOffset * 0.07;
    state.stackSway = landingOffset * 10;
    advanceGoal("catch", 1);
    if (state.combo >= 8) advanceGoal("combo", 1);
    if (state.mode === "dessert") advanceGoal("dessert", 1);
    state.stack.push({
      ...drop,
      w: clamp(drop.w, 58, 96),
      h: drop.h,
      squash: 0.24,
      settle: 0.24,
      stackOffset: layerOffset,
      tilt: landingOffset * 0.06
    });
    addLandBurst(stackCenterX + layerOffset, state.player.y - Math.min(state.stack.length * STACK_STEP, 136) + 6, cleanCatch || state.mode === "dessert" || state.combo >= 5);
    if (cleanCatch && state.combo >= 3) addScorePop("Clean", stackCenterX, drop.y - 16, "#9ee493");
    if (state.stack.length > 24) {
      state.score += 300;
      if (state.mode === "sandwich") state.sandwichScore += 300;
      state.stack = state.stack.slice(-14);
      state.message = state.mode === "dessert" ? "Layer bonus!" : "Mega stack!";
      state.messageTimer = 1;
      beep(660, 0.09, "triangle", 0.04);
    } else {
      beep(440 + Math.min(state.stack.length, 16) * 18, 0.04, "sine", 0.025);
    }
    const comboBonus = 1 + Math.min(state.combo - 1, 20) * 0.08;
    const modeBonus = state.mode === "dessert" ? 3 : 1;
    const powerBonus = state.effects.double > 0 ? 2 : 1;
    const earned = Math.round((drop.points + state.stack.length * 3) * modeBonus * powerBonus * comboBonus);
    state.score += earned;
    addScorePop(`+${earned}`, drop.x, drop.y, state.combo >= 5 ? "#ffd84c" : "#fff8e8");
    if (state.mode === "dessert") {
      state.dessertScore += earned;
    } else {
      state.sandwichScore += earned;
    }
  }
  updateHud();
  if (state.mode === "sandwich" && state.sandwichScore >= state.nextDessertScore && state.lives > 0) {
    state.pendingDessert = true;
    state.spawnTimer = 0.2;
  }
}

function getSpawnDelay() {
  if (state.mode === "dessert") return 0.28;
  const level = getLevelSettings();
  const speedPressure = clamp((getEffectiveDropSpeed() - 150) / 620, 0, 0.2);
  return Math.max(level.minDelay, 0.82 - state.score / 90000 - speedPressure);
}

function getDropSpeedMultiplier() {
  return state.effects.slow > 0 ? 0.58 : 1;
}

function getLevelIndex(score) {
  let index = 0;
  for (let i = 0; i < levels.length; i++) {
    if (score >= levels[i].score) index = i;
  }
  return index;
}

function getLevelSettings() {
  return levels[Math.min(state.levelIndex, levels.length - 1)];
}

function getEffectiveDropSpeed() {
  return Math.max(state.speed, getLevelSettings().speed);
}

function updateLevelProgress() {
  const nextLevel = getLevelIndex(state.score);
  if (nextLevel <= state.levelIndex) return;
  state.levelIndex = nextLevel;
  state.levelToastTimer = 2.2;
  state.screenShake = Math.max(state.screenShake, 0.16);
  addScorePop(levels[nextLevel].name, W / 2, 88, levels[nextLevel].tint);
  beep(520 + nextLevel * 55, 0.08, "triangle", 0.035, true);
}

function activatePower(name) {
  const durations = {
    slow: 8,
    magnet: 9,
    double: 8,
    shield: 18
  };
  state.effects[name] = durations[name] || 6;
  state.message = powerItems.find((item) => item.name === name)?.label || "Power";
  state.messageTimer = 1;
  addScorePop(state.message, state.player.x, state.player.y - 120, "#ffd84c");
  beep(760, 0.08, "triangle", 0.04, true);
  updateHud();
}

function updateEffects(dt) {
  for (const key of Object.keys(state.effects)) {
    state.effects[key] = Math.max(0, state.effects[key] - dt);
  }
  const powerText = getPowerStatusText();
  if (powerText !== state.lastPowerText) {
    state.lastPowerText = powerText;
    updateHud();
  }
}

function addScorePop(text, x, y, color) {
  state.scorePops.push({ text, x, y, color, life: 0.9 });
  if (state.scorePops.length > 12) state.scorePops.shift();
}

function updateScorePops(dt) {
  for (const pop of state.scorePops) {
    pop.y -= 46 * dt;
    pop.life -= dt;
  }
  state.scorePops = state.scorePops.filter((pop) => pop.life > 0);
}

function addLandBurst(x, y, sparkly) {
  const count = sparkly ? 9 : 4;
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + randomBetween(-1.15, 1.15);
    const speed = randomBetween(34, sparkly ? 110 : 72);
    state.landBursts.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randomBetween(0.28, sparkly ? 0.58 : 0.42),
      color: sparkly && i % 2 === 0 ? "#ffd84c" : "#fff8e8",
      size: sparkly ? randomBetween(2, 4.5) : randomBetween(1.5, 3),
      spin: randomBetween(-0.8, 0.8)
    });
  }
  if (state.landBursts.length > 48) state.landBursts.splice(0, state.landBursts.length - 48);
}

function updateLandBursts(dt) {
  for (const burst of state.landBursts) {
    burst.x += burst.vx * dt;
    burst.y += burst.vy * dt;
    burst.vy += 180 * dt;
    burst.spin += dt * 4;
    burst.life -= dt;
  }
  state.landBursts = state.landBursts.filter((burst) => burst.life > 0);
  for (const item of state.stack) {
    if (item.squash) item.squash = Math.max(0, item.squash - dt);
    if (item.settle) item.settle = Math.max(0, item.settle - dt);
  }
}

function triggerDessertRound() {
  state.dessertRounds += 1;
  state.nextDessertScore += getNextDessertGap();
  state.mode = "dessert";
  state.modeDuration = DESSERT_BASE_DURATION + Math.min(6, (state.dessertRounds - 1) * 1.5);
  state.modeTimer = state.modeDuration;
  state.dessertScore = 0;
  state.spawnTimer = 0;
  state.stack = [];
  state.drops = [];
  state.tripleFlash = 1.35;
  state.screenShake = 0.62;
  state.message = "";
  state.messageTimer = 0;
  updateHud();
  beep(659, 0.1, "triangle", 0.035, true);
}

function getNextDessertGap() {
  return Math.round(10000 * Math.pow(1.65, state.dessertRounds));
}

function finishDessertRound() {
  if (state.mode !== "dessert") return;
  state.mode = "sandwich";
  state.modeTimer = 0;
  state.modeDuration = 0;
  state.tripleFlash = 0;
  state.stack = [];
  state.drops = [];
  state.spawnTimer = 0.4;
  state.message = `Sugar rush +${state.dessertScore}`;
  state.messageTimer = 1.5;
  updateHud();
  beep(720, 0.08, "triangle", 0.035);
}

function updateHud() {
  scoreEl.textContent = state.score;
  stackEl.textContent = state.stack.length;
  livesEl.textContent = state.lives;
  comboEl.textContent = `${state.combo}x`;
  highScoreEl.textContent = Math.max(highScore, state.score);
  state.lastPowerText = getPowerStatusText();
  powerStatusEl.textContent = state.lastPowerText;
  pauseButton.textContent = state.paused ? "GO" : "II";
  pauseButton.setAttribute("aria-label", state.paused ? "Resume game" : "Pause game");
  pauseButton.setAttribute("title", state.paused ? "Resume game" : "Pause game");
  soundToggle.textContent = muted ? "OFF" : "SFX";
  soundToggle.setAttribute("aria-label", muted ? "Turn sound on" : "Turn sound off");
}

function makeGoal(index) {
  const goals = [
    { type: "catch", text: "Catch 12 good items", target: 12 },
    { type: "combo", text: "Reach an 8 combo", target: 1 },
    { type: "power", text: "Grab a power-up", target: 1 },
    { type: "dessert", text: "Catch 5 desserts", target: 5 }
  ];
  return { ...goals[index % goals.length], progress: 0 };
}

function advanceGoal(type, amount) {
  if (!state.goal || state.goal.type !== type) return;
  state.goal.progress += amount;
  if (state.goal.progress < state.goal.target) return;
  const reward = 750 + state.goalsDone * 250;
  state.score += reward;
  if (state.mode === "sandwich") state.sandwichScore += reward;
  state.goalsDone += 1;
  state.goal = makeGoal(state.goalsDone);
  state.message = `Goal +${reward}`;
  state.messageTimer = 1.2;
  addScorePop(`Goal +${reward}`, W / 2, 96, "#ffd84c");
  updateHud();
}

function getPowerStatusText() {
  const active = Object.entries(state.effects)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${key.charAt(0).toUpperCase()}${Math.ceil(value)}`);
  return active.length ? active.join(" ") : "None";
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  const shake = getScreenShake();
  ctx.save();
  ctx.translate(shake.x, shake.y);
  drawScene();
  drawDrops();
  drawPlayer();
  drawLandBursts();
  drawScorePops();
  ctx.restore();
  if (state.mode === "dessert") drawSugarRushWash();
  if (state.mode === "dessert") drawDessertTimer();
  drawGoal();
  drawLevelBadge();
  if (phoneLayout) drawMobileControls();
  if (phoneLayout) drawMobileStatusBadges();
  if (DEBUG_MODE && volcanoEditMode) drawVolcanoEditGuide();
  if (state.tripleFlash > 0) drawTripleToast();
  if (state.levelToastTimer > 0) drawLevelToast();
  if (state.messageTimer > 0) drawMessage(state.message);
  if (state.paused) drawPauseScreen();
}

function getScreenShake() {
  if (state.screenShake <= 0) return { x: 0, y: 0 };
  const strength = state.screenShake * 18;
  return {
    x: Math.sin(frameNow / 28) * strength,
    y: Math.cos(frameNow / 34) * strength * 0.55
  };
}

function drawScene() {
  if (backgroundImage.complete && backgroundImage.naturalWidth) {
    drawCoverImage(backgroundImage, 0, 0, W, H);
    drawBackgroundMoodWash();
    drawOceanShimmer();
    drawBackgroundVolcanoEffects(state.mode === "dessert");
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    if (state.mode === "dessert") {
      gradient.addColorStop(0, "#ffc2d2");
      gradient.addColorStop(0.42, "#b994d8");
      gradient.addColorStop(0.68, "#f7b76d");
      gradient.addColorStop(1, "#8f5a4b");
    } else if (state.score > 45000) {
      gradient.addColorStop(0, "#5b77aa");
      gradient.addColorStop(0.44, "#7f9fd6");
      gradient.addColorStop(0.68, "#efac62");
      gradient.addColorStop(1, "#685842");
    } else if (state.score > 22000) {
      gradient.addColorStop(0, "#92d9a8");
      gradient.addColorStop(0.44, "#5aa891");
      gradient.addColorStop(0.68, "#f2d36b");
      gradient.addColorStop(1, "#bc7d4d");
    } else {
      gradient.addColorStop(0, "#68c8d6");
      gradient.addColorStop(0.4, "#8ee0e4");
      gradient.addColorStop(0.68, "#f5c56b");
      gradient.addColorStop(1, "#d98c59");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }

  const hasBackgroundArt = backgroundImage.complete && backgroundImage.naturalWidth;

  if (!hasBackgroundArt) {
    drawAbstractSun(W * (phoneLayout ? 0.78 : 0.79), phoneLayout ? 96 : 112, phoneLayout ? 44 : 58);

    ctx.fillStyle = "rgba(255, 255, 255, 0.62)";
    puff(W * 0.15, phoneLayout ? 118 : 92, phoneLayout ? 42 : 58);
    puff(W * 0.73, phoneLayout ? 70 : 70, phoneLayout ? 36 : 44);
    puff(W * 0.9, phoneLayout ? 156 : 144, phoneLayout ? 46 : 62);
  }

  if (!hasBackgroundArt) {
    drawVolcano(
      W * (phoneLayout ? 0.53 : 0.44),
      phoneLayout ? H * 0.18 : 212,
      phoneLayout ? W * 1.24 : 560,
      phoneLayout ? H * 0.38 : 328,
      state.mode === "dessert"
    );
    drawIslandBand(0, phoneLayout ? H * 0.56 : 338, "#226a68", 0.95);
    drawIslandBand(W * 0.11, phoneLayout ? H * 0.63 : 388, "#2f875f", 0.98);

    drawPalmLeaf(phoneLayout ? -28 : -12, phoneLayout ? 132 : 94, phoneLayout ? 92 : 112, -0.68, "#1f7a55");
    drawPalmLeaf(phoneLayout ? 28 : 64, phoneLayout ? 84 : 58, phoneLayout ? 78 : 96, -0.42, "#2c9a63");
    drawPalmLeaf(W + (phoneLayout ? 22 : 4), phoneLayout ? 146 : 114, phoneLayout ? 98 : 126, 3.82, "#1f7a55");
    drawPalmLeaf(W - (phoneLayout ? 40 : 70), phoneLayout ? 84 : 64, phoneLayout ? 82 : 98, 3.52, "#2c9a63");

    drawBoardwalk(getBoardwalkY());
  }
}

function drawCoverImage(image, x, y, w, h) {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (image.naturalWidth - sw) / 2;
  const sy = (image.naturalHeight - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}

function drawBackgroundMoodWash() {
  const level = getLevelSettings();
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = hexToRgba(level.tint, state.mode === "dessert" ? 0.26 : 0.12);
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "multiply";
  const vignette = ctx.createRadialGradient(W * 0.5, H * 0.42, H * 0.24, W * 0.5, H * 0.46, H * 0.82);
  vignette.addColorStop(0, "rgba(255,255,255,0)");
  vignette.addColorStop(1, "rgba(45,28,19,0.18)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawOceanShimmer() {
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#fff8e8";
  ctx.lineWidth = phoneLayout ? 2 : 3;
  for (let i = 0; i < 5; i++) {
    const y = (phoneLayout ? H * 0.44 : 286) + i * 17;
    ctx.beginPath();
    for (let x = -30; x <= W + 30; x += 26) {
      const yy = y + Math.sin(x / 42 + frameNow / 720 + i * 0.8) * 3.5;
      if (x === -30) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawBackgroundVolcanoEffects(erupting) {
  const vent = getBackgroundVolcanoVent();
  if (erupting) {
    drawVolcanoAnimationStrip(volcanoAnimationImages.eruption, vent.x, vent.y, vent.eruptionW, vent.eruptionH, VOLCANO_ERUPTION_FRAMES, 7.2, 1, vent.eruptionCropBottom, vent.fadeBottom * 0.65, vent.fadeTop * 0.5);
  } else {
    drawVolcanoAnimationStrip(volcanoAnimationImages.smoke, vent.x, vent.y, vent.smokeW, vent.smokeH, VOLCANO_SMOKE_FRAMES, 5.5, 0.9, vent.smokeCropBottom, vent.fadeBottom, vent.fadeTop);
  }
}

function getBackgroundVolcanoVent() {
  const base = phoneLayout
    ? { x: W * 0.39, y: H * 0.245, smokeW: 118, smokeH: 270, eruptionW: 188, eruptionH: 316, smokeCropBottom: 0, eruptionCropBottom: 0, fadeBottom: 54, fadeTop: 42 }
    : { x: W * 0.315, y: H * 0.315, smokeW: 134, smokeH: 300, eruptionW: 216, eruptionH: 348, smokeCropBottom: 0, eruptionCropBottom: 0, fadeBottom: 60, fadeTop: 46 };
  const layoutPlacement = volcanoPlacement[phoneLayout ? "phone" : "wide"];
  if (!layoutPlacement) return base;
  const scale = clamp(layoutPlacement.scale || 1, 0.45, 2.4);
  return {
    ...base,
    x: Number.isFinite(layoutPlacement.x) ? layoutPlacement.x : base.x,
    y: Number.isFinite(layoutPlacement.y) ? layoutPlacement.y : base.y,
    smokeW: base.smokeW * scale,
    smokeH: base.smokeH * scale,
    eruptionW: base.eruptionW * scale,
    eruptionH: base.eruptionH * scale,
    fadeBottom: base.fadeBottom * scale,
    fadeTop: base.fadeTop * scale
  };
}

function drawVolcanoAnimationStrip(image, anchorX, anchorY, w, h, frameCount, fps, alpha = 1, cropBottom = 0, fadeBottom = 0, fadeTop = 0) {
  if (!image?.complete || !image.naturalWidth) return;
  const frameW = image.naturalWidth / frameCount;
  const frameH = image.naturalHeight - cropBottom;
  const frame = Math.floor(frameNow / (1000 / fps)) % frameCount;
  const bounds = getVolcanoFrameBounds(image, frameCount, cropBottom)[frame];
  const scale = h / frameH;
  const centeredCellX = anchorX - w / 2;
  const centeredCellY = anchorY - h;
  const visibleCenterX = (bounds.left + bounds.right) / 2;
  const visibleBottomY = bounds.bottom;
  const pinX = anchorX - visibleCenterX * scale;
  const pinY = anchorY - visibleBottomY * scale;
  const drawX = Number.isFinite(pinX) ? pinX : centeredCellX;
  const drawY = Number.isFinite(pinY) ? pinY : centeredCellY;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (fadeBottom > 0 || fadeTop > 0) {
    const temp = getTempCanvas(Math.ceil(w), Math.ceil(h));
    const tempCtx = temp.getContext("2d");
    tempCtx.clearRect(0, 0, temp.width, temp.height);
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = "high";
    tempCtx.drawImage(image, frame * frameW, 0, frameW, frameH, 0, 0, w, h);
    tempCtx.globalCompositeOperation = "destination-in";
    const mask = tempCtx.createLinearGradient(0, 0, 0, h);
    const topStop = clamp(fadeTop / h, 0, 0.48);
    const bottomStop = clamp(1 - fadeBottom / h, 0.52, 1);
    mask.addColorStop(0, fadeTop > 0 ? "rgba(0,0,0,0)" : "rgba(0,0,0,1)");
    if (fadeTop > 0) mask.addColorStop(topStop, "rgba(0,0,0,1)");
    mask.addColorStop(Math.min(topStop + 0.001, bottomStop), "rgba(0,0,0,1)");
    if (fadeBottom > 0) mask.addColorStop(bottomStop, "rgba(0,0,0,1)");
    mask.addColorStop(1, fadeBottom > 0 ? "rgba(0,0,0,0)" : "rgba(0,0,0,1)");
    tempCtx.fillStyle = mask;
    tempCtx.fillRect(0, 0, w, h);
    tempCtx.globalCompositeOperation = "source-over";
    ctx.drawImage(temp, drawX, drawY, w, h);
  } else {
    ctx.drawImage(image, frame * frameW, 0, frameW, frameH, drawX, drawY, w, h);
  }
  ctx.restore();
}

function getTempCanvas(w, h) {
  if (!getTempCanvas.canvas) getTempCanvas.canvas = document.createElement("canvas");
  const temp = getTempCanvas.canvas;
  if (temp.width !== w) temp.width = w;
  if (temp.height !== h) temp.height = h;
  return temp;
}

function getVolcanoFrameBounds(image, frameCount, cropBottom = 0) {
  const frameW = image.naturalWidth / frameCount;
  const frameH = image.naturalHeight - cropBottom;
  if (cropBottom === 0 && frameCount === VOLCANO_SMOKE_FRAMES && image === volcanoAnimationImages.smoke) {
    return VOLCANO_SMOKE_FRAME_BOUNDS;
  }
  if (cropBottom === 0 && frameCount === VOLCANO_ERUPTION_FRAMES && image === volcanoAnimationImages.eruption) {
    return VOLCANO_ERUPTION_FRAME_BOUNDS;
  }
  return Array.from({ length: frameCount }, () => ({
    left: frameW * 0.5,
    right: frameW * 0.5,
    top: 0,
    bottom: frameH
  }));
}

function drawGoal() {
  if (!state.running || state.over || !state.goal) return;
  const progress = `${Math.min(state.goal.progress, state.goal.target)}/${state.goal.target}`;
  const x = phoneLayout ? 14 : 18;
  const y = phoneLayout ? 68 : 18;
  const w = phoneLayout ? (state.mode === "dessert" ? W - 184 : W - 28) : 292;
  const h = phoneLayout ? 42 : 50;
  ctx.save();
  ctx.fillStyle = "rgba(255, 248, 232, 0.9)";
  ctx.strokeStyle = "#201713";
  ctx.lineWidth = 3;
  roundedRect(x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#201713";
  ctx.font = phoneLayout ? "900 14px Trebuchet MS, Arial" : "900 16px Trebuchet MS, Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(state.goal.text, x + 16, y + h / 2 - (phoneLayout ? 1 : 6));
  ctx.textAlign = "right";
  ctx.fillText(progress, x + w - 18, y + h / 2 - (phoneLayout ? 1 : 6));
  ctx.restore();
}

function drawLevelBadge() {
  if (!state.running || state.over) return;
  const level = getLevelSettings();
  const next = levels[state.levelIndex + 1];
  const progress = next ? clamp((state.score - level.score) / (next.score - level.score), 0, 1) : 1;
  const w = phoneLayout ? W - 28 : 288;
  const h = phoneLayout ? 42 : 50;
  const x = W / 2 - w / 2;
  const y = phoneLayout ? 14 : 18;

  ctx.save();
  ctx.fillStyle = "rgba(255, 248, 232, 0.9)";
  ctx.strokeStyle = "#201713";
  ctx.lineWidth = 3;
  roundedRect(x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#201713";
  ctx.font = phoneLayout ? "900 13px Trebuchet MS, Arial" : "900 14px Trebuchet MS, Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`Level ${state.levelIndex + 1}`, x + 16, y + (phoneLayout ? 15 : 18));
  ctx.textAlign = "right";
  ctx.fillText(level.name, x + w - 16, y + (phoneLayout ? 15 : 18));

  ctx.fillStyle = "rgba(32, 23, 19, 0.18)";
  roundedRect(x + 16, y + h - 16, w - 32, 8, 4);
  ctx.fill();
  ctx.fillStyle = level.tint;
  roundedRect(x + 16, y + h - 16, (w - 32) * progress, 8, 4);
  ctx.fill();
  ctx.restore();
}

function drawLevelToast() {
  const level = getLevelSettings();
  const alpha = clamp(state.levelToastTimer / 2.2, 0, 1);
  const lift = (1 - alpha) * 18;

  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha * 1.4);
  ctx.fillStyle = "rgba(255, 248, 232, 0.94)";
  ctx.strokeStyle = "#201713";
  ctx.lineWidth = 4;
  roundedRect(W / 2 - 168, 82 - lift, 336, 76, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = level.tint;
  roundedRect(W / 2 - 156, 92 - lift, 312, 8, 4);
  ctx.fill();

  ctx.fillStyle = "#201713";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 18px Trebuchet MS, Arial";
  ctx.fillText(`Level ${state.levelIndex + 1}`, W / 2, 116 - lift);
  ctx.font = "900 30px Trebuchet MS, Arial";
  ctx.fillText(level.name, W / 2, 140 - lift);
  ctx.restore();
}

function drawMobileControls() {
  if (!state.running || state.over || state.paused) return;
  const hintAlpha = 0.08 + clamp(state.touchHintTimer / 5, 0, 1) * 0.14;
  const activeAlpha = state.touchActive ? 0.2 : 0;
  const padAlpha = Math.max(hintAlpha, activeAlpha);
  const padY = H - 126;
  const padW = 112;
  const padH = 86;

  ctx.save();
  drawTouchPad(16, padY, padW, padH, -1, padAlpha);
  drawTouchPad(W - padW - 16, padY, padW, padH, 1, padAlpha);

  if (state.touchActive || state.touchRipple > 0) {
    const x = clamp(state.touchX, getPlayerMinX(), getPlayerMaxX());
    const pulse = clamp(state.touchRipple / 0.45, 0, 1);
    const ring = 16 + (1 - pulse) * 20;
    ctx.globalAlpha = state.touchActive ? 0.42 : pulse * 0.32;
    ctx.strokeStyle = "#fff8e8";
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 9]);
    ctx.beginPath();
    ctx.moveTo(x, H - 152);
    ctx.lineTo(x, H - 48);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = state.touchActive ? 0.55 : pulse * 0.45;
    ctx.beginPath();
    ctx.arc(x, H - 84, ring, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 248, 232, 0.35)";
    ctx.beginPath();
    ctx.arc(x, H - 84, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawMobileStatusBadges() {
  if (!state.running || state.over) return;
  const badges = [];
  const powerText = getPowerStatusText();
  if (state.combo > 1) badges.push({ label: `${state.combo}x combo`, color: "#ffd84c" });
  if (powerText !== "None") badges.push({ label: powerText, color: "#9ee493" });
  if (!badges.length) return;

  ctx.save();
  ctx.font = "900 16px Trebuchet MS, Arial";
  ctx.textBaseline = "middle";
  const gap = 8;
  const widths = badges.map((badge) => Math.min(168, ctx.measureText(badge.label).width + 28));
  const totalW = widths.reduce((sum, width) => sum + width, 0) + gap * (badges.length - 1);
  let x = Math.max(14, W / 2 - totalW / 2);
  const y = state.mode === "dessert" ? 118 : 116;

  for (let i = 0; i < badges.length; i++) {
    const badge = badges[i];
    const w = widths[i];
    const h = 30;
    ctx.fillStyle = "rgba(255, 248, 232, 0.92)";
    ctx.strokeStyle = "#201713";
    ctx.lineWidth = 3;
    roundedRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = badge.color;
    roundedRect(x + 7, y + 7, 9, 16, 4);
    ctx.fill();
    ctx.fillStyle = "#201713";
    ctx.textAlign = "left";
    ctx.fillText(badge.label, x + 22, y + h / 2);
    x += w + gap;
  }
  ctx.restore();
}

function drawTouchPad(x, y, w, h, direction, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(255, 248, 232, 0.72)";
  ctx.strokeStyle = "rgba(32, 23, 19, 0.7)";
  ctx.lineWidth = 3;
  roundedRect(x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();
  drawChevronIcon(x + w / 2, y + h / 2, direction, 24);
  ctx.restore();
}

function drawChevronIcon(x, y, direction, size) {
  ctx.strokeStyle = "#201713";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x + direction * size * 0.35, y - size * 0.55);
  ctx.lineTo(x - direction * size * 0.35, y);
  ctx.lineTo(x + direction * size * 0.35, y + size * 0.55);
  ctx.stroke();
}

function drawDrops() {
  for (const drop of state.drops) {
    const seed = drop.pulseSeed || 0;
    const powerBob = drop.kind === "power" ? Math.sin(frameNow / 180 + seed) * 4 : 0;
    ctx.save();
    ctx.translate(drop.x, drop.y + powerBob);
    drawDropMotionTrail(drop, seed);
    if (drop.kind === "power") {
      drawPowerAura(drop);
      ctx.rotate(drop.angle);
      drawPower(drop);
      drawPowerGlints(drop);
    } else {
      ctx.rotate(drop.angle);
      if (drop.kind === "bad") drawBad(drop);
      else drawIngredient(drop, 0, 0, drop.w, drop.h, drop.name);
    }
    ctx.restore();
  }
}

function drawDropMotionTrail(drop, seed) {
  if (drop.kind === "bad" || drop.vy < 220) return;
  const alpha = clamp((drop.vy - 180) / 520, 0, 0.24);
  const glint = effectImages.glint;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.rotate(Math.sin(frameNow / 260 + seed) * 0.08);
  if (glint?.complete && glint.naturalWidth) {
    drawImageParticle(glint, 0, -drop.h * 0.8, drop.w * 0.72, drop.h * 2.3, 0, alpha);
  } else {
    const trail = ctx.createLinearGradient(0, -drop.h * 2, 0, 0);
    trail.addColorStop(0, "rgba(255,248,232,0)");
    trail.addColorStop(1, "rgba(255,248,232,0.75)");
    ctx.fillStyle = trail;
    ctx.beginPath();
    ctx.ellipse(0, -drop.h * 0.9, drop.w * 0.24, drop.h * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPlayer() {
  const p = state.player;
  const bounce = Math.sin((state.plateBounce / 0.22) * Math.PI) * -4;
  const plateY = p.y + 2 + bounce;
  const stackBase = plateY - 28;
  const facing = p.facing || 1;
  const plateX = 0;
  const stackX = getPlateStackOffset();
  const spriteReady = isCurrentPlayerSpriteReady(p.vx);
  const holderTilt = clamp(p.vx / 2600 + state.catchTilt, -0.09, 0.09);

  ctx.save();
  ctx.translate(p.x, 0);
  if (spriteReady) {
    ctx.translate(plateX, plateY);
    ctx.rotate(holderTilt);
    ctx.translate(-plateX, -plateY);
  }
  drawPlayerSprite(plateX, plateY, p.vx, facing);

  for (let i = 0; i < state.stack.length; i++) {
    const item = state.stack[i];
    const layer = state.stack.length <= 1 ? 0 : i / (state.stack.length - 1);
    const wobble = Math.sin(frameNow / 180 + i * 0.8) * Math.min(i * 0.55, 8);
    const sway = state.stackSway * (0.2 + layer * 0.8);
    const settle = item.settle ? Math.sin((item.settle / 0.24) * Math.PI) * -6 : 0;
    const layerTilt = (item.tilt || 0) + state.catchTilt * (0.22 + layer * 0.5);
    drawStackIngredient(
      item,
      stackX + (item.stackOffset || 0) + wobble + sway,
      stackBase - i * STACK_STEP + settle,
      item.w,
      item.h,
      item.name,
      layerTilt
    );
  }
  ctx.restore();
}

function isCurrentPlayerSpriteReady(vx) {
  const walking = Math.abs(vx) > 30;
  const sprite = walking ? playerSprite : playerIdleSprite;
  return sprite.complete && sprite.naturalWidth;
}

function drawPlayerSprite(plateX, plateY, vx, facing) {
  const walking = Math.abs(vx) > 30;
  const sprite = walking ? playerSprite : playerIdleSprite;
  if (!sprite.complete || !sprite.naturalWidth) return;

  const frameW = sprite.naturalWidth / PLAYER_SPRITE_FRAMES;
  const frameH = sprite.naturalHeight;
  const frame = walking ? Math.floor(frameNow / 110) % PLAYER_SPRITE_FRAMES : Math.floor(frameNow / 260) % PLAYER_SPRITE_FRAMES;
  const frameOffset = walking ? WALK_FRAME_OFFSETS[frame] : IDLE_FRAME_OFFSETS[frame];
  const spriteScale = 248 / frameH;
  const spriteH = 248;
  const spriteW = spriteH * (frameW / frameH);
  const plateAnchorX = spriteW * 0.72;
  const plateAnchorY = spriteH * 0.43;
  const idle = Math.sin(frameNow / 520);
  const bob = walking ? Math.sin(frameNow / 110) * 2 : idle * 2;
  const breathe = 1;

  ctx.save();
  ctx.translate(plateX, plateY + bob);
  if (facing < 0) ctx.scale(-1, 1);
  ctx.scale(1, breathe);
  ctx.drawImage(
    sprite,
    frame * frameW,
    0,
    frameW,
    frameH,
    -plateAnchorX + frameOffset.x * spriteScale,
    -plateAnchorY + frameOffset.y * spriteScale,
    spriteW,
    spriteH
  );
  ctx.restore();
}

function drawIngredient(item, x, y, w, h, name) {
  if (drawIngredientSprite(item, x, y, w, h, name)) return;

  if (item.group === "dessert" || item.group === "frosting" || item.group === "redVelvet") {
    drawDessertIngredient(item, x, y, w, h);
    return;
  }

  ctx.fillStyle = item.color;
  ctx.strokeStyle = item.edge;
  ctx.lineWidth = 3;

  if (name === "lettuce") {
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const px = x - w / 2 + (w / 10) * i;
      const py = y + Math.sin(i * 1.7) * 5;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x - w / 2, y + h);
    ctx.closePath();
  } else if (name === "cheese") {
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - h / 2);
    ctx.lineTo(x + w / 2, y - h / 2 + 2);
    ctx.lineTo(x + w / 2 - 12, y + h / 2);
    ctx.lineTo(x - w / 2 + 10, y + h / 2 - 1);
    ctx.closePath();
  } else if (name === "tomato" || name === "pickle") {
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else {
    roundedRect(x - w / 2, y - h / 2, w, h, h / 2);
  }

  ctx.fill();
  ctx.stroke();

  if (name === "bread") {
    ctx.fillStyle = "#fff0bc";
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(x + i * 18, y - 3, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (name === "tomato") {
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x - 18, y, 7, 0, Math.PI * 2);
    ctx.arc(x + 18, y, 7, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawIngredientSprite(item, x, y, w, h, name) {
  const image = itemImages[name];
  if (image?.complete && image.naturalWidth) {
    const spriteW = w * 1.2;
    const spriteH = Math.max(h * 2.15, 30);
    drawCenteredImage(image, x, y, spriteW, spriteH);
    return true;
  }

  const index = INGREDIENT_SPRITES[name];
  if (index === undefined || !ingredientSprite.complete || !ingredientSprite.naturalWidth) return false;

  const spriteW = w * 1.16;
  const spriteH = Math.max(h * 2.05, 28);
  ctx.drawImage(
    ingredientSprite,
    index * INGREDIENT_CELL_W,
    0,
    INGREDIENT_CELL_W,
    INGREDIENT_CELL_H,
    x - spriteW / 2,
    y - spriteH / 2,
    spriteW,
    spriteH
  );
  return true;
}

function drawCenteredImage(image, x, y, w, h, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, x - w / 2, y - h / 2, w, h);
  ctx.restore();
}

function drawImageParticle(image, x, y, w, h, rotation = 0, alpha = 1) {
  if (!image?.complete || !image.naturalWidth) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawStackIngredient(item, x, y, w, h, name, tilt = 0) {
  const squash = item.squash ? Math.sin((item.squash / 0.24) * Math.PI) : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(1 + squash * 0.12, 1 - squash * 0.18);
  drawIngredient(item, 0, 0, w, h, name);
  ctx.restore();
}

function drawDessertIngredient(item, x, y, w, h) {
  ctx.fillStyle = item.color;
  ctx.strokeStyle = item.edge;
  ctx.lineWidth = 3;

  if (item.group === "frosting") {
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const px = x - w / 2 + (w / 12) * i;
      const py = y + Math.sin(i * 1.25) * 5;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineTo(x + w / 2, y + h / 2);
    ctx.lineTo(x - w / 2, y + h / 2);
    ctx.closePath();
  } else {
    roundedRect(x - w / 2, y - h / 2, w, h, 8);
  }

  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  if (item.group === "frosting") {
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(x + i * 18, y - 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (item.group === "redVelvet") {
    ctx.fillStyle = "#fff4dc";
    roundedRect(x - w / 2 + 6, y - 5, w - 12, 8, 5);
    ctx.fill();
    roundedRect(x - w / 2 + 12, y + 6, w - 24, 5, 4);
    ctx.fill();
  } else {
    ctx.fillRect(x - w / 2 + 8, y - 2, w - 16, 5);
  }
}

function drawBad(drop) {
  if (drawHazardPowerSprite(drop.name, 0, 0, drop.kind)) return;

  if (drop.name === "fishbone") {
    ctx.strokeStyle = drop.edge;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-drop.w / 2, 0);
    ctx.lineTo(drop.w / 2, 0);
    ctx.moveTo(-drop.w / 2, 0);
    ctx.lineTo(-drop.w / 2 - 12, -10);
    ctx.moveTo(-drop.w / 2, 0);
    ctx.lineTo(-drop.w / 2 - 12, 10);
    ctx.stroke();
    ctx.fillStyle = drop.color;
    ctx.beginPath();
    ctx.moveTo(drop.w / 2, 0);
    ctx.lineTo(drop.w / 2 + 17, -12);
    ctx.lineTo(drop.w / 2 + 17, 12);
    ctx.closePath();
    ctx.fill();
    return;
  }

  ctx.fillStyle = drop.color;
  ctx.strokeStyle = drop.edge;
  ctx.lineWidth = 4;
  if (drop.name === "boot") {
    roundedRect(-26, -20, 34, 44, 8);
    ctx.fill();
    ctx.stroke();
    roundedRect(-8, 3, 52, 24, 10);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(0, 0, 27, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#201713";
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.moveTo(i * 12, -8);
      ctx.lineTo(i * 28, -22);
      ctx.moveTo(i * 12, 0);
      ctx.lineTo(i * 31, 0);
      ctx.moveTo(i * 12, 8);
      ctx.lineTo(i * 28, 22);
      ctx.stroke();
    }
  }
}

function drawPowerAura(drop) {
  const seed = drop.pulseSeed || 0;
  const pulse = (Math.sin(frameNow / 150 + seed) + 1) / 2;
  const outerRadius = 64 + pulse * 9;
  const innerColor = hexToRgba(drop.color, 0.5);
  const outerColor = hexToRgba(drop.color, 0);

  ctx.save();
  const glow = ctx.createRadialGradient(0, 0, 8, 0, 0, outerRadius + 16);
  glow.addColorStop(0, "rgba(255, 248, 232, 0.72)");
  glow.addColorStop(0.38, innerColor);
  glow.addColorStop(1, outerColor);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, outerRadius + 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 248, 232, 0.9)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 38 + pulse * 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.rotate(frameNow / 520 + seed);
  ctx.strokeStyle = hexToRgba(drop.color, 0.78);
  ctx.lineWidth = 5;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawPower(drop) {
  if (drawHazardPowerSprite(drop.name, 0, 0, drop.kind)) return;

  ctx.fillStyle = drop.color;
  ctx.strokeStyle = drop.edge;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#201713";
  ctx.font = "900 16px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(drop.label, 0, 1);
}

function drawPowerGlints(drop) {
  const seed = drop.pulseSeed || 0;
  ctx.save();
  ctx.strokeStyle = "rgba(255, 248, 232, 0.96)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    const angle = seed + frameNow / 420 + i * Math.PI / 3;
    const pulse = Math.sin(frameNow / 120 + i * 1.7 + seed);
    const radius = 42 + pulse * 5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const size = 5 + (i % 2) * 2;
    ctx.globalAlpha = 0.5 + (pulse + 1) * 0.22;
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHazardPowerSprite(name, x, y, kind) {
  const image = kind === "power" ? powerImages[name] : hazardImages[name];
  if (image?.complete && image.naturalWidth) {
    const size = kind === "power" ? POWER_VISUAL_SIZE : 66;
    drawCenteredImage(image, x, y, size, size * (image.naturalHeight / image.naturalWidth));
    return true;
  }

  const index = HAZARD_POWER_SPRITES[name];
  if (index === undefined || !hazardPowerSprite.complete || !hazardPowerSprite.naturalWidth) return false;

  const size = kind === "power" ? POWER_VISUAL_SIZE : 66;
  const spriteW = size;
  const spriteH = size * (HAZARD_POWER_CELL_H / HAZARD_POWER_CELL_W);
  ctx.drawImage(
    hazardPowerSprite,
    index * HAZARD_POWER_CELL_W,
    0,
    HAZARD_POWER_CELL_W,
    HAZARD_POWER_CELL_H,
    x - spriteW / 2,
    y - spriteH / 2,
    spriteW,
    spriteH
  );
  return true;
}

function drawScorePops() {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 24px Trebuchet MS, Arial";
  for (const pop of state.scorePops) {
    ctx.globalAlpha = clamp(pop.life / 0.9, 0, 1);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#201713";
    ctx.fillStyle = pop.color;
    ctx.strokeText(pop.text, pop.x, pop.y);
    ctx.fillText(pop.text, pop.x, pop.y);
  }
  ctx.restore();
}

function drawLandBursts() {
  ctx.save();
  for (const burst of state.landBursts) {
    ctx.globalAlpha = clamp(burst.life / 0.58, 0, 1);
    const glint = effectImages.glint;
    if (glint?.complete && glint.naturalWidth) {
      drawImageParticle(glint, burst.x, burst.y, burst.size * 7, burst.size * 7, burst.spin || 0, ctx.globalAlpha);
    } else {
      ctx.fillStyle = burst.color;
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, burst.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawMessage(text) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 248, 232, 0.92)";
  ctx.strokeStyle = "#201713";
  ctx.lineWidth = 4;
  roundedRect(W / 2 - 135, 104, 270, 70, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#201713";
  ctx.font = "900 34px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, 139);
  ctx.restore();
}

function drawPauseScreen() {
  ctx.save();
  ctx.fillStyle = "rgba(32, 23, 19, 0.42)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff8e8";
  ctx.strokeStyle = "#201713";
  ctx.lineWidth = 5;
  roundedRect(W / 2 - 170, H / 2 - 68, 340, 136, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#201713";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 52px Trebuchet MS, Arial";
  ctx.fillText("Paused", W / 2, H / 2 - 8);
  ctx.font = "900 22px Trebuchet MS, Arial";
  ctx.fillText("Press pause or P to resume", W / 2, H / 2 + 40);
  ctx.restore();
}

function drawSugarRushWash() {
  const pulse = (Math.sin(frameNow / 140) + 1) / 2;
  ctx.save();
  const glow = ctx.createRadialGradient(W / 2, 138, 80, W / 2, 138, 520);
  glow.addColorStop(0, `rgba(255, 231, 127, ${0.06 + pulse * 0.04})`);
  glow.addColorStop(0.52, "rgba(255, 100, 128, 0.035)");
  glow.addColorStop(1, "rgba(255, 100, 128, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = 0.2 + pulse * 0.08;
  ctx.strokeStyle = "#fff0a6";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  for (let i = 0; i < 9; i++) {
    const t = frameNow / 360 + i * 0.82;
    const x = (i * 126 + Math.sin(t) * 38) % (W + 140) - 70;
    const y = 92 + (i % 4) * 54 + Math.cos(t * 1.4) * 8;
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x + 12, y);
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x, y + 12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTripleToast() {
  const progress = clamp(state.tripleFlash / 1.35, 0, 1);
  const alpha = Math.min(1, progress * 1.6);
  const scale = 1 + (1 - progress) * 0.16;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(W / 2, 154);
  ctx.scale(scale, scale);

  const pulse = Math.sin(frameNow / 90) * 0.08 + 1;
  ctx.fillStyle = "rgba(255, 216, 76, 0.22)";
  for (let i = 0; i < 18; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 18 + frameNow / 1300);
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(10, -112 * pulse);
    ctx.lineTo(-10, -112 * pulse);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = "rgba(255, 248, 232, 0.94)";
  ctx.strokeStyle = "#201713";
  ctx.lineWidth = 5;
  roundedRect(-188, -42, 376, 84, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ff6b6b";
  roundedRect(-172, -30, 344, 10, 5);
  ctx.fill();
  ctx.fillStyle = "#201713";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 44px Trebuchet MS, Arial";
  ctx.fillText("TRIPLE POINTS", 0, 2);
  ctx.font = "900 17px Trebuchet MS, Arial";
  ctx.fillText("x3 on every sweet catch", 0, 30);
  ctx.restore();
}

function drawDessertTimer() {
  const boxW = phoneLayout ? 154 : 190;
  const boxH = phoneLayout ? 42 : 50;
  const x = phoneLayout ? W - boxW - 14 : W - 214;
  const y = phoneLayout ? 68 : 18;
  const barW = phoneLayout ? boxW - 32 : 154;
  ctx.save();
  ctx.fillStyle = "rgba(255, 248, 232, 0.9)";
  ctx.strokeStyle = "#201713";
  ctx.lineWidth = 3;
  roundedRect(x, y, boxW, boxH, 8);
  ctx.fill();
  ctx.stroke();
  const progress = state.modeDuration ? clamp(state.modeTimer / state.modeDuration, 0, 1) : 0;
  ctx.fillStyle = "#201713";
  ctx.font = phoneLayout ? "900 20px Trebuchet MS, Arial" : "900 24px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`x3 ${Math.ceil(state.modeTimer)}s`, x + boxW / 2, y + (phoneLayout ? 19 : 21));
  ctx.fillStyle = "rgba(32, 23, 19, 0.18)";
  roundedRect(x + 16, y + boxH - 12, barW, 6, 3);
  ctx.fill();
  ctx.fillStyle = "#ff6b6b";
  roundedRect(x + 16, y + boxH - 12, barW * progress, 6, 3);
  ctx.fill();
  ctx.restore();
}

function puff(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r * 0.48, 0, Math.PI * 2);
  ctx.arc(x + r * 0.42, y + 8, r * 0.62, 0, Math.PI * 2);
  ctx.arc(x - r * 0.42, y + 12, r * 0.58, 0, Math.PI * 2);
  ctx.fill();
}

function drawAbstractSun(x, y, r) {
  const pulse = Math.sin(frameNow / 700) * 4;
  ctx.save();
  ctx.fillStyle = "rgba(255, 223, 123, 0.72)";
  ctx.beginPath();
  ctx.arc(x, y, r + pulse + 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffcf68";
  ctx.beginPath();
  ctx.arc(x, y, r + pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 248, 232, 0.75)";
  ctx.lineWidth = 5;
  for (let i = 0; i < 6; i++) {
    const yy = y - 26 + i * 11;
    ctx.beginPath();
    ctx.moveTo(x - r - 8, yy);
    ctx.lineTo(x + r + 8, yy);
    ctx.stroke();
  }
  ctx.restore();
}

function drawIslandBand(offset, baseY, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-40, H);
  ctx.lineTo(-40, baseY + 90);
  ctx.bezierCurveTo(W * 0.07 + offset, baseY - 26, W * 0.21 + offset, baseY + 78, W * 0.36 + offset, baseY + 12);
  ctx.bezierCurveTo(W * 0.53 + offset, baseY - 58, W * 0.67 + offset, baseY + 82, W * 0.84 + offset, baseY + 8);
  ctx.bezierCurveTo(W * 0.96 + offset, baseY - 28, W + 80 + offset, baseY + 60, W + 50 + offset, H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawVolcano(x, y, w, h, erupting) {
  ctx.save();
  const rock = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y + h);
  rock.addColorStop(0, "rgba(22, 24, 27, 0.94)");
  rock.addColorStop(0.46, "rgba(44, 48, 50, 0.96)");
  rock.addColorStop(1, "rgba(12, 14, 16, 0.98)");
  ctx.fillStyle = rock;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y + h);
  ctx.quadraticCurveTo(x - w * 0.24, y + h * 0.18, x - w * 0.08, y);
  ctx.lineTo(x + w * 0.1, y);
  ctx.quadraticCurveTo(x + w * 0.3, y + h * 0.16, x + w / 2, y + h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(7, 9, 11, 0.38)";
  ctx.beginPath();
  ctx.moveTo(x + w * 0.1, y);
  ctx.quadraticCurveTo(x + w * 0.32, y + h * 0.38, x + w / 2, y + h);
  ctx.lineTo(x + w * 0.04, y + h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(95, 101, 105, 0.4)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.28, y + h * 0.86);
  ctx.quadraticCurveTo(x - w * 0.14, y + h * 0.52, x - w * 0.06, y + h * 0.12);
  ctx.moveTo(x + w * 0.32, y + h * 0.84);
  ctx.quadraticCurveTo(x + w * 0.2, y + h * 0.48, x + w * 0.08, y + h * 0.11);
  ctx.stroke();

  ctx.fillStyle = "rgba(10, 12, 14, 0.86)";
  ctx.beginPath();
  ctx.ellipse(x + w * 0.01, y + h * 0.04, w * 0.15, h * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();

  if (erupting) drawEruption(x + w * 0.01, y + h * 0.02, w, h);
  drawLavaFlow(x + w * 0.02, y + h * 0.07, h, erupting);
  ctx.restore();
}

function drawEruption(x, y, w, h) {
  const pulse = Math.sin(frameNow / 180);
  const slowPulse = Math.sin(frameNow / 420);
  ctx.save();

  const glow = ctx.createRadialGradient(x, y + 8, 4, x, y + 8, w * 0.18);
  glow.addColorStop(0, "rgba(255, 214, 94, 0.72)");
  glow.addColorStop(0.42, "rgba(255, 103, 42, 0.32)");
  glow.addColorStop(1, "rgba(255, 96, 36, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y + 8, w * (0.2 + pulse * 0.015), 0, Math.PI * 2);
  ctx.fill();

  drawSmokePlume(x - 52, y - 22, 54, 0.26, slowPulse);
  drawSmokePlume(x + 2, y - 58, 70, 0.25, -slowPulse);
  drawSmokePlume(x + 64, y - 26, 50, 0.22, pulse * 0.6);
  drawSmokePlume(x - 8, y - 106, 46, 0.18, slowPulse * 0.7);

  drawLavaArc(x, y + 6, -w * 0.18, -h * 0.28, w * 0.075, 0.58);
  drawLavaArc(x, y + 6, w * 0.2, -h * 0.24, w * 0.09, 0.52);
  drawLavaArc(x, y + 6, -w * 0.06, -h * 0.38, w * 0.05, 0.46);
  drawLavaArc(x, y + 6, w * 0.07, -h * 0.34, w * 0.055, 0.44);
  drawLavaArc(x, y + 6, w * 0.3, -h * 0.18, w * 0.1, 0.32);
  drawLavaArc(x, y + 6, -w * 0.28, -h * 0.2, w * 0.08, 0.34);

  drawLavaSparks(x, y, w, h);

  ctx.restore();
}

function drawSmokePlume(x, y, r, alpha, drift) {
  ctx.save();
  if (effectImages.smokePuff?.complete && effectImages.smokePuff.naturalWidth) {
    const puffs = [
      [x + drift * 10, y, r * 1.55, r * 0.96, -0.12],
      [x + r * 0.54 + drift * 14, y - r * 0.22, r * 1.4, r * 0.84, 0.18],
      [x - r * 0.42 + drift * 8, y - r * 0.1, r * 1.12, r * 0.72, 0.08]
    ];
    for (const [px, py, pw, ph, rotate] of puffs) {
      drawImageParticle(effectImages.smokePuff, px, py, pw, ph, rotate, alpha * 1.45);
    }
    ctx.restore();
    return;
  }
  ctx.fillStyle = `rgba(37, 35, 34, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x + drift * 10, y, r * 0.78, r * 0.48, -0.12, 0, Math.PI * 2);
  ctx.ellipse(x + r * 0.54 + drift * 14, y - r * 0.22, r * 0.7, r * 0.42, 0.18, 0, Math.PI * 2);
  ctx.ellipse(x - r * 0.42 + drift * 8, y - r * 0.1, r * 0.56, r * 0.36, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLavaArc(x, y, endX, peakY, sway, alpha) {
  const wobble = Math.sin(frameNow / 170 + endX * 0.03) * sway;
  ctx.save();
  ctx.strokeStyle = `rgba(255, 137, 45, ${alpha})`;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + endX * 0.42 + wobble, y + peakY, x + endX, y + Math.abs(peakY) * 0.34);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 221, 111, 0.28)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y + 1);
  ctx.quadraticCurveTo(x + endX * 0.42 + wobble, y + peakY + 4, x + endX, y + Math.abs(peakY) * 0.34);
  ctx.stroke();
  ctx.restore();
}

function drawLavaSparks(x, y, w, h) {
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const t = frameNow / 140 + i * 1.73;
    const spread = Math.sin(t * 0.8) * w * 0.22;
    const lift = (Math.abs(Math.cos(t)) * h * 0.3) + (i % 5) * 10;
    const px = x + spread;
    const py = y - 12 - lift;
    const size = 2 + (i % 3);
    ctx.globalAlpha = 0.35 + (Math.sin(t) + 1) * 0.22;
    const particle = i % 4 === 0 ? effectImages.lavaSpark : effectImages.ember;
    if (particle?.complete && particle.naturalWidth) {
      drawImageParticle(particle, px, py, size * 9, size * 9, t, ctx.globalAlpha);
    } else {
      ctx.fillStyle = i % 4 === 0 ? "#fff0a6" : "#ff7a2d";
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawLavaFlow(x, y, h, erupting) {
  const glow = Math.sin(frameNow / 220) * 0.09 + (erupting ? 0.68 : 0.28);
  ctx.save();
  ctx.globalAlpha = glow;
  ctx.strokeStyle = "#ffb347";
  ctx.lineWidth = Math.max(12, h * (erupting ? 0.085 : 0.05));
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - 12, y + h * 0.18, x + 22, y + h * 0.32, x + 2, y + h * 0.5);
  ctx.bezierCurveTo(x - 14, y + h * 0.64, x + 12, y + h * 0.74, x - 8, y + h * 0.9);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = erupting ? 0.96 : 0.72;
  ctx.strokeStyle = "#d9341f";
  ctx.lineWidth = Math.max(5, h * (erupting ? 0.042 : 0.024));
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y + 2);
  ctx.bezierCurveTo(x - 9, y + h * 0.18, x + 16, y + h * 0.32, x, y + h * 0.5);
  ctx.bezierCurveTo(x - 10, y + h * 0.64, x + 8, y + h * 0.74, x - 8, y + h * 0.9);
  ctx.stroke();
  ctx.strokeStyle = "#ff9b35";
  ctx.lineWidth = Math.max(2, h * (erupting ? 0.02 : 0.01));
  ctx.beginPath();
  ctx.moveTo(x + 1, y + 10);
  ctx.bezierCurveTo(x - 5, y + h * 0.22, x + 10, y + h * 0.38, x + 1, y + h * 0.54);
  ctx.stroke();
  ctx.restore();
}

function drawPalmLeaf(x, y, size, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  for (let i = -3; i <= 3; i++) {
    ctx.save();
    ctx.rotate(i * 0.22);
    ctx.beginPath();
    ctx.ellipse(size * 0.44, 0, size * 0.48, size * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = "rgba(32, 23, 19, 0.18)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.9, 0);
  ctx.stroke();
  ctx.restore();
}

function drawOceanCurve(y, color, alpha, phase) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let x = -20; x <= W + 20; x += 20) {
    const yy = y + Math.sin(x / 48 + frameNow / 650 + phase) * 7;
    if (x === -20) ctx.moveTo(x, yy);
    else ctx.lineTo(x, yy);
  }
  ctx.stroke();
  ctx.restore();
}

function drawBoardwalk(y) {
  const plankGradient = ctx.createLinearGradient(0, y, 0, H);
  plankGradient.addColorStop(0, "#d69a4f");
  plankGradient.addColorStop(0.45, "#b87538");
  plankGradient.addColorStop(1, "#8f542c");
  ctx.fillStyle = plankGradient;
  ctx.fillRect(0, y, W, H - y);

  ctx.strokeStyle = "rgba(74, 43, 24, 0.72)";
  ctx.lineWidth = 4;
  for (let row = 0; row < 7; row++) {
    const yy = y + row * 22 + row * row * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, yy);
    ctx.lineTo(W, yy);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 218, 143, 0.32)";
  ctx.lineWidth = 3;
  for (let row = 0; row < 5; row++) {
    const yy = y + 12 + row * 27 + row * row;
    ctx.beginPath();
    ctx.moveTo(0, yy);
    ctx.lineTo(W, yy);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(70, 38, 20, 0.55)";
  ctx.lineWidth = 3;
  for (let x = -80; x < W + 120; x += 155) {
    ctx.beginPath();
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x - 54, H);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(80, 45, 24, 0.45)";
  for (let x = 36; x < W; x += 118) {
    for (let yy = y + 18; yy < H; yy += 52) {
      ctx.beginPath();
      ctx.ellipse(x + Math.sin(yy) * 8, yy, 5, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function hill(x, y, w, h) {
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h, w / 2, h, 0, Math.PI, 0);
  ctx.lineTo(x + w, H);
  ctx.lineTo(x, H);
  ctx.closePath();
  ctx.fill();
}

function roundedRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function beep(freq, duration, type, gainValue, force) {
  if (muted || audioUnavailable) return;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    audioUnavailable = true;
    muted = true;
    updateHud();
    return;
  }

  try {
    audioCtx = audioCtx || new AudioContextCtor();
    if (!force && audioCtx.currentTime - lastBeepTime < 0.035) return;
    lastBeepTime = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainValue, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    audioUnavailable = true;
    muted = true;
    updateHud();
  }
}

function setCanvasSizeForViewport() {
  phoneLayout = shouldUsePhoneLayout();
  const nextW = phoneLayout ? 540 : 960;
  const nextH = phoneLayout ? 960 : 640;
  W = nextW;
  H = nextH;
  if (canvas.width !== nextW) canvas.width = nextW;
  if (canvas.height !== nextH) canvas.height = nextH;
  if (canvas.dataset) canvas.dataset.layout = phoneLayout ? "phone" : "wide";
}

function shouldUsePhoneLayout() {
  const viewport = window.visualViewport || window;
  const vw = viewport.width || window.innerWidth || canvas.clientWidth || W;
  const vh = viewport.height || window.innerHeight || canvas.clientHeight || H;
  return vw <= 700 && vh > vw;
}

function handleViewportResize() {
  const oldW = W;
  const oldH = H;
  const playerRatio = state?.player ? state.player.x / oldW : 0.5;
  setCanvasSizeForViewport();
  if (oldW === W && oldH === H) return;

  const xScale = W / oldW;
  const yScale = H / oldH;
  pointerTarget = null;
  if (state) {
    state.touchActive = false;
    state.touchX = clamp((state.touchX || playerRatio * oldW) * xScale, getPlayerMinX(), getPlayerMaxX());
  }

  if (state?.player) {
    state.player.w = getPlayerWidth();
    state.player.y = getPlayerY();
    state.player.x = clamp(playerRatio * W, getPlayerMinX(), getPlayerMaxX());
  }

  for (const drop of state?.drops || []) {
    drop.x *= xScale;
    drop.y *= yScale;
  }
  for (const pop of state?.scorePops || []) {
    pop.x *= xScale;
    pop.y *= yScale;
  }
  for (const burst of state?.landBursts || []) {
    burst.x *= xScale;
    burst.y *= yScale;
  }

  updateHud();
  draw();
}

function canvasPointerX(event) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width) return W / 2;
  return ((event.clientX - rect.left) / rect.width) * W;
}

function canvasPointerPoint(event) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return { x: W / 2, y: H / 2 };
  return {
    x: ((event.clientX - rect.left) / rect.width) * W,
    y: ((event.clientY - rect.top) / rect.height) * H
  };
}

function setPointerTargetFromEvent(event, ripple) {
  const x = clamp(canvasPointerX(event), getPlayerMinX(), getPlayerMaxX());
  pointerTarget = x;
  state.touchActive = true;
  state.touchX = x;
  state.touchHintTimer = 0;
  if (ripple) state.touchRipple = 0.45;
}

function clearInputState() {
  keys.clear();
  pointerTarget = null;
  volcanoDrag = null;
  if (!state) return;
  state.touchActive = false;
  state.touchRipple = 0;
  if (state.player) state.touchX = state.player.x;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  if (value.length !== 6) return `rgba(255, 248, 232, ${alpha})`;
  const number = parseInt(value, 16);
  const r = (number >> 16) & 255;
  const g = (number >> 8) & 255;
  const b = number & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function loadHighScore() {
  try {
    return Number(localStorage.getItem("sandwichStackHighScore")) || 0;
  } catch {
    return 0;
  }
}

function saveHighScore() {
  if (state.score <= highScore) return;
  highScore = state.score;
  try {
    localStorage.setItem("sandwichStackHighScore", String(highScore));
  } catch {
    // Browser storage can be unavailable in some embedded contexts.
  }
}

function loadVolcanoPlacement() {
  try {
    return JSON.parse(localStorage.getItem(VOLCANO_PLACEMENT_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveVolcanoPlacement() {
  try {
    localStorage.setItem(VOLCANO_PLACEMENT_STORAGE_KEY, JSON.stringify(volcanoPlacement));
  } catch {
    // Placement editing is optional polish tooling.
  }
}

function getVolcanoPlacementForLayout() {
  const layout = phoneLayout ? "phone" : "wide";
  if (!volcanoPlacement[layout]) {
    const base = phoneLayout
      ? { x: W * 0.39, y: H * 0.245 }
      : { x: W * 0.315, y: H * 0.315 };
    volcanoPlacement[layout] = { ...base, scale: 1 };
  }
  return volcanoPlacement[layout];
}

function moveVolcanoPlacement(dx, dy) {
  const placement = getVolcanoPlacementForLayout();
  placement.x = clamp(placement.x + dx, 0, W);
  placement.y = clamp(placement.y + dy, 0, H);
  saveVolcanoPlacement();
  draw();
}

function scaleVolcanoPlacement(delta) {
  const placement = getVolcanoPlacementForLayout();
  placement.scale = clamp((placement.scale || 1) + delta, 0.45, 2.4);
  saveVolcanoPlacement();
  draw();
}

function resetVolcanoPlacement() {
  delete volcanoPlacement[phoneLayout ? "phone" : "wide"];
  saveVolcanoPlacement();
  draw();
}

function drawVolcanoEditGuide() {
  const vent = getBackgroundVolcanoVent();
  ctx.save();
  ctx.strokeStyle = "rgba(255, 248, 232, 0.9)";
  ctx.fillStyle = "rgba(32, 23, 19, 0.74)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.arc(vent.x, vent.y, 11, 0, Math.PI * 2);
  ctx.moveTo(vent.x - 26, vent.y);
  ctx.lineTo(vent.x + 26, vent.y);
  ctx.moveTo(vent.x, vent.y - 26);
  ctx.lineTo(vent.x, vent.y + 26);
  ctx.stroke();
  ctx.setLineDash([]);
  const text = "Volcano edit: drag, arrows nudge, +/- scale, R reset, V done";
  ctx.font = phoneLayout ? "800 13px Trebuchet MS, Arial" : "800 15px Trebuchet MS, Arial";
  const pad = 10;
  const metrics = ctx.measureText(text);
  const boxW = Math.min(W - 24, metrics.width + pad * 2);
  const boxH = phoneLayout ? 34 : 38;
  roundedRect(12, H - boxH - 12, boxW, boxH, 8);
  ctx.fill();
  ctx.fillStyle = "#fff8e8";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 12 + pad, H - boxH / 2 - 12);
  ctx.restore();
}

function jumpToDessertTest() {
  if (!state.running || state.over) return;
  state.score = Math.max(state.score, 9850);
  state.sandwichScore = Math.max(state.sandwichScore, 9850);
  state.message = "Test jump";
  state.messageTimer = 1;
  updateHud();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function togglePause() {
  if (!state.running || state.over) return;
  state.paused = !state.paused;
  lastTime = performance.now();
  updateHud();
  draw();
}

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
soundToggle.addEventListener("click", () => {
  if (audioUnavailable) {
    muted = true;
    updateHud();
    return;
  }
  muted = !muted;
  updateHud();
});
window.addEventListener("resize", handleViewportResize);
window.addEventListener("orientationchange", () => {
  setTimeout(handleViewportResize, 120);
});
if (window.visualViewport) window.visualViewport.addEventListener("resize", handleViewportResize);
window.addEventListener("blur", clearInputState);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") clearInputState();
});

window.addEventListener("keydown", (event) => {
  if (DEBUG_MODE && (event.key === "v" || event.key === "V")) {
    volcanoEditMode = !volcanoEditMode;
    clearInputState();
    event.preventDefault();
    draw();
    return;
  }

  if (DEBUG_MODE && volcanoEditMode) {
    const step = event.shiftKey ? 10 : 2;
    if (event.key === "ArrowLeft") moveVolcanoPlacement(-step, 0);
    else if (event.key === "ArrowRight") moveVolcanoPlacement(step, 0);
    else if (event.key === "ArrowUp") moveVolcanoPlacement(0, -step);
    else if (event.key === "ArrowDown") moveVolcanoPlacement(0, step);
    else if (event.key === "+" || event.key === "=") scaleVolcanoPlacement(0.04);
    else if (event.key === "-" || event.key === "_") scaleVolcanoPlacement(-0.04);
    else if (event.key === "r" || event.key === "R") resetVolcanoPlacement();
    else return;
    event.preventDefault();
    return;
  }

  if (["ArrowLeft", "ArrowRight", "a", "d"].includes(event.key)) {
    keys.add(event.key);
    pointerTarget = null;
    event.preventDefault();
  }
  if (event.key === "p" || event.key === "P") togglePause();
  if (DEBUG_MODE && (event.key === "t" || event.key === "T")) jumpToDessertTest();
  if ((event.key === " " || event.key === "Enter") && !state.running) startGame();
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  if (DEBUG_MODE && volcanoEditMode) {
    const point = canvasPointerPoint(event);
    const placement = getVolcanoPlacementForLayout();
    volcanoDrag = { dx: placement.x - point.x, dy: placement.y - point.y };
    placement.x = clamp(point.x + volcanoDrag.dx, 0, W);
    placement.y = clamp(point.y + volcanoDrag.dy, 0, H);
    saveVolcanoPlacement();
    draw();
    canvas.setPointerCapture(event.pointerId);
    return;
  }
  setPointerTargetFromEvent(event, true);
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!event.buttons) return;
  event.preventDefault();
  if (DEBUG_MODE && volcanoEditMode && volcanoDrag) {
    const point = canvasPointerPoint(event);
    const placement = getVolcanoPlacementForLayout();
    placement.x = clamp(point.x + volcanoDrag.dx, 0, W);
    placement.y = clamp(point.y + volcanoDrag.dy, 0, H);
    saveVolcanoPlacement();
    draw();
    return;
  }
  setPointerTargetFromEvent(event, false);
});

canvas.addEventListener("pointerup", (event) => {
  event.preventDefault();
  volcanoDrag = null;
  state.touchActive = false;
  pointerTarget = null;
});

canvas.addEventListener("pointercancel", () => {
  volcanoDrag = null;
  state.touchActive = false;
  pointerTarget = null;
});

updateHud();
draw();
