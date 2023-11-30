import Page from "../baseClass/Page.js";

export default class InGamePage extends Page {
    constructor(ctx) {
        super(ctx, {
            font: "bold 16px system-ui",
            fillStyle: "white"
        });
    }

    setCard(spellCard) {
        let second = Math.floor(spellCard.time ?? 0);
        this.name = spellCard.name ?? "未命名";
        this.frame = second * FPS;
        this.stopped = false;
        this.success = false;
        this.countDown = Math.min(second, 5);
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
        this.info();
    }
    info() {
        this.write(this.name, true, {
            font: `16px ${spellFont}`,
            textAlign: "left",
            fillStyle: "ghostwhite",
            strokeStyle: "black"
        }, 10, 22);
        if (this.stopped) this.period(this.stopTime);
    }
    period(current) {
        const expand = 10, nw = 120 + expand, nh = 32;
        let countDownCanvas = new OffscreenCanvas(nw, nh),
            ctx = countDownCanvas.getContext("2d");
        let remain;
        if (current >= this.frame) {
            remain = 0;
            this.stop(current);
        } else remain = (this.frame - current) / FPS;
        if (remain > 0 && remain < this.countDown) {
            Sound.play("countDown");
            this.countDown--;
        }
        ctx.clearRect(0, 0, nw, nh);
        [...remain.toFixed(2).padStart(5, "0")].forEach((char, index) => {
            if (!ascii.has(char)) return;
            ctx.drawImage(ascii.get(char), index * (nw - expand) / 5, 0);
        });
        if (this.stopped) {
            let copy = new OffscreenCanvas(nw, nh),
                copyCtx = copy.getContext("2d");
            copyCtx.drawImage(countDownCanvas, 0, 0);
            copyCtx.globalCompositeOperation = "multiply";
            copyCtx.fillStyle = this.success ? "lawngreen" : "red";
            copyCtx.fillRect(0, 0, nw, nh);
            ctx.save();
            ctx.globalCompositeOperation = "source-atop";
            ctx.drawImage(copy, 0, 0);
            ctx.restore();
        }
        this.ctx.clearRect(W - (nw >> 1) - 20, 0, (nw >> 1) + 20, nh);
        this.ctx.drawImage(countDownCanvas, W - (nw >> 1) - 10, 10, nw >> 1, nh >> 1);
    }
    stop(current) {
        if (this.stopped) return;
        this.stopped = true;
        this.stopTime = current;
        if (current >= this.frame) {
            Sound.play("success");
            this.success = true;
        } else this.success = false;
        this.period(current);
        // this.ctx.fillRect(0, 0, W, H / 2);
    }
}