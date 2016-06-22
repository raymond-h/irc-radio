import Throttle from 'throttle';
import { Readable as PcmSilenceReadable } from 'pcm-silence';

import got from 'got';
import ffmpeg from 'fluent-ffmpeg';

import { Readable as MixingReadable } from './live-mixing';

export default class Radio {
    constructor() {
        this.mr = new MixingReadable({ highWaterMark: 1024 });

        this.out = this.mr.pipe(new Throttle(44100 * 2 * 2));

        (new PcmSilenceReadable({
            signed: true,
            bitDepth: 16,
            byteOrder: 'LE'
        }))
        .pipe(this.mr.createInputStream());
    }

    play(url) {
        ffmpeg(got.stream(url))
            .audioChannels(2)
            .audioFrequency(44100)
            .format('s16le')
            .pipe(this.mr.createInputStream());
    }
}
