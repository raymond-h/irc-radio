export default {
    name: 's16le',

    handles({ format }) {
        return format === 's16le';
    },

    transformFormat({ stream }, outStream) {
        stream.pipe(outStream);
    }
};
