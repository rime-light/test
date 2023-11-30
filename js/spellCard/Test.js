import {BaseCheck} from "../baseClass/Entity.js";
import Bullet from "../item/Bullet.js";
import SpellCard from "../baseClass/SpellCard.js";
import {Size} from "../item/Style.js";

export default class Test extends SpellCard {
    constructor() {
        super({ lighter: true });
        this.createBullet();
    }
    createBullet() {
        const type = Object.keys(Size);
        for (let i = 0; i < type.length; i++) {
            let bullet = new Bullet({
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