import got from 'got';

export default {
    handles() {
        return true;
    },

    getStream(url) {
        return {
            stream: got.stream(url),
            format: ''
        };
    }
};
