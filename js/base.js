const
    PI = Math.PI,
    FPS = 60,
    W = 384, H = 450,
    diagonalRate = 1 / Math.sqrt(2),
    limitDistance = { top: 24, bottom: 16, left: 8, right: 8 };
let background, hitbox, playerStyle, bulletStyle;
let player, bullets;

function test(node) {
    document.querySelector("#container").style.display = "none";
    node && document.querySelector("body").appendChild(node);
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

function angle() {
    
}

function x(item) {
    return calcX(item, item.style);
}
function calcX(posItem, sizeItem) {
    return arguments.length === 1 ? -(posItem.size ?? posItem.width) / 2 : posItem.pos.x - (sizeItem.size ?? sizeItem.width) / 2;
}

function y(item) {
    return calcY(item, item.style);
}
function calcY(posItem, sizeItem) {
    return arguments.length === 1 ? -(posItem.size ?? posItem.height) / 2 :posItem.pos.y - (sizeItem.size ?? sizeItem.height) / 2;
}
