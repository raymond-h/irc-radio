import ffmpeg from 'fluent-ffmpeg';

export default {
    name: 'ffmpeg',

    handles() {
        return true;
    },

    transformFormat({ stream, format }, outStream) {
        ffmpeg(stream)
            .audioChannels(2)
            .audioFrequency(44100)
            .format('s16le')
            .pipe(outStream);
    }
};
