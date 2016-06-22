import fs from 'fs';
import Throttle from 'throttle';
import { Readable as PcmSilenceReadable } from 'pcm-silence';

import { Readable as MixingReadable } from './live-mixing';

const mr = new MixingReadable({ highWaterMark: 1024 });

mr
.pipe(new Throttle(44100 * 2 * 2))
.pipe(process.stdout);

(new PcmSilenceReadable({
    signed: true,
    bitDepth: 16,
    byteOrder: 'LE'
}))
.pipe(mr.createInputStream());

setTimeout(() => {
    fs.createReadStream('out.wav').pipe(mr.createInputStream());
}, 3000);
