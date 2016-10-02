import deepstream from 'deepstream.io-client-js';
import R from 'ramda';
import Radio from './radio';
import Queue from './queue';

async function main() {
    const dsClient = deepstream(process.env.DEEPSTREAM_HOST_PORT).login({
        username: process.env.DEEPSTREAM_USERNAME,
        password: process.env.DEEPSTREAM_PASSWORD
    });

    const radio = new Radio();
    radio.out.pipe(process.stdout);

    const queue = new Queue(radio);

    dsClient.event.subscribe('queue', data => {
        switch(data.action) {
            case 'add': queue.queueUrl(data.url); break;
            case 'next': queue.next(); break;
        }
    });

    const songStateRecord = dsClient.record.getRecord('song-state');
    const setSongStatePath = R.curryN(2, ::songStateRecord.set);

    songStateRecord.set({ currentSong: null, queue: queue.queue });

    queue.on('queue-changed', setSongStatePath('queue'));
    radio.on('song-end', () => setSongStatePath('currentSong', null));
    radio.on('song-start', setSongStatePath('currentSong'));

    radio.on('song-end', (url, stream, manual) => console.error('SONG ENDED:', url, 'MANUALLY?', manual));
    radio.on('song-start', (url) => console.error('NOW PLAYING:', url));
}

main()
.catch((err) => console.error(err.stack));
