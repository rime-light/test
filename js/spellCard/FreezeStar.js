import Entity, {BaseCheck} from "../item/Entity.js";
import SpellCard, {createWay} from "./SpellCard.js";
import Timer from "../util/Timer.js";
import {Color, Size} from "../item/Style.js";

export default class FreezeStar extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: H / 4 },
            value: {
                layer: 6 - 1
            }
        });
        this.way = 60 - 5;
        this.waitTime = 12;
        this.angle = 0;
        this.nextWave();
    }
    nextFrame() {
        super.nextFrame();
        if (this.frame >= Math.min(18, this.value.layer + 5) * this.waitTime)
            this.nextWave();
    }
    createSingle(step, other) {
        let {angle} = other;
        if (step >= this.value.layer) return;
        const {basePos, way} = this;
        angle += (step & 1 ? PI / way : 0);
        for (let i = 0; i < way; i++) {
            // break;
            let bullet = new Entity({
                size: Size.small,
                style: bulletStyle.small[Color.blue],
                lighter: true,
                pos: {...basePos},
                basePos: {...basePos},
                angle: createWay(angle, way, i),
                baseSpeed: 18
            });
            bullet.setMove((item) => {
                item.speedAngle(item.angle, item.baseSpeed / Math.max(Math.sqrt(item.frame), 1));
            });
            bullet.setClearedCheck(BaseCheck.outOfScreen);
            bullets.push(bullet);
        }
        Timer.wait(() => this.createSingle(step + 1, other), this.waitTime);
    }
    nextWave() {
        super.nextWave();
        this.way = Math.min(80, this.way + 5);
        this.value.layer = Math.min(16, this.value.layer + 1);
        this.createSingle(0, {angle: random(0, 2 * PI / this.way)});
    }
}