const
    PI = Math.PI,
    FPS = 60,
    W = 384, H = 450,
    diagonalRate = 1 / Math.sqrt(2),
    limitDistance = { top: 24, bottom: 16, left: 8, right: 8 };
let background, hitPoint, playerStyle, bulletStyle;
let player, bullets;

function test(node) {
    document.querySelector("#container").style.display = "none";
    node && document.querySelector("body").appendChild(node);
}

function isCircleCrash(p1, p2, limit) {
    let px = p1.x - p2.x, py = p1.y - p2.y;
    return px * px + py * py < limit * limit;
}

function random(start, end) {
    return Math.floor(Math.random() * (end - start + 1)) + start;
}

function x(item) {
    return calcX(item, item.style);
}
function calcX(posItem, sizeItem) {
    return posItem.pos.x - (sizeItem.size ?? sizeItem.width) / 2;
}

function y(item) {
    return calcY(item, item.style);
}
function calcY(posItem, sizeItem) {
    return posItem.pos.y - (sizeItem.size ?? sizeItem.height) / 2;
}
