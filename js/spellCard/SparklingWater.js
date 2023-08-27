import Entity, {BaseCheck, BaseMove} from "../item/Entity.js";
import SpellCard, {createWay} from "./SpellCard.js";

export default class SparklingWater extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: H / 6 },
            value: {
                middle: 7,
                small: 200,
                row: 15,
                waitForStop: 300
            },
            currentValue: {
                middle: 0,
                small: 0,
                row: 0,
                waitForStop: 0
            },
            waitTime: {
                middle: 20,
                small: 30
            }
        });
        this.offset = 0;
        this.rowTimeOffset = 12;
        this.nextWave();
    }
    nextFrame() {
        super.nextFrame();
        if (this.frame === 680) {
            this.nextWave();
            return;
        }
        if (this.value.row === this.currentValue.row) {
            this.currentValue.waitForStop++;
        }
        let wait = this.currentValue.waitForStop;
        if (this.frameMatch(this.rowTimeOffset)
            && (wait >= this.value.waitForStop || wait === 0)
        ) this.currentValue.row++;
        if (this.frameMatch(this.waitTime.small)) this.createSin();
        if (this.frame > 400
            && this.frameMatch(this.waitTime.middle)
            && this.currentValue.middle < this.value.middle
        ) this.createShootTo();
    }
    createSin() {
        const row = this.value.row, currentRow = this.currentValue.row, size = 4;
        // console.log(currentRow);
        const summon = (i) => {
            let dir = (i & 1) === 1;
            let bullet = new Entity({
                size,
                style: bulletStyle.water,
                pos: { x: dir ? -2 * size : W + 2 * size, y: 0 },
                basePos: { x: this.offset, y: createWay(H / 2, row, i, false, H / (row - 2)) },
                baseSpeed: 0.8 * (dir ? 1 : -1)
            });
            bullet.setMove((item) => {
                item.pos.x += item.baseSpeed;
                item.pos.y = item.basePos.y + 30 * Math.sin(item.pos.x / (12 * PI) + item.basePos.x);
            });
            bullet.setClearedCheck((item) => BaseCheck.timeOver(item, 500));
            bullets.push(bullet);
        }
        if (currentRow > row)
            for (let i = 2 * row - currentRow; i >= 0; i--) summon(row - i);
        else for (let i = 0; i < currentRow; i++) summon(i);
    }
    createShootTo() {
        this.currentValue.middle++;
        let way = 9, pos = this.basePos;
        let calculator = { pos: {...pos}, angle: 0 };
        BaseMove.shootTo(calculator);
        for (let i = 0; i < way; i++) {
            let bullet = new Entity({
                size: 8.5,
                style: bulletStyle.middle,
                pos: {...pos},
                basePos: {...pos},
                angle: createWay(calculator.angle, way, i, false, PI / 20),
                baseSpeed: 2.4
            });
            bullet.setMove(BaseMove.speedAngle);
            bullet.setClearedCheck(BaseCheck.outOfScreen);
            bullets.push(bullet);
        }
    }
    nextWave() {
        super.nextWave();
        this.offset = random(-PI, PI);
        this.setCurrentValue({
            middle: 0,
            small: 0,
            row: 0,
            waitForStop: 0
        });
    }
}