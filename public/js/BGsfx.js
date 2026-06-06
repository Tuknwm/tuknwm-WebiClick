let bgMusicPlayer;
let isInitialized = false;

function initMusicPlayer() {
  if (isInitialized) return;
  isInitialized = true;

  const volume = parseFloat(localStorage.getItem('bgMusicVolume') || 0.5);
  const time = parseFloat(localStorage.getItem('bgMusicTime') || 0);
  const state = localStorage.getItem('bgMusicState');
  const justLoggedIn = document.body.getAttribute('data-just-logged-in') === 'true';

  bgMusicPlayer = new Audio("/sfx/Lofi.mp3");
  bgMusicPlayer.loop = true;
  bgMusicPlayer.volume = volume;
  bgMusicPlayer.currentTime = time;

  bgMusicPlayer.addEventListener('play', () => updateState(true));
  bgMusicPlayer.addEventListener('pause', () => updateState(false));
  bgMusicPlayer.addEventListener('timeupdate', () => {
    localStorage.setItem('bgMusicTime', bgMusicPlayer.currentTime);
  });

  const btn = document.getElementById('musicToggleBtn');
  if (btn) {
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    clone.addEventListener('click', e => {
      e.preventDefault();
      bgMusicPlayer.paused ? playMusic() : pauseMusic();
    });
  }

  if (justLoggedIn || state === 'playing') {
    document.body.removeAttribute('data-just-logged-in');
    playMusic();
  } else {
    updateState(false);
  }

  updateMusicControl();
}

function playMusic() {
  if (!bgMusicPlayer || !bgMusicPlayer.paused) return;
  bgMusicPlayer.play().catch(() => {
    document.addEventListener('click', function onceClick() {
      bgMusicPlayer.play().catch(err => console.error('Play failed:', err));
      document.removeEventListener('click', onceClick);
    }, { once: true });
  });
}

function pauseMusic() {
  if (bgMusicPlayer && !bgMusicPlayer.paused) bgMusicPlayer.pause();
}

function updateState(isPlaying) {
  localStorage.setItem('bgMusicState', isPlaying ? 'playing' : 'paused');
  updateMusicControl();
}

function updateMusicControl() {
  const btn = document.getElementById('musicToggleBtn');
  if (btn) {
    const playing = bgMusicPlayer && !bgMusicPlayer.paused;
    btn.innerHTML = playing ? '🔊' : '🔇';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMusicPlayer);
} else {
  initMusicPlayer();
}

document.addEventListener('visibilitychange', () => {
  if (bgMusicPlayer && document.visibilityState === 'hidden') {
    localStorage.setItem('bgMusicTime', bgMusicPlayer.currentTime);
  } else {
    updateMusicControl();
  }
});

window.musicPlayer = {
  play: playMusic,
  pause: pauseMusic,
  toggle: () => (bgMusicPlayer.paused ? playMusic() : pauseMusic()),
  updateUI: updateMusicControl
};
