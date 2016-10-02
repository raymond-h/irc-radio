import Client from 'squelch-client';
import deepstream from 'deepstream.io-client-js';

async function main() {
    const dsClient = deepstream(process.env.DEEPSTREAM_HOST_PORT).login({
        username: process.env.DEEPSTREAM_USERNAME,
        password: process.env.DEEPSTREAM_PASSWORD
    });

    const client = new Client({
        server: 'irc.esper.net',
        nick: 'Otsu-chan',
        autoConnect: false,
        channels: [process.argv[2]]
    });

    await client.connect();

    const songStateRecord = dsClient.record.getRecord('song-state');

    const playRegex = /^#play\s+(.+)$/;
    client.on('msg', ({ to, msg }) => {
        const match = playRegex.exec(msg);
        if(match == null) return;

        client.msg(to, "OK, I'll sing it!");

        dsClient.event.emit('queue', { action: 'add', url: match[1] });
    });

    const nextRegex = /^#next$/;
    client.on('msg', ({ to, msg }) => {
        const match = nextRegex.exec(msg);
        if(match == null) return;

        client.msg(to, 'OK, skipping to next song!');

        dsClient.event.emit('queue', { action: 'next' });
    });

    const currentRegex = /^#current$/;
    client.on('msg', ({ to, msg }) => {
        const match = currentRegex.exec(msg);
        if(match == null) return;

        if(songStateRecord.get('currentSong') != null) {
            client.msg(to, `The current song is: ${ songStateRecord.get('currentSong') }`);
        }
        else {
            client.msg(to, 'Not singing at all right now!');
        }
    });

    const queueRegex = /^#queue$/;
    client.on('msg', ({ to, msg }) => {
        const match = queueRegex.exec(msg);
        if(match == null) return;

        const queue = songStateRecord.get('queue');
        if(queue.length === 0) {
            client.msg(to, 'No songs coming up!');
            return;
        }

        client.msg(to, 'Coooooming up!');
        for(const song of queue) {
            client.msg(to, `> ${song}`);
        }
    });
}

main()
.catch((err) => console.error(err.stack));
