// shared/pricing.ts
// Единое место, где задаются цены по способам оплаты. Используется и
// сервером (создание заявки, письма, Telegram), и клиентом (страница
// оплаты, админка). Чтобы поменять цену — правьте только этот файл.
//
// Ключи совпадают с methodKey в PAYMENT_METHODS (PaymentsPage.tsx).
export type PaymentPrice = {
  amount: number;
  currency: "UAH" | "USDT";
};

export const PAYMENT_PRICES: Record<string, PaymentPrice> = {
  privatbank_card: { amount: 45, currency: "UAH" }, // карта ПриватБанка — 45 грн
  usdt_trc20: { amount: 1, currency: "USDT" }, // крипто-кошелёк — 1 USDT
};

// Цена, если способ оплаты ещё не выбран (заявка создаётся при
// регистрации) — берётся цена карты; при нажатии «Оплачено» сумма
// пересчитывается под выбранный способ.
export const DEFAULT_PAYMENT_PRICE: PaymentPrice = PAYMENT_PRICES.privatbank_card;

export function getPaymentPrice(method?: string | null): PaymentPrice {
  return (method && PAYMENT_PRICES[method]) || DEFAULT_PAYMENT_PRICE;
}

// 45 UAH → "45 грн", 1 USDT → "1 USDT"
export function formatPrice(amount: number | string, currency?: string | null): string {
  const label = !currency || currency === "UAH" ? "грн" : currency;
  return `${Number(amount)} ${label}`;
}
