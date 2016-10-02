import cp from 'child_process';

export default {
    name: 'ffmpeg',

    handles() {
        return true;
    },

    transformFormat({ stream, format }, outStream) {
        const ffmpeg = cp.spawn('ffmpeg', [
            '-i', '-',
            '-ac', '2', '-ar', '44100', '-f', 's16le', '-'
        ]);

        stream.pipe(ffmpeg.stdin);
        ffmpeg.stdout.pipe(outStream);
    }
};
