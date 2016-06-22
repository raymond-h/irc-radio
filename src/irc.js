import Client from 'squelch-client';
import Radio from './radio';

const playRegex = /^#play\s+(.+)$/;

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

    client.on('msg', ({ to, msg }) => {
        const match = playRegex.exec(msg);
        if(match == null) return;

        client.msg(to, "OK, I'll sing it!");

        const url = match[1];
        radio.play(url);
    });
}

main()
.catch((err) => console.error(err.stack));
