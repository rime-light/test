const filetype = "video/webm;codecs=vp9";
export default class Recorder {
    static recorder;
    static stream;
    static data;
    static recording = false;
    static set(source) {
        this.stream = source.captureStream(60);
    }
    static start() {
        this.data = [];
        const recorder = new MediaRecorder(this.stream, {
            videoBitsPerSecond: 12000000,
            mimeType: filetype
        });
        recorder.ondataavailable = (event) => this.data.push(event.data);
        recorder.onstop = () => {
            let videoURL = URL.createObjectURL(new Blob(this.data, { type: filetype }));
            let link = document.createElement("a");
            link.style.display = "none";
            link.href = videoURL;
            link.download = "record.webm";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(videoURL);
        };
        recorder.start(200);
        this.recorder = recorder;
        this.recording = true;
    }
    static stop() {
        this.recorder.stop();
        this.recording = false;
    }
}