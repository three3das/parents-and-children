// client/src/components/SortRequestForm.tsx
//
// Общая форма «поиск по странице / сортировка по запросу»: ряд золотых
// полей-списков и золотая кнопка «Сортировка по запросу». Подключается
// на любой странице сайта, где нужна такая сортировка (сейчас — экран
// «Уже готово для вас» в IshvaraPage.tsx).
//
// Компонент рисует ТОЛЬКО ряд полей и кнопку — белый фон, отступ сверху
// и положение на странице задаёт сама страница (см. пример ниже).
//
// ─── Пример использования ───────────────────────────────────────────────────
//   import SortRequestForm, { type SortValues } from "@/components/SortRequestForm";
//
//   const handleSort = (values: SortValues) => {
//     // values.age / values.topic / values.section — номера из списков
//     // ("1", "2", "3" …) или "" (если поле не выбрано).
//   };
//
//   <div className="w-full flex items-start justify-center px-4 pt-4 bg-white">
//     <SortRequestForm onSubmit={handleSort} />
//   </div>
//
// ─── Свои поля ──────────────────────────────────────────────────────────────
// Чтобы на другой странице были другие поля, передайте проп fields:
//   <SortRequestForm
//     fields={[{ key: "level", label: "Уровень", options: [...] }]}
//     onSubmit={...}
//   />

import { useState } from "react";

// ─── Данные списков (общие для сайта) ───────────────────────────────────────

// Разделы сайта — те же 12 названий, что и на «Домашней странице»
// (колесо тем). Используется и колесом в IshvaraPage.tsx, и списком
// «Разделы» в форме, поэтому хранится в одном месте.
export const CATEGORY_ITEMS: string[] = [
  "Игры",
  "Природа",
  "Кулинария",
  "Культура",
  "Образование",
  "Наука",
  "Творчество",
  "Медицина",
  "Обычаи",
  "Религия",
  "Традиция",
  "Йога",
];

export interface SortOption {
  value: string; // номер варианта: "1", "2", "3" …
  label: string; // подпись в списке
}

export interface SortField {
  key: string; // ключ поля в объекте значений (например, "age")
  label: string; // подпись над полем
  options: SortOption[];
}

// Значения формы: ключ поля → выбранный номер ("" — ничего не выбрано).
export type SortValues = Record<string, string>;

export const AGE_OPTIONS: SortOption[] = [
  { value: "1", label: "до 3-х лет" },
  { value: "2", label: "до 5-ти лет" },
  { value: "3", label: "до 7-ми лет" },
];

export const TOPIC_OPTIONS: SortOption[] = [
  { value: "1", label: "Родители" },
  { value: "2", label: "Дети" },
  { value: "3", label: "Взаимоотношения" },
];

// Разделы — номера 1–12 по порядку, как в CATEGORY_ITEMS.
export const SECTION_OPTIONS: SortOption[] = CATEGORY_ITEMS.map((label, i) => ({
  value: String(i + 1),
  label,
}));

// Набор полей по умолчанию: Возраст, Тема, Разделы.
export const DEFAULT_SORT_FIELDS: SortField[] = [
  { key: "age", label: "Возраст", options: AGE_OPTIONS },
  { key: "topic", label: "Тема", options: TOPIC_OPTIONS },
  { key: "section", label: "Разделы", options: SECTION_OPTIONS },
];

// ─── Одно золотое поле (выпадающий список) ──────────────────────────────────
function SortSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
}) {
  return (
    <label className="flex flex-col gap-1 min-w-[170px]">
      <span className="text-xs font-bold" style={{ color: "#FFD700" }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 rounded-full border-2 bg-white font-bold text-sm outline-none cursor-pointer"
        style={{ color: "#FFD700", borderColor: "#FFD700" }}
      >
        <option value="">Выберите…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ─── Форма ──────────────────────────────────────────────────────────────────
interface SortRequestFormProps {
  // Какие поля показывать (по умолчанию — Возраст, Тема, Разделы).
  fields?: SortField[];
  // Начальные значения (например, {"age": "2"}); необязательно.
  initialValues?: SortValues;
  // Вызывается при каждом изменении любого поля.
  onChange?: (values: SortValues) => void;
  // Вызывается по кнопке «Сортировка по запросу».
  onSubmit?: (values: SortValues) => void;
  // Подпись кнопки.
  buttonLabel?: string;
}

export default function SortRequestForm({
  fields = DEFAULT_SORT_FIELDS,
  initialValues,
  onChange,
  onSubmit,
  buttonLabel = "Сортировка по запросу",
}: SortRequestFormProps) {
  const [values, setValues] = useState<SortValues>(() => {
    const empty = fields.reduce<SortValues>((acc, f) => {
      acc[f.key] = "";
      return acc;
    }, {});
    return { ...empty, ...initialValues };
  });

  const handleFieldChange = (key: string, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    onChange?.(next);
  };

  return (
    <div className="flex flex-wrap items-end justify-center gap-3">
      {fields.map((f) => (
        <SortSelect
          key={f.key}
          label={f.label}
          value={values[f.key] ?? ""}
          onChange={(v) => handleFieldChange(f.key, v)}
          options={f.options}
        />
      ))}

      <button
        onClick={() => onSubmit?.(values)}
        className="px-5 py-2 rounded-full text-sm font-bold text-white shrink-0"
        style={{ backgroundColor: "#FFD700" }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}