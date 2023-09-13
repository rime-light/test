import Entity, {BaseCheck} from "../item/Entity.js";
import SpellCard from "./SpellCard.js";
import {Size} from "../item/Style.js";

export default class Test extends SpellCard {
    constructor() {
        super({ lighter: true });
        this.createBullet();
    }
    nextFrame() {
        super.nextFrame();
    }
    createBullet() {
        const type = Object.keys(Size);
        for (let i = 0; i < type.length; i++) {
            let bullet = new Entity({
                size: Size[type[i]],
                style: bulletStyle[type[i]][1] || bulletStyle[type[i]],
                pos: { x: (i % 4 + 1) * 80, y: (Math.floor(i / 4) + 1) * 80 },
                angle: PI / 2
            });
            bullet.setMove(() => {});
            bullet.setClearedCheck(BaseCheck.outOfScreen);
            bullets.push(bullet);
        }
    }
}