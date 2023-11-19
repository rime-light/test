import CanvasAnimation from "./util/Animation.js";
import FileLoader from "./util/FileLoader.js";
import Timer from "./util/Timer.js";
import {BaseCheck} from "./item/Entity.js"
import {spellList} from "./item/SpellList.js";
import Recorder from "./util/Recorder.js";
import WaitingPage from "./page/WaitingPage.js";
import SelectPage from "./page/SelectPage.js";
import InGamePage from "./page/InGamePage.js";

class Game {
    constructor() {
        this.functionBind();

        this.prevTime = 0;
        this.frameLocked = false;
        this.moveHCount = 0;
        this.moveVCount = 0;
        this.pressed = new Map();
        this.playing = false;
        this.paused = false;

        let gameBlock = document.getElementById("game");
        gameBlock.style.width = `${W}px`;
        gameBlock.style.height = `${H}px`;
        let painter = {
            record: null,
            item: null,
            text: null
        };
        this.displayList = [];
        let dpr = Math.max(window.devicePixelRatio, 1.98);
        Object.keys(painter).forEach((id) => {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            // canvas.width = W;
            // canvas.height = H;
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            if (id !== "record") {
                canvas.className = "game";
                canvas.style.width = `${W}px`;
                canvas.style.height = `${H}px`;
                ctx.scale(dpr, dpr);
                gameBlock.appendChild(canvas);
                this.displayList.push(canvas);
            } else {
                Recorder.set(canvas);
            }
            painter[id] = ctx;
        });
        this.painter = painter;
        changeSize();

        document.getElementById("options").addEventListener("keydown", (event) => {
            event.preventDefault();
            event.target.blur();
        });
        document.getElementById("options").addEventListener("click", (event) => {
            event.target.blur();
        });

        let storageValue = localStorage.getItem("quality");
        if (!["low", "high"].includes(storageValue)) {
            storageValue = "high";
        }
        const changeQuality = (value) => {
            Object.keys(painter).forEach((id) => {
                painter[id].imageSmoothingQuality = value;
            })
        }
        document.getElementsByName("quality").forEach((radio) => {
            if (storageValue === radio.value) {
                radio.checked = true;
                changeQuality(storageValue);
            }
            radio.addEventListener("change", (event) => {
                let currentValue = event.target.value;
                changeQuality(currentValue);
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

        const recordButton = document.getElementById("record");
        recordButton.addEventListener("click", () => {
            if (Recorder.recording) {
                Recorder.stop();
                recordButton.innerHTML = "录制";
                recordButton.classList.remove("recording");
            } else {
                this.copyForRecord();
                Recorder.start();
                recordButton.innerHTML = "停止";
                recordButton.classList.add("recording");
            }
        });

        this.inGame = null;
        let waitingPage = new WaitingPage(painter.text);
        waitingPage.wait();

        playerStyle = [];
        bulletStyle = {};
        FileLoader.queue(FileLoader.loadJpg, "bg", (img) => {
            background = img;
            painter.item.drawImage(img, 0, 0);
        });
        FileLoader.queue(FileLoader.loadPng, "player/slow_effect", (img) => {
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
            let sub = this.createBulletStyleList(img, 8, 13, 2, 2, 1, 4, 32, true);
            bulletStyle.water = {
                animation: true,
                size: sub[0].size,
                angle: sub[0].angle,
                image: sub.map(single => single.image)
            };
            bulletStyle.scale = this.createBulletStyleList(img, 0, 1, 1, 1, 1, 16, 16, true);
            bulletStyle.small = this.createBulletStyleList(img, 0, 3, 1, 1, 1, 16, 16, false);
            bulletStyle.rice = this.createBulletStyleList(img, 0, 4, 1, 1, 1, 16, 16, true);
            bulletStyle.needle = this.createBulletStyleList(img, 0, 6, 1, 1, 1, 16, 16, true);
            bulletStyle.paper = this.createBulletStyleList(img, 0, 7, 1, 1, 1, 16, 16, true);
            bulletStyle.firearm = this.createBulletStyleList(img, 0, 8, 1, 1, 1, 16, 16, true);
        });
        FileLoader.queue(FileLoader.loadPng, `bullet/bullet2`, (img) => {
            bulletStyle.middle = this.createBulletStyleList(img, 0, 2, 2, 2, 1, 8, 32, false);
            bulletStyle.butterfly = this.createBulletStyleList(img, 0, 4, 2, 2, 1, 8, 32, true);
            bulletStyle.knife = this.createBulletStyleList(img, 0, 6, 2, 2, 1, 8, 32, true);
            bulletStyle.large = this.createBulletStyleList(img, 0, 12, 4, 4, 1, 4, 64, false);
        });
        FileLoader.queue(FileLoader.loadPng, `bullet/bullet4`, (img) => {
            bulletStyle.glow = this.createBulletStyleList(img, 0, 0, 4, 4, 2, 4, 64, false);
        });
        FileLoader.loadList(() => {
            let selectPage = new SelectPage(painter.text);
            selectPage.init(localStorage.getItem("lastPlay"));
            window.addEventListener("keydown", (event) => {
                let key = event.key;
                if (key.length < 2) key = key.toUpperCase();
                if (this.pressed.get(key)) return;
                this.pressed.set(key, true);
                switch (key) {
                    case "ArrowUp":
                        if (this.playing) {
                            this.moveVCount++;
                            player.direction.y = -1;
                        } else {
                            selectPage.prevLine();
                        }
                        break;
                    case "ArrowDown":
                        if (this.playing) {
                            this.moveVCount++;
                            player.direction.y = 1;
                        } else {
                            selectPage.nextLine();
                        }
                        break;
                    case "ArrowLeft":
                        if (this.playing) {
                            this.moveHCount++;
                            player.direction.x = -1;
                        } else {
                            selectPage.prevPage();
                        }
                        break;
                    case "ArrowRight":
                        if (this.playing) {
                            this.moveHCount++;
                            player.direction.x = 1;
                        } else {
                            selectPage.nextPage();
                        }
                        break;
                    case "Shift":
                        if (this.playing) {
                            player.slowMove = true;
                        }
                        break;
                    case "Z":
                        if (this.playing) {
                            if (this.paused) this.pauseToggle();
                        } else {
                            let cardId = selectPage.cardId();
                            localStorage.setItem("lastPlay", cardId);
                            this.init(cardId);
                        }
                        break;
                    case "Escape":
                        if (this.playing) {
                            this.pauseToggle();
                        }
                        break;
                    case "R":
                        if (this.playing) {
                            this.init(selectPage.cardId());
                        }
                        break;
                    case "Q":
                        if (this.playing) {
                            this.playing = false;
                            this.gameViewClear();
                            selectPage.init(localStorage.getItem("lastPlay"));
                        }
                        break;
                    default:
                        return;
                }
                if (this.playing) player.diagonalMove = (this.moveVCount > 0 && this.moveHCount > 0);
            });
            window.addEventListener("keyup", (event) => {
                let key = event.key;
                if (key.length < 2) key = key.toUpperCase();
                if (!this.pressed.get(key)) return;
                this.pressed.set(key, false);
                switch (key) {
                    case "ArrowUp":
                        if (this.playing) {
                            this.moveVCount--;
                            player.direction.y = this.pressed.get("ArrowDown") ? 1 : 0;
                        }
                        break;
                    case "ArrowDown":
                        if (this.playing) {
                            this.moveVCount--;
                            player.direction.y = this.pressed.get("ArrowUp") ? -1 : 0;
                        }
                        break;
                    case "ArrowLeft":
                        if (this.playing) {
                            this.moveHCount--;
                            player.direction.x = this.pressed.get("ArrowRight") ? 1 : 0;
                        }
                        break;
                    case "ArrowRight":
                        if (this.playing) {
                            this.moveHCount--;
                            player.direction.x = this.pressed.get("ArrowLeft") ? -1 : 0;
                        }
                        break;
                    case "Shift":
                        if (this.playing) {
                            player.slowMove = false;
                        }
                        break;
                    default:
                        return;
                }
                if (this.playing) player.diagonalMove = (this.moveVCount > 0 && this.moveHCount > 0);
            });
        }, (err) => {
            waitingPage.fail(err.failList.length);
        });
    }
    functionBind() {
        this.init = this.init.bind(this);
        this.draw = this.draw.bind(this);
        this.calcFrame = this.calcFrame.bind(this);
        this.copyForRecord = this.copyForRecord.bind(this);
    }

    pauseToggle() {
        if (this.paused) {
            this.paused = false;
            this.inGame.play();
            requestAnimationFrame(this.calcFrame);
        } else {
            const ctx = this.painter.text;
            this.paused = true;
            this.inGame.pause();
            this.copyForRecord();
        }
    }

    gameViewClear() {
        this.painter.item.drawImage(background, 0, 0);
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

    init(cardId) {
        this.inGame = new InGamePage(this.painter.text);
        this.playing = false;
        this.paused = false;
        this.biuTime = 0;
        Timer.waiting = [];
        player = {
            style: playerStyle[0],
            size: 3.0,
            pos: { x: W / 2, y: H - H / 10 },
            direction: { x: 0, y: 0 },
            baseSpeed: 4.5,
            slowSpeed: 1.8,
            diagonalMove: false,
            slowMove: false,
            prev: {
                direction: 0,
                slowMove: false
            }
        };
        this.animationInit();
        bullets = [];
        bulletList = [];
        this.spellCard = spellList[cardId].render();
        setTimeout(() => {
            this.inGame.setCard(spellList[cardId]);
            this.inGame.play();
            this.playing = true;
            requestAnimationFrame(this.calcFrame);
        }, 50);
    }

    copyForRecord() {
        if (!Recorder.recording) return;
        const ctx = this.painter.record;
        this.displayList.forEach((canvas) => ctx.drawImage(canvas, 0, 0));
        // requestAnimationFrame(this.copyForRecord);
    }

    calcFrame(timestamp) {
        if (!this.playing || this.paused) return;
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
        this.biuTime--;
        let biu = false;
        let current = bulletList.filter((bullet) => {
            bullet.move();
            if (bullet.cleared()) return false;
            if (!bullet.safe && BaseCheck.isCrash(player, bullet)) {
                biu = true;
                // return false;
            }
            return true;
        });
        if (biu) {
            this.biuTime = 6;
            this.inGame.stop(this.spellCard.globalFrame);
        }
        bulletList = [...current, ...bullets];
        bullets = [];
        this.draw();
        this.inGame.period(this.spellCard.globalFrame);
        this.copyForRecord();
        requestAnimationFrame(this.calcFrame);
    }

    drawBullet(bullet) {
        const ctx = this.painter.item;
        let style = {...bullet.style};
        if (style.animation) style.image = style.image[Math.floor(bullet.frame / 5) % style.image.length];
        if (style.angle || Object.keys(bullet.transformValue).length) {
            ctx.save();
            ctx.translate(bullet.pos.x, bullet.pos.y);
            if (style.angle)
                ctx.rotate((bullet.transformValue.angle ?? bullet.angle) + PI / 2);
            if (!isNaN(bullet.transformValue.opacity) && !equal(bullet.transformValue.opacity, 1))
                ctx.globalAlpha = bullet.transformValue.opacity;
            if (!isNaN(bullet.transformValue.scale) && !equal(bullet.transformValue.scale, 1)) {
                let finalSize = style.size * bullet.transformValue.scale;
                ctx.drawImage(style.image, -finalSize / 2, -finalSize / 2, finalSize, finalSize);
            } else ctx.drawImage(style.image, calcX(style), calcY(style));
            ctx.restore();
        } else ctx.drawImage(style.image, x(bullet), y(bullet));
    }
    draw() {
        const {painter, animations} = this;
        const ctx = painter.item;
        this.gameViewClear();
        if (this.biuTime > 0) {
            ctx.fillStyle = "#ff00003f";
            ctx.fillRect(0, 0, W, H);
        }
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
        let lighterList = [], topList = [];
        if (this.spellCard.lighter) {
            lighterList = bulletList;
        } else {
            for (const bullet of bulletList) {
                if (bullet.lighter) {
                    lighterList.push(bullet);
                    continue;
                } else if (bullet.top) {
                    topList.push(bullet);
                    continue;
                }
                this.drawBullet(bullet);
            }
        }
        if (lighterList.length > 0) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            lighterList.forEach(bullet => this.drawBullet(bullet));
            ctx.restore();
        }
        if (topList.length > 0)
            topList.forEach(bullet => this.drawBullet(bullet));
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
        });
    }
}

function changeSize() {
    let expandRate = Math.max((window.innerHeight - 10) / H, 0.5);
    document.querySelector("#container").style.setProperty("--expand", `${expandRate}`);
}

window.onload = () => new Game();
window.onresize = changeSize;