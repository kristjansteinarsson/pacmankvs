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

        // Additional boundary checks
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
  
// -- TURN INTO CLASS --
let redBall = createBall(colorRed);
let orangeBall = createBall(colorOrange);
let blueBall = createBall(colorBlue);
let pinkBall = createBall(colorPink);

// Dots -- TURN INTO CLASS --
const dots = [];
const dotRadius = 5;
const maxDots = 50;

// Function to create random dots
function createRandomdots() {
    const livesCounterHeight = document.getElementById('lives-counter').offsetHeight;
    const pointsCounterWidth = document.getElementById('points-counter').offsetWidth;

    for (let i = 0; i < maxDots; i++) {
        const dot = {
            x: Math.random() * (canvas.width - 40) + 20,
            y: Math.random() * (canvas.height - livesCounterHeight - 40) + 20 + livesCounterHeight,
            color: colorYellow,
            isCollected: false,
        };
        dots.push(dot);
    }
}

// Function to draw dots
function drawdots() {
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
function checkdotCollision() {
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
createRandomdots();

function checkWinCondition() {
    if (points === 50 || lives <= 0) {
        pacmanShape.radius = 0; 
        redBall.radius = 0;
        blueBall.radius = 0;
        pinkBall.radius = 0;
        orangeBall.radius = 0;
        
        const winMessage = document.getElementById('message');
        winMessage.style.display = 'block';
    }
} 

let moveSpeed = 3.5;

function moveBallRandomly(ball) {
    // If the ball doesn't have a velocity, generate a random one
    if (!ball.vx || !ball.vy) {
        ball.vx = moveSpeed;
        ball.vy = moveSpeed;
    }

    // Update ball's position based on the velocity
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Reflect the ball if it hits the canvas boundaries
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.vx = -ball.vx;
    }
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.vy = -ball.vy;
    }
}


function moveBallsRandomly() {
    moveBallRandomly(redBall);
    moveBallRandomly(blueBall);
    moveBallRandomly(pinkBall);
    moveBallRandomly(orangeBall);

    // Request the next animation frame
    requestAnimationFrame(moveBallsRandomly);
}

// Start the animation loop
moveBallsRandomly();


// Game loop 
function update() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pacmanShape.move();
    pacmanShape.draw();
  
    drawBall(redBall);
    drawBall(orangeBall);
    drawBall(blueBall);
    drawBall(pinkBall);
  
    drawdots();
    checkdotCollision();
  
    // Check collision with all balls
    checkBallCollision(redBall);
    checkBallCollision(orangeBall);
    checkBallCollision(blueBall);
    checkBallCollision(pinkBall);
  
    checkWinCondition();

    // Request the next animation frame
    requestAnimationFrame(update);
}

  // Function to draw a ball
  function drawBall(ball) {
    ctx.beginPath();
    ctx.fillStyle = ball.color;
    ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
  
// Function to check collision with a ball
function checkBallCollision(ball) {
    const distanceToBall = Math.sqrt(
        Math.pow(pacmanShape.x - ball.x, 2) + Math.pow(pacmanShape.y - ball.y, 2)
    );
  
    if (distanceToBall < pacmanShape.radius + ball.radius && !ball.isTouched) {
        // Move all balls away from Pacman's position
        redBall.x += (ball.x - pacmanShape.x) * 2;
        redBall.y += (ball.y - pacmanShape.y) * 2;
        
        orangeBall.x += (ball.x - pacmanShape.x) * 2;
        orangeBall.y += (ball.y - pacmanShape.y) * 2;
        
        blueBall.x += (ball.x - pacmanShape.x) * 2;
        blueBall.y += (ball.y - pacmanShape.y) * 2;
        
        pinkBall.x += (ball.x - pacmanShape.x) * 2;
        pinkBall.y += (ball.y - pacmanShape.y) * 2;
    
        // Trigger loseLife only once
        if (!ball.isTouched) {
            ball.isTouched = true;
            loseLife();
        }
    
        // Move Pacman back to the center
        pacmanShape.x = canvas.width / 2;
        pacmanShape.y = canvas.height / 2;
    
        // Move the balls to new random positions
        redBall = createBall(colorRed);
        orangeBall = createBall(colorOrange);
        blueBall = createBall(colorBlue);
        pinkBall = createBall(colorPink);
    }
  
    // Reset the flag when Pacman is not colliding with the ball
    if (distanceToBall >= pacmanShape.radius + ball.radius) {
        ball.isTouched = false;
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
