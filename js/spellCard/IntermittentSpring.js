import Entity, {BaseCheck} from "../item/Entity.js";
import SpellCard, {createWay} from "./SpellCard.js";
import Timer from "../util/Timer.js";
import {Color16, Color8, Size} from "../item/Style.js";

export default class IntermittentSpring extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: H / 4 },
            value: {
                middle: 5,
                scale: 8
            },
            waitTime: {
                wave: 200,
                middle: 80,
                water: 4,
                scale: 40
            }
        });
        this.nextWave();
    }

    createMiddle() {
        const basePos = this.basePos, {middle: way} = this.value;
        let angle = random(-1, 1) * PI / 36 + PI / 2;
        for (let i = 0; i < way; i++) {
            // break;
            let bullet = new Entity({
                size: Size.middle,
                style: bulletStyle.middle[Color8.blue],
                pos: {...basePos},
                basePos: {...basePos},
                lighter: true,
                angle: createWay(angle, way, i, PI / 12),
                baseSpeed: 3,
                fixed: false
            });
            let waterWait = this.waitTime.water;
            if (i === 0 || i === way - 1) waterWait--;
            bullet.setMove((item) => {
                if (item.fixed) {
                    if (item.frameEqual(this.waitTime.middle))
                        item.alive = false;
                    if (item.frameMatch(waterWait))
                        this.createWater(item.pos);
                } else if (item.pos.y >= H) {
                    item.pos.y = H;
                    item.lighter = false;
                    item.fixed = true;
                    item.frame = 0;
                } else item.speedAngle();
            });
            bullet.setClearedCheck((item) => !item.alive);
            bullets.push(bullet);
        }
    }

    createWater(basePos) {
        let angle = random(-1, 1) * PI / 24 - PI / 2,
            baseSpeed = 6.5;
        let bullet = new Entity({
            size: Size.water,
            style: bulletStyle.small[Color16.blue],
            pos: {...basePos},
            basePos: {...basePos},
            lighter: true,
            speed: {
                x: baseSpeed * Math.cos(angle),
                y: baseSpeed * Math.sin(angle)
            },
            changed: false
        });
        bullet.setMove((item) => {
            item.speedXY(true);
            if (!item.changed && item.speed.y > -0.5) {
                item.changed = true;
                item.style = bulletStyle.water;
                item.speed.x *= 0.8;
            }
            if (Math.abs(item.speed.x) > 0.3 && item.speed.y > 0)
                item.speed.x *= 0.98;
            if (item.speed.y < 2.8) item.speed.y += 0.05;
        });
        bullet.setClearedCheck((item) =>
            BaseCheck.timeOver(item, 180) && BaseCheck.outOfScreen(item)
        );
        bullets.push(bullet);
    }

    createGlow() {
        const basePos = this.basePos;
        for (let i = 0; i < 2; i++) {
            // break;
            let bullet = new Entity({
                size: Size.glow,
                style: bulletStyle.glow[Color8.red],
                pos: {...basePos},
                basePos: {...basePos},
                lighter: true,
                angle: createWay(PI / 2, 2, i, PI / 2),
                baseSpeed: 4
            });
            bullet.setMove((item) => {
                if (item.frameEqual(this.waitTime.scale)) {
                    item.alive = false;
                    this.createScale(item.pos);
                }
                item.speedAngle();
            });
            bullet.setClearedCheck((item) => !item.alive);
            bullets.push(bullet);
        }
    }
    createScale(basePos) {
        const {scale: way} = this.value,
            angle = random(-1, 1) * PI,
            shootTime = 40 + randomInt(-10, 15);
        for (let i = 0; i < way; i++) {
            // break;
            let posAngle = createWay(angle, way, i);
            let bullet = new Entity({
                size: Size.scale,
                style: bulletStyle.scale[Color16.red],
                pos: {
                    x: basePos.x + 10 * Math.cos(posAngle),
                    y: basePos.y + 10 * Math.sin(posAngle),
                },
                angle: posAngle,
                top: true,
                baseSpeed: 1.8,
                transform: { opacity: 1 }
            });
            bullet.setMove((item) => {
                item.animation("opacity", 20, 0);
                if (item.frameEqual(20)) {
                    item.baseSpeed = 0;
                    item.transform.opacity = 0;
                }
                if (item.frame > 20) {
                    item.animation("opacity", 10, 1, item.frame - 20);
                    item.frame < 75 && item.shootTo();
                }
                if (item.frame >= shootTime && item.frame < 90) {
                    item.baseSpeed += 0.08;
                }
                item.speedAngle();
            });
            bullet.setClearedCheck(BaseCheck.outOfScreen);
            bullets.push(bullet);
        }
    }
    nextWave() {
        super.nextWave();
        this.createMiddle();
        this.createGlow();
        Timer.wait(() => this.nextWave(), this.waitTime.wave);
    }
}