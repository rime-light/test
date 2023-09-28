import Entity, {BaseCheck} from "../item/Entity.js";
import SpellCard from "./SpellCard.js";
import Timer from "../util/Timer.js";
import {Color8, Size} from "../item/Style.js";

export default class Macrocosm extends SpellCard {
    constructor() {
        super({
            basePos: { x: W / 2, y: H / 2 },
            value: {
                fast: 60,
                slow: 30
            },
            waitTime: {
                wave: 325,
                speedup: 120,
                show: 180,
                leave: 300
            }
        });
        this.nextWave(0);
    }
    nextFrame() {
        super.nextFrame();
    }
    createSingle(dir, speed, up) {
        speed *= random(0.95, 1.05);
        let limit = speed * up;
        const pos = this.basePos, {speedup, show, leave} = this.waitTime;
        let bullet = new Entity({
            size: Size.glow,
            style: bulletStyle.glow[Color8.blue],
            lighter: true,
            safe: true,
            pos: {...pos},
            basePos: {...pos},
            angle: random(0, 2 * PI),
            radius: random(0, 0.7 * H),
            transform: { opacity: 0, scale: 0.6 }
        });
        bullet.setMove((item) => {
            if (item.frame <= 20) {
                if (!item.animation("opacity", 20, 0.5)) {
                    item.transform = {...item.transformValue};
                }
            }
            if (item.frame >= speedup && item.frame < show) {
                speed += limit * (1 - 1 / up) / (show - speedup);
                if (speed > limit) speed = limit;
            } else if (item.frame <= show + 10) {
                let current = item.frame - show;
                item.animation("opacity", 10, 1, current);
                if (!item.animation("scale", 10, 1, current)) {
                    item.safe = false;
                    item.transform = {...item.transformValue};
                    speed = limit;
                }
            } else if (item.frame >= leave) {
                if (item.frameEqual(leave)) item.safe = true;
                let current = item.frame - leave;
                item.animation("opacity", 6, 0, current);
                item.animation("scale", 6, 0, current);
            }
            item.angle += speed * (dir ? 1 : -1);
            item.pos.x = item.basePos.x + item.radius * Math.cos(item.angle);
            item.pos.y = item.basePos.y + item.radius * Math.sin(item.angle);
        });
        bullet.setClearedCheck((item) => {
            return BaseCheck.timeOver(item, leave + 10);
        });
        bullets.push(bullet);
    }
    nextWave(step) {
        super.nextWave();
        for (let i = 0; i < this.value.fast; i++)
            this.createSingle(!(step & 1), PI / 180, 1.35);
        for (let i = 0; i < this.value.slow; i++)
            this.createSingle(step & 1, PI / 255, 1.1);
        Timer.wait(
            () => this.nextWave(step + 1),
            this.waitTime.wave
        );
    }
}