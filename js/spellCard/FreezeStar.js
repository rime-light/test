import Entity, {BaseCheck} from "../item/Entity.js";
import SpellCard, {createWay} from "./SpellCard.js";

export default class FreezeStar extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: H / 4 },
            value: {
                layer: 6 - 1
            },
            currentValue: {
                layer: 0
            }
        });
        this.way = 60 - 5;
        this.waitTime = 12;
        this.angle = 0;
        this.nextWave();
    }
    nextFrame() {
        super.nextFrame();
        const {way, waitTime, frame} = this;
        const layer = this.value.layer, currentLayer = this.currentValue.layer
        if (this.frame >= Math.min(18, layer + 5) * waitTime)
            this.nextWave();
        if (currentLayer < layer && frame % waitTime === 0) {
            this.createSingle(this.angle + (currentLayer & 1 ? 0 : PI / way));
            this.currentValue.layer++;
        }
    }
    createSingle(angle) {
        const {basePos, way} = this;
        for (let i = 0; i < way; i++) {
            // break;
            let bullet = new Entity({
                frame: 0,
                size: 4,
                style: bulletStyle.water,
                pos: {...basePos},
                basePos: {...basePos},
                angle: createWay(angle, way, i),
                baseSpeed: 18
            });
            bullet.setMove((item) => {
                BaseMove.speedAngle(item, item.angle, item.baseSpeed / Math.max(Math.sqrt(item.frame), 1));
                // if (item.frame === 40) BaseMove.shootTo(item);
            });
            bullet.setClearedCheck(BaseCheck.outOfScreen);
            bullets.push(bullet);
        }
    }
    nextWave() {
        super.nextWave();
        this.way = Math.min(80, this.way + 5);
        this.angle = PI * randomInt(0, 359) / 180;
        this.value.layer = Math.min(16, this.value.layer + 1);
        this.currentValue.layer = 0;
    }
}