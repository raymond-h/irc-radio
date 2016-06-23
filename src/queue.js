export default class Queue {
    constructor(radio) {
        this.radio = radio;
        this.queue = [];

        this.radio.on('song-end', () => {
            if(this.queue.length > 0) {
                this.radio.play(this.queue.shift());
            }
        });
    }

    queueUrl(url) {
        if(!this.radio.isPlaying) {
            this.radio.play(url);
            return;
        }

        this.queue.push(url);
    }

    next() {
        this.radio.stop();
    }

    clear() {
        this.queue = [];
    }
}
