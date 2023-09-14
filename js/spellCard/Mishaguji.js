import Entity, {BaseCheck} from "../item/Entity.js";
import SpellCard, {createWay} from "./SpellCard.js";
import Timer from "../util/Timer.js";
import {Color16, Size} from "../item/Style.js";

export default class Mishaguji extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: H / 4 },
            waitTime: {
                layer: 90
            }
        });
        this.way = 60;
        this.nextWave(0);
    }
    nextFrame() {
        super.nextFrame();
    }
    createSingle(angle) {
        angle -= PI / 2;
        const {way, basePos} = this;
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < way; j++) {
                // break;
                let bullet = new Entity({
                    size: Size.rice,
                    style: bulletStyle.rice[Color16.green],
                    pos: {...basePos},
                    basePos: {...basePos},
                    angle: createWay(angle + (i ? 0 : PI / way), way, j),
                    baseSpeed: 1.8
                });
                bullet.setMove((item) => {
                    item.speedAngle();
                    let spinStart = 60, spinTime = 90;
                    if (item.frame >= spinStart && item.frame < spinStart + spinTime) {
                        item.angle += (i ? 1 : -1) * PI / (2 * spinTime);
                        item.baseSpeed -= 1 / spinTime;
                    }
                });
                bullet.setClearedCheck((item) => {
                    return BaseCheck.outOfScreen(item) && BaseCheck.timeOver(item, 120);
                });
                bullets.push(bullet);
            }
        }
    }
    nextWave(step) {
        super.nextWave();
        this.createSingle(random(0, 2 * PI / this.way));
        this.waitTime.layer = Math.max(40, this.waitTime.layer - 2);
        Timer.wait(
            () => this.nextWave(step),
            this.waitTime.layer
        );
    }
}