import { useState, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { headerNav, footerNav } from "@/lib/siteNav";
import { WheelHeader, WheelFooter, WheelPageShell } from "@/components/SiteHeaderFooter";

// ============================================================================
// Колесо способов оплаты — 12 секторов, тот же визуальный стиль,
// что и остальные колёса сайта.
//
// Раскладка секторов (обновлено):
//   Сектор 1 — крипто-кошелёк: перевод USDT (TRC20) на «Trust Wallet»
//              (нет ни банка, ни компании-хозяина — деньги живут в блокчейне)
//   Сектор 2 — компания с электронными деньгами (PayPal и т.п.) —
//              пока пустая заготовка: WebMoney / QIWI в Украине запрещены,
//              остальные сервисы ещё не подключены
//   Сектор 3 — банк: оплата на карту «ПриватБанк» из любой страны
//              (гривна — по Украине, иностранная валюта — из-за границы;
//              для переводов из-за границы дополнительно показан IBAN)
//   Остальные секторы — пустые заготовки под будущие способы оплаты.
//
// ⚠️ ПРАВКА: QR-коды убраны из обоих способов оплаты (кошелёк USDT и карта
// «ПриватБанк»): телефон читает их как обычный текст и предлагает «поиск в
// Google», а не открывает банковское приложение или кошелёк — пользы нет.
// Номер карты, IBAN и адрес кошелька копируются кнопками «Копировать».
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

// --- реквизиты карты Приватбанка — заданы один раз, используются в
//     секторе 3 («Оплата на карту «ПриватБанк» из любой страны»),
//     чтобы номер карты не дублировался в нескольких местах вручную.
//     Если карта сменится — достаточно поменять значения здесь. ---
const PRIVATBANK_CARD = "5168 7451 2747 0224";
const PRIVATBANK_HOLDER = "Урiзко Олександр Леонiдович";
// IBAN счёта этой карты — для переводов из-за границы (Приват24 →
// карта → «Реквізити»). Если оставить строку пустой, поле IBAN на
// странице не показывается.
const PRIVATBANK_IBAN = "UA47 305299 0262 0964 0093 3899078";
// Реквизиты для SWIFT-перевода из-за границы (Приват24 → карта → «Реквізити» →
// SWIFT → «Інша валюта — для зарахування в гривні»). Адрес получателя
// НЕ указываем намеренно (личные данные; на странице показываются только
// имя латиницей, банк, SWIFT/BIC и банк-корреспондент).
const PRIVATBANK_SWIFT = {
  beneficiary: "URIZKO OLEKSANDR",
  bank: "JSC CB PRIVATBANK, 1D HRUSHEVSKOHO STR., KYIV, 01001, UKRAINE",
  bic: "PBANUA2X",
  correspondentBank: "Citibank N.A., NEW YORK, USA",
  correspondentBic: "CITIUS33",
  correspondentAccount: "36445343",
};

// --- реквизиты для SWIFT-перевода из-за границы ---
type SwiftDetails = {
  beneficiary: string; // получатель латиницей
  bank: string; // банк получателя (название и адрес банка)
  bic: string; // SWIFT/BIC банка получателя
  correspondentBank: string; // банк-корреспондент
  correspondentBic: string; // SWIFT/BIC банка-корреспондента
  correspondentAccount: string; // корреспондентский счёт
};

// --- данные способов оплаты ---
type PaymentMethod = {
  methodKey: string; // машиночитаемый идентификатор способа оплаты, уходит на сервер
  labelLines: string[]; // текст на секторе колеса
  title: string; // заголовок в панели деталей
  card?: string; // номер карты / адрес кошелька (если применимо)
  cardFieldLabel?: string; // подпись поля выше (по умолчанию «Номер карты»)
  holder?: string; // получатель
  iban?: string; // IBAN счёта (для переводов из-за границы)
  swift?: SwiftDetails; // реквизиты SWIFT (для переводов из-за границы)
  note?: string; // дополнительное примечание
};

const PAYMENT_METHODS: (PaymentMethod | null)[] = [
  {
    // Сектор 1 — крипто-кошелёк (было в секторе 4, перенесено сюда).
    methodKey: "usdt_trc20",
    labelLines: ["Оплата на", "крипто-кошелёк", "«Trust Wallet»", "из любой страны"],
    title: "Оплата криптовалютой USDT (сеть TRON / TRC20)",
    card: "TNVoTnr2VyX4mSDrRjgPqp2Tcw6QiQe3dZ",
    cardFieldLabel: "Адрес кошелька (TRC20)",
    note: "Переведите сумму на адрес выше — подойдёт любая карта, украинская или иностранная. Выбирайте только сеть TRON (TRC20) и монету USDT — иначе деньги будут потеряны. После перевода нажмите «Оплачено» — мы проверим поступление и откроем доступ.",
  },
  null, // сектор 2 — компания с электронными деньгами (пока не подключена)
  {
    // Сектор 3 — банк: единый способ — карта «ПриватБанк». Объединяет два
    // прежних сектора (оплата по Украине в гривне и перевод из-за
    // границы в иностранной валюте) — реквизиты у них были одни и те же.
    // Ключ "privatbank_card" совпадает со справочником на сервере
    // (PAYMENT_METHOD_DETAILS в server/email.ts).
    methodKey: "privatbank_card",
    labelLines: ["Оплата на карту", "«ПриватБанк»", "из любой", "страны"],
    title: "Оплата на карту «ПриватБанк» из любой страны",
    card: PRIVATBANK_CARD,
    cardFieldLabel: "Номер карты (для переводов по Украине, в гривне)",
    holder: PRIVATBANK_HOLDER,
    iban: PRIVATBANK_IBAN || undefined,
    swift: PRIVATBANK_SWIFT,
    note: "По Украине — переведите сумму в гривне на номер карты. Из-за границы — переведите сумму на IBAN, реквизиты SWIFT указаны выше. Курс обмена и комиссии определяют банки. После перевода нажмите «Оплачено» — мы проверим поступление и откроем доступ.",
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

// --- Строка «подпись + значение + кнопка Копировать» ---
// ⚠️ ПРАВКА (без прокрутки): значение и кнопка «Копировать» стоят в
// одной строке (значение слева, кнопка справа) — так каждая строка
// занимает меньше высоты. copyValue — что реально копируется (например,
// номер карты / IBAN без пробелов), если отличается от показанного
// значения; large — крупнее шрифт (для номера карты и адреса кошелька).
function CopyRow({
  label,
  value,
  copyValue,
  large,
}: {
  label: string;
  value: string;
  copyValue?: string;
  large?: boolean;
}) {
  const [done, setDone] = useState(false);

  const handle = async () => {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      // clipboard недоступен — значение и так видно на экране
    }
  };

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[#FFD700] font-bold">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={`${
            large ? "text-base sm:text-lg tracking-wider" : "text-sm"
          } font-mono font-bold break-all min-w-0 flex-1 leading-snug`}
          style={{ color: "#FFD700" }}
        >
          {value}
        </span>
        <button
          onClick={handle}
          className="px-2.5 py-1 rounded-full border-2 text-xs font-bold shrink-0"
          style={{ color: "#FFD700", borderColor: "#FFD700" }}
        >
          {done ? "Скопировано" : "Копировать"}
        </button>
      </div>
    </div>
  );
}

// --- Золотая рамка с заголовком (одна «карточка» реквизитов) ---
// ⚠️ ПРАВКА (без прокрутки): flex-1 + min-h-0 — рамка занимает всё
// оставшееся место между заголовком и нижними кнопками и при нехватке
// высоты сжимается, а не выталкивает кнопки «Далее» и «Оплачено» за
// экран. overflow-y-auto — только запасной вариант для очень маленьких
// экранов: на обычном телефоне и на компьютере прокрутки не будет.
function DetailFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className="rounded-2xl border-2 bg-white p-3 flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto"
      style={{ borderColor: "#FFD700", boxShadow: "0 4px 14px rgba(255, 215, 0, 0.35)" }}
    >
      <h3 className="text-sm font-bold shrink-0" style={{ color: "#FFD700" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// --- Панель деталей выбранного способа оплаты ---
// ⚠️ ПРАВКА (без прокрутки, компьютер и телефон): панель занимает ровно
// доступную высоту (h-full) и состоит из четырёх частей: заголовок,
// золотая рамка с реквизитами (flex-1, сжимается), переключатель рамок
// и блок «Оплачено». Все реквизиты по-прежнему разбиты на рамки,
// показываемые по одной («Назад» / «Далее» и точки-индикаторы).
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
  const [step, setStep] = useState(0);

  // Собираем рамки из тех полей, что есть у способа оплаты.
  const frames: { key: string; title: string; content: ReactNode }[] = [];

  if (method.card) {
    frames.push({
      key: "card",
      title: method.iban ? "Оплата по Украине" : "Реквизиты для оплаты",
      content: (
        <>
          <CopyRow
            label={method.cardFieldLabel ?? "Номер карты"}
            value={method.card}
            copyValue={method.card.replace(/\s+/g, "")}
            large
          />
          {method.holder && <CopyRow label="Получатель" value={method.holder} />}
        </>
      ),
    });
  }

  if (method.iban) {
    frames.push({
      key: "iban",
      title: "Оплата из-за границы: IBAN",
      content: (
        <>
          <CopyRow
            label="IBAN (для переводов из-за границы)"
            value={method.iban}
            copyValue={method.iban.replace(/\s+/g, "")}
          />
          {method.holder && <CopyRow label="Получатель" value={method.holder} />}
        </>
      ),
    });
  }

  if (method.swift) {
    frames.push({
      key: "swift",
      title: "Реквизиты SWIFT",
      content: (
        <>
          <CopyRow label="Получатель (Beneficiary)" value={method.swift.beneficiary} />
          <CopyRow label="Банк получателя (Bank of beneficiary)" value={method.swift.bank} />
          <CopyRow label="SWIFT / BIC банка получателя" value={method.swift.bic} />
        </>
      ),
    });
    frames.push({
      key: "correspondent",
      title: "Банк-корреспондент (необязательно)",
      content: (
        <>
          <p className="text-xs italic leading-snug" style={{ color: "#FFD700", opacity: 0.8 }}>
            Три строки ниже — необязательные: указывайте их, только если банк
            отправителя запросит банк-корреспондент.
          </p>
          <CopyRow label="Банк-корреспондент (Correspondent bank)" value={method.swift.correspondentBank} />
          <CopyRow label="SWIFT / BIC банка-корреспондента" value={method.swift.correspondentBic} />
          <CopyRow
            label="Корреспондентский счёт (Correspondent account)"
            value={method.swift.correspondentAccount}
          />
        </>
      ),
    });
  }

  if (method.note) {
    frames.push({
      key: "note",
      title: "Как завершить оплату",
      content: (
        <p className="text-sm text-[#FFD700] font-bold leading-relaxed">{method.note}</p>
      ),
    });
  }

  const last = frames.length - 1;
  const current = frames[Math.min(step, last)];

  // На телефоне (≈ 414 px) панель занимает всю ширину экрана (поля по
  // 8 px); от ширины sm (640 px) — до max-w-2xl по центру.
  return (
    <div className="w-full max-w-none sm:max-w-2xl mx-auto h-full flex flex-col gap-2 px-2 sm:px-4 py-1">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 shrink-0">
        <button
          onClick={onBack}
          className="self-start px-3 py-1.5 rounded-full border-2 font-bold text-xs bg-white shrink-0"
          style={{ color: "#FFD700", borderColor: "#FFD700" }}
        >
          ← Назад к способам оплаты
        </button>

        <h2 className="text-base font-bold leading-tight" style={{ color: "#FFD700" }}>
          {method.title}
        </h2>
      </div>

      {current && <DetailFrame title={current.title}>{current.content}</DetailFrame>}

      {/* Переключатель рамок: «Назад» / точки / «Далее» */}
      {frames.length > 1 && (
        <div className="flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-3 py-1.5 rounded-full border-2 text-xs font-bold bg-white disabled:opacity-40"
            style={{ color: "#FFD700", borderColor: "#FFD700" }}
          >
            ← Назад
          </button>

          <div className="flex items-center gap-2" aria-label={`Шаг ${step + 1} из ${frames.length}`}>
            {frames.map((f, i) => (
              <button
                key={f.key}
                onClick={() => setStep(i)}
                aria-label={`Перейти к шагу ${i + 1}`}
                className="w-2.5 h-2.5 rounded-full border-2"
                style={{
                  borderColor: "#FFD700",
                  backgroundColor: i === step ? "#FFD700" : "#FFFFFF",
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setStep((s) => Math.min(last, s + 1))}
            disabled={step === last}
            className="px-3 py-1.5 rounded-full border-2 text-xs font-bold bg-white disabled:opacity-40"
            style={{ color: "#FFD700", borderColor: "#FFD700" }}
          >
            Далее →
          </button>
        </div>
      )}

      <div
        className="rounded-2xl border-2 bg-white p-2 flex flex-col sm:flex-row sm:items-center gap-2 shrink-0"
        style={{ borderColor: "#FFD700" }}
      >
        <p className="text-xs text-[#FFD700] font-bold leading-snug flex-1">
          После перевода нажмите кнопку — заявка уйдёт администратору
          на проверку поступления средств.
        </p>
        <button
          onClick={onConfirmPaid}
          disabled={submitting}
          className="px-5 py-2 rounded-full text-sm font-bold text-white disabled:opacity-50 shrink-0"
          style={{ backgroundColor: "#FFD700" }}
        >
          {submitting ? "Отправка…" : "Оплачено"}
        </button>
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
          // "usdt_trc20" | "privatbank_card"
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
        {/* ⚠️ ПРАВКА (без прокрутки): контейнер снова items-center +
            overflow-hidden (как у остальных колёс сайта) — внешней
            прокрутки нет. Панель реквизитов сама занимает h-full и
            сжимает свою золотую рамку, а не выходит за экран. */}
        <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
          {confirmedPending ? (
            // ⚠️ ДОБАВЛЕНО: короткое сообщение вместо мгновенного
            // редиректа — показывается на 1.5с, пока не сработает
            // setTimeout(() => navigate("/"), ...) в useEffect выше.
            <div className="flex flex-col items-center justify-center gap-4">
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