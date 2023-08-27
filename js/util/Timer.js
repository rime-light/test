export default class Timer {
    static waiting = [];
    static wait(fn, frame) {
        if (frame <= 0) {
            fn();
            return 0;
        }
        let id = this.waiting.length > 0 ? this.waiting.at(-1).id + 1 : 0,
            timestamp = `${randomInt(0, 65535).toString(16)}${Date.now().toString(16)}`;
        this.waiting.push({
            id,
            fn,
            frame,
            timestamp,
            currentFrame: 0
        });
        return `${timestamp}${id}`;
    }
    static cancel(timerId) {
        for (let i = 0; i < this.waiting.length; i++) {
            let single = this.waiting[i];
            if (timerId === `${single.timestamp}${single.id}`) {
                this.waiting.splice(i, 1);
                break;
            }
        }
    }
    static nextFrame() {
        this.waiting = this.waiting.filter((single) => {
            single.currentFrame++;
            if (single.currentFrame >= single.frame) {
                single.fn();
                return false;
            }
            return true;
        });
    }
    static frameCalc(fn) {
        let start = null;
        let runCount = 0;
        const next = (timestamp) => {
            if (!timestamp) {
                requestAnimationFrame(next);
                return;
            }
            if (!start) start = timestamp;
            runCount++;
            if (timestamp - start > 500) {
                fn && fn(runCount * 2);
                return;
            }
            requestAnimationFrame(next);
        }
        next();
    }
}