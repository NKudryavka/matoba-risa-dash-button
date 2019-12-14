import anime from 'animejs';

const RISA = encodeURIComponent('Spin-off!と集貝はなさんにありがとう。');
const TOKEN = encodeURIComponent(btoa(Math.random())).slice(24);
const API_URL = 'https://script.google.com/macros/s/AKfycbxnd1vK3GoT44glQIa8izD80Q7ska09Br0G-dpa3F3Igb9u3zKD/exec';

window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const gravityA = 2 + Math.sqrt(3);
const gravityB = - 1 - Math.sqrt(3);
anime.easings['gravity'] = (t) => {
    return gravityA * t * t + gravityB * t;
}

async function fetchSounds() {
    const sounds = [
        'sound/derepa-risarisa.mp3',
        'sound/derepa-arigato.mp3',
        'sound/derepa-lolicon.mp3',
        'sound/derepa-papa.mp3',
        'sound/derepa-producer.mp3',
        'sound/derepa-zampona.mp3',
        'sound/dereradi-producer.mp3',
        'sound/dereradi-sikkari.mp3',
    ];
    const responses = await Promise.all(sounds.map((p) => fetch(p)));
    const buffers = await Promise.all(responses.map((r) => r.arrayBuffer()));
    return Promise.all(buffers.map((buf) => {
        return new Promise((resolve, reject) => audioContext.decodeAudioData(buf, resolve));
    }));
}

function random(n) {
    return Math.floor(Math.random()*n)
}

class Sender {
    constructor() {
        this.waitFrom = Number.MAX_SAFE_INTEGER;
        this.count = 0;
        setInterval(() => {
            if (Date.now() - this.waitFrom > 1000) {
                this.send();
            }
        }, 100);
    }

    countUp() {
        this.count++;
        this.waitFrom = Date.now();
    }

    send() {
        const count = this.count;
        this.count = 0;
        this.waitFrom = Number.MAX_SAFE_INTEGER;
        if (!count) return;
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
            body: `token=${TOKEN}&risa=${RISA}&count=${count}`,
        })
        .catch(console.log);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const button = document.getElementById('button');
    const push = button.getElementsByClassName('push')[0];
    const pops = Array.from(document.getElementById('risa-pops').children);
    const body = document.getElementsByTagName('body')[0];
    const globalCounter = document.getElementById('global-counter');
    const localCounter = document.getElementById('local-counter');
    const twitterButton = document.getElementById('twitter-button');
    const sender = new Sender();

    let count = 0;

    const sounds = await fetchSounds();

    const siteUrl = encodeURIComponent('https://nkudryavka.github.io/matoba-risa-dash-button/');
    const hashtags = `Matoba_Risa_Dash_Button`;
    function getTweetUrl() {
        const content = encodeURIComponent(`Matoba Risa Dash Buttonで梨沙ちゃんを${count}回注文したよ！`);
        return `https://twitter.com/intent/tweet?text=${content}&url=${siteUrl}&hashtags=${hashtags}`;
    }

    let refreshCount = null;
    function refreshGlobalCount() {
        if (count === refreshCount) return;
        fetch(`${API_URL}?risa=${RISA}`)
        .then((res) => res.json())
        .then((res) => {
            globalCounter.textContent = res.count.toLocaleString();
            refreshCount = count;
        });
    }
    refreshGlobalCount();
    setInterval(refreshGlobalCount, 10*1000);

    function say() {
        audioContext.resume();
        const pop = (Math.random() < 0.7 ? pops[0] : pops[random(pops.length)]).cloneNode();
        countUp();
        const source = audioContext.createBufferSource();
        source.buffer = sounds[Math.random() < 0.99 ? random(sounds.length-1)+1 : 0];
        source.connect(audioContext.destination);
        source.start(0);
        
        pop.style.position = 'absolute';
        pop.style.maxWidth = '20%';
        pop.style.maxHeight = '20%';
        pop.style.top = '30%';
        pop.style.left = '40%';
        pop.style.zIndex = -1;
        button.appendChild(pop);
        const popAnime = anime({
            targets: pop,
            translateX: {
                value: (Math.random()-0.5) * body.clientWidth,
                easing: 'linear',
            },
            translateY: {
                value: body.clientHeight * (Math.random() * 0.5 + 0.5),
                easing: 'gravity'
            },
            rotate: {
                value: (Math.random() - 0.5) * 360 * 3,
                easing: 'linear'
            },
            duration: 1500,
        });
        popAnime.complete = () => {
            pop.remove();
        }
    }

    function countUp() {
        count++;
        sender.countUp();
        localCounter.textContent = count.toLocaleString();
        twitterButton.href = getTweetUrl();
    }

    const buttonDarken = () => {
        push.style.fill = '#ccc';
    }
    const buttonLighten = () => {
        push.style.fill = '';
    }
    
    push.addEventListener('touchstart', (e) => {
        e.preventDefault();
        buttonDarken();
    })
    push.addEventListener('touchend', (e) => {
        e.preventDefault();
        buttonLighten();
        say();
    });
    push.addEventListener('mousedown', buttonDarken);
    push.addEventListener('mouseleave', buttonLighten);
    push.addEventListener('mouseup', () => {
        buttonLighten();
        say();
    });

    window.addEventListener('beforeunload', (e) => {
        sender.send();
    });
});