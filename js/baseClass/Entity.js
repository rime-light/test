/**
 * @classdesc 实体类
 * @property {number} frame - 实体当前时间(帧)
 * @property {number} size - 判定大小
 * @property {Object} style - 样式
 * @property {Point} pos - 当前位置
 * @property {Point} basePos - 基础位置
 * @property {number} baseSpeed - 移动速度
 * @property {Object} transform - 图像变换起始状态
 * @property {Object} transformValue - 图像变换当前状态
 */
export default class Entity {
    constructor(props) {
        this.frame = 0;
        this.size = 0;
        this.style = null;
        this.pos = { x: 0, y: 0 };
        this.basePos = { x: 0, y: 0 };
        this.baseSpeed = 0;
        this.transform = {};
        Object.assign(this, props);
        this.transformValue = {...this.transform};
    }

    /**
     * 实体移动
     */
    move() {}

    /**
     * 判断是否应被清除
     * @returns {boolean}
     */
    cleared() {
        return false;
    }

    /**
     * 清除图像变换
     * @param {...string} names - 变换名称
     */
    clearTransform(...names) {
        if (!names.length) {
            this.transform = {};
            this.transformValue = {};
            return;
        }
        names.forEach(name => {
            delete this.transform[name];
            delete this.transformValue[name];
        });
    }

    /**
     * 图像变换动画
     * @param {string} name - 变换名称
     * @param {number} totalFrame - 总时长
     * @param {number} endValue - 变换结束状态
     * @param {number} currentFrame - 当前时间
     * @returns {number}
     */
    animation(name, totalFrame = 10, endValue = 1, currentFrame = this.frame) {
        if (currentFrame < 0 || currentFrame > totalFrame) return -1;
        let startValue = this.transform[name];
        this.transformValue[name] = startValue + (endValue - startValue) * currentFrame / totalFrame;
        return currentFrame === totalFrame ? 0 : 1;
    }

    /**
     * 当前帧匹配
     * @param {number} value - 帧
     * @returns {boolean}
     */
    frameMatch(value) {
        return !(this.frame % value);
    }

    /**
     * 当前帧相等
     * @param {number} value - 帧
     * @returns {boolean}
     */
    frameEqual(value) {
        return this.frame === value;
    }
}

export class BaseCheck {
    static posOutOfRect(pos, x, y, w, h) {
        return pos.x > x + w || pos.x < x ||
            pos.y > y + h || pos.y < y;
    }
    static outOfRect(entity, x, y, w, h) {
        return BaseCheck.posOutOfRect(entity.pos, x - entity.size, y - entity.size, w + 2 * entity.size, h + 2 * entity.size);
    }
    static posOutOfCircle(pos, x, y, r) {
        let px = pos.x - x, py = pos.y - y;
        return px * px + py * py >= r * r;
    }
    static outOfCircle(entity, x, y, r) {
        return BaseCheck.posOutOfCircle(entity.pos, x, y, entity.size + r);
    }
    static isCrash(entity1, entity2) {
        return !BaseCheck.outOfCircle(entity1, entity2.pos.x, entity2.pos.y, entity2.size);
    }
    static never() {
        return false;
    }
    static outOfScreen(entity) {
        let pos = entity.pos, size = entity.style.size;
        return BaseCheck.outOfRect({pos, size}, 0, 0, W, H);
    }
    static timeOver(entity, limit) {
        return entity.frame > limit;
    }
}
