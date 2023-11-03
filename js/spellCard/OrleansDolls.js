import Entity, {BaseCheck} from "../item/Entity.js";
import SpellCard, {createWay} from "./SpellCard.js";
import Timer from "../util/Timer.js";
import {Color16, Size} from "../item/Style.js";

export default class OrleansDolls extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: H / 4 },
            value: {
                doll: 8,
                level: 0,
                radius: [100, 60, 80],
                maxLevel: 4,
                speedLevel: [1.0, 1.2, 1.6, 2.0, 2.5, 3.2],
                speedSp: [0, 3.0, 3.0, 3.5, 0],
                spLevel: [-1, 3, 4, 5, -1],
                color: [Color16.black, Color16.blue, Color16.white, Color16.red, Color16.green]
            },
            waitTime: {
                wave: 780,
                episode: 240,
                level: 50
            }
        });
        this.nextWave(0);
    }
    nextFrame() {
        super.nextFrame();
    }
    createSingle(pos, angle, speed, notChange) {
        const {level, maxLevel, speedLevel, speedSp, spLevel} = this.value, color = this.value.color[level];
        let bullet = new Entity({
            size: Size.scale,
            style: bulletStyle.scale[color],
            pos: {...pos},
            angle: angle,
            baseSpeed: !notChange && speed === spLevel[level] ? speedSp[level] : speedLevel[speed],
            transform: { opacity: 0, scale: 0.3 }
        });
        bullet.setMove((item) => {
            item.animation("opacity", 10);
            item.animation("scale", 10);
            item.speedAngle();
            if (this.value.level > level) {
                item.alive = false;
                if (level >= maxLevel - 1 && speed > 2) speed--;
                const baseAngle = item.angle + PI;
                this.createSingle(
                    item.pos,
                    baseAngle,
                    speed
                );
                for (let i = 0; i < 2; i++) this.createSingle(
                    item.pos,
                    createWay(baseAngle, 2, i, PI / 3),
                    Math.max(0, speed - 1)
                );
                Timer.wait(() => {
                    for (let i = 0; i < 2; i++) this.createSingle(
                        item.pos,
                        createWay(baseAngle, 2, i, 2 * PI / 4),
                        speed + 1
                    );
                }, 8);
            }
        });
        bullet.setClearedCheck((item) => {
            return !item.alive || (level >= maxLevel && BaseCheck.outOfScreen(item));
        });
        bullets.push(bullet);
    }
    createFirst(step, offset) {
        if (step >= 3) return;
        this.value.level = 0;
        this.nextLevel();
        const {doll: way, radius} = this.value,
            r = radius[step],
            baseAngle = PI / 2;
        for (let i = 0; i < way; i++) {
            let angle = createWay(baseAngle, way, i);
            this.createSingle(
                {
                    x: this.basePos.x + r * Math.cos(angle),
                    y: this.basePos.y + r * Math.sin(angle),
                },
                angle + offset,
                3,
                step & 1
            );
        }
        Timer.wait(() => this.createFirst(step + 1, offset - PI / 2), this.waitTime.episode);
    }
    nextLevel() {
        const {level, maxLevel} = this.value;
        if (level >= maxLevel) {
            this.value.level = maxLevel;
            return;
        }
        this.value.level++;
        Timer.wait(() => this.nextLevel(), this.waitTime.level * (this.value.level < 2 ? 0.4 : 1));
    }
    nextWave(step) {
        super.nextWave();
        this.createFirst(0, PI / 2);
        Timer.wait(
            () => this.nextWave(step + 1),
            this.waitTime.wave
        );
    }
}