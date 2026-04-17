// server/services/nowpayments.ts
import crypto from "crypto";
import dotenv from "dotenv";

// Загрузить .env перед использованием переменных окружения
dotenv.config();

const IS_SANDBOX = process.env.NOWPAYMENTS_SANDBOX === "true";
const BASE_URL = IS_SANDBOX
  ? "https://api-sandbox.nowpayments.io/v1"
  : "https://api.nowpayments.io/v1";
const API_KEY = process.env.NOWPAYMENTS_API_KEY!;
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET!;

console.log("[NOWPayments] Mode:", IS_SANDBOX ? "SANDBOX" : "PRODUCTION");
console.log("[NOWPayments] API_KEY loaded:", API_KEY ? `${API_KEY.slice(0, 10)}...` : "MISSING");

async function apiFetch(path: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    console.log("[apiFetch] Calling:", `${BASE_URL}${path}`);
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    console.log("[apiFetch] Response status:", res.status);
    const data = await res.json();
    console.log("[apiFetch] Response data:", JSON.stringify(data).slice(0, 200));
    if (!res.ok) {
      const msg = (data as any)?.message || `HTTP ${res.status}`;
      console.error("[NOWPayments API] Error response:", JSON.stringify(data, null, 2));
      throw new Error(`NOWPayments API error: ${msg}`);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function createInvoice({
  userId,
  amountUsd,
  plan = "lifetime",
}: {
  userId: number;
  amountUsd: number;
  plan?: string;
}) {
  const orderId = `sub_${userId}_${plan}_${Date.now()}`;
  const payCurrency = "usdttrc20";
  console.log("[createInvoice] Creating invoice with params:", {
    orderId,
    amountUsd,
    pay_currency: payCurrency,
    app_url: process.env.APP_URL
  });
  const invoice = await apiFetch("/invoice", {
    method: "POST",
    body: JSON.stringify({
      price_amount: amountUsd,
      price_currency: "usd",
      pay_currency: payCurrency,
      order_id: orderId,
      order_description: "KnowledgeChildren — доступ навсегда",
      ipn_callback_url: `${process.env.APP_URL}/api/payments/webhook`,
      success_url: `${process.env.APP_URL}/thank-you`,
      cancel_url: `${process.env.APP_URL}/pricing`,
    }),
  }) as any;
  console.log("[createInvoice] Invoice created:", {
    invoiceUrl: invoice.invoice_url,
    expiresAt: invoice.expiration_estimate_date
  });
  return {
    orderId,
    invoiceUrl: invoice.invoice_url,
    expiresAt: invoice.expiration_estimate_date,
  };
}

export function verifyWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string
): boolean {
  if (!IPN_SECRET) return true;
  const hmac = crypto
    .createHmac("sha512", IPN_SECRET)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(signatureHeader || "")
    );
  } catch {
    return false;
  }
}

export const isPaymentFinished = (s: string) =>
  ["finished", "confirmed"].includes(s);

export const isPaymentFailed = (s: string) =>
  ["failed", "expired", "refunded"].includes(s);

export const isPaymentPending = (s: string) =>
  ["waiting", "confirming", "sending", "partially_paid"].includes(s);
