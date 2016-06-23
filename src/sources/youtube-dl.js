import { spawn } from 'child_process';
import concat from 'concat-stream';

export default {
    name: 'youtube-dl',

    async handles(inputUrl) {
        const ytdl = spawn('youtube-dl', [inputUrl, '-j']);

        const [stdout, success] = await Promise.all([
            new Promise((resolve, reject) => {
                ytdl.on('error', reject);
                ytdl.stdout.pipe(concat(resolve));
            }),
            new Promise((resolve, reject) => {
                ytdl
                .on('exit', code => {
                    resolve(code === 0);
                })
                .on('error', reject);
            })
        ]);

        if(!success) return false;

        const obj = JSON.parse(stdout);

        return obj.extractor !== 'generic';
    },

    getStream(inputUrl) {
        const ytdl = spawn('youtube-dl', [inputUrl, '-f', 'bestaudio', '-o', '-']);

        return {
            stream: ytdl.stdout,
            format: ''
        };
    }
};
