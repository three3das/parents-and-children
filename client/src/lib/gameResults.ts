// Личные результаты игр вошедшего пользователя.
//
// Пока результаты хранятся в браузере (localStorage) под id пользователя:
// это работает сразу и не требует изменений в базе данных, но на другом
// устройстве или в другом браузере сохранённого результата не будет.
// Если понадобится хранение на сервере, нужно заменить только функции
// этого файла: остальной код обращается к результатам через них.

export interface SavedResult {
  score: number; // очки игры (правильные ответы за сегодня)
  savedAt: string; // дата сохранения, ISO
}

const storageKey = (userId: string) => `parents.and.children-results:${userId}`;

function readAll(userId: string): Record<string, SavedResult> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as Record<string, SavedResult>) : {};
  } catch {
    return {};
  }
}

export function getSavedResult(
  userId: string | null | undefined,
  gameType: string
): SavedResult | null {
  if (!userId) return null;
  return readAll(userId)[gameType] ?? null;
}

export function saveResult(
  userId: string | null | undefined,
  gameType: string,
  score: number
): SavedResult | null {
  if (!userId) return null;
  const result: SavedResult = { score, savedAt: new Date().toISOString() };
  try {
    const all = readAll(userId);
    all[gameType] = result;
    localStorage.setItem(storageKey(userId), JSON.stringify(all));
    return result;
  } catch {
    return null;
  }
}
