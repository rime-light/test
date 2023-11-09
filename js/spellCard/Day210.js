import Entity, {BaseCheck} from "../item/Entity.js";
import SpellCard, {createWay} from "./SpellCard.js";
import Timer from "../util/Timer.js";
import {Color16, Size} from "../item/Style.js";

export default class Day210 extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: H / 3 },
            value: {
                line: 30
            },
            waitTime: {
                line: 4,
                wave: 240
            }
        });
        this.way = 16;
        this.nextWave(0);
    }
    nextFrame() {
        super.nextFrame();
    }
    createSingle(step, other) {
        if (step >= this.value.line) return;
        const {angle} = other;
        const {way, basePos} = this;
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < way; j++) {
                let bullet = new Entity({
                    size: Size.rice,
                    style: bulletStyle.rice[i ? Color16.blue : Color16.green],
                    lighter: true,
                    pos: {...basePos},
                    basePos: {...basePos},
                    angle: createWay(angle + (i ? 0 : PI / way), way, j),
                    baseSpeed: 6
                });
                let offsetAngle = PI / 12 * random(-step, step) / this.value.line;
                bullet.setMove((item) => {
                    if (item.frameEqual(5))
                        item.lighter = false;
                    item.speedAngle();
                    let spinTime = 120;
                    if (item.frame < spinTime) {
                        item.angle += (i ? -1 : 1) * (2 * PI + offsetAngle) / spinTime;
                        item.baseSpeed -= 3.5 / spinTime;
                    }
                });
                bullet.setClearedCheck((item) => {
                    return BaseCheck.timeOver(item, 120) && BaseCheck.outOfScreen(item);
                });
                bullets.push(bullet);
            }
        }
        Timer.wait(
            () => this.createSingle(step + 1, other),
            this.waitTime.line
        );
    }
    nextWave(step) {
        super.nextWave();
        this.createSingle(0, {angle: random(0, 2 * PI / this.way)});
        Timer.wait(
            () => this.nextWave(step),
            this.waitTime.wave
        );
    }
}