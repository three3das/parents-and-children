import { SPEECH_LOCALE } from './constants';

export function stopSpeech() {
  try {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  } catch {
    // нечего останавливать
  }
}

export function speak(
  text: string,
  language: string,
  rate: number,
  handlers?: { onStart?: () => void; onEnd?: () => void }
) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SPEECH_LOCALE[language] ?? 'en-US';
    u.rate = rate;
    if (handlers?.onStart) u.onstart = handlers.onStart;
    if (handlers?.onEnd) {
      u.onend = handlers.onEnd;
      u.onerror = handlers.onEnd;
    }
    speechSynthesis.speak(u);
  } catch (e) {
    console.error(e);
  }
}