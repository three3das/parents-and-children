import { BORDER_WIDTH, GOLD_67, SILVER } from './constants';

// Единый вид белой пилюли в золотых полях: «Words for this letter» (верхнее поле)
// и «Trace the letter with finger or mouse» (нижнее поле). Образец — нижняя
// пилюля на десктопе. Длинный текст обрезается многоточием (truncate на <span>
// внутри), а не вылезает за край поля.
export const PILL_BASE_CLASS =
  'inline-flex items-center gap-1 max-w-[92%] px-2 py-0.5 rounded-full bg-white text-[10px] font-bold leading-tight whitespace-nowrap select-none';

export const PILL_STYLE = {
  color: SILVER,
  border: `${BORDER_WIDTH}px solid ${GOLD_67}`,
};

// Текст внутри пилюли.
export const PILL_TEXT_CLASS = 'min-w-0 truncate';