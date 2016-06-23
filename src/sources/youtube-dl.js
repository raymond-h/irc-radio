import url from 'url';
import { spawn } from 'child_process';

export default {
    name: 'youtube-dl',

    async handles(inputUrl) {
        const urlParts = url.parse(inputUrl);

        return /http/.test(urlParts.protocol) &&
            /youtube\.[a-z]+/i.test(urlParts.host) &&
            /watch/.test(urlParts.pathname);
    },

    getStream(inputUrl) {
        const ytdl = spawn('youtube-dl', [inputUrl, '-f', 'bestaudio', '-o', '-']);

        return {
            stream: ytdl.stdout,
            format: ''
        };
    }
};
