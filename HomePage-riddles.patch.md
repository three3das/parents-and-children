# Правки в `client/src/pages/HomePage.tsx`

Новый файл `RiddlesView.tsx` положите в `client/src/components/`.
Свободный сектор на главном колесе — №3 (индекс 2). Сектора 0 («Игры») и 1 («Шастра») уже заняты.

## 1. Импорт (рядом с остальными импортами компонентов)

```tsx
import RiddlesView from "@/components/RiddlesView";
```

## 2. Константы (рядом с `SHASTRA_INDEX`)

Было:
```tsx
const CATEGORY_CLICKABLE_INDICES = [0, SHASTRA_INDEX];
```
Стало:
```tsx
const RIDDLES_INDEX = 2;
const RIDDLES_LABEL = "Загадки";
const CATEGORY_CLICKABLE_INDICES = [0, SHASTRA_INDEX, RIDDLES_INDEX];
```

## 3. Подпись сектора (в `CATEGORY_WHEEL_LABELS`)

```tsx
if (i === SHASTRA_INDEX) return [SHASTRA_LABEL];
if (i === RIDDLES_INDEX) return [RIDDLES_LABEL];   // ← добавить
```

## 4. Тип `ViewState`

```tsx
  | "shastra-verse"
  | "riddles"          // ← добавить
```

## 5. Клик по сектору (`handleSelectCategory`)

```tsx
} else if (index === RIDDLES_INDEX) {
  setView("riddles");
}
```

## 6. Отрисовка (рядом с `{view === "games" && ...}`)

```tsx
{view === "riddles" && <RiddlesView />}
```

## «← Назад»

Ничего менять не нужно: `handleBack` по умолчанию делает `setView("main")`.
