let paddle;
let ball;
let ballTexture;
let paddleTexture;
let gameIsOver = false;
let blocks = [];
let gameOverTime;
let gameOverDuration = 3000;
let gameStarted = false;
let startButton;

function preload() {
  // Replace 'ball_texture.png' with your own image file path for the ball
  ballTexture = loadImage('https://i.ibb.co/4ttDmkd/RKD-logo-redball.png'); 
  
  // Replace 'paddle_texture.png' with your own image file path for the paddle
  paddleTexture = loadImage('https://i.ibb.co/2qDTZpb/bt.png'); 
}

function setup() {
  createCanvas(800, 600);
  
  paddle = new Paddle();
  ball = new Ball();
  
  startButton = createButton('Start Game (Use arrow keys for paddle)');
  startButton.position(width / 2 - startButton.width / 2, height + 20);
  startButton.mousePressed(startGame);
  startButton.style('font-size', '20px');
  startButton.style('background-color', '#D50032');
  startButton.style('color', '#FFFFFF');
  startButton.style('border', 'none');
  startButton.style('padding', '10px 20px');
}

function startGame() {
  gameStarted = true;
  startButton.hide();
  
  // Generate blocks
  let rows = 5;
  let cols = 10;
  let blockWidth = width / cols;
  let blockHeight = 30;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x = c * blockWidth;
      let y = r * blockHeight;
      blocks.push(new Block(x, y, blockWidth, blockHeight));
    }
  }
}

function draw() {
  background(255);
  
  if (gameStarted) {
    if (!gameIsOver) {
      paddle.move();
      paddle.display();

      ball.move();
      ball.bounceOffPaddle(paddle);
      ball.display();

      // Check for collisions with blocks
      for (let block of blocks) {
        if (block.isHit(ball)) {
          ball.bounceOffBlock(block);
          block.hit = true;
        }
      }

      // Display blocks
      for (let block of blocks) {
        block.display();
      }

      // Check for win condition
      if (blocks.every(block => block.hit)) {
        showWinMessage();
      }

      if (ball.isOutOfScreen()) {
        gameOver();
      }
    } else {
      if (millis() - gameOverTime > gameOverDuration) {
        resetGame();
      }
    }
  }
  
  drawFrame();
}

function drawFrame() {
  let frameThickness = 2;
  fill(0);
  rect(0, 0, width, frameThickness); // Top
  rect(0, 0, frameThickness, height); // Left
  rect(width - frameThickness, 0, frameThickness, height); // Right
	rect(0, height - frameThickness, width, frameThickness); // Bottom
}

function gameOver() {
  gameIsOver = true;
  gameOverTime = millis();
  
  textSize(32);
  fill(255, 0, 0);
  text("Game Over", width / 2 - 100, height / 2);
}

function showWinMessage() {
  textSize(32);
  fill(0, 255, 0);
  text("You Win!", width / 2 - 80, height / 2);
}

function resetGame() {
  gameIsOver = false;
  ball = new Ball();
  paddle = new Paddle();
  
  // Reset the blocks
  blocks = [];
  startGame();
}

class Block {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.hit = false;
  }
	isHit(ball) {
    return (ball.x > this.x && ball.x < this.x + this.width &&
            ball.y > this.y && ball.y < this.y + this.height && !this.hit);
  }
	display() {
    if (!this.hit) {
      fill('#D50032'); // Red color for the blocks
      rect(this.x, this.y, this.width, this.height);
    }
  }
	getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }
}
class Paddle {
  constructor() {
    this.width = 200;
    this.height = 30;
    this.x = (width - this.width) / 2;
    this.y = height - this.height - 10;
    this.speed = 10;
    this.movingLeft = false;
    this.movingRight = false;
  }

  move() {
    if ((keyIsDown(LEFT_ARROW) || this.movingLeft) && this.x > 10) {
      this.x -= this.speed;
    } else if ((keyIsDown(RIGHT_ARROW) || this.movingRight) && this.x < width - this.width - 10) {
      this.x += this.speed;
    }
  }

  display() {
    // Use the custom image texture for the paddle
    image(paddleTexture, this.x, this.y, this.width, this.height);
  }
}

class Ball {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.radius = 20;
    this.speedX = 5;
    this.speedY = -5;
  }

  move() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 10 + this.radius || this.x > width - 10 - this.radius) {
      this.speedX = -this.speedX;
    }
    
    if (this.y < 10 + this.radius) {
      this.speedY = -this.speedY;
    }
	  if (this.x < 10 + this.radius || this.x > width - 10 - this.radius) {
  this.speedX = -this.speedX;
  // Add a small random value to speedX to make the bounce less predictable
  this.speedX += random(-1, 1);
  // Keep the ball within the bounds of the screen
  this.x = constrain(this.x, 10 + this.radius, width - 10 - this.radius);
}
  }

  bounceOffPaddle(paddle) {
    if (this.y + this.radius > paddle.y && this.y < paddle.y + paddle.height && 
        this.x > paddle.x && this.x < paddle.x + paddle.width) {
      this.speedY = -abs(this.speedY);
      this.speedX += (this.x - (paddle.x + paddle.width / 2)) * 0.05;
      this.speedY *= 1.05; // Increase speed after each bounce
    }
  }

  bounceOffBlock(block) {
    let ballLeft = this.x - this.radius;
    let ballRight = this.x + this.radius;
    let ballTop = this.y - this.radius;
    let ballBottom = this.y + this.radius;

    let blockBounds = block.getBounds();

    // Check which side of the block the ball has hit
    let hitFromLeft = ballRight - blockBounds.left;
    let hitFromRight = blockBounds.right - ballLeft;
    let hitFromTop = ballBottom - blockBounds.top;
    let hitFromBottom = blockBounds.bottom - ballTop;

    let minHit = Math.min(hitFromLeft, hitFromRight, hitFromTop, hitFromBottom);

    // Handle the collision based on the side of impact
    switch (minHit) {
      case hitFromLeft:
        this.speedX = -abs(this.speedX);
        break;
      case hitFromRight:
        this.speedX = abs(this.speedX);
        break;
      case hitFromTop:
        this.speedY = -abs(this.speedY);
        break;
      case hitFromBottom:
        this.speedY = abs(this.speedY);
        break;
    }
  }

  isOutOfScreen() {
    return this.y > height + this.radius;
  }

  display() {
    image(ballTexture, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
  }
}


function mousePressed() {
  if (mouseX > paddle.x && mouseX < paddle.x + paddle.width && mouseY > paddle.y && mouseY < paddle.y + paddle.height) {
    if (mouseX < paddle.x + paddle.width / 2) {
      paddle.movingLeft = true;
    } else {
      paddle.movingRight = true;
    }
  }
}

function mouseReleased() {
  paddle.movingLeft = false;
  paddle.movingRight = false;
}
