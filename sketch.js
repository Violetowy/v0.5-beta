let player;
let zombies = [];
let bullets = [];
let lastShotTime = 0;
let shotCooldown = 1500; // 1.5 seconds
let bulletSpeed = 5;
let points = 0;
let level = 1;
const MAX_LEVELS = 100;
let gameOver = false;
let gameLost = false;
let showShop = false;
let retryButton, exitButton, shopButton, smgButton, rifleButton, minigunButton;

function setup() {
    createCanvas(windowWidth, windowHeight);
    startNewGame();
}

function draw() {
    background(0);
    if (gameOver) {
        showGameOverMenu();
        return;
    }
    if (showShop) {
        showShopMenu();
        return;
    }

    player.move();
    player.display();

    for (let bullet of bullets) {
        bullet.move();
        bullet.display();
    }

    for (let zombie of zombies) {
        zombie.move();
        zombie.display();
    }

    checkCollisions();
    checkPlayerCollision();
    checkLevelCompletion();

    fill(255);
    textSize(24);
    text(`Points: ${points}`, 10, 30);
    text(`Level: ${level}`, 10, 60);
}

function mousePressed() {
    if (gameOver || showShop) return;
    let currentTime = millis();
    if (currentTime - lastShotTime > shotCooldown) {
        bullets.push(new Bullet(player.x, player.y, mouseX, mouseY, bulletSpeed));
        if (shotCooldown === 1000) {
            // Double shot for SMG
            bullets.push(new Bullet(player.x, player.y, mouseX, mouseY + 10, bulletSpeed));
        }
        lastShotTime = currentTime;
    }
}

function checkCollisions() {
    for (let i = zombies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (dist(zombies[i].x, zombies[i].y, bullets[j].x, bullets[j].y) < 20) {
                zombies.splice(i, 1);
                bullets.splice(j, 1);
                points += 3;
                break;
            }
        }
    }
}

function checkPlayerCollision() {
    for (let zombie of zombies) {
        if (dist(zombie.x, zombie.y, player.x, player.y) < 20) {
            gameOver = true;
            gameLost = true;
            break;
        }
    }
}

function checkLevelCompletion() {
    if (zombies.length === 0 && level < MAX_LEVELS) {
        if (level % 20 === 0) {
            showShop = true;
        } else {
            level++;
            spawnZombies(level);
        }
    } else if (level === MAX_LEVELS && zombies.length === 0) {
        gameOver = true;
    }
}

function spawnZombies(count) {
    for (let i = 0; i < count; i++) {
        zombies.push(new Zombie(random(width), random(height)));
    }
}

function showGameOverMenu() {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    if (gameLost) {
        text("Przegrałeś", width / 2, height / 2 - 80);
    } else {
        text("Zgłoś się do Silvera po range", width / 2, height / 2 - 80);
    }

    if (!retryButton) {
        retryButton = createButton('Od nowa');
        retryButton.position(width / 2 - 50, height / 2 - 10);
        retryButton.mousePressed(() => {
            gameOver = false;
            gameLost = false;
            removeButtons();
            startNewGame();
        });
    }

    if (!exitButton) {
        exitButton = createButton('Wyjdź');
        exitButton.position(width / 2 - 50, height / 2 + 30);
        exitButton.mousePressed(() => window.close());
    }
}

function showShopMenu() {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Sklep", width / 2, height / 2 - 100);

    textSize(24);
    text(`Punkty: ${points}`, width / 2, height / 2 - 60);

    if (!smgButton) {
        smgButton = createButton('SMG (100 punktów)');
        smgButton.position(width / 2 - 100, height / 2 - 20);
        smgButton.mousePressed(() => {
            if (points >= 100) {
                points -= 100;
                shotCooldown = 1000;
                bulletSpeed = 7;
                removeButtons();
                startNextLevel();
            }
        });
    }

    if (!rifleButton) {
        rifleButton = createButton('Karabin (500 punktów)');
        rifleButton.position(width / 2 - 100, height / 2 + 20);
        rifleButton.mousePressed(() => {
            if (points >= 500) {
                points -= 500;
                shotCooldown = 500;
                bulletSpeed = 10;
                removeButtons();
                startNextLevel();
            }
        });
    }

    if (!minigunButton) {
        minigunButton = createButton('Minigun (1500 punktów)');
        minigunButton.position(width / 2 - 100, height / 2 + 60);
        minigunButton.mousePressed(() => {
            if (points >= 1500) {
                points -= 1500;
                shotCooldown = 200;
                bulletSpeed = 15;
                removeButtons();
                startNextLevel();
            }
        });
    }
}

function removeButtons() {
    if (retryButton) {
        retryButton.remove();
        retryButton = null;
    }
    if (exitButton) {
        exitButton.remove();
        exitButton = null;
    }
    if (smgButton) {
        smgButton.remove();
        smgButton = null;
    }
    if (rifleButton) {
        rifleButton.remove();
        rifleButton = null;
    }
    if (minigunButton) {
        minigunButton.remove();
        minigunButton = null;
    }
}

function startNewGame() {
    player = new Player();
    bullets = [];
    zombies = [];
    points = 0;
    level = 1;
    shotCooldown = 1500;
    bulletSpeed = 5;
    spawnZombies(level);
}

function startNextLevel() {
    showShop = false;
    spawnZombies(level);
}

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height / 2;
        this.size = 20;
    }

    move() {
        if (keyIsDown(87)) this.y -= 2; // W
        if (keyIsDown(83)) this.y += 2; // S
        if (keyIsDown(65)) this.x -= 2; // A
        if (keyIsDown(68)) this.x += 2; // D
    }

    display() {
        fill(0, 0, 255);
        ellipse(this.x, this.y, this.size);
    }
}

class Zombie {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
    }

    move() {
        let angle = atan2(player.y - this.y, player.x - this.x);
        this.x += cos(angle);
        this.y += sin(angle);
    }

    display() {
        fill(255, 0, 0);
        ellipse(this.x, this.y, this.size);
    }
}

class Bullet {
    constructor(x, y, targetX, targetY, speed) {
        this.x = x;
        this.y = y;
        this.size = 5;
        let angle = atan2(targetY - y, targetX - x);
        this.vx = cos(angle) * speed;
        this.vy = sin(angle) * speed;
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;
    }

    display() {
        fill(255, 255, 0);
        ellipse(this.x, this.y, this.size);
    }
}
