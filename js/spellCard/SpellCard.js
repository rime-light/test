export default class SpellCard {
    constructor(props) {
        this.basePos = { x: 0, y: 0 };
        this.globalFrame = 0;
        this.frame = 0;
        this.value = {};
        this.currentValue = {};
        this.waitTime = {};
        Object.assign(this, props);
    }
    setValue(value) {
        Object.assign(this.value, value);
    }
    setCurrentValue(value) {
        Object.assign(this.currentValue, value);
    }
    setBothValue(value) {
        this.setValue(value);
        this.setCurrentValue(value);
    }
    frameEqual(value) {
        return this.frame === value;
    }
    frameMatch(value) {
        return this.frame % value === 0;
    }
    nextFrame() {
        this.globalFrame++;
        this.frame++;
    }
    nextWave() {
        this.frame = 0;
    }
}

export function createWay(angle, way, current, interval) {
    return angle + (interval ? (current - (way - 1) / 2) * interval : (2 * PI * current / way));
}