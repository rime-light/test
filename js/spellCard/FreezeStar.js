import Entity, {BaseCheck} from "../item/Entity.js";
import SpellCard, {createWay} from "./SpellCard.js";
import Timer from "../util/Timer.js";
import {Color16, Size} from "../item/Style.js";

export default class FreezeStar extends SpellCard {
    constructor() {
        super({
            lighter: true,
            basePos: { x: W / 2, y: H / 4 },
            value: {
                layer: 5 - 1,
                way: 60 - 5
            }
        });
        this.waitTime = 12;
        this.nextWave();
    }
    nextFrame() {
        super.nextFrame();
        if (this.frame >= (this.value.layer + 2) * this.waitTime)
            this.nextWave();
    }
    createSingle(step, other) {
        let {angle} = other;
        const basePos = this.basePos, {way, layer} = this.value;
        if (step >= layer) return;
        angle += (step & 1 ? PI / way : 0);
        for (let i = 0; i < way; i++) {
            // break;
            let bullet = new Entity({
                size: Size.small,
                style: bulletStyle.small[Color16.blue],
                pos: {...basePos},
                basePos: {...basePos},
                angle: createWay(angle, way, i),
                baseSpeed: 2
            });
            bullet.setMove((item) => {
                item.speedAngle();
            });
            bullet.setClearedCheck(BaseCheck.outOfScreen);
            bullets.push(bullet);
        }
        Timer.wait(() => this.createSingle(step + 1, other), this.waitTime);
    }
    nextWave() {
        super.nextWave();
        this.value.way = Math.min(80, this.value.way + 5);
        this.value.layer = Math.min(10, this.value.layer + 1);
        this.createSingle(0, {angle: random(0, 2 * PI / this.value.way)});
    }
}