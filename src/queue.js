import R from 'ramda';
import { EventEmitter } from 'events';

export default class Queue extends EventEmitter {
    constructor(radio) {
        super();
        this.radio = radio;
        this.queue = [];
        this.emit('queue-changed', this.queue);

        this.radio.on('song-end', () => {
            if(this.queue.length > 0) {
                this.radio.play(R.head(this.queue));
                this.queue = R.tail(this.queue);
                this.emit('queue-changed', this.queue);
            }
        });
    }

    queueUrl(url) {
        if(!this.radio.isPlaying) {
            this.radio.play(url);
            return;
        }

        this.queue = R.append(url, this.queue);
        this.emit('queue-changed', this.queue);
    }

    next() {
        this.radio.stop();
    }

    clear() {
        this.queue = [];
        this.emit('queue-changed', this.queue);
    }
}
