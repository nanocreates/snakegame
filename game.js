// Game variables
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let gameLoop;
let score = 0;
let gridSize = 20;
let gameSpeed = 100;
let playerName = '';
let isPaused = false;
let isFirstGame = true;
let virtualControlsEnabled = false;

// Add these variables at the top with other game variables
const GAME_SPEEDS = {
    easy: 120,
    medium: 100,
    hard: 70
};

// Initialize the game
window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    setupVirtualControls();
    initializeGame();
};

function initializeGame() {
    // Initialize snake
    snake = [
        {x: 200, y: 200},
        {x: 180, y: 200},
        {x: 160, y: 200},
    ];
    
    // Create initial food
    createFood();
    
    // Set up keyboard controls
    document.addEventListener('keydown', changeDirection);
}

function startGame() {
    if (gameLoop) clearInterval(gameLoop);
    score = 0;
    document.getElementById('score').textContent = score;
    
    // Update button text based on first game or replay
    const startButton = document.getElementById('startButton');
    startButton.textContent = 'Replay';
    
    // Show pause button
    document.getElementById('pauseButton').style.display = 'inline-block';
    
    isPaused = false;
    document.getElementById('pauseButton').textContent = 'Pause';
    
    // Get selected game mode speed
    const mode = document.getElementById('game-mode').value;
    gameSpeed = GAME_SPEEDS[mode];
    
    initializeGame();
    gameLoop = setInterval(gameStep, gameSpeed);
    isFirstGame = false;
}

function gameStep() {
    if (isPaused) return;
    
    // Move snake
    let head = {x: snake[0].x, y: snake[0].y};
    
    switch(direction) {
        case 'right': head.x += gridSize; break;
        case 'left': head.x -= gridSize; break;
        case 'up': head.y -= gridSize; break;
        case 'down': head.y += gridSize; break;
    }
    
    // Check collisions
    if (isCollision(head)) {
        gameOver();
        return;
    }
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        createFood();
    } else {
        snake.pop();
    }
    
    snake.unshift(head);
    drawGame();
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    ctx.fillStyle = '#4CAF50';
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, gridSize-2, gridSize-2);
    });
    
    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(food.x, food.y, gridSize-2, gridSize-2);
}

function createFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width/gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height/gridSize)) * gridSize
    };
    
    // Make sure food doesn't appear on snake
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * (canvas.width/gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height/gridSize)) * gridSize
        };
    }
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const goingUp = direction === 'up';
    const goingDown = direction === 'down';
    const goingRight = direction === 'right';
    const goingLeft = direction === 'left';
    
    if (keyPressed === 37 && !goingRight) direction = 'left';
    if (keyPressed === 38 && !goingDown) direction = 'up';
    if (keyPressed === 39 && !goingLeft) direction = 'right';
    if (keyPressed === 40 && !goingUp) direction = 'down';
}

function isCollision(head) {
    // Wall collision
    if (head.x < 0 || head.x >= canvas.width || 
        head.y < 0 || head.y >= canvas.height) {
        return true;
    }
    
    // Self collision
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
}

function gameOver() {
    clearInterval(gameLoop);
    // Hide pause button instead of disabling it
    document.getElementById('pauseButton').style.display = 'none';
    alert(`Game Over, ${playerName}! Your score: ${score}`);
}

function setNickname() {
    const nicknameInput = document.getElementById('nickname-input');
    const nickname = nicknameInput.value.trim();
    
    if (nickname) {
        playerName = nickname;
        setupGameDisplay();
    } else {
        if (confirm('No nickname entered. Would you like to play as Guest?')) {
            playAsGuest();
        }
    }
}

function togglePause() {
    isPaused = !isPaused;
    const pauseButton = document.getElementById('pauseButton');
    
    if (isPaused) {
        clearInterval(gameLoop);
        pauseButton.textContent = 'Resume';
    } else {
        gameLoop = setInterval(gameStep, gameSpeed);
        pauseButton.textContent = 'Pause';
    }
}

function playAsGuest() {
    playerName = 'Guest';
    setupGameDisplay();
}

// Add new function to handle game display setup
function setupGameDisplay() {
    const mode = document.getElementById('game-mode').value;
    document.getElementById('player-name').textContent = playerName;
    
    // Update score container to include mode
    const scoreContainer = document.querySelector('.score-container');
    if (!document.querySelector('.mode-display')) {
        const modeDisplay = document.createElement('div');
        modeDisplay.className = 'mode-display';
        modeDisplay.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
        scoreContainer.appendChild(modeDisplay);
    }
    
    document.getElementById('nickname-section').style.display = 'none';
    document.getElementById('game-section').style.display = 'block';
    
    // Show virtual controls if enabled
    if (virtualControlsEnabled) {
        document.getElementById('virtual-controls').style.display = 'block';
    }
}

// Add this function to handle virtual controls setup
function setupVirtualControls() {
    const virtualControlsToggle = document.getElementById('virtual-controls-toggle');
    const virtualControls = document.getElementById('virtual-controls');
    
    virtualControlsToggle.addEventListener('change', (e) => {
        virtualControlsEnabled = e.target.checked;
        virtualControls.style.display = virtualControlsEnabled ? 'block' : 'none';
    });

    // Setup virtual arrow keys
    const arrowKeys = {
        'up-key': 38,    // Up arrow key code
        'down-key': 40,  // Down arrow key code
        'left-key': 37,  // Left arrow key code
        'right-key': 39  // Right arrow key code
    };

    // Handle touch events for virtual keys
    Object.keys(arrowKeys).forEach(keyId => {
        const button = document.getElementById(keyId);
        
        // Handle both touch and click events
        ['touchstart', 'mousedown'].forEach(eventType => {
            button.addEventListener(eventType, (e) => {
                e.preventDefault();
                const event = new KeyboardEvent('keydown', {
                    keyCode: arrowKeys[keyId]
                });
                document.dispatchEvent(event);
            });
        });
    });
} 