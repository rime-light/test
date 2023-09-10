import Entity, {BaseCheck} from "../item/Entity.js";
import SpellCard, {createWay} from "./SpellCard.js";
import Timer from "../util/Timer.js";
import {Size} from "../item/Style.js";

export default class SparklingWater extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: H / 6 },
            value: {
                middle: 6,
                small: 15,
                row: 15,
                waitForStop: 300
            },
            waitTime: {
                middle: 20,
                small: 20,
                row: 20
            }
        });
        this.wave = 0;
        this.nextWave();
    }
    nextFrame() {
        super.nextFrame();
        if (this.frameEqual(480)) {
            this.nextWave();
            return;
        }
        if (this.frameEqual(1)) {
            let range = H / (2 * (this.value.row - 1));
            this.createSin(0, {
                priority: this.wave,
                offsetX: PI / 2,
                offsetY: random(-range, range)
            });
        }
        if (this.frameEqual(360)) this.createShootTo(0);
    }
    sinNext(step, other) {
        if (step >= this.value.small) return;
        const { row, priority, offsetY } = other;
        const expand = 30,
            rowCount = this.value.row,
            dir = ((priority + row) & 1) === 1;
        for (let i = 0; i < 2; i++) {
            let upDown = (i === 0);
            let bullet = new Entity({
                size: Size.water,
                style: bulletStyle.water,
                pos: { x: (dir ? -expand : W + expand), y: offsetY + createWay(H / 2, rowCount, row, 35) },
                angle: (dir ? 0 : PI),
                angleSpeed: PI / 235 * (upDown ? 1 : -1),
                baseSpeed: 1.35
            });
            bullet.setMove((item) => {
                if (Math.abs(item.angle - (dir ? 0 : PI)) > Math.abs(item.angleSpeed * 60)) item.angleSpeed *= -1;
                item.angle += item.angleSpeed;
                item.speedAngle();
            });
            bullet.setClearedCheck((item) => BaseCheck.timeOver(item, 480));
            bullets.push(bullet);
        }
        Timer.wait(() => this.sinNext(step + 1, other), this.waitTime.small);
    }
    createSin(step, other) {
        if (step >= this.value.row) return;
        this.sinNext(0, { row: step, ...other });
        Timer.wait(() => this.createSin(step + 1, other), this.waitTime.row);
    }
    createShootTo(step) {
        if (step >= this.value.middle) return;
        let way = 9, pos = this.basePos;
        let angle = posAngle(pos, player.pos);
        for (let i = 0; i < way; i++) {
            let bullet = new Entity({
                size: Size.middle,
                style: bulletStyle.middle,
                pos: {...pos},
                basePos: {...pos},
                angle: createWay(angle, way, i, PI / 18),
                baseSpeed: 2.2
            });
            bullet.setMove((item) => item.speedAngle());
            bullet.setClearedCheck(BaseCheck.outOfScreen);
            bullets.push(bullet);
        }
        Timer.wait(() => this.createShootTo(step + 1), this.waitTime.middle);
    }
    nextWave() {
        super.nextWave();
        this.wave++;
    }
}