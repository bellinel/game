// WebSocket setup
const socket = new WebSocket('ws://178.172.187.99:3000');
let playerId = null;
let remotePlayer = null;

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'init') {
        playerId = data.playerId;
        if (playerId === 'player1') {
            remotePlayer = player2;
        } else {
            remotePlayer = player1;
        }
    } else if (data.type === 'state') {
        Object.assign(remotePlayer, data.player);
    }
};

function sendState() {
    if (!playerId) return;
    const localPlayer = playerId === 'player1' ? player1 : player2;
    socket.send(JSON.stringify({ type: 'state', player: localPlayer }));
}

// Game setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerSize = 50;
const bulletSize = 10;
const playerSpeed = 5;
const bulletSpeed = 7;
const maxBullets = 5;

const keys = {};

let player1Image = new Image();
player1Image.src = 'player1.png';

let player2Image = new Image();
player2Image.src = 'player2.png';

let player1, player2;
resetGame();

function resetGame() {
    player1 = { x: 100, y: 275, name: 'malchik zvezda', bullets: [], health: 5 };
    player2 = { x: 650, y: 275, name: 'farsunkk', bullets: [], health: 5 };
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && !keys['_spaceHeld']) {
        shoot(player1, 1);
        keys['_spaceHeld'] = true;
    }
    if (e.key === 'Enter' && !keys['_enterHeld']) {
        shoot(player2, -1);
        keys['_enterHeld'] = true;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (e.key === ' ') keys['_spaceHeld'] = false;
    if (e.key === 'Enter') keys['_enterHeld'] = false;
});

function shoot(player, direction) {
    if (player.bullets.length < maxBullets) {
        player.bullets.push({ x: player.x + playerSize / 2, y: player.y + playerSize / 2, dir: direction });
    }
}

function handleInput() {
    // Ограничения для player1 (левая сторона)
    if (keys['w'] && player1.y > 0) player1.y -= playerSpeed;
    if (keys['s'] && player1.y + playerSize < 600) player1.y += playerSpeed;
    if (keys['a'] && player1.x > 0) player1.x -= playerSpeed;
    if (keys['d'] && player1.x + playerSize < 400) player1.x += playerSpeed; // ограничение по центру

    // Ограничения для player2 (правая сторона)
    if (keys['ArrowUp'] && player2.y > 0) player2.y -= playerSpeed;
    if (keys['ArrowDown'] && player2.y + playerSize < 600) player2.y += playerSpeed;
    if (keys['ArrowLeft'] && player2.x > 400) player2.x -= playerSpeed; // ограничение по центру
    if (keys['ArrowRight'] && player2.x + playerSize < 800) player2.x += playerSpeed;
}

function update() {
    player1.bullets.forEach(b => b.x += bulletSpeed * b.dir);
    player2.bullets.forEach(b => b.x += bulletSpeed * b.dir);

    player1.bullets = player1.bullets.filter(b => {
        if (b.x > player2.x && b.x < player2.x + playerSize && b.y > player2.y && b.y < player2.y + playerSize) {
            player2.health -= 1;
            return false;
        }
        return b.x < 800 && b.x > 0;
    });

    player2.bullets = player2.bullets.filter(b => {
        if (b.x > player1.x && b.x < player1.x + playerSize && b.y > player1.y && b.y < player1.y + playerSize) {
            player1.health -= 1;
            return false;
        }
        return b.x < 800 && b.x > 0;
    });

    sendState();
}

function drawPlayer(player, image) {
    if (image.complete) {
        ctx.drawImage(image, player.x, player.y, playerSize, playerSize);
    } else {
        ctx.fillStyle = 'gray';
        ctx.fillRect(player.x, player.y, playerSize, playerSize);
    }

    player.bullets.forEach(b => {
        ctx.fillStyle = 'black';
        ctx.fillRect(b.x, b.y, bulletSize, bulletSize);
    });

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`${player.name} HP: ${player.health}`, player.x, player.y - 10);
}

let gameOver = false;
let gameOverTime = 0;

function gameLoop(timestamp) {
    ctx.clearRect(0, 0, 800, 600);
    handleInput();

    ctx.strokeStyle = 'gray';
    ctx.beginPath();
    ctx.moveTo(400, 0);
    ctx.lineTo(400, 600);
    ctx.stroke();

    if (!gameOver) {
        update();
        drawPlayer(player1, player1Image);
        drawPlayer(player2, player2Image);

        if (player1.health <= 0 || player2.health <= 0) {
            gameOver = true;
            gameOverTime = timestamp;
            const winner = player1.health <= 0 ? player2.name : player1.name;
            ctx.fillStyle = 'black';
            ctx.font = '30px Arial';
            ctx.fillText(`${winner} wins!`, 320, 300);
        }
    } else {
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText('Restarting in 3 seconds...', 310, 340);
        if (timestamp - gameOverTime > 3000) {
            resetGame();
            gameOver = false;
        }
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
