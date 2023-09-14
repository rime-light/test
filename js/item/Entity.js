export default class Entity {
    constructor(props) {
        this.frame = 0;
        this.size = 0;
        this.safe = false;
        this.style = null;
        this.lighter = false;
        this.top = false;
        this.pos = { x: 0, y: 0 };
        this.speed = { x: 0, y: 0 };
        this.basePos = 0;
        this.baseSpeed = 0;
        this.angle = 0;
        this.change = 0;
        this.transform = {};
        Object.assign(this, props);
        this.transformValue = {...this.transform};
    }
    move() {
        return false;
    }
    cleared() {
        return false;
    }
    setMove(fn) {
        let moveFn = () => {
            this.frame++;
            fn(this);
        };
        this.move = moveFn.bind(this);
    }
    setClearedCheck(fn) {
        let clearedFn = () => fn(this);
        this.cleared = clearedFn.bind(this);
    }
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
    animation(name, totalFrame = 10, endValue = 1, currentFrame = this.frame) {
        if (currentFrame > totalFrame) return -1;
        let startValue = this.transform[name];
        this.transformValue[name] = startValue + (endValue - startValue) * currentFrame / totalFrame;
        return currentFrame === totalFrame ? 0 : 1;
    }
    speedXY() {
        this.pos.x += this.speed.x;
        this.pos.y += this.speed.y;
    };
    speedAngle(angle = this.angle, speed = this.baseSpeed) {
        this.pos.x += speed * Math.cos(angle);
        this.pos.y += speed * Math.sin(angle);
    }
    angleChange(origin, reverse) {
        origin = origin ?? this.basePos;
        this.angle = posAngle(origin, this.pos, this.angle);
        if (reverse) this.angle += PI;
    }
    shootTo(pos) {
        pos = pos ?? player.pos;
        this.angleChange(pos, true);
    }
    frameMatch(value) {
        return this.frame % value === 0;
    }
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
