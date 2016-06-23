import stream from 'stream';
import _ from 'lodash';

function clampS16(n) {
    return Math.max(-Math.pow(2, 15), Math.min(n, Math.pow(2, 15)-1));
}

function mixSingleSamples(samples) {
    return clampS16(_.sum(samples));
}

function mixSamples(chunks) {
    if(chunks.length === 0) return new Buffer(0);

    const len = _.max(chunks.map((c) => c.length));
    const out = new Buffer(len);

    for(let i = 0; i < len; i+=2) {
        const samples =
            chunks.map((chunk) => {
                if(i >= chunk.length) return 0;

                return chunk.readInt16LE(i);
            });

        out.writeInt16LE(mixSingleSamples(samples), i);
    }

    return out;
}

function streamBuffer(stream, maxBufferSize = 16384) {
    let isDone = false;
    let buffer = new Buffer(0);

    stream
    .on('data', data => {
        buffer = Buffer.concat([buffer, data]);

        if(buffer.length >= maxBufferSize) {
            stream.pause();
        }
    })
    .on('end', () => {
        isDone = true;
    });

    return {
        read(size) {
            const data = buffer.slice(0, size);
            buffer = buffer.slice(size);

            if(buffer.length < maxBufferSize) {
                stream.resume();
            }

            return data;
        },

        get isDone() {
            return isDone && buffer.length == 0;
        }
    };
}

export class Readable extends stream.Readable {
    constructor(opts) {
        super(opts);

        this.inStreams = [];
    }

    createInputStream() {
        const s = new stream.PassThrough();
        const sb = streamBuffer(s);
        this.inStreams.push(sb);
        return s;
    }

    _read(size) { this._tryRead(size); }

    _tryRead(size) {
        this.inStreams = this.inStreams.filter(sb => !sb.isDone);

        if(this.inStreams.length === 0) return this.push(null);

        const chunks = this.inStreams.map(sb => sb.read(size));

        if(this.push(mixSamples(chunks))) {
            setImmediate(() => this._tryRead(size));
        }
    }
}

// console.error('Let us go!');
//
// const mr = new MixingReadable({ highWaterMark: 1024 });
//
// mr.pipe(new Throttle(44100 * 2 * 2)).pipe(process.stdout);
//
// (new PcmSilenceReadable({
//     signed: true,
//     bitDepth: 16,
//     byteOrder: 'LE'
// }))
// .pipe(mr.createInputStream());
//
// net.createServer((c) => {
//     console.error('New client', c.address());
//     c.pipe(mr.createInputStream());
// })
// .listen(8080);
