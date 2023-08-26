import CanvasAnimation from "./util/Animation.js";
import FileLoader from "./util/FileLoader.js";
import Timer from "./util/Timer.js";

function isCrash(p1, p2, limit) {
    let px = p1.x - p2.x, py = p1.y - p2.y;
    return px * px + py * py < limit * limit;
}

function saveWrap(fn) {
    ctx.save();
    fn();
    ctx.restore();
}

function createPlayerStyle(img) {
    const width = 2, height = 3;
    return {
        normal: FileLoader.saveAsCanvasList(img, 0, 0, width, height, 1, 8),
        left: FileLoader.saveAsCanvasList(img, 0, height, width, height, 1, 8),
        right: FileLoader.saveAsCanvasList(img, 0, height * 2, width, height, 1, 8),
        width: FileLoader.size(width),
        height: FileLoader.size(height)
    };
}

function createBulletStyle(img, size) {
    return {
        image: FileLoader.saveAsCanvas(img, 8, 13, 2, 2, size, size),
        size: size
    };
}

function changeSize() {
    let expandRate = Math.max((window.innerHeight - 10) / H, 0.5);
    document.querySelector("#container").style.setProperty("--expand", `${expandRate}`);
}

export function changeQuality(value) {
    ctx.imageSmoothingQuality = value;
}

export function init() {
    stop();
    player = {
        style: playerStyle[0],
        size: 3,
        pos: { x: W / 2, y: H - H / 10 },
        direction: { x: 0, y: 0 },
        baseSpeed: 5,
        slowSpeed: 2,
        diagonalMove: false,
        slowMove: false,
        prev: {
            direction: 0,
            slowMove: false
        }
    };
    animationInit();
    bullets = [];
    freezeStarInit();
    setTimeout(() => {
        playing = true;
        requestAnimationFrame(calcFrame);
    }, 50);
}

export function stop() {
    playing = false;
}

function animationInit() {
    animations = {};
    animations.playerNormal = new CanvasAnimation(5, 8, true);
    animations.playerLR = new CanvasAnimation(1, 4);
    animations.playerLROver = new CanvasAnimation(5, 4, true);
    animations.hitPoint = new CanvasAnimation(1, 9, false, true);

    animations.playerLR.endFn = () => {
        animations.playerLROver.run();
    };

    animations.playerNormal.run();
    animations.hitPoint.run();
}

function calcFrame(timestamp) {
    if (!playing) return;

    if (frameLocked) {
        if (!timestamp) timestamp = prevTime;
        let interval = 1000 / FPS, delta = timestamp - prevTime;
        if (delta < interval) {
            requestAnimationFrame(calcFrame);
            return;
        }
        prevTime = timestamp - delta % interval;
    }

    const stopPlayerAnimation = () => {
        animations.playerNormal.stop();
        animations.playerLR.stop();
        animations.playerLROver.stop();
    }
    if (player.prev.direction !== player.direction.x) {
        stopPlayerAnimation();
        player.direction.x === 0 ?
            animations.playerNormal.run() : animations.playerLR.run();
    }
    if (player.prev.slowMove !== player.slowMove)
        animations.hitPoint.run();
    player.prev.direction = player.direction.x;
    player.prev.slowMove = player.slowMove;
    player.pos.x += player.direction.x * (player.diagonalMove ? diagonalRate : 1) * (player.slowMove ? player.slowSpeed : player.baseSpeed);
    player.pos.y += player.direction.y * (player.diagonalMove ? diagonalRate : 1) * (player.slowMove ? player.slowSpeed : player.baseSpeed);
    if (player.pos.x > W - limitDistance.right) player.pos.x = W - limitDistance.right;
    else if (player.pos.x < limitDistance.left) player.pos.x = limitDistance.left;
    if (player.pos.y > H - limitDistance.bottom) player.pos.y = H - limitDistance.bottom;
    else if (player.pos.y < limitDistance.top) player.pos.y = limitDistance.top;

    frame++;
    createWave();

    let biu = false;
    bullets = bullets.filter((bullet) => {
        if (!bullet.move()) return false;
        if (isCrash(player.pos, bullet.pos, player.size + bullet.size)) {
            biu = true;
        }
        return true;
    });
    draw(biu ? "#ff8f8f7f" : "#d8d8ff7f");
    requestAnimationFrame(calcFrame);
}

function draw(bgColor) {
    ctx.drawImage(background, 0, 0, W, H);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);
    animations.playerNormal.nextFrame((step) => {
        ctx.drawImage(player.style.normal[step], x(player), y(player));
    });
    animations.playerLR.nextFrame(
        player.direction.x < 0 ?
            (step) => ctx.drawImage(player.style.left[step], x(player), y(player))
            : (step) => ctx.drawImage(player.style.right[step], x(player), y(player))
    );
    animations.playerLROver.nextFrame(
        player.direction.x < 0 ?
            (step) => ctx.drawImage(player.style.left[step + 4], x(player), y(player))
            : (step) => ctx.drawImage(player.style.right[step + 4], x(player), y(player))
    );
    for (const bullet of bullets) {
        ctx.drawImage(bullet.style.image, x(bullet), y(bullet));
    }
    animations.hitPoint.nextFrame((step) => {
        if (step === 0) return;
        if (step === animations.hitPoint.step - 1) {
            ctx.drawImage(hitPoint.image, calcX(player, hitPoint), calcY(player, hitPoint));
            return;
        }
        saveWrap(() => {
            let scale = player.slowMove ?
                step > animations.hitPoint.step - 3 ?
                    0.9 + (animations.hitPoint.step - step) / 10
                    : 1.2 * step / (animations.hitPoint.step - 3)
                : step / animations.hitPoint.step;
            ctx.translate(player.pos.x, player.pos.y);
            ctx.scale(scale, scale);
            ctx.drawImage(hitPoint.image, -hitPoint.size / 2, -hitPoint.size / 2);
        });
    }, !player.slowMove);
}

window.onload = function () {
    prevTime = 0;
    frameLocked = false;
    canvas = document.getElementById("items");
    ctx = canvas.getContext("2d");
    let dpr = window.devicePixelRatio;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);
    changeSize();
    changeQuality("high");

    moveHCount = 0;
    moveVCount = 0;
    pressed = {};
    window.addEventListener("keydown", (event) => {
        let key = event.key;
        if (pressed[key]) return;
        switch (key) {
            case "ArrowUp":
                pressed[key] = true;
                moveVCount++;
                if (!pressed["ArrowDown"]) player.direction.y = -1;
                break;
            case "ArrowDown":
                pressed[key] = true;
                moveVCount++;
                if (!pressed["ArrowUp"]) player.direction.y = 1;
                break;
            case "ArrowLeft":
                pressed[key] = true;
                moveHCount++;
                if (!pressed["ArrowRight"]) player.direction.x = -1;
                break;
            case "ArrowRight":
                pressed[key] = true;
                moveHCount++;
                if (!pressed["ArrowLeft"]) player.direction.x = 1;
                break;
            case "Shift":
                pressed[key] = true;
                player.slowMove = true;
                break;
            default:
                return;
        }
        player.diagonalMove = (moveVCount > 0 && moveHCount > 0);
    });
    window.addEventListener("keyup", (event) => {
        let key = event.key;
        if (!pressed[key]) return;
        switch (key) {
            case "ArrowUp":
                pressed[key] = false;
                moveVCount--;
                player.direction.y = pressed["ArrowDown"] ? 1 : 0;
                break;
            case "ArrowDown":
                pressed[key] = false;
                moveVCount--;
                player.direction.y = pressed["ArrowUp"] ? -1 : 0;
                break;
            case "ArrowLeft":
                pressed[key] = false;
                moveHCount--;
                player.direction.x = pressed["ArrowRight"] ? 1 : 0;
                break;
            case "ArrowRight":
                pressed[key] = false;
                moveHCount--;
                player.direction.x = pressed["ArrowLeft"] ? -1 : 0;
                break;
            case "Shift":
                pressed[key] = false;
                player.slowMove = false;
                break;
            default:
                return;
        }
        player.diagonalMove = (moveVCount > 0 && moveHCount > 0);
    });
    document.querySelector("#options").addEventListener("keydown", (event) => {
        if (event.key.startsWith("Arrow"))
            event.preventDefault();
    });

    background = new Image();
    background.src = "images/bg.jpg";
    playerStyle = [];
    bulletStyle = {};
    FileLoader.queue(FileLoader.loadPng, "player/sloweffect", (img) => {
        let size = 4;
        hitPoint = {
            image: FileLoader.saveAsCanvas(img, 0, 0, size, size),
            size: FileLoader.size(size)
        };
    });
    let playerId = "00";
    FileLoader.queue(FileLoader.loadPng, `player/player${playerId}/pl${playerId}`, (img) => {
        playerStyle.push(createPlayerStyle(img));
    });
    FileLoader.queue(FileLoader.loadPng, `bullet/bullet1`, (img) => {
        bulletStyle.water = createBulletStyle(img, 24);
    });
    FileLoader.loadList(init, (err) => console.log(err));
}

window.onresize = changeSize;