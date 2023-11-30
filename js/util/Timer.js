/**
 * 计时器(帧)
 * @namespace Timer
 */
export default class Timer {
    static waiting = [];

    /**
     * 等待一段时间后运行
     * @param {function} fn - 运行的函数
     * @param {number} frame - 等待时间(帧)
     * @returns {string} - 计时器ID
     */
    static wait(fn, frame) {
        if (frame <= 0) {
            fn();
            return "";
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

    /**
     * @typedef TimerCancel
     * @property {number} remain - 剩余时间
     * @property {function} fn - 被取消的函数
     */
    /**
     * 取消计时执行
     * @param {string} timerId - 要取消的ID
     * @returns {TimerCancel|null}
     */
    static cancel(timerId) {
        for (let single of this.waiting) {
            if (timerId === `${single.timestamp}${single.id}`) {
                single.canceled = true;
                return { remain: single.frame - single.currentFrame, fn: single.fn };
            }
        }
        return null;
    }

    /**
     * 下一帧
     */
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

    /**
     * @callback frameCalcCallback
     * @param {number} fps - 测得的帧率
     */
    /**
     * 计算requestAnimationFrame的帧率
     * @param {frameCalcCallback} fn - 回调
     */
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
                fn && fn(1000 * runCount / (timestamp - start));
                return;
            }
            requestAnimationFrame(next);
        }
        next();
    }
}