import Page from "./Page.js";

export default class WaitingPage extends Page {
    constructor(ctx) {
        super(ctx, { font: "bold 28px system-ui" });
    }
    wait() {
        this.clear();
        this.write(`等待加载资源完毕...`, true, { fillStyle: "lightblue" });
    }
    fail(count = 0) {
        this.clear();
        this.write(`${count}个资源加载失败`, true, { fillStyle: "orangered" });
    }
}