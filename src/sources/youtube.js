import url from 'url';
import ytdl from 'ytdl-core';

export default {
    name: 'youtube',

    handles(inputUrl) {
        const urlParts = url.parse(inputUrl);

        return /http/.test(urlParts.protocol) &&
            /youtube\.[a-z]+/i.test(urlParts.host) &&
            /watch/.test(urlParts.pathname);
    },

    getStream(inputUrl) {
        return {
            stream: ytdl(inputUrl, { filter: 'audioonly' }),
            format: ''
        };
    }
};
