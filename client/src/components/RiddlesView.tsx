import { useMemo, useState, type FormEvent } from "react";
import { WHEEL_TEXT_COLOR } from "@/lib/colors";

// Народные загадки (общественное достояние). Список можно свободно
// дополнять — компонент ничего больше не требует.
export interface Riddle {
  question: string;
  answer: string;
}

export const RIDDLES: Riddle[] = [
  { question: "Зимой и летом одним цветом.", answer: "Ёлка" },
  { question: "Не лает, не кусает, а в дом не пускает.", answer: "Замок" },
  { question: "Висит груша — нельзя скушать.", answer: "Лампочка" },
  { question: "Без окон, без дверей полна горница людей.", answer: "Огурец" },
  { question: "Сидит дед, во сто шуб одет; кто его раздевает, тот слёзы проливает.", answer: "Лук" },
  { question: "Сто одёжек, и все без застёжек.", answer: "Капуста" },
  { question: "Идёт, идёт, а с места не сойдёт.", answer: "Часы" },
  { question: "Два конца, два кольца, посередине гвоздик.", answer: "Ножницы" },
  { question: "Что в огне не горит и в воде не тонет?", answer: "Лёд" },
  { question: "Не птица, а с крыльями; не пчела, а над цветами летает.", answer: "Бабочка" },
  { question: "Хвост крючком, нос пятачком.", answer: "Свинья" },
  { question: "Растёт вниз головой, летом не растёт, а зимой растёт.", answer: "Сосулька" },
  { question: "Всех кормлю с охотою, а сама не ем.", answer: "Ложка" },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Мягкое сравнение: без учёта регистра, пробелов по краям и буквы «ё».
function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/ё/g, "е");
}

const BUTTON_CLASS =
  "flex-1 h-12 px-2 rounded-full border-2 font-bold text-sm sm:text-base transition bg-white whitespace-nowrap";

const INPUT_CLASS =
  "w-full h-12 px-5 rounded-full border-2 text-base text-center outline-none";

export default function RiddlesView() {
  const [order, setOrder] = useState<Riddle[]>(() => shuffle(RIDDLES));
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");

  const riddle = order[index];
  const style = useMemo(
    () => ({ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }),
    []
  );

  const check = (e: FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    setResult(
      normalize(guess) === normalize(riddle.answer) ? "correct" : "wrong"
    );
  };

  const next = () => {
    setShowAnswer(false);
    setGuess("");
    setResult("idle");
    if (index + 1 >= order.length) {
      setOrder(shuffle(RIDDLES));
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  };

  const canAnswer = !showAnswer && result !== "correct";

  return (
    <div className="w-full h-full flex items-start justify-center px-4 pt-4 bg-white overflow-y-auto">
      <div className="flex flex-col items-center gap-5 w-full max-w-xl text-center">
        <p className="text-xl font-bold" style={{ color: WHEEL_TEXT_COLOR }}>
          Загадки
        </p>

        <p
          className="text-2xl font-bold leading-snug px-2"
          style={{ color: WHEEL_TEXT_COLOR }}
        >
          {riddle.question}
        </p>

        <div className="min-h-[3.5rem] flex items-center" aria-live="polite">
          {showAnswer ? (
            <p className="text-2xl font-bold" style={{ color: WHEEL_TEXT_COLOR }}>
              Ответ: {riddle.answer}
            </p>
          ) : result === "correct" ? (
            <p className="text-2xl font-bold text-green-600">
              Верно! 🎉 {riddle.answer}
            </p>
          ) : result === "wrong" ? (
            <p className="text-xl font-bold text-red-500">
              Не совсем, попробуйте ещё раз
            </p>
          ) : null}
        </div>

        {canAnswer && (
          <form
            id="riddle-form"
            onSubmit={check}
            className="w-full flex justify-center"
          >
            <input
              type="text"
              value={guess}
              onChange={(e) => {
                setGuess(e.target.value);
                if (result === "wrong") setResult("idle");
              }}
              placeholder="Ваш ответ"
              autoComplete="off"
              className="px-5 py-3 rounded-full border-2 text-base text-center w-full max-w-md outline-none"
              style={style}
            />
          </form>
        )}

        <div className="flex flex-nowrap justify-center gap-2 w-full">
          {canAnswer && (
            <button
              type="submit"
              form="riddle-form"
              className={BUTTON_CLASS}
              style={style}
            >
              Проверить
            </button>
          )}
          {canAnswer && (
            <button
              type="button"
              onClick={() => setShowAnswer(true)}
              className={BUTTON_CLASS}
              style={style}
            >
              Показать ответ
            </button>
          )}
          <button
            type="button"
            onClick={next}
            className={BUTTON_CLASS}
            style={style}
          >
            Следующая загадка
          </button>
        </div>

        <p className="text-sm pb-4" style={{ color: WHEEL_TEXT_COLOR }}>
          Загадка {index + 1} из {order.length}
        </p>
      </div>
    </div>
  );
}