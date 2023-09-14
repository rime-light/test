import Entity, {BaseCheck} from "../item/Entity.js";
import SpellCard, {createWay} from "./SpellCard.js";
import Timer from "../util/Timer.js";
import {Color16, Color8, Size} from "../item/Style.js";

export default class DreamSealWabi extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: H / 6 },
            value: {
                middle: 50,
                small: 5,
                scatter: 8,
                shootFast: 6,
                shootSlow: 2
            },
            waitTime: {
                middle: 60,
                wave: 210,
                scatter: 20
            }
        });
        const whiteEnd = 50,
            toRed = whiteEnd + 30,
            redStart = toRed + 30,
            redEnd = redStart + 50,
            toMagenta = redEnd + 30,
            magentaStart = toMagenta + 30;
        this.setValue({ whiteEnd, toRed, redStart, redEnd, toMagenta, magentaStart });
        this.createMiddle();
        Timer.wait(() => this.nextWave(0), 4 * this.waitTime.scatter);

    }
    nextFrame() {
        super.nextFrame();
    }
    createMiddle() {
        const basePos = this.basePos, {middle: way} = this.value;
        let angle = posAngle(basePos, player.pos, PI / 2) - randomInt(1, way) * 2 * PI / way;
        for (let i = 0; i < way; i++) {
            let bullet = new Entity({
                size: Size.middle,
                style: bulletStyle.middle[Color8.white],
                pos: {...basePos},
                basePos: {...basePos},
                angle: createWay(angle, way, i),
                baseSpeed: 2.5
            });
            bullet.setMove((item) => {
                item.speedAngle();
            });
            bullet.setClearedCheck(BaseCheck.outOfScreen)
            bullets.push(bullet);
        }
        Timer.wait(() => this.createMiddle(), this.waitTime.middle);
    }
    createSingle(step, other) {
        const {scatter, small} = this.value, {dir} = other;
        if (step >= scatter) return;
        let angle = random(0, 2 * PI), pos = {...this.basePos}, dis = 50;
        pos.x += dir * Math.cos(angle - PI / 2) * dis;
        pos.y += dir * Math.sin(angle - PI / 2) * dis;
        for (let i = 0; i < small; i++) {
            for (let j = 0; j < small; j++) {
                // break;
                let bullet = new Entity({
                    size: Size.paper,
                    style: bulletStyle.paper[Color16.white],
                    pos: {...pos},
                    angle: createWay(angle, small, j, PI / 48),
                    baseSpeed: (i + 1) * 1.5,
                    top: true
                });
                bullet.setMove((item) => {
                    let speed = 0;
                    if (item.frame < this.value.whiteEnd) {
                        speed = item.baseSpeed * (1 - item.frame / this.value.whiteEnd);
                    } else if (item.frameEqual(this.value.whiteEnd)) {
                        item.size = Size.small;
                        item.style = bulletStyle.small[Color16.white];
                    } else if (item.frameEqual(this.value.toRed)){
                        item.style = bulletStyle.small[Color16.red];
                    } else if (item.frame >= this.value.redStart && item.frame < this.value.redEnd) {
                        if (item.frameEqual(this.value.redStart)) {
                            item.baseSpeed = this.value.shootFast;
                            item.size = Size.paper;
                            item.style = bulletStyle.paper[Color16.red];
                            item.shootTo();
                        }
                        speed = item.baseSpeed * (1 - (item.frame - this.value.redStart) / (this.value.redEnd - this.value.redStart));
                    } else if (item.frameEqual(this.value.redEnd)) {
                        item.size = Size.small;
                        item.style = bulletStyle.small[Color16.red];
                    } else if (item.frameEqual(this.value.toMagenta)){
                        item.style = bulletStyle.small[Color16.magenta];
                    } else if (item.frame >= this.value.magentaStart) {
                        if (item.frameEqual(this.value.magentaStart)) {
                            item.size = Size.paper;
                            item.style = bulletStyle.paper[Color16.magenta];
                            item.shootTo();
                        }
                        speed = this.value.shootSlow;
                    }
                    item.speedAngle(item.angle, speed);
                });
                bullet.setClearedCheck((item) => {
                    return BaseCheck.timeOver(item, this.value.redEnd) && BaseCheck.outOfScreen(item);
                });
                bullets.push(bullet);
            }
        }
        Timer.wait(() => this.createSingle(step + 1, other), this.waitTime.scatter);
    }
    nextWave(step) {
        super.nextWave();
        this.createSingle(0, {dir: (step & 1) ? 1 : -1});
        Timer.wait(
            () => this.nextWave(step + 1),
            this.waitTime.wave
        );
    }
}