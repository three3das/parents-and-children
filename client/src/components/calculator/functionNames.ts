// Названия тригонометрических функций на разных языках. По ним движок
// понимает слова, набранные кнопками раздела «Буквы»: «косинус 60°»,
// «seno 30°» и т. п. Регистр не важен.
//
// ⚠️ Для санскрита (sa), хинди (hi), бенгальского (bn) и урду (ur)
// названий пока НЕТ — их нужно внести и проверить (например, слово
// «котангенс» на санскрите). Чтобы добавить язык, допишите сюда блок
// того же вида, ничего другого менять не нужно: слова из всех языков
// объединяются в общую таблицу, и функция распознаётся независимо от
// выбранного языка.
export type FnName = 'sin' | 'cos' | 'tan' | 'cot';

export const FUNCTION_NAMES: Record<string, Record<FnName, string[]>> = {
  // Латиница и общепринятые сокращения (работают всегда)
  en: {
    sin: ['sin', 'sine'],
    cos: ['cos', 'cosine'],
    tan: ['tan', 'tg', 'tangent'],
    cot: ['cot', 'ctg', 'cotan', 'cotangent'],
  },
  ru: {
    sin: ['синус', 'син'],
    cos: ['косинус', 'кос'],
    tan: ['тангенс', 'тг'],
    cot: ['котангенс', 'ктг'],
  },
  uk: {
    sin: ['синус'],
    cos: ['косинус'],
    tan: ['тангенс', 'тг'],
    cot: ['котангенс', 'ктг'],
  },
  es: {
    sin: ['seno'],
    cos: ['coseno'],
    tan: ['tangente'],
    cot: ['cotangente'],
  },
  pt: {
    sin: ['seno'],
    cos: ['cosseno'],
    tan: ['tangente'],
    cot: ['cotangente'],
  },
  fr: {
    sin: ['sinus'],
    cos: ['cosinus'],
    tan: ['tangente'],
    cot: ['cotangente'],
  },
  id: {
    sin: ['sinus'],
    cos: ['cosinus'],
    tan: ['tangen'],
    cot: ['kotangen'],
  },
  // Арабский: общепринятые краткие обозначения (جا، جتا، ظا، ظتا)
  ar: {
    sin: ['جا'],
    cos: ['جتا'],
    tan: ['ظا'],
    cot: ['ظتا'],
  },
};

// Общая таблица «слово → функция» из всех языков.
export const FN_ALIASES: Record<string, FnName> = (() => {
  const table: Record<string, FnName> = {};
  for (const names of Object.values(FUNCTION_NAMES)) {
    for (const fn of Object.keys(names) as FnName[]) {
      for (const word of names[fn]) table[word.toLowerCase()] = fn;
    }
  }
  return table;
})();
