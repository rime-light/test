import Entity from "../baseClass/Entity.js";

/**
 * @classdesc 弹幕类
 * @property {boolean} safe - 是否有判定
 * @property {boolean} alive - 是否应被消除
 * @property {boolean} lighter - 是否为瞎眼效果
 * @property {boolean} top - 是否在顶层绘制
 * @property {Point} speed - 移动速度，仅在纵横分离计算时使用
 * @property {number} angle - 移动时的角度
 * @property {number} change - 状态变更次数
 */
export default class Bullet extends Entity {
    constructor(props) {
        super({
            ...{
                safe: false,
                alive: true,
                lighter: false,
                top: false,
                speed: { x: 0, y: 0 },
                angle: 0,
                change: 0
            }, ...props
        });
    }

    /**
     * @callback bulletFn
     * @param {Bullet} item - 当前实体
     */

    /**
     * 设置实体移动函数
     * @param {bulletFn} fn
     */
    setMove(fn) {
        let moveFn = () => {
            this.frame++;
            fn(this);
        };
        this.move = moveFn.bind(this);
    }

    /**
     * 设置清除检测函数
     * @param {bulletFn} fn
     */
    setClearedCheck(fn) {
        let clearedFn = () => fn(this);
        this.cleared = clearedFn.bind(this);
    }

    /**
     * 按照纵横速度分别进行移动
     * @param {boolean} setAngle - 是否根据当前速度方向重设角度
     */
    speedXY(setAngle) {
        this.pos.x += this.speed.x;
        this.pos.y += this.speed.y;
        if (setAngle) this.angle = posAngle({x: 0, y: 0}, this.speed);
    }

    /**
     * 向指定方向以指定速度移动
     * @param {number} angle - 角度，默认为当前角度
     * @param {number} speed - 速度，默认为基础速度
     */
    speedAngle(angle = this.angle, speed = this.baseSpeed) {
        this.pos.x += speed * Math.cos(angle);
        this.pos.y += speed * Math.sin(angle);
    }

    /**
     * 变更角度
     * @param {Point} origin - 一个坐标，用于计算到当前位置的指向，此点默认为基础位置
     * @param {boolean} reverse - 是否反向
     */
    angleChange(origin, reverse) {
        origin = origin ?? this.basePos;
        this.angle = posAngle(origin, this.pos, this.angle);
        if (reverse) this.angle += PI;
    }

    /**
     * 指向某位置
     * @param {Point} pos - 目标，默认为自机
     */
    shootTo(pos) {
        pos = pos ?? player.pos;
        this.angleChange(pos, true);
    }
}