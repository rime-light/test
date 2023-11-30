const PI = Math.PI;
const
    /**
     * 帧率
     * @type {number}
     */
    FPS = 60,
    /**
     * 画面宽度
     * @type {number}
     */
    W = 384,
    /**
     * 画面高度
     * @type {number}
     */
    H = 448,
    /**
     * 斜向移动比率
     * @type {number}
     */
    diagonalRate = 1 / Math.sqrt(2),
    /**
     * 角色移动版边限制
     * @type {{top: number, left: number, bottom: number, right: number}}
     */
    limitDistance = { top: 24, bottom: 16, left: 8, right: 8 },
    /**
     * 符卡字体
     * @type {string}
     */
    spellFont = `"Times New Roman","华文中宋",monospace`;

let background, hitbox, ascii, playerStyle, bulletStyle;
let
    /**
     * 动画列表
     * @type {Object.<string,CanvasAnimation>}
     */
    animations,
    /**
     * 自机
     * @type {Player}
     */
    player,
    /**
     * 附加弹幕列表
     * @type {Bullet[]}
     */
    bullets,
    /**
     * 弹幕列表
     * @type {Bullet[]}
     */
    bulletList = [];
const Sound = {
    audioList: new Map(),
    add(name, audio) {
        this.audioList.set(name, audio);
    },
    play(name) {
        if (!this.audioList.has(name)) return;
        let audio = this.audioList.get(name);
        audio.currentTime = 0;
        audio.play();
    }
};

/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

function r(org, play) {
    play = play ?? 2;
    return (Math.hypot(org, play) - play).toFixed(3);
}

function randomInt(start, end) {
    return Math.floor(Math.random() * (end - start + 1)) + start;
}
function random(start, end, step) {
    return start + (end - start) * (step ? randomInt(0, step) / step : Math.random());
}

function equal(a, b) {
    return Math.abs(a - b) < Number.EPSILON;
}

function posAngle(p1, p2, defaultValue) {
    if (equal(p1.x, p2.x) && equal(p1.y, p2.y) && defaultValue) return defaultValue;
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function x(item) {
    return calcX(item.pos, item.style);
}
function calcX(posItem, sizeItem) {
    return arguments.length === 1 ? -(posItem.size ?? posItem.width) / 2 : posItem.x - (sizeItem.size ?? sizeItem.width) / 2;
}

function y(item) {
    return calcY(item.pos, item.style);
}
function calcY(posItem, sizeItem) {
    return arguments.length === 1 ? -(posItem.size ?? posItem.height) / 2 : posItem.y - (sizeItem.size ?? sizeItem.height) / 2;
}
