import got from 'got';

export default {
    name: 'plain http',

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
