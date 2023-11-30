import Entity from "../baseClass/Entity.js";

/**
 * @classdesc 角色类
 * @property {Point} direction - 当前移动方向
 * @property {number} slowSpeed - 低速移动速度
 * @property {boolean} diagonalMove - 是否在斜向移动
 * @property {boolean} slowMove - 是否在低速移动
 * @property {Object} prev - 之前的状态
 * @property {number} prev.direction - 之前的横向移动方向
 * @property {boolean} prev.slowMove - 之前是否在低速移动
 */
export default class Player extends Entity {
    constructor(props) {
        super({
            ...{
                pos: { x: W / 2, y: H - H / 10 },
                direction: { x: 0, y: 0 },
                slowSpeed: 0,
                diagonalMove: false,
                slowMove: false,
                prev: {
                    direction: { x: 0, y: 0 },
                    slowMove: false
                }
            }, ...props
        });
    }

    /**
     * 角色移动
     */
    move() {
        const stopPlayerAnimation = () => {
            animations.playerNormal.stop();
            animations.playerLR.stop();
            animations.playerLROver.stop();
        }
        if (this.prev.direction !== this.direction.x) {
            stopPlayerAnimation();
            this.direction.x === 0 ?
                animations.playerNormal.run() : animations.playerLR.run();
        }
        if (this.prev.slowMove !== this.slowMove)
            animations.hitboxShow.run();
        let speedRate = (this.diagonalMove ? diagonalRate : 1) * (this.slowMove ? this.slowSpeed : this.baseSpeed)
        this.prev.direction = this.direction.x;
        this.prev.slowMove = this.slowMove;
        this.pos.x += this.direction.x * speedRate;
        this.pos.y += this.direction.y * speedRate;
        if (this.pos.x > W - limitDistance.right) this.pos.x = W - limitDistance.right;
        else if (this.pos.x < limitDistance.left) this.pos.x = limitDistance.left;
        if (this.pos.y > H - limitDistance.bottom) this.pos.y = H - limitDistance.bottom;
        else if (this.pos.y < limitDistance.top) this.pos.y = limitDistance.top;
    }
}