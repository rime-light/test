import CanvasAnimation from "./util/Animation.js";
import FileLoader from "./util/FileLoader.js";
import Timer from "./util/Timer.js";

class App {
    constructor() {
        this.functionBind();

        this.prevTime = 0;
        this.frameLocked = false;
        this.moveHCount = 0;
        this.moveVCount = 0;
        this.pressed = {};
        this.playing = false;

        let canvas = document.getElementById("items");
        let ctx = canvas.getContext("2d");
        let dpr = window.devicePixelRatio;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;
        ctx.scale(dpr, dpr);
        changeSize();

        window.addEventListener("keydown", (event) => {
            let key = event.key;
            if (this.pressed[key]) return;
            switch (key) {
                case "ArrowUp":
                    this.pressed[key] = true;
                    this.moveVCount++;
                    if (!this.pressed["ArrowDown"]) player.direction.y = -1;
                    break;
                case "ArrowDown":
                    this.pressed[key] = true;
                    this.moveVCount++;
                    if (!this.pressed["ArrowUp"]) player.direction.y = 1;
                    break;
                case "ArrowLeft":
                    this.pressed[key] = true;
                    this.moveHCount++;
                    if (!this.pressed["ArrowRight"]) player.direction.x = -1;
                    break;
                case "ArrowRight":
                    this.pressed[key] = true;
                    this.moveHCount++;
                    if (!this.pressed["ArrowLeft"]) player.direction.x = 1;
                    break;
                case "Shift":
                    this.pressed[key] = true;
                    player.slowMove = true;
                    break;
                default:
                    return;
            }
            player.diagonalMove = (this.moveVCount > 0 && this.moveHCount > 0);
        });
        window.addEventListener("keyup", (event) => {
            let key = event.key;
            if (!this.pressed[key]) return;
            switch (key) {
                case "ArrowUp":
                    this.pressed[key] = false;
                    this.moveVCount--;
                    player.direction.y = this.pressed["ArrowDown"] ? 1 : 0;
                    break;
                case "ArrowDown":
                    this.pressed[key] = false;
                    this.moveVCount--;
                    player.direction.y = this.pressed["ArrowUp"] ? -1 : 0;
                    break;
                case "ArrowLeft":
                    this.pressed[key] = false;
                    this.moveHCount--;
                    player.direction.x = this.pressed["ArrowRight"] ? 1 : 0;
                    break;
                case "ArrowRight":
                    this.pressed[key] = false;
                    this.moveHCount--;
                    player.direction.x = this.pressed["ArrowLeft"] ? -1 : 0;
                    break;
                case "Shift":
                    this.pressed[key] = false;
                    player.slowMove = false;
                    break;
                default:
                    return;
            }
            player.diagonalMove = (this.moveVCount > 0 && this.moveHCount > 0);
        });
        document.getElementById("options").addEventListener("keydown", (event) => {
            if (event.key.startsWith("Arrow"))
                event.preventDefault();
        });
        document.getElementById("reload").addEventListener("click", this.init);
        document.getElementById("stop").addEventListener("click", this.stop);

        let storageValue = localStorage.getItem("quality");
        ctx.imageSmoothingQuality = "high";
        document.getElementsByName("quality").forEach((radio) => {
            if (storageValue === radio.value) {
                radio.checked = true;
                ctx.imageSmoothingQuality = storageValue;
            }
            radio.addEventListener("change", () => {
                let currentValue = radio.value;
                ctx.imageSmoothingQuality = currentValue;
                localStorage.setItem("quality", currentValue);
            });
        });

        storageValue = localStorage.getItem("fixedFrame");
        let checkbox = document.getElementById("frame-control");
        const frameControl = () => {
            this.frameLocked = checkbox.checked;
            localStorage.setItem("fixedFrame", `${checkbox.checked ? 1 : 0}`);
        }
        if (storageValue) {
            storageValue = parseInt(storageValue) !== 0;
            checkbox.checked = storageValue;
            frameControl();
        } else Timer.frameCalc((fps) => {
            checkbox.checked = (fps - 10 > FPS);
            frameControl();
        });
        checkbox.addEventListener("change", frameControl);

        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.lineWidth = 1;
        ctx.fillStyle = "lightblue";
        ctx.strokeStyle = "gray"
        let txt = "等待加载资源完毕...";
        ctx.fillText(txt, W >> 1, H >> 1);
        ctx.strokeText(txt, W >> 1, H >> 1);
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
            playerStyle.push(this.createPlayerStyle(img));
        });
        FileLoader.queue(FileLoader.loadPng, `bullet/bullet1`, (img) => {
            bulletStyle.water = this.createBulletStyle(img, 24);
        });
        FileLoader.loadList(this.init, (err) => {
            let msg = `${err.failList.length}个资源加载失败`;
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = "orangered";
            ctx.fillText(msg, W / 2, H / 2);
            ctx.strokeText(msg, W / 2, H / 2);
        });
        this.canvas = canvas;
        this.ctx = ctx;
    }

    functionBind() {
        this.init = this.init.bind(this);
        this.stop = this.stop.bind(this);
        this.draw = this.draw.bind(this);
        this.saveWrap = this.saveWrap.bind(this);
        this.calcFrame = this.calcFrame.bind(this);
    }

    createPlayerStyle(img) {
        const width = 2, height = 3;
        return {
            normal: FileLoader.saveAsCanvasList(img, 0, 0, width, height, 1, 8),
            left: FileLoader.saveAsCanvasList(img, 0, height, width, height, 1, 8),
            right: FileLoader.saveAsCanvasList(img, 0, height * 2, width, height, 1, 8),
            width: FileLoader.size(width),
            height: FileLoader.size(height)
        };
    }

    createBulletStyle(img, size) {
        return {
            image: FileLoader.saveAsCanvas(img, 8, 13, 2, 2, size, size),
            size: size
        };
    }

    animationInit() {
        let animations = {};
        animations.playerNormal = new CanvasAnimation(5, 8, true);
        animations.playerLR = new CanvasAnimation(1, 4);
        animations.playerLROver = new CanvasAnimation(5, 4, true);
        animations.hitboxShow = new CanvasAnimation(1, 9, false, true);
        animations.hitboxSpin = new CanvasAnimation(1, 180, true);

        animations.playerLR.endFn = () => {
            animations.playerLROver.run();
        };

        animations.playerNormal.run();
        animations.hitboxShow.run();
        animations.hitboxSpin.run();
        this.animations = animations;
    }
    
    saveWrap(fn) {
        this.ctx.save();
        fn();
        this.ctx.restore();
    }

    init() {
        this.stop();
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
        this.animationInit();
        bullets = [];
        freezeStarInit();
        setTimeout(() => {
            this.playing = true;
            requestAnimationFrame(this.calcFrame);
        }, 50);
    }

    stop() {
        this.playing = false;
    }

    calcFrame(timestamp) {
        if (!this.playing) return;
        if (this.frameLocked) {
            if (!timestamp) timestamp = this.prevTime;
            let interval = 1000 / FPS, delta = timestamp - this.prevTime;
            if (delta < interval) {
                requestAnimationFrame(this.calcFrame);
                return;
            }
            this.prevTime = timestamp - delta % interval;
        }

        const stopPlayerAnimation = () => {
            this.animations.playerNormal.stop();
            this.animations.playerLR.stop();
            this.animations.playerLROver.stop();
        }
        if (player.prev.direction !== player.direction.x) {
            stopPlayerAnimation();
            player.direction.x === 0 ?
                this.animations.playerNormal.run() : this.animations.playerLR.run();
        }
        if (player.prev.slowMove !== player.slowMove)
            this.animations.hitboxShow.run();
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
            if (isCircleCrash(player.pos, bullet.pos, player.size + bullet.size)) {
                biu = true;
                // return false;
            }
            return true;
        });
        this.draw(biu ? "#ff8f8f7f" : "#d8d8ff7f");
        requestAnimationFrame(this.calcFrame);
    }

    draw(bgColor) {
        const {ctx, animations} = this;
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
        animations.hitboxSpin.nextFrame((angleStep) => {
            let angle = 2 * PI * angleStep / animations.hitboxSpin.step;
            animations.hitboxShow.nextFrame((step) => {
                if (step === 0) return;
                if (step === animations.hitboxShow.step - 1) {
                    ctx.drawImage(hitPoint.image, calcX(player, hitPoint), calcY(player, hitPoint));
                    return;
                }
                this.saveWrap(() => {
                    let scale = player.slowMove ?
                        step > animations.hitboxShow.step - 3 ?
                            0.9 + (animations.hitboxShow.step - step) / 10
                            : 1.2 * step / (animations.hitboxShow.step - 3)
                        : step / animations.hitboxShow.step;
                    ctx.translate(player.pos.x, player.pos.y);
                    ctx.scale(scale, scale);
                    ctx.rotate(angle);
                    ctx.drawImage(hitPoint.image, -hitPoint.size / 2, -hitPoint.size / 2);
                });
            }, !player.slowMove);
        });
    }
}

function changeSize() {
    let expandRate = Math.max((window.innerHeight - 10) / H, 0.5);
    document.querySelector("#container").style.setProperty("--expand", `${expandRate}`);
}

window.onload = () => new App();

window.onresize = changeSize;