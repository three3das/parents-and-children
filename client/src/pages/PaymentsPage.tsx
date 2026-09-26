import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { headerNav, footerNav } from "@/lib/siteNav";
import { WheelHeader, WheelFooter, WheelPageShell } from "@/components/SiteHeaderFooter";

// ============================================================================
// Колесо способов оплаты — 12 секторов, тот же визуальный стиль,
// что и остальные колёса сайта.
//
// Раскладка секторов (обновлено):
//   Сектор 1 — оплата с любой карты (украинской или иностранной) →
//              перевод на крипто-кошелёк USDT (TRC20)
//   Сектор 2 — оплата с любой карты по Украине → карта «ПриватБанк» (грн)
//   Сектор 3 — перевод из-за границы, иностранная валюта → та же карта
//              «ПриватБанк» (грн), что и в секторе 2
//   Остальные секторы — пустые заготовки под будущие способы оплаты.
// ============================================================================

const SECTOR_COUNT = 12;
const CX = 250;
const CY = 250;
const R = 250;

const toRad = (deg: number) => (deg * Math.PI) / 180;

// --- те же золотые цвета, что и в остальных колёсах сайта ---
const GOLD = { r: 255, g: 215, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

function mix(goldPct: number) {
  const r = Math.round(GOLD.r * goldPct + WHITE.r * (1 - goldPct));
  const g = Math.round(GOLD.g * goldPct + WHITE.g * (1 - goldPct));
  const b = Math.round(GOLD.b * goldPct + WHITE.b * (1 - goldPct));
  return `rgb(${r},${g},${b})`;
}

const COLOR_33 = mix(0.33);
const COLOR_67 = mix(0.67);
const COLOR_100 = mix(1.0);

function sectorColor(i: number) {
  const m = i % 3;
  if (m === 0) return COLOR_33;
  if (m === 1) return COLOR_67;
  return COLOR_100;
}

const MM_TO_UNITS = 96 / 25.4;
const EDGE_GAP_MM = 2;
const GAP = EDGE_GAP_MM * MM_TO_UNITS;

const HALF_ANGLE = toRad(360 / SECTOR_COUNT / 2);
const SIN_HALF = Math.sin(HALF_ANGLE);

const BADGE_R = (R * SIN_HALF - GAP * (SIN_HALF + 1)) / (1 + SIN_HALF);
const BADGE_RADIUS = R - BADGE_R - GAP;

const LABEL_FONT_SIZE = 8.4;

// --- реквизиты карты Приватбанка — заданы один раз, используются
//     и в секторе 2 (по Украине), и в секторе 3 (из-за границы),
//     чтобы номер карты не дублировался в двух местах вручную. Если
//     карта сменится — достаточно поменять значение здесь. ---
const PRIVATBANK_CARD = "5168 7451 2747 0224";
const PRIVATBANK_HOLDER = "Урiзко Олександр Леонiдович";

// --- данные способов оплаты ---
type PaymentMethod = {
  methodKey: string; // машиночитаемый идентификатор способа оплаты, уходит на сервер
  labelLines: string[]; // текст на секторе колеса
  title: string; // заголовок в панели деталей
  card?: string; // номер карты / адрес кошелька (если применимо)
  cardFieldLabel?: string; // подпись поля выше (по умолчанию «Номер карты»)
  holder?: string; // получатель
  note?: string; // дополнительное примечание
};

const PAYMENT_METHODS: (PaymentMethod | null)[] = [
  {
    // Сектор 1 — было в секторе 4, перенесено сюда.
    methodKey: "usdt_trc20",
    labelLines: ["Оплата любой", "картой (укр. или", "иностр.) →", "крипто-кошелёк"],
    title: "Оплата криптовалютой USDT (сеть TRON / TRC20)",
    card: "TNVoTnr2VyX4mSDrRjgPqp2Tcw6QiQe3dZ",
    cardFieldLabel: "Адрес кошелька (TRC20)",
    note: "Переведите сумму на адрес выше — подойдёт любая карта, украинская или иностранная. После перевода нажмите «Оплачено» — мы проверим поступление и откроем доступ.",
  },
  {
    // Сектор 2 — оплата любой картой в пределах Украины.
    methodKey: "privatbank_card_domestic",
    labelLines: ["Оплата картой", "по Украине", "на карту", "«ПриватБанк»"],
    title: "Оплата с украинской карты на карту Приватбанка",
    card: PRIVATBANK_CARD,
    holder: PRIVATBANK_HOLDER,
    note: "Переведите сумму в гривне с любой украинской карты на карту выше. После перевода нажмите «Оплачено» — мы проверим поступление и откроем доступ.",
  },
  {
    // Сектор 3 — перевод из-за границы в иностранной валюте, но на
    // ту же самую карту (PRIVATBANK_CARD), что и в секторе 2.
    methodKey: "privatbank_card_foreign",
    labelLines: ["Перевод из-за", "границы (валюта)", "на карту", "«ПриватБанк»"],
    title: "Перевод из-за границы (иностранная валюта) на карту Приватбанка",
    card: PRIVATBANK_CARD,
    holder: PRIVATBANK_HOLDER,
    note: "Переведите сумму в иностранной валюте с зарубежной карты — банк спишет её в исходной валюте, а зачислится она на карту получателя в гривне по курсу конвертации. После перевода нажмите «Оплачено» — мы проверим поступление и откроем доступ.",
  },
  null, // сектор 4 — освободился (криптовалюта переехала в сектор 1)
  null, // сектор 5 — зарезервирован
  null, // сектор 6 — зарезервирован
  null, // сектор 7 — зарезервирован
  null, // сектор 8 — зарезервирован
  null, // сектор 9 — зарезервирован
  null, // сектор 10 — зарезервирован
  null, // сектор 11 — зарезервирован
  null, // сектор 12 — зарезервирован
];

function Wheel12({
  labels,
  centerLabel,
  onSectorClick,
  activeIndex,
  disabledIndices,
}: {
  labels: string[][];
  centerLabel: string;
  onSectorClick?: (index: number) => void;
  activeIndex?: number;
  disabledIndices?: Set<number>;
}) {
  return (
    <div className="relative aspect-square h-full max-h-full max-w-full">
      <svg viewBox="0 0 500 500" className="w-full h-full">
        {Array.from({ length: SECTOR_COUNT }).map((_, i) => {
          const angle = (360 / SECTOR_COUNT) * i;
          const nextAngle = (360 / SECTOR_COUNT) * (i + 1);
          const x1 = CX + R * Math.sin(toRad(angle));
          const y1 = CY - R * Math.cos(toRad(angle));
          const x2 = CX + R * Math.sin(toRad(nextAngle));
          const y2 = CY - R * Math.cos(toRad(nextAngle));
          const fill = sectorColor(i);
          return (
            <path
              key={i}
              d={`M${CX},${CY} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`}
              fill={fill}
            />
          );
        })}

        {Array.from({ length: SECTOR_COUNT }).map((_, i) => {
          const midAngle = (360 / SECTOR_COUNT) * i + 360 / SECTOR_COUNT / 2;
          const bx = CX + BADGE_RADIUS * Math.sin(toRad(midAngle));
          const by = CY - BADGE_RADIUS * Math.cos(toRad(midAngle));
          const isDisabled = disabledIndices?.has(i);
          const clickable = Boolean(onSectorClick) && !isDisabled;
          const isActive = i === activeIndex;
          return (
            <circle
              key={`badge-${i}`}
              cx={bx}
              cy={by}
              r={BADGE_R}
              fill={isActive ? "#FFD700" : "#FFFFFF"}
              stroke="#FFD700"
              strokeWidth={3}
              style={clickable ? { cursor: "pointer" } : undefined}
              onClick={clickable ? () => onSectorClick!(i) : undefined}
            />
          );
        })}

        {Array.from({ length: SECTOR_COUNT }).map((_, i) => {
          const midAngle = (360 / SECTOR_COUNT) * i + 360 / SECTOR_COUNT / 2;
          const bx = CX + BADGE_RADIUS * Math.sin(toRad(midAngle));
          const by = CY - BADGE_RADIUS * Math.cos(toRad(midAngle));
          const lines = labels[i] || [];
          const isDisabled = disabledIndices?.has(i);
          const clickable = Boolean(onSectorClick) && !isDisabled;
          const isActive = i === activeIndex;

          const firstDy =
            lines.length === 1
              ? "0.32em"
              : lines.length === 2
              ? "-0.5em"
              : lines.length === 3
              ? "-1.1em"
              : lines.length === 4
              ? "-1.7em"
              : "0em";

          return (
            <text
              key={`label-${i}`}
              x={bx}
              y={by}
              textAnchor="middle"
              fontSize={LABEL_FONT_SIZE}
              fontWeight="bold"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fill={isActive ? "#FFFFFF" : "#FFD700"}
              opacity={isDisabled ? 0.55 : 1}
              style={clickable ? { cursor: "pointer" } : undefined}
              onClick={clickable ? () => onSectorClick!(i) : undefined}
            >
              {lines.map((line, li) => (
                <tspan key={li} x={bx} dy={li === 0 ? firstDy : "1.2em"}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="px-6 py-3 rounded-full border-[3px] border-yellow-400 bg-white font-bold text-xl"
          style={{ color: "#FFD700" }}
        >
          {centerLabel}
        </div>
      </div>
    </div>
  );
}

// --- Панель деталей выбранного способа оплаты ---
function PaymentDetailsPanel({
  method,
  onBack,
  onConfirmPaid,
  submitting,
}: {
  method: PaymentMethod;
  onBack: () => void;
  onConfirmPaid: () => void;
  submitting: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!method.card) return;
    try {
      await navigator.clipboard.writeText(method.card.replace(/\s+/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard недоступен — молча игнорируем, номер и так виден на экране
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4 px-4">
      <button
        onClick={onBack}
        className="self-start px-4 py-2 rounded-full border-2 font-bold text-sm bg-white"
        style={{ color: "#FFD700", borderColor: "#FFD700" }}
      >
        ← Назад к способам оплаты
      </button>

      <div className="rounded-2xl border-2 border-yellow-400 bg-white p-4 sm:p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold" style={{ color: "#FFD700" }}>
          {method.title}
        </h2>

        {method.card && (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-[#FFD700] font-bold">
              {method.cardFieldLabel ?? "Номер карты"}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Само значение (номер карты / адрес кошелька) — именно
                  этот текст был чёрным на скриншотах. Красим его тоже. */}
              <span
                className="text-lg font-mono font-bold tracking-wider break-all min-w-0"
                style={{ color: "#FFD700" }}
              >
                {method.card}
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded-full border-2 text-xs font-bold shrink-0"
                style={{ color: "#FFD700", borderColor: "#FFD700" }}
              >
                {copied ? "Скопировано" : "Копировать"}
              </button>
            </div>
          </div>
        )}

        {method.holder && (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-[#FFD700] font-bold">Получатель</span>
            {/* Само значение (ФИО получателя) — тоже было чёрным. */}
            <span className="font-semibold" style={{ color: "#FFD700" }}>
              {method.holder}
            </span>
          </div>
        )}

        {method.note && (
          <p className="text-sm text-[#FFD700] font-bold leading-relaxed">{method.note}</p>
        )}

        <div className="flex flex-col gap-2 pt-2 border-t border-yellow-100">
          <p className="text-xs text-[#FFD700] font-bold">
            После перевода нажмите кнопку ниже — заявка уйдёт администратору
            на проверку поступления средств.
          </p>
          <button
            onClick={onConfirmPaid}
            disabled={submitting}
            className="mt-2 px-6 py-3 rounded-full font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: "#FFD700" }}
          >
            {submitting ? "Отправка…" : "Оплачено"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeNav, setActiveNav] = useState<string>(headerNav[0].key);
  const [activeFooterNav, setActiveFooterNav] = useState<string>("dynamic");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // Собственное окно-уведомление в стиле сайта (золотой текст) —
  // заменяет системный alert(), который браузер стилизовать не даёт.
  const [infoModal, setInfoModal] = useState<{
    title: string;
    message: string;
  } | null>(null);
  // ⚠️ ДОБАВЛЕНО: true в короткий промежуток между тем, как опрос ниже
  // обнаружил hasSubscription: true, и фактическим переходом на "/" —
  // показывает сообщение "Оплата подтверждена! Переходим..." вместо
  // мгновенного резкого редиректа.
  const [confirmedPending, setConfirmedPending] = useState(false);

  const [, navigate] = useLocation();

  // Реальный пользователь из общего контекста авторизации
  // (тот же useAuth(), что используют login.tsx, useGoogleAuth.ts и HomePage).
  const { user, login, logout } = useAuth();

  // ⚠️ ДОБАВЛЕНО: автоматический опрос статуса подписки. Пока
  // пользователь на этой странице и ещё не имеет подписки — раз в 5
  // секунд спрашиваем уже существующий эндпоинт GET
  // /api/auth/status/:userId (server/routes.ts). Как только
  // администратор подтвердит оплату в Telegram-боте и hasSubscription
  // станет true на сервере — останавливаем опрос, обновляем user в
  // общем контексте (через login(), это же обновит localStorage) и
  // переходим на "/" с коротким сообщением-паузой.
  useEffect(() => {
    if (!user || user.hasSubscription) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/status/${user.id}`);
        const data = await res.json();
        if (data.hasSubscription) {
          clearInterval(interval);
          setConfirmedPending(true);
          login({ ...user, hasSubscription: true });
          setTimeout(() => {
            navigate("/?skipSplash=true");
          }, 1500);
        }
      } catch {
        // сеть недоступна временно — просто попробуем на следующем тике
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, login, navigate]);

  const labels = PAYMENT_METHODS.map((m) => m?.labelLines ?? []);
  const disabledIndices = new Set(
    PAYMENT_METHODS.map((m, i) => (m ? -1 : i)).filter((i) => i >= 0)
  );

  const handleSectorClick = (index: number) => {
    if (!PAYMENT_METHODS[index]) return;
    setSelected(index);
  };

  const handleConfirmPaid = async () => {
    if (selected === null) return;
    const method = PAYMENT_METHODS[selected];
    if (!method) return;

    if (!user) {
      setInfoModal({
        title: "Вход не выполнен",
        message: "Сначала войдите в аккаунт, чтобы подтвердить оплату.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/p2p/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          // "usdt_trc20" | "privatbank_card_domestic" | "privatbank_card_foreign"
          // Раньше сервер ожидал только "privatbank_card" | "usdt_trc20" —
          // если ветка по этим двум новым ключам обрабатывается на бэкенде
          // так же, как раньше обрабатывался единый "privatbank_card",
          // серверный обработчик тоже нужно обновить (см. примечание ниже).
          method: method.methodKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInfoModal({
          title: "Ошибка",
          message: data.error || "Не удалось отправить заявку. Попробуйте ещё раз.",
        });
        return;
      }
      setInfoModal({
        title: "Заявка отправлена",
        message:
          "Как только поступление подтвердится администратором, доступ ко всем страницам сайта откроется автоматически.",
      });
      setSelected(null);
    } catch {
      setInfoModal({
        title: "Ошибка сети",
        message: "Проверьте подключение и попробуйте снова.",
      });
    } finally {
      setSubmitting(false);
    }
  };


  // Футер здесь общий с домашней страницей (3 кнопки: "stable" /
  // "home" / "dynamic"), но сама эта страница — не одно из тех колёс,
  // поэтому любой клик по футеру просто возвращает на домашнюю
  // страницу, где уже можно выбрать нужное колесо снова.
  const handleFooterClick = (key: string) => {
    setActiveFooterNav(key);
    navigate("/home");
  };

  const selectedMethod =
    selected !== null ? PAYMENT_METHODS[selected] : null;

  return (
    <>
      <WheelPageShell
        header={
          <WheelHeader items={headerNav} activeKey={activeNav} onSelect={setActiveNav} />
        }
        footer={
          <WheelFooter
            items={footerNav}
            activeKey={activeFooterNav}
            onSelect={handleFooterClick}
          />
        }
      >

        <div className="flex-1 min-h-0 w-full flex items-start justify-center overflow-y-auto py-4">
          {confirmedPending ? (
            // ⚠️ ДОБАВЛЕНО: короткое сообщение вместо мгновенного
            // редиректа — показывается на 1.5с, пока не сработает
            // setTimeout(() => navigate("/"), ...) в useEffect выше.
            <div className="flex flex-col items-center justify-center gap-4 pt-20">
              <p className="text-xl font-bold" style={{ color: "#FFD700" }}>
                Оплата подтверждена! Переходим...
              </p>
            </div>
          ) : selectedMethod ? (
            <PaymentDetailsPanel
              method={selectedMethod}
              onBack={() => setSelected(null)}
              onConfirmPaid={handleConfirmPaid}
              submitting={submitting}
            />
          ) : (
            <Wheel12
              labels={labels}
              centerLabel="Оплата"
              onSectorClick={handleSectorClick}
              disabledIndices={disabledIndices}
            />
          )}
        </div>
      </WheelPageShell>

      {/* Модалка подтверждения выхода из аккаунта — в стиле сайта
          (золотая рамка, белый фон), вместо системного window.confirm.
          Открывается кликом по кнопке "Добро пожаловать, ...!" в футере. */}
      {showLogoutConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div
            className="fixed top-1/2 left-1/2 w-[90%] max-w-sm bg-white rounded-2xl border-2 border-yellow-400 shadow-2xl z-[9999] p-6 flex flex-col gap-4"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <h2 className="text-lg font-bold" style={{ color: "#FFD700" }}>
              Выйти из аккаунта?
            </h2>
            <p className="text-sm" style={{ color: "#FFD700" }}>
              Вы сможете снова войти в любой момент со своим email и паролем.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-5 py-2 rounded-full border-2 font-bold text-sm bg-white"
                style={{ color: "#FFD700", borderColor: "#FFE066" }}
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowLogoutConfirm(false);
                  navigate("/home");
                }}
                className="px-5 py-2 rounded-full font-bold text-sm text-white"
                style={{ backgroundColor: "#FFD700" }}
              >
                Выйти
              </button>
            </div>
          </div>
        </>
      )}

      {/* Собственное окно-уведомление (замена системного alert()) —
          тот же стиль, что и окно выхода из аккаунта выше: золотая
          рамка, белый фон, золотой текст. Системный alert() браузер
          не даёт стилизовать вообще никак, поэтому рисуем своё. */}
      {infoModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={() => setInfoModal(null)}
          />
          <div
            className="fixed top-1/2 left-1/2 w-[90%] max-w-sm bg-white rounded-2xl border-2 border-yellow-400 shadow-2xl z-[9999] p-6 flex flex-col gap-4"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <h2 className="text-lg font-bold" style={{ color: "#FFD700" }}>
              {infoModal.title}
            </h2>
            <p className="text-sm" style={{ color: "#FFD700" }}>
              {infoModal.message}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInfoModal(null)}
                className="px-5 py-2 rounded-full font-bold text-sm text-white"
                style={{ backgroundColor: "#FFD700" }}
              >
                OK
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}