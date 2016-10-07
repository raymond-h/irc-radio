import deepstream from 'deepstream.io-client-js';
import R from 'ramda';

function modifyRecord(record, path, fn) {
    record.set(path, fn(record.get(path)));
}

function main() {
    const dsClient = deepstream(process.env.DEEPSTREAM_HOST_PORT).login({
        username: process.env.DEEPSTREAM_USERNAME,
        password: process.env.DEEPSTREAM_PASSWORD
    });

    const songStateRecord = dsClient.record.getRecord('song-state');
    songStateRecord.whenReady(() => {
        songStateRecord.set({ currentSong: null, queue: [], ...songStateRecord.get() });
    });

    // Manage popping off of queue if nothing's playing ATM
    songStateRecord.subscribe(({ currentSong, queue }) => {
        if(currentSong == null && !R.isEmpty(queue)) {
            songStateRecord.set('currentSong', R.head(queue));
            songStateRecord.set('queue', R.tail(queue));
        }
    }, true);

    // Handle requests to modify the queue
    dsClient.event.subscribe('queue', data => {
        switch(data.action) {
            case 'add': {
                modifyRecord(songStateRecord, 'queue', R.append(data.url));
                break;
            }
            case 'next': {
                songStateRecord.set('currentSong', null);
                break;
            }
        }
    });
}

main();
