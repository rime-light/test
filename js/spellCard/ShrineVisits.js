import {BaseCheck} from "../baseClass/Entity.js";
import Bullet from "../item/Bullet.js";
import SpellCard, {createWay} from "../baseClass/SpellCard.js";
import Timer from "../util/Timer.js";
import {Color16, Size} from "../item/Style.js";

export default class ShrineVisits extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: 2 * H / 5 },
            value: {
                way: 7,
                needle: 20
            },
            waitTime: {
                wave: 160,
                needle: 8
            }
        });
        this.nextWave(0);
    }
    createSingle(step, other) {
        const {needle, way} = this.value;
        if (step >= needle) return;
        const pos = this.basePos, {angle} = other;
        for (let i = 0; i < way; i++) {
            let bullet = new Bullet({
                size: Size.needle,
                style: bulletStyle.needle[Color16.red],
                pos: {...pos},
                top: true,
                angle: createWay(angle, way, i) + random(-1, 1) * PI / 72,
                baseSpeed: 2.0 + random(-1, 1) * 0.2
            });
            bullet.setMove((item) => {
                item.speedAngle();
                item.baseSpeed += 0.06;
                if (BaseCheck.posOutOfRect(item.pos, 0, 0, W, H)) {
                    this.turnToWater(item);
                    item.alive = false;
                }
            });
            bullet.setClearedCheck((item) => {
                return !item.alive;
            });
            bullets.push(bullet);
        }
        Timer.wait(() => this.createSingle(step + 1, other), this.waitTime.needle);
    }
    turnToWater(needle) {
        let bullet = new Bullet({
            size: Size.water,
            style: bulletStyle.water,
            lighter: true,
            pos: {...needle.pos},
            angle: needle.angle + PI + random(-1, 1) * PI / 6,
            baseSpeed: 1.2,
            transform: { scale: 1.5 }
        });
        bullet.setMove((item) => {
            if (!item.animation("scale", 15))
                item.clearTransform();
            item.speedAngle();
        });
        bullet.setClearedCheck((item) => {
            return BaseCheck.timeOver(item, 10) && BaseCheck.outOfScreen(item);
        });
        bullets.push(bullet);
    }
    nextWave(step) {
        super.nextWave();
        this.createSingle(0, {angle: posAngle(this.basePos, player.pos)});
        Timer.wait(
            () => this.nextWave(step + 1),
            this.waitTime.wave
        );
    }
}