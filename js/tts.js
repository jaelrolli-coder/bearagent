// Read-aloud helper using the browser SpeechSynthesis API.
// macOS / iPadOS / modern Android all ship de-DE and en-GB voices.

window.BearTTS = {
  speak: function (text, lang) {
    if (!window.speechSynthesis) return;
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'en' ? 'en-GB' : 'de-DE';
    u.rate = 0.9;
    u.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  },
  stop: function () {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }
};
