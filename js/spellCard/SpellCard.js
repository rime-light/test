export default class SpellCard {
    constructor(props) {
        this.basePos = { x: 0, y: 0 };
        this.globalFrame = 0;
        this.frame = 0;
        this.value = {};
        this.currentValue = {};
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

export function createWay(angle, way, current, isCircle, interval) {
    isCircle = isCircle ?? true;
    return angle + ((isCircle || !interval) ? 2 * PI * current / way : (current - (way - 1) / 2) * interval);
}