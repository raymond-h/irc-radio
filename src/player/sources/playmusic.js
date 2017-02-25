import url from 'url';
import path from 'path';
import pify from 'pify';
import PlayMusic from 'playmusic';

let loggedIn = false;
const config = {
    androidId: process.env.PM_ANDROID_ID,
    masterToken: process.env.PM_MASTER_TOKEN,
    email: process.env.PM_EMAIL,
    password: process.env.PM_PASSWORD
};
const pm = new PlayMusic();
pm.__proto__ = pify(pm.__proto__);

pm.init(config)
.then(() => loggedIn = true)
.catch(err => {
    console.error('Failed to login to Google Play Music.');
    console.error('Make sure you have your credentials in the environment variables:');
    console.error('PM_EMAIL and PM_PASSWORD');
    console.error('         or');
    console.error('PM_ANDROID_ID and PM_MASTER_TOKEN');
    console.error('See http://npm.im/playmusic for more info');
    console.error('');
    console.error('Error received:');
    console.error(err);
});

export default {
    name: 'google play music',

    handles(inputUrl) {
        if(!loggedIn) return false;

        const urlParts = url.parse(inputUrl);

        return /https/.test(urlParts.protocol) &&
            /play\.google\.[a-z]+/i.test(urlParts.host) &&
            /music\/m\//.test(urlParts.pathname);
    },

    async getStream(inputUrl) {
        const id = path.basename(url.parse(inputUrl).pathname);
        console.error('Getting play music stream for: ', id);

        const stream = await pm.getStream(id);

        return {
            stream,
            format: ''
        };
    }
};
