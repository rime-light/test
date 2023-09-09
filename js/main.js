import CanvasAnimation from "./util/Animation.js";
import FileLoader from "./util/FileLoader.js";
import Timer from "./util/Timer.js";
import Entity, {BaseCheck} from "./item/Entity.js"
import FreezeStar from "./spellCard/FreezeStar.js";
import SparklingWater from "./spellCard/SparklingWater.js";
import Mishaguji from "./spellCard/Mishaguji.js";
import Day210 from "./spellCard/Day210.js";

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
        document.getElementById("stop").addEventListener("click", () => {
            if (this.playing) this.playing = false;
            else {
                this.playing = true;
                requestAnimationFrame(this.calcFrame);
            }
        });

        let storageValue = localStorage.getItem("quality");
        if (!["low", "medium", "high"].includes(storageValue)) {
            storageValue = "high";
        }
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
            hitbox = {
                image: FileLoader.saveAsCanvas(img, 0, 0, size, size, { opacity: 0.8 }),
                size: FileLoader.size(size)
            };
        });
        let playerId = "00";
        FileLoader.queue(FileLoader.loadPng, `player/player${playerId}/pl${playerId}`, (img) => {
            playerStyle.push(this.createPlayerStyle(img));
        });
        FileLoader.queue(FileLoader.loadPng, `bullet/bullet1`, (img) => {
            bulletStyle.water = this.createBulletStyle(img, 8, 13, 2, 2, 32, true, {luminosity: 20});
            bulletStyle.rice = this.createBulletStyleList(img, 0, 4, 1, 1, 1, 16, 18, true);
        });
        FileLoader.queue(FileLoader.loadPng, `bullet/bullet2`, (img) => {
            bulletStyle.knife = this.createBulletStyle(img, 8, 6, 2, 2, 32, true);
            bulletStyle.middle = this.createBulletStyle(img, 6, 2, 2, 2, 32, false);
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
        this.draw = this.draw.bind(this);
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

    createBulletStyle(img, x, y, w, h, size, angle, options) {
        return {
            size, angle,
            image: FileLoader.saveAsCanvas(img, x, y, w, h, { sw: size, sh: size, ...options })
        };
    }
    createBulletStyleList(img, x, y, w, h, row, column, size, angle, options) {
        let list = [];
        const imgList = FileLoader.saveAsCanvasList(img, x, y, w, h, row, column, { sw: size, sh: size, ...options });
        for (let i = 0; i < imgList.length; i++) {
            list.push({
                size, angle,
                image: imgList[i]
            });
        }
        return list;
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

    init() {
        this.playing = false;
        Timer.waiting = [];
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
        this.spellCard = new Day210();
        setTimeout(() => {
            this.playing = true;
            requestAnimationFrame(this.calcFrame);
        }, 50);
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

        Timer.nextFrame();
        this.spellCard.nextFrame();
        let biu = false;
        bullets = bullets.filter((bullet) => {
            bullet.move();
            if (bullet.cleared()) return false;
            if (BaseCheck.isCrash(player, bullet)) {
                biu = true;
                // return false;
            }
            return true;
        });
        this.draw(biu);
        requestAnimationFrame(this.calcFrame);
    }

    draw(biu) {
        const {ctx, animations} = this;
        ctx.drawImage(background, 0, 0);
        ctx.fillStyle = biu ? "#ff00003f" : "#afafff3f";
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
            if (bullet.style.angle) {
                ctx.save();
                ctx.translate(bullet.pos.x, bullet.pos.y);
                ctx.rotate((bullet.drawAngle ?? bullet.angle) + PI / 2);
                ctx.drawImage(bullet.style.image, calcX(bullet.style), calcY(bullet.style));
                ctx.restore();
            } else ctx.drawImage(bullet.style.image, x(bullet), y(bullet));
        }
        animations.hitboxSpin.nextFrame((angleStep) => {
            let angle = 2 * PI * angleStep / animations.hitboxSpin.step;
            const turn = (scale) => {
                ctx.save();
                ctx.translate(player.pos.x, player.pos.y);
                if (scale !== 1) ctx.scale(scale, scale);
                ctx.rotate(angle);
                ctx.drawImage(hitbox.image, calcX(hitbox), calcY(hitbox));
                ctx.rotate(-2 * angle);
                ctx.drawImage(hitbox.image, calcX(hitbox), calcY(hitbox));
                ctx.restore();
            }
            animations.hitboxShow.nextFrame((step) => {
                if (step === 0) return;
                if (step === animations.hitboxShow.step - 1) turn(1);
                else turn(player.slowMove ?
                    step > animations.hitboxShow.step - 3 ?
                        0.9 + (animations.hitboxShow.step - step) / 10
                        : 1.2 * step / (animations.hitboxShow.step - 3)
                    : step / animations.hitboxShow.step
                );
            }, !player.slowMove);
            bullets.forEach((bullet) => {
                ctx.fillStyle = "white";
                if (bullet.style === bulletStyle.water) {
                    ctx.beginPath();
                    ctx.arc(bullet.pos.x, bullet.pos.y, 7, 0, 2*PI);
                    ctx.fill();
                }
            });
        });
    }
}

function changeSize() {
    let expandRate = Math.max((window.innerHeight - 10) / H, 0.5);
    document.querySelector("#container").style.setProperty("--expand", `${expandRate}`);
}

window.onload = () => new App();

window.onresize = changeSize;