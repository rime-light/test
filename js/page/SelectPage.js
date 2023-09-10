import {spellList} from "../item/SpellList.js";

export default class SelectPage {
    constructor(ctx) {
        this.ctx = ctx;
        this.line = 0;
        this.page = 0;
        this.itemCount = spellList.length;
        this.pageCount = Math.ceil(this.itemCount / 8);
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
        this.update();
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

    update() {
        let ctx = this.ctx;
        ctx.save();
        ctx.font = "bold 16px Arial";
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#0000005f";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#7fd9d9";
        ctx.fillText(spellList[this.cardId()].name, W >> 1, (this.line + 1) * H / 9);
        ctx.fillStyle = "#e8e8af";
        ctx.strokeStyle = "black";
        for (let i = 0; i < 8; i++) {
            let k = (this.page << 3) + i;
            if (k >= this.itemCount) break;
            if (this.line !== i)
                ctx.fillText(spellList[k].name, W >> 1, (i + 1) * H / 9);
        }
        ctx.restore();
    }
}