export default class Page {
    constructor(ctx, options) {
        options = {
            ...{
                textAlign: "center",
                lineWidth: 1,
                strokeStyle: "#808080"
            }, ...options
        };
        Object.keys(options).forEach((value) => {
            if (ctx[value] !== options[value])
                ctx[value] = options[value];
        });
        this.ctx = ctx;
    }
    clear() {
        this.ctx.clearRect(0, 0, W, H);
    }
    fill(color = "#0000005f", needSave) {
        let ctx = this.ctx;
        needSave && ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, W, H);
        needSave && ctx.restore();
    }
    write(txt, stroke, options, x = W >> 1, y = H >> 1) {
        let optionList, needSave = false;
        if (options) {
            optionList = Object.keys(options);
            needSave = optionList.length > 0;
        }
        if (needSave) {
            this.ctx.save();
            optionList.forEach((value) => this.ctx[value] = options[value]);
        }
        if (txt) {
            this.ctx.fillText(txt, x, y);
            stroke && this.ctx.strokeText(txt, x, y);
        }
        needSave && this.ctx.restore();
    }
}