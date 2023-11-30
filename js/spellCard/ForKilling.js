import {BaseCheck} from "../baseClass/Entity.js";
import Bullet from "../item/Bullet.js";
import SpellCard, {createWay} from "../baseClass/SpellCard.js";
import Timer from "../util/Timer.js";
import {Color8, Size} from "../item/Style.js";

export default class ForKilling extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: H / 3 },
            value: {
                wave: 60
            },
            waitTime: {
                wave: 180,
                middle: 120
            }
        });
        this.nextWave(0);
    }
    createWave(angle, dir) {
        const basePos = {...this.basePos}, {wave: way} = this.value;
        basePos.x += randomInt(-50, 50);
        basePos.y -= randomInt(10, 30);
        for (let i = 0; i < way; i++) {
            let bullet = new Bullet({
                size: Size.glow,
                style: bulletStyle.glow[Color8.red],
                lighter: true,
                pos: {...basePos},
                basePos: {...basePos},
                angle: createWay(angle, way, dir ? i : way - i - 1),
                baseSpeed: 1.5
            });
            bullet.setMove((item) => {
                item.speedAngle();
                if (item.frameEqual(this.waitTime.middle)) {
                    this.createMiddle(item);
                }
            });
            bullet.setClearedCheck(BaseCheck.outOfScreen);
            bullets.push(bullet);
        }
    }
    createMiddle(glowBullet) {
        let bullet = new Bullet({
            size: Size.middle,
            style: bulletStyle.middle[Color8.blue],
            top: true,
            pos: {...glowBullet.pos},
            angle: glowBullet.angle,
            baseSpeed: glowBullet.baseSpeed,
            transform: { opacity: 0, scale: 1.2 }
        });
        bullet.setMove((item) => {
            item.animation("opacity");
            if (item.animation("scale", 10, 1.05) === 0)
                item.clearTransform("opacity");
            item.speedAngle();
        });
        bullet.setClearedCheck(BaseCheck.outOfScreen);
        bullets.push(bullet);
    }
    nextWave(step) {
        super.nextWave();
        this.createWave(random(0, 2 * PI / this.value.wave), step & 1);
        this.waitTime.wave = Math.max(100, this.waitTime.wave - 3);
        Timer.wait(
            () => this.nextWave(step + 1),
            this.waitTime.wave
        );
    }
}