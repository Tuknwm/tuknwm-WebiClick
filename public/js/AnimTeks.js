document.addEventListener("DOMContentLoaded", function () {
  const texts = document.querySelectorAll(".TeksAnimLP");
  let index = 0;

  function changeText() {
    texts.forEach((text) => text.classList.remove("active"));
    texts[index].classList.add("active");
    index = (index + 1) % texts.length;
  }

  changeText();

  setInterval(changeText, 5000);
});

document.addEventListener("DOMContentLoaded", function () {
  const texts = document.querySelectorAll(".TeksAnimReg");
  let index = 0;

  function changeText() {
    texts.forEach((text) => text.classList.remove("active"));
    texts[index].classList.add("active");
    index = (index + 1) % texts.length;
  }

  changeText();

  setInterval(changeText, 5000);
});

document.addEventListener("DOMContentLoaded", function () {
  const texts = document.querySelectorAll(".TeksAnimLog");
  let index = 0;

  function changeText() {
    texts.forEach((text) => text.classList.remove("active"));
    texts[index].classList.add("active");
    index = (index + 1) % texts.length;
  }

  changeText();

  setInterval(changeText, 5000);
});
