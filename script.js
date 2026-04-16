/* ============================================================
   Come Dine With Us — Greece
   Navigation · Music Player · Greek-or-Arabic Game
   ============================================================ */

'use strict';

/* ---- Constants ---- */
const LIGHT_PAGES = new Set(['page-2', 'page-3', 'page-4', 'page-5']);
const VIDEO_ID    = '1Ba3fOvlruU';

/* ---- Helpers ---- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   STARS
   ============================================================ */
function createStars(containerId, count = 75) {
  const layer = document.getElementById(containerId);
  if (!layer) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    const size = Math.random() < 0.65 ? 1 : 2;
    const top  = Math.random() * 72; // stay above skyline
    const left = Math.random() * 100;
    const dur  = 2 + Math.random() * 3;
    const del  = Math.random() * 4;
    const op   = 0.25 + Math.random() * 0.65;
    star.style.cssText = [
      'position:absolute',
      `width:${size}px`,
      `height:${size}px`,
      'border-radius:50%',
      `background:rgba(255,255,255,${op.toFixed(2)})`,
      `top:${top.toFixed(1)}%`,
      `left:${left.toFixed(1)}%`,
      `animation:twinkle ${dur.toFixed(1)}s ease-in-out ${del.toFixed(1)}s infinite`,
    ].join(';');
    frag.appendChild(star);
  }
  layer.appendChild(frag);
}

createStars('starsLayer1', 80);
createStars('starsLayer2', 110);

/* ============================================================
   HORIZONTAL PAGE NAVIGATION
   ============================================================ */
const navDots  = $$('.sidenav__dot');
const sections = $$('.page');
const scroller = document.getElementById('menuScroll');

function setActiveDot(id) {
  navDots.forEach(dot => {
    dot.classList.toggle('active', dot.dataset.target === id);
  });
  document.body.classList.toggle('on-light-page', LIGHT_PAGES.has(id));
}

// Track which page is most visible inside the horizontal scroller
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) setActiveDot(entry.target.id);
  });
}, {
  root: scroller,
  threshold: 0.5,
});

sections.forEach(sec => sectionObserver.observe(sec));

// Dot click → scroll horizontally to the target page
navDots.forEach(dot => {
  dot.addEventListener('click', () => {
    const target = document.getElementById(dot.dataset.target);
    if (target && scroller) {
      scroller.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    }
  });
});

setActiveDot('page-1');

/* ============================================================
   YOUTUBE MUSIC PLAYER
   ============================================================ */
let ytPlayer       = null;
let isPlaying      = false;
let apiReady       = false;
let playRequested  = false; // true if user clicked before API loaded

const musicBtn    = document.getElementById('musicBtn');
const musicStatus = document.getElementById('musicStatus');

// Load YouTube IFrame API
(function loadYTApi() {
  const tag    = document.createElement('script');
  tag.src      = 'https://www.youtube.com/iframe_api';
  tag.async    = true;
  const first  = document.getElementsByTagName('script')[0];
  first.parentNode.insertBefore(tag, first);
})();

window.onYouTubeIframeAPIReady = function () {
  apiReady = true;
  ytPlayer = new YT.Player('yt-player', {
    videoId: VIDEO_ID,
    playerVars: {
      autoplay:        1,
      loop:            1,
      playlist:        VIDEO_ID,
      controls:        0,
      modestbranding:  1,
      rel:             0,
    },
    events: {
      onReady(e) {
        e.target.setVolume(62);
        e.target.playVideo();
      },
      onStateChange(e) {
        if (e.data === YT.PlayerState.PLAYING) {
          setMusicState(true);
        } else if (
          e.data === YT.PlayerState.PAUSED ||
          e.data === YT.PlayerState.ENDED
        ) {
          setMusicState(false);
        }
      },
    },
  });
};

// Mobile browsers block audio autoplay until a user gesture — play on first touch
document.addEventListener('touchstart', function onFirstTouch() {
  if (ytPlayer && !isPlaying) {
    ytPlayer.playVideo();
  }
}, { once: true });

function setMusicState(playing) {
  isPlaying = playing;
  musicBtn.classList.toggle('is-playing', playing);
  musicStatus.textContent = playing ? 'playing' : 'paused';
}

musicBtn.addEventListener('click', () => {
  if (!apiReady || !ytPlayer) {
    // API not ready yet; queue the request
    playRequested = true;
    musicStatus.textContent = 'loading…';
    return;
  }
  if (isPlaying) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
    playRequested = true;
  }
});

/* ============================================================
   GREEK OR ARABIC — GAME
   ============================================================ */
const SONGS = [
  {
    title:    'Misirlou',
    original: 'Μισιρλού',
    hint:     'A haunting melody that became a surf-rock legend — and a Pulp Fiction classic.',
    answer:   'greek',
    label:    'Greek',
    fact:     'Μισιρλού means "Egyptian girl" in Greek. Written in the 1920s by a Greek musician, it is a song of longing for a woman from Cairo. It crossed oceans and decades before Dick Dale made it electric — one of the most recognisable melodies in the world.',
  },
  {
    title:    'Ya Mustafa',
    original: 'يا مصطفى',
    hint:     'A celebration song that swept across the Mediterranean in the early 1960s.',
    answer:   'arabic',
    label:    'Arabic',
    fact:     'Written and performed by Egyptian musician Bob Azzam in 1960, it became an unexpected hit across France, Greece, and all of Europe — proof that joy travels without a passport.',
  },
  {
    title:    'Zeibekiko',
    original: 'Ζεϊμπέκικο',
    hint:     'A solo improvised dance — no partner, no fixed steps, only feeling.',
    answer:   'greek',
    label:    'Greek',
    fact:     'Zeibekiko has deep Ottoman and Middle Eastern roots, practiced by the Zeybeks of western Anatolia. In modern Greece it became one of the most intimate dances — performed solo, in near silence, watched by everyone at the table.',
  },
  {
    title:    'Lamma Bada',
    original: 'لما بدا يتثنّى',
    hint:     'One of the oldest love songs known to the Arabic-speaking world.',
    answer:   'arabic',
    label:    'Arabic',
    fact:     'Dating back to Andalusian poetry, this muwashshah traveled east through the Ottoman Empire and settled into the classical Egyptian and Levantine repertoire. It sounds ancient because it is — and it is still sung today.',
  },
  {
    title:    'Never on Sunday',
    original: 'Ποτέ την Κυριακή',
    hint:     'A film song that made the whole world want to dance, just for a moment.',
    answer:   'greek',
    label:    'Greek',
    fact:     'Composed by Manos Hadjidakis for the 1960 film and sung by Melina Mercouri. It won the Academy Award for Best Original Song and gave Greek music a global stage it had never had before.',
  },
];

let score        = 0;
let answered     = 0;

const gameGrid       = document.getElementById('gameGrid');
const scoreVal       = document.getElementById('scoreVal');
const totalVal       = document.getElementById('totalVal');
const gameEnd        = document.getElementById('gameEnd');
const gameEndMsg     = document.getElementById('gameEndMsg');
const gameRestartBtn = document.getElementById('gameRestartBtn');

if (totalVal) totalVal.textContent = SONGS.length;

function buildGame() {
  score    = 0;
  answered = 0;
  if (scoreVal)  scoreVal.textContent  = 0;
  if (gameEnd)   gameEnd.hidden        = true;
  if (gameGrid)  gameGrid.innerHTML    = '';

  SONGS.forEach((song, idx) => {
    const card = document.createElement('article');
    card.className   = 'game-card';
    card.id          = `card-${idx}`;
    card.innerHTML   = `
      <p class="game-card__number">Song ${idx + 1}</p>
      <h3 class="game-card__title">${song.title}</h3>
      <p class="game-card__original">${song.original}</p>
      <p class="game-card__hint">${song.hint}</p>
      <div class="game-card__btns">
        <button class="game-btn game-btn--greek" data-idx="${idx}" data-guess="greek">Greek</button>
        <button class="game-btn game-btn--arabic" data-idx="${idx}" data-guess="arabic">Arabic</button>
      </div>
      <div class="game-card__reveal" id="reveal-${idx}" aria-live="polite">
        <p class="reveal-label reveal-label--${song.answer}">${song.label}</p>
        <p class="reveal-fact">${song.fact}</p>
      </div>
    `;
    gameGrid.appendChild(card);
  });

  // Single delegated listener on the grid
  gameGrid.addEventListener('click', handleGuess);
}

function handleGuess(e) {
  const btn = e.target.closest('.game-btn');
  if (!btn || btn.disabled) return;

  const idx   = parseInt(btn.dataset.idx, 10);
  const guess = btn.dataset.guess;
  const song  = SONGS[idx];
  const card  = document.getElementById(`card-${idx}`);

  // Disable both buttons on this card
  $$('.game-btn', card).forEach(b => { b.disabled = true; });

  const correct = guess === song.answer;
  if (correct) {
    score++;
    card.classList.add('state-correct');
  } else {
    card.classList.add('state-wrong');
  }

  // Show reveal
  const reveal = document.getElementById(`reveal-${idx}`);
  if (reveal) reveal.classList.add('is-visible');

  answered++;
  if (scoreVal) scoreVal.textContent = score;

  if (answered === SONGS.length) {
    showGameEnd(score);
  }
}

function showGameEnd(s) {
  let msg;
  if (s === SONGS.length)      msg = 'Perfect — you have a Mediterranean ear.';
  else if (s >= 3)             msg = `${s} out of ${SONGS.length} — the music moved through you.`;
  else if (s >= 1)             msg = `${s} out of ${SONGS.length} — it is harder than it sounds. Literally.`;
  else                         msg = `0 out of ${SONGS.length} — perhaps the music was the point all along.`;

  if (gameEndMsg) gameEndMsg.textContent = msg;
  if (gameEnd)    gameEnd.hidden = false;
}

if (gameRestartBtn) {
  gameRestartBtn.addEventListener('click', () => {
    // Remove old delegated listener by rebuilding
    const fresh = gameGrid.cloneNode(false);
    gameGrid.parentNode.replaceChild(fresh, gameGrid);
    // Reassign reference (id stays the same but var is stale — use id)
    buildGame();
  });
}

// Override buildGame to work with potentially replaced grid
function buildGame() {
  score    = 0;
  answered = 0;
  if (scoreVal) scoreVal.textContent = 0;
  if (gameEnd)  gameEnd.hidden = true;

  const grid = document.getElementById('gameGrid');
  if (!grid) return;
  grid.innerHTML = '';

  SONGS.forEach((song, idx) => {
    const card = document.createElement('article');
    card.className = 'game-card';
    card.id        = `card-${idx}`;
    card.innerHTML = `
      <p class="game-card__number">Song ${idx + 1}</p>
      <h3 class="game-card__title">${song.title}</h3>
      <p class="game-card__original">${song.original}</p>
      <p class="game-card__hint">${song.hint}</p>
      <div class="game-card__btns">
        <button class="game-btn game-btn--greek" data-idx="${idx}" data-guess="greek">Greek</button>
        <button class="game-btn game-btn--arabic" data-idx="${idx}" data-guess="arabic">Arabic</button>
      </div>
      <div class="game-card__reveal" id="reveal-${idx}" aria-live="polite">
        <p class="reveal-label reveal-label--${song.answer}">${song.label}</p>
        <p class="reveal-fact">${song.fact}</p>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.addEventListener('click', function onGuess(e) {
    const btn = e.target.closest('.game-btn');
    if (!btn || btn.disabled) return;

    const idx   = parseInt(btn.dataset.idx, 10);
    const guess = btn.dataset.guess;
    const song  = SONGS[idx];
    const card  = document.getElementById(`card-${idx}`);

    $$('.game-btn', card).forEach(b => { b.disabled = true; });

    const correct = guess === song.answer;
    if (correct) { score++; card.classList.add('state-correct'); }
    else         { card.classList.add('state-wrong'); }

    const reveal = document.getElementById(`reveal-${idx}`);
    if (reveal) reveal.classList.add('is-visible');

    answered++;
    if (scoreVal) scoreVal.textContent = score;
    if (answered === SONGS.length) showGameEnd(score);
  });
}

// Game init removed — host plays songs live
