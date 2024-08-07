let player;
let bullets = [];
let zombies = [];
let score = 0;
let level = 1;
let points = 0;
let playerSpeed = 2;
let bulletCooldown = 1500;
let lastShot = 0;
let gameOver = false;
let shop = false;
let weapon = 'pistol';
let resetButton, quitButton, smgButton, rifleButton, minigunButton;

function setup() {
    createCanvas(windowWidth, windowHeight);
    player = new Player();
    spawnZombies(5);
}

function draw() {
    if (gameOver) {
        background(255);
        textSize(32);
        fill(0);
        textAlign(CENTER, CENTER);
        text('Przegrałeś', width / 2, height / 2 - 40);
        textSize(24);
        text('Punkty: ' + score, width / 2, height / 2);
        text('Level: ' + level, width / 2, height / 2 + 40);

        if (!resetButton) {
            resetButton = createButton('Od nowa');
            resetButton.position(width / 2 - 50, height / 2 + 80);
            resetButton.mousePressed(resetGame);
        }

        if (!quitButton) {
            quitButton = createButton('Wyjdz');
            quitButton.position(width / 2 - 50, height / 2 + 120);
            quitButton.mousePressed(closeGame);
        }

        noLoop();
        return;
    }

    if (shop) {
        background(255);
        textSize(32);
        fill(0);
        textAlign(CENTER, CENTER);
        text('Sklep', width / 2, height / 2 - 80);
        textSize(24);
        text('Punkty: ' + points, width / 2, height / 2 - 40);

        if (!smgButton) {
            smgButton = createButton('SMG (100 pkt)');
            smgButton.position(width / 2 - 50, height / 2);
            smgButton.mousePressed(() => buyWeapon('smg', 100));
        }

        if (!rifleButton) {
            rifleButton = createButton('Karabin (500 pkt)');
            rifleButton.position(width / 2 - 50, height / 2 + 40);
            rifleButton.mousePressed(() => buyWeapon('rifle', 500));
        }

        if (!minigunButton) {
            minigunButton = createButton('Mini Gun (1500 pkt)');
            minigunButton.position(width / 2 - 50, height / 2 + 80);
            minigunButton.mousePressed(() => buyWeapon('minigun', 1500));
        }

        noLoop();
        return;
    }

    background(0, 255, 0);

    player.move();
    player.display();

    for (let bullet of bullets) {
        bullet.move();
        bullet.display();
    }

    for (let zombie of zombies) {
        if (!shop) {
            zombie.move();
        }
        zombie.display();

        if (dist(player.x, player.y, zombie.x, zombie.y) < 25) {
            gameOver = true;
        }
    }

    bullets = bullets.filter(bullet => !bullet.offscreen());
    zombies = zombies.filter(zombie => !zombie.hit);

    if (zombies.length === 0) {
        level++;
        if (level % 20 === 0) {
            shop = true;
        } else {
            spawnZombies(level * 5);
        }
    }

    textSize(24);
    fill(0);
    text('Punkty: ' + score, 10, 30);
    text('Level: ' + level, 10, 60);
}

function mousePressed() {
    if (millis() - lastShot > bulletCooldown) {
        bullets.push(new Bullet(player.x, player.y));
        lastShot = millis();
    }
}

function spawnZombies(num) {
    for (let i = 0; i < num; i++) {
        let x, y;
        do {
            x = random(width);
            y = random(height);
        } while (dist(player.x, player.y, x, y) < 100);
        zombies.push(new Zombie(x, y));
    }
}

function buyWeapon(type, cost) {
    if (points >= cost) {
        points -= cost;
        weapon = type;
        switch (type) {
            case 'smg':
                bulletCooldown = 1000;
                break;
            case 'rifle':
                bulletCooldown = 500;
                break;
            case 'minigun':
                bulletCooldown = 200;
                break;
        }
        shop = false;
        removeShopButtons();
        loop();
    }
}

function resetGame() {
    gameOver = false;
    score = 0;
    level = 1;
    points = 0;
    player = new Player();
    bullets = [];
    zombies = [];
    spawnZombies(5);
    removeGameOverButtons();
    loop();
}

function closeGame() {
    window.close();
}

function removeGameOverButtons() {
    if (resetButton) {
        resetButton.remove();
        resetButton = null;
    }
    if (quitButton) {
        quitButton.remove();
        quitButton = null;
    }
}

function removeShopButtons() {
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

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height / 2;
        this.size = 50;
    }

    move() {
        if (keyIsDown(87) && this.y > 0) { // W key
            this.y -= playerSpeed;
        }
        if (keyIsDown(83) && this.y < height - this.size) { // S key
            this.y += playerSpeed;
        }
        if (keyIsDown(65) && this.x > 0) { // A key
            this.x -= playerSpeed;
        }
        if (keyIsDown(68) && this.x < width - this.size) { // D key
            this.x += playerSpeed;
        }
    }

    display() {
        fill(0, 0, 255);
        rect(this.x, this.y, this.size, this.size);
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 10;
        this.speed = 10;
    }

    move() {
        this.y -= this.speed;
    }

    display() {
        fill(255, 0, 0);
        ellipse(this.x, this.y, this.size, this.size);
    }

    offscreen() {
        return this.y < 0;
    }
}

class Zombie {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 50;
        this.hit = false;
    }

    move() {
        let angle = atan2(player.y - this.y, player.x - this.x);
        this.x += cos(angle);
        this.y += sin(angle);
    }

    display() {
        fill(0, 255, 0);
        rect(this.x, this.y, this.size, this.size);
    }
}
