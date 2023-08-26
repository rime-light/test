let frame;
let way, layer, waitTime;
let angle, currentLayer;
function createSingle(angle) {
    for (let i = 0; i < way; i++) {
        // break;
        bullets.push({
            frame: 0,
            size: 4,
            style: bulletStyle.water,
            pos: { x: W / 2, y: H / 4 },
            angle: angle + i * 2 * PI / way,
            baseSpeed: 18,
            move() {
                this.frame++;
                let speed = this.baseSpeed / Math.sqrt(this.frame);
                this.pos.x += speed * Math.sin(this.angle);
                this.pos.y += speed * Math.cos(this.angle);
                return !(this.pos.x > W + this.size || this.pos.x < -this.size ||
                    this.pos.y > H + this.size || this.pos.y < -this.size);
            }
        });
    }
}

function createWave() {
    if (frame >= Math.min(18, layer + 5) * waitTime) nextWave();
    if (currentLayer >= layer) return;
    if (frame % waitTime === 0) {
        createSingle(angle + (currentLayer & 1 ? 0 : PI / way));
        currentLayer++;
    }
}

function nextWave() {
    frame = 0;
    way = Math.min(80, way + 5);
    layer = Math.min(16, layer + 1);
    angle = PI * random(0, 359) / 180;
    currentLayer = 0;
}

function freezeStarInit() {
    way = 60;
    layer = 5;
    waitTime = 12;
    nextWave();
}