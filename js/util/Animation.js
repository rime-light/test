export default class CanvasAnimation {

    constructor(interval, step, infinity, keepStep) {
        this.frame = 0;
        this.currentStep = 0;
        this.running = false;
        this.paused = false;
        this.interval = interval;
        this.step = step;
        this.infinity = infinity ?? false;
        this.keepStep = keepStep ?? false;
        this.endFn = null;
    }

    nextFrame(fn, reverse) {
        if (this.running) {
            fn(this.currentStep);
            if (this.paused) return;
            this.frame++;
            if (this.frame >= this.interval) {
                this.frame = 0;
                if (reverse) {
                    this.currentStep--;
                    if (this.currentStep < 0) {
                        if (this.infinity) this.currentStep = this.step - 1;
                        else {
                            this.currentStep = 0;
                            this.keepStep ? this.pause() : this.stop();
                            if (this.endFn) this.endFn();
                        }
                    }
                } else {
                    this.currentStep++;
                    if (this.currentStep >= this.step) {
                        if (this.infinity) this.currentStep = 0;
                        else {
                            this.currentStep = this.step - 1;
                            this.keepStep ? this.pause() : this.stop();
                            if (this.endFn) this.endFn();
                        }
                    }
                }
            }
        }
    }

    run(endFn) {
        if (endFn) this.endFn = endFn;
        this.running = true;
        this.paused = false;
    }

    pause() {
        this.paused = true;
    }

    stop() {
        this.frame = 0;
        this.currentStep = 0;
        this.running = false;
    }

}
