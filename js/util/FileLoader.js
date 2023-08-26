export default class FileLoader {
    static px = 16;
    static waitingList = [];
    static loading = false;
    static size(value) {
        return value * this.px;
    }
    static loadPng(filename, loadedFn, failedFn) {
        let img = new Image();
        img.src = `images/${filename}.png`;
        img.onload = () => {
            loadedFn(img);
        }
        img.onerror = () => {
            failedFn && failedFn({
                fullPath: img.src,
                filename,
                loadedFn,
                failedFn
            });
        };
    }
    static queue(loaderFn, filename, loadedFn) {
        if (this.loading) return false;
        this.waitingList.push({loaderFn, filename, loadedFn});
        return true;
    }
    static loadList(loadedFn, failedFn) {
        let failList = [];
        let waitingCount = this.waitingList.length;
        const finishFn = () => {
            this.waitingList = [];
            this.loading = false;
            failList.length > 0 ? (failedFn && failedFn({failList, loadedFn, failedFn})) : loadedFn();
        };
        this.loading = true;
        this.waitingList.forEach((loader) => {
            loader.loaderFn(loader.filename, (file) => {
                waitingCount--;
                loader.loadedFn(file);
                if (waitingCount <= 0) finishFn();
            }, (failData) => {
                waitingCount--;
                failList.push({
                    ...loader,
                    fullPath: failData.fullPath,
                });
                if (waitingCount <= 0) finishFn();
            })
        });
    }
    static saveAsCanvas(img, x, y, w, h, sw, sh) {
        x *= this.px;
        y *= this.px;
        w *= this.px;
        h *= this.px;
        sw = sw ?? w;
        sh = sh ?? h;
        let screen = document.createElement("canvas");
        let painter = screen.getContext("2d");
        screen.width = sw;
        screen.width = sh;
        painter.drawImage(img, x, y, w, h, 0, 0, sw, sh);
        return screen;
    }
    static saveAsCanvasList(img, x, y, w, h, rowCount, columnCount, sw, sh) {
        let canvasList = [];
        for (let i = 0; i < rowCount; i++) {
            for (let j = 0; j < columnCount; j++) {
                canvasList.push(this.saveAsCanvas(img, x + w * j, y + h * i, w, h, sw, sh));
            }
        }
        return canvasList;
    }
}
