// Litir og Canvas
const colorRed = 'rgba(255, 0, 0, 1)';
const colorBlue = 'rgba(0, 255, 255, 1)';
const colorYellow = 'rgba(255, 206, 86, 1)';
const colorOrange = 'rgba(255, 140, 0, 1)';
const colorPink = 'rgba(255, 0, 255, 1)';

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.width = 1520;
canvas.height = 675;

let gameOver = false;

// Líf function
let lives = 3;

function updateLivesDisplay() {
    const livesDisplay = document.getElementById('lives');
    livesDisplay.textContent = lives;
}

function loseLife() {
    if (lives <= 0){
        lives === 0;
    }
    lives--;
    console.log('Lives remaining:', lives);
    updateLivesDisplay();
}

updateLivesDisplay();

// Pacman
const pacmanShape = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    mouthOpen: false,
    angle: 0,
    speed: 3,
    direction: 'right',
    mouthTimer: 0,
    draw: function () {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "darkBlue";
        ctx.fill();

        ctx.beginPath();
        if (this.mouthOpen) {
            ctx.arc(0, 0, this.radius, 0.2 * Math.PI, 1.8 * Math.PI);
        } else {
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        }

        ctx.lineTo(0, 0);
        ctx.fillStyle = "rgb(255, 255, 0)";
        ctx.fill();
        let eyeRadius = 3;
        const eyeX = this.radius / 3;
        const eyeY = -this.radius / 1.5;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();

        ctx.restore();

    },
    move: function () {
        let newX = this.x;
        let newY = this.y;

        if (this.direction === 'right') {
            newX += this.speed;
        } else if (this.direction === 'left') {
            newX -= this.speed;
        } else if (this.direction === 'up') {
            newY -= this.speed;
        } else if (this.direction === 'down') {
            newY += this.speed;
        }

        if (newX - this.radius >= 0 && newX + this.radius <= canvas.width) {
            this.x = newX;
        }
        if (newY - this.radius >= 0 && newY + this.radius <= canvas.height) {
            this.y = newY;
        }

        this.mouthTimer += 1;
        if (this.mouthTimer % 25 === 0) {
            this.mouthOpen = !this.mouthOpen;
        }
    },
};

function createBall(color) {
    return {
        x: Math.random() * (canvas.width - 2 * pacmanShape.radius) + pacmanShape.radius,
        y: Math.random() * (canvas.height - 2 * pacmanShape.radius) + pacmanShape.radius,
        radius: pacmanShape.radius,
        color: color,
        isTouched: false,
    };
}

class Ghost {
    constructor(color) {
        this.color = color;
        this.radius = 35;
        this.isTouched = false;
        this.sprite = new Image();
        this.sprite.onload = () => {
            console.log(`Ghost ${color} loaded.`);
            this.spawn();
        };
        this.sprite.src = `ghost${color}.png`;
    }

    spawn() {
        // Set initial random position on the canvas
        this.x = Math.random() * (canvas.width - 2 * this.radius) + this.radius;
        this.y = Math.random() * (canvas.height - 2 * this.radius) + this.radius;

        // Set initial random velocity
        this.vx = (Math.random() < 0.5 ? -1 : 1) * moveSpeed;
        this.vy = (Math.random() < 0.5 ? -1 : 1) * moveSpeed;
    }

    move() {
        // Update Ghost's position based on the velocity
        this.x += this.vx;
        this.y += this.vy;

        // Check if Ghost hits the canvas boundaries
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width || this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            // Change direction randomly within a 120° angle in the opposite direction
            const angle = Math.atan2(this.vy, this.vx);
            const newAngle = angle + Math.PI + Math.random() * (1.5 * Math.PI / 3.5); // 120° angle in the opposite direction
            this.vx = moveSpeed * Math.cos(newAngle);
            this.vy = moveSpeed * Math.sin(newAngle);
        }
    }

    draw() {
        ctx.drawImage(this.sprite, this.x - this.radius, this.y - this.radius, 2 * this.radius, 2 * this.radius);
    }
}

// Create Ghost objects
const blinky = new Ghost('red');
const pinky = new Ghost('pink');
const inky = new Ghost('cyan');
const clyde = new Ghost('orange');


class Dot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = colorYellow;
        this.isCollected = false;
    }
}

// Dots
const dots = [];
const dotRadius = 5;
const maxDots = 50;

// Function to create random dots
function createRandomDots() {
    // Assuming these elements exist, or use static values for testing
    const livesCounterHeight = document.getElementById('lives-counter').offsetHeight || 0;
    const pointsCounterWidth = document.getElementById('points-counter').offsetWidth || 0;

    for (let i = 0; i < maxDots; i++) {
        const dot = new Dot(
            Math.random() * (canvas.width - 40) + 20,
            Math.random() * (canvas.height - livesCounterHeight - 40) + 20 + livesCounterHeight
        );
        dots.push(dot);
    }
}

// Function to draw dots
function drawDots() {
    dots.forEach((dot) => {
        if (!dot.isCollected) {
            ctx.beginPath();
            ctx.fillStyle = dot.color;
            ctx.arc(dot.x, dot.y, dotRadius, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

// Function to check collision with dots
function checkDotCollision() {
    dots.forEach((dot) => {
        if (!dot.isCollected) {
            const distance = Math.sqrt(Math.pow(pacmanShape.x - dot.x, 2) + Math.pow(pacmanShape.y - dot.y, 2));

            if (distance < pacmanShape.radius + dotRadius) {
                dot.isCollected = true;
                updatePoints(1);
            }
        }
    });
}

// Points
let points = 0;

function updatePoints(amount) {
    points += amount;
    const pointsDisplay = document.getElementById('points');
    pointsDisplay.textContent = points;
    console.log("Points amount:", points);
}

// Initialize dots
createRandomDots();

function checkWinCondition() {
    if (points === 50 || lives <= 0) {
        pacmanShape.radius = 0; 
        pacmanShape.speed = 0;
        pacmanShape.eyeRadius = 0;
        gameOver = true;  // Set gameOver to true
        const winMessage = document.getElementById('message');
        winMessage.style.display = 'block';
    }
}

let moveSpeed = 2;

// Game loop 
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    blinky.move();
    blinky.draw();

    pinky.move();
    pinky.draw();

    inky.move();
    inky.draw();

    clyde.move();
    clyde.draw();

    pacmanShape.move();
    pacmanShape.draw();

    drawDots();
    checkDotCollision();

    // Check collision with all Ghosts
    checkGhostCollision(blinky);
    checkGhostCollision(pinky);
    checkGhostCollision(inky);
    checkGhostCollision(clyde);

    checkWinCondition();

    // Request the next animation frame
    requestAnimationFrame(update);
}
// Function to check collision with a Ghost
function checkGhostCollision(ghost) {
    if (!gameOver) {
        const distanceToGhost = Math.sqrt(
            Math.pow(pacmanShape.x - ghost.x, 2) + Math.pow(pacmanShape.y - ghost.y, 2)
        );

        if (distanceToGhost < pacmanShape.radius + ghost.radius && !ghost.isTouched) {
            // Add collision handling logic for Ghosts here

            // Trigger loseLife only once
            if (!ghost.isTouched) {
                ghost.isTouched = true;
                loseLife();
            }

            pacmanShape.x = canvas.width / 2;
            pacmanShape.y = canvas.height / 2;

            ghost.spawn();
        }

        if (distanceToGhost >= pacmanShape.radius + ghost.radius) {
            ghost.isTouched = false;
        }
    }
}


document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        pacmanShape.direction = 'right';
        pacmanShape.angle = 0;
    } else if (event.key === 'ArrowLeft') {
        pacmanShape.direction = 'left';
        pacmanShape.angle = Math.PI;
    } else if (event.key === 'ArrowUp') {
        pacmanShape.direction = 'up';
        pacmanShape.angle = 1.5 * Math.PI;
    } else if (event.key === 'ArrowDown') {
        pacmanShape.direction = 'down';
        pacmanShape.angle = 0.5 * Math.PI;
    }
});

    
// Initial update call
update();
