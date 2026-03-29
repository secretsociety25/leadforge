import { getZiinaApiBase } from "./ziina-config";

export type ZiinaCreatePaymentIntentBody = {
  amount: number;
  currency_code: string;
  message: string;
  success_url: string;
  cancel_url: string;
  failure_url?: string;
  operation_id?: string;
  test?: boolean;
};

export type ZiinaPaymentIntentResponse = {
  id: string;
  redirect_url: string;
  status?: string;
  operation_id?: string;
  amount?: number;
};

function getZiinaApiKey(): string {
  const key = process.env.ZIINA_API_KEY ?? process.env.ZIINA_ACCESS_TOKEN;
  if (!key) {
    throw new Error("ZIINA_API_KEY (or ZIINA_ACCESS_TOKEN) is not set");
  }
  return key;
}

/**
 * Create a hosted checkout Payment Intent (Ziina REST API).
 * Use test=true in development. Amount must be in fils. One-time payment for now.
 * @see https://docs.ziina.com/api-reference/payment-intent/create
 */
export async function ziinaCreatePaymentIntent(
  body: ZiinaCreatePaymentIntentBody,
): Promise<ZiinaPaymentIntentResponse> {
  const url = `${getZiinaApiBase()}/payment_intent`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getZiinaApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Ziina payment_intent ${res.status}: ${text}`);
  }

  return JSON.parse(text) as ZiinaPaymentIntentResponse;
}
