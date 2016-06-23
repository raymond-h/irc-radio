import Client from 'squelch-client';
import Radio from './radio';
import Queue from './queue';

async function main() {
    const client = new Client({
        server: 'irc.esper.net',
        nick: 'Otsu-chan',
        autoConnect: false,
        channels: ['#kellyirc']
    });

    await client.connect();

    const radio = new Radio();
    radio.out.pipe(process.stdout);

    const queue = new Queue(radio);

    const playRegex = /^#play\s+(.+)$/;
    client.on('msg', ({ to, msg }) => {
        const match = playRegex.exec(msg);
        if(match == null) return;

        client.msg(to, "OK, I'll sing it!");

        queue.queueUrl(match[1]);
    });

    const nextRegex = /^#next$/;
    client.on('msg', ({ to, msg }) => {
        const match = nextRegex.exec(msg);
        if(match == null) return;

        client.msg(to, 'OK, skipping to next song!');

        queue.next();
    });

    radio.on('song-end', (url, stream, manual) => console.error('SONG ENDED:', url, 'MANUALLY?', manual));
    radio.on('song-start', (url) => console.error('NOW PLAYING:', url));
}

main()
.catch((err) => console.error(err.stack));
