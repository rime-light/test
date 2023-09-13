const
    PI = Math.PI,
    FPS = 60,
    W = 384, H = 448,
    diagonalRate = 1 / Math.sqrt(2),
    limitDistance = { top: 24, bottom: 16, left: 8, right: 8 };
let background, hitbox, playerStyle, bulletStyle;
let player, bullets, bulletList = [];

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
