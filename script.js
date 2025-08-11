const player = document.getElementById('player');
const game = document.getElementById('game');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const phaseDisplay = document.getElementById('phase');
const modal = document.getElementById('instructionModal');
const playButton = document.getElementById('playButton');
const phaseTitle = document.getElementById('phaseTitle');
const goodItemsDisplay = document.getElementById('goodItemsDisplay');
const badItemsDisplay = document.getElementById('badItemsDisplay');
const countdown = document.getElementById('countdown');

let score = 0;
let lives = 3;
let currentPhase = 0;
let gameIntervals = [];
let gameRunning = false;

let playerX = window.innerWidth / 2;
const playerSpeed = 8;
const keysPressed = {};

const phases = [
  {
    name: "Cidade Medieval",
    background: "https://img.craftpix.net/2020/12/Free-Elven-Land-Game-Battle-Backgrounds6.jpg",
    goodItems: [
      "https://static.vecteezy.com/system/resources/previews/019/527/033/non_2x/an-8-bit-retro-styled-pixel-art-illustration-of-a-stone-sword-free-png.png", 
      "https://png.pngtree.com/png-vector/20240807/ourmid/pngtree-a-torch-in-pixel-art-style-png-image_13130699.png", 
      "https://png.pngtree.com/png-clipart/20250721/original/pngtree-pixel-art-protection-shield-shape-object-graphic-element-isolated-vector-png-image_21298251.png"
    ],
    badItems: ["https://static.vecteezy.com/system/resources/thumbnails/013/743/158/small_2x/apple-pixel-art-png.png"],
    fallSpeed: 4,
    dropInterval: 1200
  },
  {
    name: "Floresta Mística",
    background: "https://img.craftpix.net/2023/04/Free-Nature-Backgrounds-Pixel-Art6.png",
    goodItems: [
      "https://png.pngtree.com/png-vector/20240917/ourmid/pngtree-mushroom-pixel-art-vector-png-image_13852256.png", 
      "https://png.pngtree.com/png-clipart/20230201/ourmid/pngtree-cactus-pixel-art-png-image_6581983.png", 
      "https://png.pngtree.com/png-vector/20230311/ourmid/pngtree-oil-lamp-vector-png-image_6645295.png"
    ],
    badItems: ["https://png.pngtree.com/png-clipart/20210516/original/pngtree-pixel-art-passenger-car-png-image_6299217.png"],
    fallSpeed: 7,
    dropInterval: 900
  },
  {
    name: "Cidade Futurista",
    background: "https://img.craftpix.net/2023/01/Free-City-Backgrounds-Pixel-Art2.png",
    goodItems: [
      "https://images.vexels.com/media/users/3/328716/isolated/preview/c8bbc44fa48cfee8b67d508a9754b35d-telefone-roxo-com-uma-listra-azul.png", 
      "https://images.vexels.com/media/users/3/145057/isolated/preview/40162fe877a9228c5cd5f28939af5a0e-silhueta-de-predio-de-escritorios.png", 
      "https://opengameart.org/sites/default/files/robot-preview.png"
    ],
    badItems: ["https://images.vexels.com/media/users/3/209697/isolated/preview/21e7c3f4451469747b77761986d7d0f8-elemento-desenhado-a-mao-de-vela.png"],
    fallSpeed: 9,
    dropInterval: 600
  }
];

function showInstructions() {
  const phase = phases[currentPhase];
  modal.style.display = "flex";
  gameRunning = false;

  phaseTitle.textContent = `Fase ${currentPhase + 1}: ${phase.name}`;
  goodItemsDisplay.innerHTML = '';
  badItemsDisplay.innerHTML = '';

  phase.goodItems.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    goodItemsDisplay.appendChild(img);
  });

  phase.badItems.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    badItemsDisplay.appendChild(img);
  });

  countdown.textContent = '';
  playButton.disabled = false;
}

function startGameCountdown() {
  let seconds = 5;
  countdown.textContent = seconds;
  playButton.disabled = true;

  const timer = setInterval(() => {
    seconds--;
    countdown.textContent = seconds;
    if (seconds === 0) {
      clearInterval(timer);
      modal.style.display = 'none';
      gameRunning = true;
      startDropping();
    }
  }, 1000);
}

playButton.addEventListener('click', startGameCountdown);

document.addEventListener('keydown', (e) => {
  keysPressed[e.key] = true;
  if (e.code === 'Space' && modal.style.display !== 'none') {
    playButton.click();
  }
});

document.addEventListener('keyup', (e) => {
  keysPressed[e.key] = false;
});

function clearGameArea() {
  document.querySelectorAll('.item').forEach(item => item.remove());
  gameIntervals.forEach(clearInterval);
  gameIntervals = [];
}

function changePhase() {
  clearGameArea();
  gameRunning = false;

  const phase = phases[currentPhase];
  game.style.background = `url('${phase.background}') no-repeat center center / cover`;
  phaseDisplay.textContent = `Fase: ${currentPhase + 1}`;
  updateHUD();

  showInstructions();
}

function startDropping() {
  const phase = phases[currentPhase];
  gameIntervals.push(setInterval(() => dropItem(phase), phase.dropInterval));
}

function updateHUD() {
  scoreDisplay.textContent = `Pontuação: ${score}`;
  livesDisplay.textContent = `Vidas: ${lives}`;
  phaseDisplay.textContent = `Fase: ${currentPhase + 1}`;
}

function dropItem(phase) {
  if (!gameRunning) return;

  const isGood = Math.random() < 0.7;
  const itemSrc = isGood
    ? phase.goodItems[Math.floor(Math.random() * phase.goodItems.length)]
    : phase.badItems[Math.floor(Math.random() * phase.badItems.length)];

  const item = document.createElement('div');
  item.classList.add('item');
  item.style.backgroundImage = `url('${itemSrc}')`;
  item.style.left = Math.random() * (window.innerWidth - 80) + 'px';
  item.style.top = '-90px'; 
  game.appendChild(item);

  const fall = setInterval(() => {
    if (!document.body.contains(item)) return clearInterval(fall);
    const currentTop = parseInt(item.style.top);
    item.style.top = currentTop + phase.fallSpeed + 'px';

    if (currentTop > window.innerHeight) {
      item.remove();
      clearInterval(fall);
    }

    const itemRect = item.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      itemRect.bottom > playerRect.top &&
      itemRect.top < playerRect.bottom &&
      itemRect.left < playerRect.right &&
      itemRect.right > playerRect.left
    ) {
      if (isGood) {
        score++;
        if (score % 10 === 0 && currentPhase < phases.length - 1) {
          currentPhase++;
          changePhase();
        }
      } else {
        lives--;
        if (lives <= 0) {
          alert('Fim de jogo!');
          location.reload();
        }
      }
      updateHUD();
      item.remove();
      clearInterval(fall);
    }
  }, 20);
}

function movePlayer() {
  if (keysPressed['ArrowLeft'] || keysPressed['a']) playerX -= playerSpeed;
  if (keysPressed['ArrowRight'] || keysPressed['d']) playerX += playerSpeed;

  playerX = Math.max(0, Math.min(playerX, window.innerWidth - player.offsetWidth));
  player.style.left = playerX + 'px';
  requestAnimationFrame(movePlayer);
}

updateHUD();
changePhase();
movePlayer();
