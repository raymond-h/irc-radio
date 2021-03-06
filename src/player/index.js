import minimist from 'minimist';
import deepstream from 'deepstream.io-client-js';
// import R from 'ramda';
import Radio from './radio';

async function main(argv) {
    const dsClient = deepstream(process.env.DEEPSTREAM_HOST_PORT).login({
        username: process.env.DEEPSTREAM_USERNAME,
        password: process.env.DEEPSTREAM_PASSWORD
    });

    const radio = new Radio({
        useAWGN: argv.useAwgn
    });
    radio.out.pipe(process.stdout);

    radio.on('error', e => {
        console.error('*** ERROR OCCURED');
        console.error(e.stack);
        songStateRecord.set('currentSong', null);
    });

    const songStateRecord = dsClient.record.getRecord('song-state');

    let currentlyPlayingUrl = null;

    songStateRecord.whenReady(() => {
        songStateRecord.set({ currentSong: null, ...songStateRecord.get() });

        // Manage always playing currentSong
        songStateRecord.subscribe('currentSong', currentSong => {
            if(currentlyPlayingUrl == currentSong) return;
            currentlyPlayingUrl = currentSong;

            radio.stop();

            if(currentSong != null) {
                radio.play(currentSong).catch(e => radio.emit('error', e));
            }
        }, true);

        // Update currentSong to reflect no song is playing anymore
        radio.on('song-end', () => {
            currentlyPlayingUrl = null;
            songStateRecord.set('currentSong', null);
        });

        radio.on('song-end', (url, stream, manual) => console.error('SONG ENDED:', url, 'MANUALLY?', manual));
        radio.on('song-start', (url) => console.error('NOW PLAYING:', url));
    });
}

main(
    minimist(process.argv.slice(2), {
        boolean: ['useAwgn'],
        alias: {
            useAwgn: 'w'
        }
    })
)
.catch((err) => console.error(err.stack));
