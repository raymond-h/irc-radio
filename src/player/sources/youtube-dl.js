import url from 'url';
import { spawn } from 'child_process';

export default {
    name: 'youtube-dl',

    async handles(inputUrl) {
        const urlParts = url.parse(inputUrl);

        return (
                /http/.test(urlParts.protocol) &&
                /youtube\.[a-z]+/i.test(urlParts.host) &&
                /watch/.test(urlParts.pathname)
            ) || (
                /http/.test(urlParts.protocol) &&
                /bandcamp\.com/i.test(urlParts.host)
            ) || (
                /http/.test(urlParts.protocol) &&
                /soundcloud\.com/i.test(urlParts.host)
            )
        ;
    },

    getStream(inputUrl) {
        const ytdl = spawn('youtube-dl', [inputUrl, '--no-check-certificate', '-f', 'bestaudio', '--no-playlist', '-o', '-']);

        return {
            stream: ytdl.stdout,
            format: ''
        };
    }
};
