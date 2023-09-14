import Entity, {BaseCheck} from "../item/Entity.js";
import SpellCard from "./SpellCard.js";
import Timer from "../util/Timer.js";
import {Color16, Color4, Size} from "../item/Style.js";

export default class MetsuzaiTemple extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: H / 4 },
            value: {
                prevX: 0
            },
            waitTime: {
                wave: 180,
                paper: 15
            }
        });
        this.nextWave(0);
    }
    nextFrame() {
        super.nextFrame();
    }
    createPaper(step, other) {
        if (step >= 2) return;
        const pos = other.pos;
        let bullet = new Entity({
            size: Size.paper,
            style: bulletStyle.paper[Color16.darkblue],
            pos: {...pos},
            angle: step ? -PI / 2 : PI / 2,
            baseSpeed: 3.5,
        });
        bullet.setMove((item) => {
            item.speedAngle();
            if (!item.change && (item.pos.y < -item.style.size || item.pos.y > H + item.style.size)) {
                item.style = bulletStyle.paper[Color16.darkmagenta];
                item.angle += PI;
                item.baseSpeed = 2.2;
                item.change++;
                Timer.wait(() => { item.change++ }, 5);
            }
        });
        bullet.setClearedCheck((item) => {
            return item.change > 1 && BaseCheck.outOfScreen(item);
        });
        bullets.push(bullet);
        this.createPaper(step + 1, other);
    }
    createLarge(step, other) {
        if (step >= 2) return;
        let pos = {...this.basePos}, {offsetX, offsetY} = other;
        pos.x += offsetX;
        pos.y += offsetY;
        this.createPaper(0, { pos });
        let bullet = new Entity({
            size: Size.large,
            style: bulletStyle.large[Color4.blue],
            safe: true,
            lighter: true,
            pos: {...pos},
            angle: step ? 0 : PI,
            baseSpeed: 0.9,
            transform: { opacity: 0, scale: 1.5 }
        });
        bullet.setMove((item) => {
            item.animation("opacity", 10, 0.5);
            if (!item.animation("scale"))
                item.clearTransform("scale");
            item.speedAngle();
            if (item.frameMatch(this.waitTime.paper))
                this.createPaper(0, { pos: item.pos });
        });
        bullet.setClearedCheck((item) => {
            return BaseCheck.outOfScreen(item);
        });
        bullets.push(bullet);
        this.createLarge(step + 1, other);
    }
    nextWave(step) {
        super.nextWave();
        let offsetX = 0;
        do {
            offsetX = random(-W / 4, W / 4);
        } while (Math.abs(offsetX - this.value.prevX) > W / 4);
        this.value.prevX = offsetX;
        this.createLarge(0, {
            offsetX,
            offsetY: random(-30, 10)
        });
        Timer.wait(
            () => this.nextWave(step + 1),
            this.waitTime.wave
        );
    }
}