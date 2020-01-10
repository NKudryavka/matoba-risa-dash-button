import anime from 'animejs';

const RISA = 'Spin-off!と集貝はなさんにありがとう。';
const TOKEN = btoa(Math.random());
const API_URL = 'https://85xhzvhf2k.execute-api.ap-northeast-1.amazonaws.com/prod/risa';

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
    'sound/natalia-risa.mp3',
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        risa: RISA,
        count: count,
        token: TOKEN
      }),
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
  let leftRefresh = 0;
  function refreshGlobalCount() {
    if (leftRefresh <= 0 && count === refreshCount) return;
    fetch(`${API_URL}?risa=${RISA}&token=${TOKEN}`)
    .then((res) => res.json())
    .then((res) => {
      globalCounter.textContent = res.count.toLocaleString();
      if (refreshCount === count) {
        leftRefresh--;
      } else {
        refreshCount = count;
        leftRefresh = 3;
      }
    });
  }
  refreshGlobalCount();
  setInterval(refreshGlobalCount, 3000);

  function say() {
    audioContext.resume();
    const pop = pops[random(pops.length)].cloneNode();
    countUp();
    const source = audioContext.createBufferSource();
    source.buffer = sounds[Math.random() < 0.98 ? random(sounds.length-2)+2 : (random(2))];
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