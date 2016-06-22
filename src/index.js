import Radio from './radio';

const radio = new Radio();
radio.out.pipe(process.stdout);

setTimeout(() => {
    radio.play('http://localhost:8080/out.mp3');
}, 2000);
