(function () {
  const canvas = document.getElementById('gameCanvas') || createCanvas();
  const ctx = canvas.getContext('2d');

  const PLAYER_IMAGE_PATH = './Noah/CowboyNoah-removebg-preview.png';
  const DOG_POO_IMAGE_PATH = './Noah/dogpoo-removebg-preview.png';
  const CAT_IMAGE_PATH = './Noah/flyingcat-removebg-preview.png';

  const PLAYER_SCALE = 1;
  const GROUND_OBJECT_SCALE = 1.75;
  const FLYING_HAZARD_SCALE = 1.5;
  const FLYING_HAZARD_HEIGHT_RATIO = 0.5;
  const CAT_VERTICAL_OFFSET = 1.9;

  const groundY = canvas.height - 100;
  const keys = {
    jump: false,
    duck: false,
  };

  let customPlayerImage = null;
  let dogPooImage = null;
  let catImage = null;

  const state = {
    running: false,
    started: false,
    score: 0,
    best: 0,
    lastTime: 0,
    spawnTimer: 0,
    nextSpawnDelay: 1.3,
    gameSpeed: 420,
    obstacleDelay: 1.25,
    obstacles: [],
    flashTimer: 0,
  };

  function syncGameState() {
    const gameState = window.__birthdayGame || {};
    gameState.started = state.started;
    gameState.playing = state.running;
    gameState.gameOver = state.started && !state.running;
    if (gameState.playing) {
      gameState.paused = true;
    } else {
      gameState.paused = false;
    }
    window.__birthdayGame = gameState;
  }

  const player = {
    x: 80,
    y: groundY - 38,
    w: 34,
    h: 38,
    vy: 0,
    jumpForce: 1200,
    gravity: 2500,
    onGround: true,
    ducking: false,
  };

  function createCanvas() {
    const created = document.createElement('canvas');
    created.id = 'gameCanvas';
    created.width = 900;
    created.height = 750;
    created.style.display = 'block';
    created.style.margin = '40px auto';
    created.style.maxWidth = '100%';
    created.style.background = '#f5f7fb';
    created.style.borderRadius = '18px';
    created.style.border = '2px solid #dfe8f5';
    created.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
    document.body.appendChild(created);
    return created;
  }

  function loadImage(path) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = path;
    });
  }

  async function preloadImages() {
    customPlayerImage = await loadImage(PLAYER_IMAGE_PATH);
    dogPooImage = await loadImage(DOG_POO_IMAGE_PATH);
    catImage = await loadImage(CAT_IMAGE_PATH);

    if (customPlayerImage) {
      player.w = customPlayerImage.width * PLAYER_SCALE;
      player.h = customPlayerImage.height * PLAYER_SCALE;
      player.y = groundY - player.h;
    }
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function scheduleNextSpawn() {
    state.nextSpawnDelay = randomBetween(1.1, 2.1);
    state.spawnTimer = 0;
  }

  function resetGame() {
    state.running = false;
    state.started = false;
    state.score = 0;
    state.spawnTimer = 0;
    state.nextSpawnDelay = randomBetween(1.1, 2.1);
    state.obstacleDelay = 1.2;
    state.gameSpeed = 420;
    state.obstacles = [];
    state.flashTimer = 0;

    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
    player.ducking = false;
    player.w = customPlayerImage ? customPlayerImage.width * PLAYER_SCALE : 34;
    player.h = customPlayerImage ? customPlayerImage.height * PLAYER_SCALE : 38;

    syncGameState();
    if (window.startAdTimer) {
      window.startAdTimer();
    }
  }

  function startGame() {
    state.running = true;
    state.started = true;
    state.score = 0;
    state.spawnTimer = 0;
    state.nextSpawnDelay = randomBetween(1.1, 2.1);
    state.obstacleDelay = 1.2;
    state.gameSpeed = 420;
    state.obstacles = [];
    state.flashTimer = 0;

    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
    player.ducking = false;
    player.w = customPlayerImage ? customPlayerImage.width * PLAYER_SCALE : 34;
    player.h = customPlayerImage ? customPlayerImage.height * PLAYER_SCALE : 38;

    syncGameState();
    if (window.pauseAdTimer) {
      window.pauseAdTimer();
    }
  }

  function jump() {
    if (!state.started) {
      startGame();
      return;
    }

    if (!state.running) {
      startGame();
      return;
    }

    if (player.onGround) {
      player.vy = -player.jumpForce;
      player.onGround = false;
      player.ducking = false;
    }
  }

  function duck(force) {
    if (!state.running) return;
    if (force && player.onGround) {
      player.ducking = true;
      player.h = customPlayerImage ? Math.max(28, Math.floor(customPlayerImage.height * (PLAYER_SCALE * 0.7))) : 24;
      player.y = groundY - player.h;
    } else if (!force && player.onGround) {
      player.ducking = false;
      player.h = customPlayerImage ? customPlayerImage.height * PLAYER_SCALE : 38;
      player.y = groundY - player.h;
    }
  }

  function spawnObstacle() {
    const lastObstacle = state.obstacles[state.obstacles.length - 1];
    const minGap = 180;
    const maxGap = 290;
    let spawnX = canvas.width + 60;

    if (lastObstacle) {
      const earliestAllowedX = lastObstacle.x + lastObstacle.w + minGap;
      spawnX = Math.max(canvas.width + 60, earliestAllowedX + randomBetween(0, maxGap - minGap));
    }

    const obstacle = {
      x: spawnX,
      y: groundY,
      type: Math.random() < 0.5 ? 'poo' : 'cat',
      passed: false,
    };

    if (obstacle.type === 'poo') {
      obstacle.w = 60 * GROUND_OBJECT_SCALE;
      obstacle.h = 44 * GROUND_OBJECT_SCALE;
      obstacle.y = groundY - obstacle.h;
    } else {
      obstacle.w = 90 * FLYING_HAZARD_SCALE;
      obstacle.h = 66 * FLYING_HAZARD_SCALE;
      obstacle.y = canvas.height * FLYING_HAZARD_HEIGHT_RATIO - obstacle.h * CAT_VERTICAL_OFFSET;
    }

    state.obstacles.push(obstacle);
  }

  function checkCollision(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  function isPlayerJumping() {
    return !player.onGround || player.vy < -10 || player.y < groundY - player.h - 2;
  }

  function update(dt) {
    if (!state.started || !state.running) return;

    state.spawnTimer += dt;
    state.gameSpeed = Math.min(980, state.gameSpeed + dt * 22);

    if (state.spawnTimer >= state.nextSpawnDelay) {
      spawnObstacle();
      scheduleNextSpawn();
    }

    const isDuckPressed = keys.duck && player.onGround;
    duck(isDuckPressed);

    player.vy += player.gravity * dt;
    player.y += player.vy * dt;

    if (player.y >= groundY - player.h) {
      player.y = groundY - player.h;
      player.vy = 0;
      player.onGround = true;
    }

    for (const obstacle of state.obstacles) {
      obstacle.x -= state.gameSpeed * dt;

      if (!obstacle.passed && obstacle.x + obstacle.w < player.x) {
        obstacle.passed = true;
        state.score += 1;
        state.best = Math.max(state.best, state.score);
        if (state.score >= 10 && typeof window.showAchievementToast === 'function') {
          window.showAchievementToast('game-player');
        }
      }

      const playerBox = {
        x: player.x + 8,
        y: player.y + 4,
        w: player.w - 12,
        h: player.h - 8,
      };

      const obstacleBox = {
        x: obstacle.x,
        y: obstacle.y,
        w: obstacle.w,
        h: obstacle.h,
      };

      const collides = checkCollision(playerBox, obstacleBox);

      if (obstacle.type === 'poo') {
        if (collides && !isPlayerJumping()) {
          state.running = false;
          syncGameState();
          if (window.startAdTimer) {
            window.startAdTimer();
          }
        }
      } else if (collides && isPlayerJumping()) {
        state.running = false;
        syncGameState();
        if (window.startAdTimer) {
          window.startAdTimer();
        }
      }
    }

    state.obstacles = state.obstacles.filter((obstacle) => obstacle.x + obstacle.w > -40);
  }

  function drawPlayer() {
    if (customPlayerImage && customPlayerImage.complete) {
      const img = customPlayerImage;
      const drawW = player.ducking ? player.w * 1.08 : player.w;
      const drawH = player.ducking ? player.h * 1.08 : player.h;
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, player.x - 10, player.y - 8, drawW + 18, drawH + 16);
      ctx.restore();
      return;
    }

    const px = player.x;
    const py = player.y;

    ctx.save();
    ctx.translate(px, py);

    ctx.fillStyle = '#f4c95d';
    ctx.beginPath();
    ctx.arc(18, 10, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2c2834';
    ctx.fillRect(6, 18, 24, 18);
    ctx.fillRect(4, 22, 8, 10);
    ctx.fillRect(24, 22, 8, 10);

    ctx.fillStyle = '#fff';
    ctx.fillRect(12, 8, 3, 3);
    ctx.fillRect(21, 8, 3, 3);
    ctx.fillStyle = '#000';
    ctx.fillRect(13, 9, 1, 1);
    ctx.fillRect(22, 9, 1, 1);

    ctx.restore();
  }

  function drawDogPoo(obstacle) {
    if (dogPooImage) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(dogPooImage, obstacle.x, obstacle.y, obstacle.w, obstacle.h);
      return;
    }

    const x = obstacle.x;
    const y = obstacle.y;
    const w = obstacle.w;
    const h = obstacle.h;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#7a4f2d';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.52, h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8f5d34';
    ctx.beginPath();
    ctx.ellipse(w * 0.39, h * 0.35, w * 0.18, h * 0.12, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5c3316';
    ctx.beginPath();
    ctx.arc(w * 0.68, h * 0.38, w * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff3d8';
    ctx.beginPath();
    ctx.arc(w * 0.33, h * 0.28, w * 0.07, 0, Math.PI * 2);
    ctx.arc(w * 0.6, h * 0.26, w * 0.07, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(w * 0.33, h * 0.28, w * 0.02, 0, Math.PI * 2);
    ctx.arc(w * 0.6, h * 0.26, w * 0.02, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawFlyingCat(obstacle) {
    if (catImage) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(catImage, obstacle.x, obstacle.y, obstacle.w, obstacle.h);
      return;
    }

    const x = obstacle.x;
    const y = obstacle.y;
    const w = obstacle.w;
    const h = obstacle.h;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#b97a52';
    ctx.beginPath();
    ctx.ellipse(w * 0.52, h * 0.56, w * 0.33, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d49c70';
    ctx.beginPath();
    ctx.moveTo(w * 0.42, h * 0.4);
    ctx.lineTo(w * 0.32, h * 0.18);
    ctx.lineTo(w * 0.5, h * 0.34);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w * 0.62, h * 0.4);
    ctx.lineTo(w * 0.72, h * 0.18);
    ctx.lineTo(w * 0.5, h * 0.34);
    ctx.fill();

    ctx.fillStyle = '#f3d2b3';
    ctx.beginPath();
    ctx.arc(w * 0.42, h * 0.58, w * 0.16, 0, Math.PI * 2);
    ctx.arc(w * 0.68, h * 0.58, w * 0.16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(w * 0.47, h * 0.58, 2, 0, Math.PI * 2);
    ctx.arc(w * 0.63, h * 0.58, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#7a4e3e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.55, h * 0.6);
    ctx.lineTo(w * 0.5, h * 0.72);
    ctx.moveTo(w * 0.55, h * 0.6);
    ctx.lineTo(w * 0.6, h * 0.72);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.12, h * 0.55);
    ctx.lineTo(w * 0.0, h * 0.4);
    ctx.moveTo(w * 0.88, h * 0.55);
    ctx.lineTo(w * 1.0, h * 0.4);
    ctx.stroke();

    ctx.restore();
  }

  function drawObstacle(obstacle) {
    if (obstacle.type === 'poo') {
      drawDogPoo(obstacle);
    } else {
      drawFlyingCat(obstacle);
    }
  }

  function drawGround() {
    ctx.fillStyle = '#dff4ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#a9d8f8';
    ctx.fillRect(0, 0, canvas.width, groundY - 10);

    ctx.fillStyle = '#79c560';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    ctx.fillStyle = '#b87a4b';
    ctx.fillRect(0, groundY + 20, canvas.width, 42);

    ctx.fillStyle = '#5d9d3e';
    for (let x = 0; x <= canvas.width; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 12);
      ctx.lineTo(x + 8, groundY + 2);
      ctx.lineTo(x + 16, groundY + 12);
      ctx.fill();
    }

    ctx.fillStyle = '#7fbf5b';
    ctx.fillRect(0, groundY + 12, canvas.width, 8);

    ctx.fillStyle = '#c58c5a';
    for (let x = 0; x < canvas.width; x += 36) {
      ctx.fillRect(x, groundY + 30, 16, 4);
    }
  }

  function drawHud() {
    ctx.fillStyle = '#243b5a';
    ctx.font = '700 22px sans-serif';
    ctx.fillText('Score: ' + state.score, 20, 28);
    ctx.fillText('Best: ' + state.best, canvas.width - 150, 28);
  }

  function drawGameOver() {
    ctx.fillStyle = 'rgba(18, 24, 36, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 8);

    ctx.font = '700 22px sans-serif';
    ctx.fillText('Press Space / Tap to restart', canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = 'left';
  }

  function drawStartScreen() {
    ctx.fillStyle = '#dff4ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGround();

    drawPlayer();

    ctx.fillStyle = 'rgba(18, 24, 36, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '900 40px sans-serif';
    ctx.fillText('CLICK TO START', canvas.width / 2, canvas.height / 2 - 8);

    ctx.font = '700 22px sans-serif';
    ctx.fillText('Jump over poo and duck under cats', canvas.width / 2, canvas.height / 2 + 28);
    ctx.textAlign = 'left';
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!state.started) {
      drawStartScreen();
      return;
    }

    drawGround();

    for (const obstacle of state.obstacles) {
      drawObstacle(obstacle);
    }

    drawPlayer();
    drawHud();

    if (!state.running) {
      drawGameOver();
    }
  }

  function loop(timestamp) {
    const dt = Math.min(0.032, (timestamp - state.lastTime) / 1000 || 0.016);
    state.lastTime = timestamp;

    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
      event.preventDefault();
      if (!state.started) {
        startGame();
        return;
      }
      jump();
    }

    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      event.preventDefault();
      keys.duck = true;
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      keys.duck = false;
      if (player.onGround) {
        player.ducking = false;
        player.h = customPlayerImage ? customPlayerImage.height * PLAYER_SCALE : 38;
        player.y = groundY - player.h;
      }
    }
  });

  canvas.addEventListener('pointerdown', () => {
    if (!state.started) {
      startGame();
      return;
    }

    if (!state.running) {
      startGame();
      return;
    }

    jump();
  });

  preloadImages();
  resetGame();
  requestAnimationFrame(loop);
})();
