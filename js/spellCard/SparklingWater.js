import {BaseCheck} from "../baseClass/Entity.js";
import Bullet from "../item/Bullet.js";
import SpellCard, {createWay} from "../baseClass/SpellCard.js";
import Timer from "../util/Timer.js";
import {Color8, Size} from "../item/Style.js";

export default class SparklingWater extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: H / 6 },
            value: {
                middle: 6,
                small: 15,
                row: 15
            },
            waitTime: {
                middle: 20,
                small: 20,
                row: 20
            }
        });
        this.nextWave(0);
    }
    sinNext(step, other) {
        if (step >= this.value.small) return;
        const { row, priority, offsetY } = other;
        const expand = 25,
            rowCount = this.value.row,
            dir = ((priority + row) & 1) === 1;
        for (let i = 0; i < 2; i++) {
            let upDown = (i === 0);
            let bullet = new Bullet({
                size: Size.water,
                style: bulletStyle.water,
                lighter: true,
                pos: { x: (dir ? -expand : W + expand), y: offsetY + createWay(H / 2, rowCount, row, 35) },
                angle: (dir ? 0 : PI),
                angleSpeed: PI / 225 * (upDown ? 1 : -1),
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
            let bullet = new Bullet({
                size: Size.middle,
                style: bulletStyle.middle[Color8.blue],
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
    nextWave(step) {
        super.nextWave();
        let range = H / this.value.row;
        this.createSin(0, {
            priority: step,
            offsetX: PI / 2,
            offsetY: random(-1, 1) * range
        });
        Timer.wait(() => this.createShootTo(0), 300);
        Timer.wait(() => this.nextWave(step + 1), 380);
    }
}