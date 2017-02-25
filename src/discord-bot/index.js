import Discord from 'discord.js';
import Rx from 'rxjs/Rx';
import R from 'ramda';
import deepstream from 'deepstream.io-client-js';

function dsRecordObservable(record) {
    return Rx.Observable.fromEventPattern(
        handler => record.subscribe(handler, true),
        handler => record.unsubscribe(handler)
    );
}

function songStateAsText(songState) {
    return `Current song: ${songState.currentSong ? `<${songState.currentSong}>` : 'nothing!'}

Queue: ${songState.queue.length <= 0 ? 'empty right now!' : ''}
${songState.queue.map(song => `- <${song}>`).join('\n')}`;
}

async function main() {
    const dsClient = deepstream(process.env.DEEPSTREAM_HOST_PORT).login({
        username: process.env.DEEPSTREAM_USERNAME,
        password: process.env.DEEPSTREAM_PASSWORD
    });

    const bot = new Discord.Client();

    await bot.login(process.env.DISCORD_TOKEN);


    const songStateRecord = dsClient.record.getRecord('song-state');


    const songState$ = dsRecordObservable(songStateRecord)
        .debounceTime(500);

    const messages$ = Rx.Observable.fromEvent(bot, 'message');

    const lastStatusMsg$ = messages$
        .filter(R.pipe(
            R.prop('cleanContent'),
            R.anyPass([
                R.test(/^#current$/),
                R.test(/^#queue$/)
            ])
        ))
        .flatMap(msg => msg.channel.sendMessage('Hold on a second...'));


    await Promise.all([
        Rx.Observable.combineLatest(lastStatusMsg$, songState$)
            .flatMap(([msg, songState]) => msg.edit(songStateAsText(songState)))
            .toPromise(),

        songState$
            .flatMap(songState =>
                bot.user.setGame(songState.currentSong)
            )
            .toPromise()
    ]);
}

main()
.catch((err) => console.error(err.stack));
