import Entity, {BaseCheck} from "../item/Entity.js";
import SpellCard from "./SpellCard.js";
import Timer from "../util/Timer.js";
import {Color16, Color4, Size} from "../item/Style.js";

export default class IllusionSeeker extends SpellCard {
    constructor() {
        super({
            basePos: { x: 0, y: H / 2 - 10 },
            waitTime: {
                wave: 60,
                fast: 8,
                slow: 25,
                open: 60
            }
        });
        this.redEye = false;
        this.timerId = [];
        this.timer = [];
        this.nextWave(0);
        Timer.wait(() => this.openEye(true), 255);
    }
    nextFrame() {
        super.nextFrame();
    }
    openEye(open) {
        this.redEye = open;
        Timer.wait(() => this.openEye(!open), 120);
        if (open) {
            const handleId = () => {
                this.timerId.forEach((id) => {
                    let single = Timer.cancel(id);
                    if (single) this.timer.push(single);
                });
                this.timerId = [];
            }
            Timer.wait(handleId, 1);
        } else {
            this.timer.forEach(single => Timer.wait(single.fn, single.remain));
            this.timer = [];
        }
    }
    createFirearm(step, other) {
        if (step >= 2) return;
        const {pos, fast, color} = other;
        let bullet = new Entity({
            size: Size.firearm,
            style: bulletStyle.firearm[color],
            pos: {...pos},
            angle: step ? -PI / 2 : PI / 2,
            baseSpeed: fast ? 1.25 : 0.9,
        });
        bullet.setMove((item) => {
            if (this.redEye) {
                item.safe = true;
                item.transformValue.opacity = 0.5;
                item.speedAngle(color === Color16.red || !fast ? PI : 0, 0.5);
                if (item.pos.x < 0) item.pos.x += W;
                if (item.pos.x > W) item.pos.x -= W;
            } else {
                item.safe = false;
                item.transformValue.opacity = 1;
                item.speedAngle();
            }
        });
        bullet.setClearedCheck((item) => {
            return item.pos.y < -item.style.size || item.pos.y > H + item.style.size;
        });
        bullets.push(bullet);
        this.createFirearm(step + 1, other);
    }
    createLarge(pos, dir, color) {
        let bullet = new Entity({
            size: Size.large,
            style: bulletStyle.large[color],
            safe: true,
            lighter: true,
            pos: {...pos},
            angle: dir,
            baseSpeed: 1,
            transform: { opacity: 0, scale: 0.1 }
        });
        bullet.setMove((item) => {
            if (this.redEye) {
                item.frame--;
                item.transformValue.opacity = Math.min(item.transformValue.opacity, 0.2);
                return;
            } else if (item.animation("opacity", 20, 0.5) === -1) {
                item.transformValue.opacity = 0.5;
            }
            item.animation("scale", 20, 0.8);
            item.speedAngle();
            if (item.frameMatch(this.waitTime.fast))
                this.createFirearm(0, { pos: item.pos, fast: true, color: color === Color4.red ? Color16.red : Color16.blue });
            if (item.frameMatch(this.waitTime.slow))
                this.createFirearm(0, {pos: item.pos, fast: false, color: color === Color4.red ? Color16.red : Color16.blue});
        });
        bullet.setClearedCheck(BaseCheck.outOfScreen);
        bullets.push(bullet);

    }
    nextWave(step) {
        super.nextWave();
        this.timerId.push(Timer.wait(() => this.createLarge({
            x: 0,
            y: this.basePos.y + random(-1, 1) * 30
        }, 0, Color4.red), randomInt(0, 15)));
        this.timerId.push(Timer.wait(() => this.createLarge({
            x: W,
            y: this.basePos.y + random(-1, 1) * 30
        }, PI, Color4.blue), randomInt(0, 15)));
        this.timerId.push(Timer.wait(
            () => this.nextWave(step + 1),
            this.waitTime.wave
        ));
    }
}