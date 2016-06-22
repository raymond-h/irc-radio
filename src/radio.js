import _ from 'lodash';
import Throttle from 'throttle';
import { Readable as PcmSilenceReadable } from 'pcm-silence';

import httpSource from './sources/http';
import ffmpegFormat from './formats/ffmpeg';

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

        this.sources = [
            httpSource
        ];

        this.formats = [
            ffmpegFormat
        ];
    }

    play(url) {
        const source = _.find(this.sources, source => source.handles(url));

        const input = source.getStream(url);

        const format = _.find(this.formats, format => format.handles(input));

        format.transformFormat(input, this.mr.createInputStream());
    }
}
