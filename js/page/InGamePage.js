import Page from "./Page.js";

export default class InGamePage extends Page {
    constructor(ctx) {
        super(ctx, {
            font: "bold 16px system-ui",
            fillStyle: "white"
        });
    }

    setCard(spellCard) {
        this.name = spellCard.name ?? "未命名";
        this.frame = (spellCard.time ?? 0) * FPS;
        this.stopped = false;
        this.success = false;
    }
    pause() {
        this.fill("#000000af", true);
        this.write("暂停中", true, {
            font: "bold 32px system-ui",
            fillStyle: "lightblue"
        });
    }
    play() {
        this.clear();
        // this.info();
    }
    info() {
        this.write(this.name, false, {
            font: "bold 16px 宋体",
            textAlign: "right",
            fillStyle: "khaki"
        }, W - 60, 20);
    }
    period(current) {
        this.ctx.clearRect(W - 60, 0, 60, 25);
        if (this.stopped) current = this.stopTime;
        let remain;
        if (current >= this.frame) {
            remain = 0;
            this.stop(current);
        } else remain = (this.frame - current) / FPS;
        const writeTime = (options = {}) => {
            this.write(remain.toFixed(2).padStart(5, "0"), false, {
                textAlign: "right",
                ...options
            }, W - 10, 20);
        }
        if (this.stopped) writeTime({
            fillStyle: this.success ? "limegreen" : "red"
        });
        else writeTime();
    }
    stop(current) {
        if (this.stopped) return;
        this.stopped = true;
        this.success = current >= this.frame;
        this.stopTime = current;
        // this.ctx.fillRect(0, 0, W, H / 2);
    }
}