// Inisialisasi variabel
let nilaiKlik = 0;
let permainanSelesai = false;
let sedangBermain = false;
let waktuPermainan = 5;
let modeKlik = "mouse";
let isPlaying = false;
let spaceKeyPressed = false;

// Mengambil elemen HTML yang dibutuhkan
let tombolMain = document.querySelector(".ButtonPlay");
let tombolUlang = document.querySelector(".BoxRestart");
let tombolMode = document.getElementById("modeButton");
let tombolModeGame = document.getElementById("ModeGameButton");
let textTimer = document.querySelector(".BoxWaktu .time-value");
let textKecepatan = document.querySelector(".BoxKecepatan .speed-value");
let textNilai = document.querySelector(".BoxNilai .score-value");
let modeText = document.getElementById("modeText");

// Efek suara klik
const mouseClickSound = new Audio("/sfx/klik2.mp3");
const keyboardClickSound = new Audio("/sfx/spacebar.mp3");
const countdownSound = new Audio("/sfx/countdown.mp3");
const bgMusic = new Audio("/sfx/Lofi.mp3");

function playMouseClickSound() {
  mouseClickSound.currentTime = 0;
  mouseClickSound.play();
}

function playKeyboardClickSound() {
  keyboardClickSound.currentTime = 0;
  keyboardClickSound.play();
}

tombolMain.addEventListener("click", function (event) {
  if (modeKlik === "mouse") {
    playMouseClickSound();
  }
});

document.addEventListener("keydown", function (event) {
  if (modeKlik === "keyboard" && event.code === "Space" && !spaceKeyPressed) {
    spaceKeyPressed = true;
    playKeyboardClickSound();
    buatEfekRippleKeyboard();
    if (sedangBermain) {
      nilaiKlik++;
    }
  }
});


document.addEventListener("keyup", function (event) {
  if (event.code === "Space") {
    spaceKeyPressed = false;
  }
});

tombolUlang.style.display = "none";

// Fungsi untuk mengganti mode waktu permainan
function gantiMode() {
  if (!sedangBermain) {
    if (waktuPermainan === 5) {
      waktuPermainan = 10;
    } else if (waktuPermainan === 10) {
      waktuPermainan = 15;
    } else {
      waktuPermainan = 5;
    }
    tombolMode.innerText = waktuPermainan + " Seconds";
  }
}

function gantiModeGame() {
  modeKlik = modeKlik === "mouse" ? "keyboard" : "mouse";
  tombolModeGame.innerText =
    modeKlik === "keyboard" ? "Keyboard (Spasi)" : "Mouse (Klik)";
}

[tombolMode, tombolModeGame].forEach((button) => {
  button.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
      event.preventDefault();
    }
  });
});

// Fungsi untuk menghitung kecepatan klik per detik
function hitungKecepatan(klik, waktu) {
  return (klik / waktu).toFixed(2);
}

// Fungsi untuk memulai permainan dengan hitung mundur
function mulaiPermainan() {
  if (!sedangBermain && !permainanSelesai) {
    sedangBermain = true;
    tombolMain.innerHTML = "[ 3 ]";

    tombolMode.disabled = true;
    tombolModeGame.disabled = true;

    let countdown = 4;
    let hitungMundur = setInterval(function () {
      countdownSound.currentTime = 0;
      countdownSound.play();
      countdown--;
      if (countdown > 0) {
        tombolMain.innerHTML = "[ " + countdown + " ]";
      } else {
        clearInterval(hitungMundur);
        mulaiGameAsli();
      }
    }, 1000);
  }
}

// Fungsi untuk mulai permainan setelah hitung mundur selesai
function mulaiGameAsli() {
  nilaiKlik = 0;
  permainanSelesai = false;
  tombolMain.innerHTML = "Klik secepat mungkin!";
  tombolUlang.style.display = "none";

  let waktuMulai = Date.now();

  let hitungWaktu = setInterval(function () {
    let waktuBerjalan = (Date.now() - waktuMulai) / 1000;
    textTimer.innerHTML = waktuBerjalan.toFixed(2) + "s";
    textKecepatan.innerHTML =
      hitungKecepatan(nilaiKlik, waktuBerjalan) + " clicks/s";
    textNilai.innerHTML = nilaiKlik;

    if (waktuBerjalan >= waktuPermainan) {
      clearInterval(hitungWaktu);
      akhirPermainan();
    }
  }, 100);
}

// Fungsi untuk menangani klik pada tombol
function klikDilakukan(event) {
  if (sedangBermain && modeKlik === "mouse" && event.type === "click") {
    nilaiKlik++;
  }
}

// Fungsi untuk mengakhiri permainan
function akhirPermainan() {
  sedangBermain = false;
  permainanSelesai = true;

  tombolMode.disabled = false;
  tombolModeGame.disabled = false;

  console.log(waktuPermainan);
  let gambarPeringkat = "/image/jangkrik.png";
  let teksPeringkat = "Tetap semangat dan coba lagi!";

  if (waktuPermainan === 5) {
    if (nilaiKlik >= 50) {
      gambarPeringkat = "/image/cheetah.png";
      teksPeringkat = "Peringkat = Legend\n Kecepatan Yang Sangat Luar Biasa!";
    } else if (nilaiKlik >= 30) {
      gambarPeringkat = "/image/kelinci.png";
      teksPeringkat = "Peringkat = Pro\n Lumayan 😁 Tidak Buruk Juga!";
    } else if (nilaiKlik >= 10) {
      gambarPeringkat = "/image/kura2.png";
      teksPeringkat = "Peringkat = Amatir\n Tetap semangat dan coba lagi!";
    }
  } else if (waktuPermainan === 10) {
    if (nilaiKlik >= 100) {
      gambarPeringkat = "/image/cheetah.png";
      teksPeringkat = "Peringkat = Legend\n Kecepatan Yang Sangat Luar Biasa!";
    } else if (nilaiKlik >= 60) {
      gambarPeringkat = "/image/kelinci.png";
      teksPeringkat = "Peringkat = Pro\n Lumayan 😁 Tidak Buruk Juga!";
    } else if (nilaiKlik >= 30) {
      gambarPeringkat = "/image/kura2.png";
      teksPeringkat = "Peringkat = Amatir\n Tetap semangat dan coba lagi!";
    }
  } else if (waktuPermainan === 15) {
    if (nilaiKlik >= 150) {
      gambarPeringkat = "/image/cheetah.png";
      teksPeringkat = "Peringkat = Legend\n Kecepatan Yang Sangat Luar Biasa!";
    } else if (nilaiKlik >= 100) {
      gambarPeringkat = "/image/kelinci.png";
      teksPeringkat = "Peringkat = Pro\n Lumayan 😁 Tidak Buruk Juga!";
    } else if (nilaiKlik >= 50) {
      gambarPeringkat = "/image/kura2.png";
      teksPeringkat = "Peringkat = Amatir\n Tetap semangat dan coba lagi!";
    }
  }

  tombolMain.innerHTML = "Permainan Selesai!";

  let imgRank = document.getElementById("rankImage");
  let textRank = document.getElementById("rankText");

  imgRank.src = gambarPeringkat;
  imgRank.classList.remove("hidden");
  imgRank.classList.add("fade-in");

  textRank.innerText = teksPeringkat;
  textRank.classList.remove("hidden");
  textRank.classList.add("fade-in");

  const scoreData = {
    score: nilaiKlik,
    timemode: waktuPermainan,
    clickmode: modeKlik
  };

  console.log('Sending score data:', scoreData);

  fetch('/leaderboard/saveScore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(scoreData)
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(JSON.stringify(err));
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Score saved successfully:', data);
      tampilkanHasil();
    })
    .catch(error => {
      console.error('Error saving score:', error);
      tampilkanHasil();
    });
}

// Fungsi untuk menampilkan hasil permainan dan beralih ke result.css
function tampilkanHasil() {
  document.querySelector(".RoundedBox").classList.add("fade-out");

  setTimeout(() => {
    document.querySelector(".RoundedBox").classList.add("hidden");

    document.getElementById("resultContainer").classList.remove("hidden");
    document.getElementById("resultContainer").classList.remove("fade-out");
    document.getElementById("resultContainer").classList.add("fade-in");

    document.getElementById("speedValue").innerText = hitungKecepatan(
      nilaiKlik,
      waktuPermainan
    );
    document.getElementById("timeValue").innerText = waktuPermainan;
    document.getElementById("scoreValue").innerText = nilaiKlik;

    if (modeKlik === "keyboard") {
      modeText.innerText = "Mode: Keyboard (Spasi)";
    } else {
      modeText.innerText = "Mode: Mouse (Klik)";
    }

    document.getElementById("restartButton").style.display = "flex";

    loadLeaderboard(waktuPermainan, modeKlik);
  }, 500);
}

// Fungsi untuk restart permainan
function ulangPermainan() {
  document.getElementById("resultContainer").classList.add("fade-out");

  setTimeout(() => {
    document.getElementById("resultContainer").classList.add("hidden");

    document.querySelector(".RoundedBox").classList.remove("hidden");
    document.querySelector(".RoundedBox").classList.remove("fade-out");
    document.querySelector(".RoundedBox").classList.add("fade-in");

    textTimer.innerHTML = " ";
    textKecepatan.innerHTML = " ";
    textNilai.innerHTML = " ";
    tombolMain.innerHTML = "Klik disini untuk mulai 🔥";
    nilaiKlik = 0;
    sedangBermain = false;
    permainanSelesai = false;
    
    document.getElementById("restartButton").style.display = "none";
    let imgRank = document.getElementById("rankImage");
    let textRank = document.getElementById("rankText");
    imgRank.classList.add("hidden");
    textRank.classList.add("hidden");
  }, 500);
}

// Fungsi efek ripple saat tombol diklik
function buatEfekRipple(event) {
  let tombol = event.currentTarget;
  let ripple = document.createElement("span");

  ripple.classList.add("ripple");
  ripple.style.width = Math.max(tombol.offsetWidth, tombol.offsetHeight) + "px";
  ripple.style.height =
    Math.max(tombol.offsetWidth, tombol.offsetHeight) + "px";
  ripple.style.left = event.offsetX - ripple.offsetWidth / 2 + "px";
  ripple.style.top = event.offsetY - ripple.offsetHeight / 2 + "px";

  tombol.appendChild(ripple);

  setTimeout(function () {
    ripple.remove();
  }, 600);
}

// Fungsi untuk membuat efek ripple saat tombol spasi ditekan
function buatEfekRippleKeyboard() {
  let tombol = tombolMain;
  let ripple = document.createElement("span");

  ripple.classList.add("ripple");
  ripple.style.width = Math.max(tombol.offsetWidth, tombol.offsetHeight) + "px";
  ripple.style.height =
    Math.max(tombol.offsetWidth, tombol.offsetHeight) + "px";

  ripple.style.left = tombol.offsetWidth / 2 - ripple.offsetWidth / 2 + "px";
  ripple.style.top = tombol.offsetHeight / 2 - ripple.offsetHeight / 2 + "px";

  tombol.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

document.body.addEventListener("click", function (event) {
  if (permainanSelesai && !event.target.classList.contains("BoxRestart")) {
    return;
  }
});

// Event listener untuk tombol dalam permainan
tombolMain.addEventListener("click", mulaiPermainan);
tombolUlang.addEventListener("click", ulangPermainan);
tombolMode.addEventListener("click", gantiMode);
tombolModeGame.addEventListener("click", gantiModeGame);
tombolMain.addEventListener("click", klikDilakukan);
tombolMain.addEventListener("click", buatEfekRipple);
tombolUlang.addEventListener("click", buatEfekRipple);

function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play();
}

document
  .getElementById("startButton")
  .addEventListener("click", playClickSound);

// Efek suara latar belakang
function toggleMusic() {
  if (isPlaying) {
    bgMusic.pause();
    isPlaying = false;
  } else {
    bgMusic.play();
    isPlaying = true;
    bgMusic.loop = true;
  }
}

document.getElementById("musicButton").addEventListener("click", toggleMusic);

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".content").classList.add("fade-in");
});

// Fungsi untuk menampilkan leaderboard
function loadLeaderboard(timeMode, clickMode) {
  const leaderboardContainer = document.querySelector(".BoxLeaderBoard");
  
  leaderboardContainer.innerHTML = '<p>LeaderBoard</p><div class="leaderboard-loading">Loading...</div>';

  fetch(`/leaderboard/api/scores?timemode=${timeMode}&clickmode=${clickMode}`)
      .then(response => {
          if (!response.ok) {
              throw new Error('Failed to fetch leaderboard data');
          }
          return response.json();
      })
      .then(scores => {
          let leaderboardHTML = `
              <p>LeaderBoard</p>
              <div class="leaderboard-table">
                  <div class="leaderboard-header">
                      <span class="rank-header">Rank</span>
                      <span class="player-header">Player</span>
                      <span class="score-header">Score</span>
                  </div>
          `;
          
          if (scores.length > 0) {
              scores.forEach((score, index) => {
                  leaderboardHTML += `
                      <div class="leaderboard-row">
                          <span class="rank-cell">${index + 1}</span>
                          <span class="player-cell">${score.username}</span>
                          <span class="score-cell">${score.score}</span>
                      </div>
                  `;
              });
          } else {
              leaderboardHTML += `
                  <div class="leaderboard-empty">No scores available for this mode</div>
              `;
          }
          
          leaderboardHTML += `</div>`;
          
          leaderboardContainer.innerHTML = leaderboardHTML;
      })
      .catch(error => {
          console.error('Error loading leaderboard:', error);
          leaderboardContainer.innerHTML = '<p>LeaderBoard</p><div class="leaderboard-error">Failed to load leaderboard data</div>';
      });
}