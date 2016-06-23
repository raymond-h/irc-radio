import Throttle from 'throttle';
import eos from 'end-of-stream';
import { Readable as PcmSilenceReadable } from 'pcm-silence';
import pify from 'pify';

import youtubeSource from './sources/youtube';
import httpSource from './sources/http';
import pmSource from './sources/playmusic';
import ffmpegFormat from './formats/ffmpeg';
import s16leFormat from './formats/s16le';

import { Readable as MixingReadable } from './live-mixing';

const eosPromise = pify(eos);

async function findAsync(array, fn) {
    for(const value of array) {
        if(await Promise.resolve(fn(value))) return value;
    }

    return null;
}

export default class Radio {
    constructor() {
        this.mr = new MixingReadable({ highWaterMark: 1024 });

        this.out = this.mr.pipe(new Throttle(44100 * 2 * 2));

        this.playing = false;
        this.urlQueue = [];

        (new PcmSilenceReadable({
            signed: true,
            bitDepth: 16,
            byteOrder: 'LE'
        }))
        .pipe(this.mr.createInputStream());

        this.sources = [
            youtubeSource,
            pmSource,
            httpSource
        ];

        this.formats = [
            s16leFormat,
            ffmpegFormat
        ];
    }

    queue(url) {
        if(!this.playing) {
            this.play(url);
            return;
        }

        this.urlQueue.push(url);
    }

    async play(url) {
        this.playing = true;

        try {
            const source = await findAsync(this.sources, source => source.handles(url));
            console.error('USING SOURCE TYPE:', source.name);

            const input = await Promise.resolve(source.getStream(url));

            const format = await findAsync(this.formats, format => format.handles(input));
            console.error('USING FORMAT TYPE:', format.name);

            const outStream = this.mr.createInputStream();
            format.transformFormat(input, outStream);

            await eosPromise(outStream);
        }
        catch(err) {
            console.error(err);
        }
        finally {
            if(this.urlQueue.length === 0) {
                this.playing = false;
                return;
            }

            this.play(this.urlQueue.shift());
        }
    }
}
