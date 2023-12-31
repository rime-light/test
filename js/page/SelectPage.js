import {spellList} from "../item/SpellList.js";
import Page from "../baseClass/Page.js";

export default class SelectPage extends Page {
    constructor(ctx, updateCallback) {
        super(ctx);
        this.line = 0;
        this.page = 0;
        this.itemCount = spellList.length;
        this.pageCount = Math.ceil(this.itemCount / 8);
        this.callback = updateCallback;
    }

    cardId() {
        return this.line + (this.page << 3);
    }

    init(cardId) {
        let id = parseInt(cardId);
        if (isNaN(id) || id < 0 || id >= this.itemCount)
            id = 0;
        this.page = id >> 3;
        this.line = id - (this.page << 3);
        this.update(true);
    }

    finalPage() {
        return this.page === this.pageCount - 1;
    }

    nextLine() {
        this.line++;
        if (this.line >= 8 || (this.finalPage() && this.line >= this.itemCount - ((this.pageCount - 1) << 3)))
            this.line = 0;
        this.update();
    }
    prevLine() {
        this.line--;
        if (this.line < 0)
            this.line = (this.finalPage() ? this.itemCount - ((this.pageCount - 1) << 3) : 8) - 1;
        this.update();
    }

    nextPage() {
        this.page++;
        if (this.page >= this.pageCount)
            this.page = 0;
        else if (this.finalPage())
            this.line = Math.min(this.line, this.itemCount - ((this.pageCount - 1) << 3) - 1);
        this.update();
    }
    prevPage() {
        this.page--;
        if (this.page < 0) {
            this.page = this.pageCount - 1;
            this.line = Math.min(this.line, this.itemCount - ((this.pageCount - 1) << 3) - 1);
        }
        this.update();
    }

    update(silent) {
        let ctx = this.ctx;
        ctx.save();
        this.clear();
        this.fill();
        ctx.font = `16px ${spellFont}`;
        ctx.fillStyle = "#e8e8af1f";
        ctx.fillRect(0, Math.floor(this.line * H / 9 + 4 * H / 63), W, Math.floor(2 * H / 27));
        ctx.fillStyle = "#7fd9d9";
        ctx.fillText(spellList[this.cardId()].name, W >> 1, (this.line + 1) * H / 9);
        ctx.fillStyle = "#e8e8af";
        for (let i = 0; i < 8; i++) {
            let k = (this.page << 3) + i;
            if (k >= this.itemCount) break;
            if (this.line !== i)
                ctx.fillText(spellList[k].name, W >> 1, (i + 1) * H / 9);
        }
        ctx.font = "12px system-ui";
        ctx.fillStyle = "white";
        ctx.fillText(`页面 ${this.page + 1}/${this.pageCount}`, W >> 1, H - 6);
        ctx.restore();
        !silent && Sound.play("select");
        this.callback && this.callback();
    }
}