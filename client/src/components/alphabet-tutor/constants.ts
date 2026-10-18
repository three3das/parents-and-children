// Палитра: mix(goldPct) = GOLD*goldPct + WHITE*(1-goldPct),
// как sectorColor() в IshvaraPage.tsx.
export const GOLD_100 = '#FFD700';
export const GOLD_67 = '#FFE454';
export const GOLD_33 = '#FFF2AB';
export const WHITE = '#FFFFFF';

// Серебряный цвет текста (буквы, слова, подписи).
export const SILVER = '#A8A9AD';

export const BORDER_WIDTH = 2;
export const BORDER_WIDTH_SELECTED = 3;

// Локаль озвучки для каждого из 12 языков сайта.
export const SPEECH_LOCALE: Record<string, string> = {
  sa: 'hi-IN', // голоса для санскрита в браузерах обычно нет
  en: 'en-US',
  ar: 'ar-SA',
  bn: 'bn-IN',
  id: 'id-ID',
  es: 'es-ES',
  pt: 'pt-PT',
  ru: 'ru-RU',
  uk: 'uk-UA',
  ur: 'ur-PK',
  fr: 'fr-FR',
  hi: 'hi-IN',
};

// Событие «стереть рисунок на холсте». Его шлёт кнопка-стиралка из панели
// режимов (GameMenu, мобильная версия), а слушает DrawingPad.
export const ERASE_DRAWING_EVENT = 'alphabet:erase-drawing';
