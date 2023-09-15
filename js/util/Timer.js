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
            currentFrame: 0,
            canceled: false
        });
        return `${timestamp}${id}`;
    }
    static cancel(timerId) {
        for (let single of this.waiting) {
            if (timerId === `${single.timestamp}${single.id}`) {
                single.canceled = true;
                return { remain: single.frame - single.currentFrame, fn: single.fn };
            }
        }
        return null;
    }
    static nextFrame() {
        let runList = [];
        this.waiting = this.waiting.filter((single) => {
            if (single.canceled) return false;
            single.currentFrame++;
            if (single.currentFrame >= single.frame) {
                runList.push(single.fn);
                return false;
            }
            return true;
        });
        runList.forEach((fn) => fn());
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