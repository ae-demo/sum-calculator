import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/sum-api";

type SumRequest = components["schemas"]["SumRequest"];

// State lives in the page: a full reload re-runs this module. This service
// stores nothing, so there is no state to reset.
const DECIMAL = /^-?[0-9]+(\.[0-9]+)?$/;

/** Exact decimal addition on strings, so the mock never rounds like a float. */
function addDecimals(a: string, b: string): string {
  const scale = (s: string) => (s.split(".")[1] ?? "").length;
  const places = Math.max(scale(a), scale(b));
  const toInt = (s: string) => BigInt(s.replace(".", "") + "0".repeat(places - scale(s)));
  const total = toInt(a) + toInt(b);
  const negative = total < 0n;
  const digits = (negative ? -total : total).toString().padStart(places + 1, "0");
  const whole = digits.slice(0, digits.length - places);
  const frac = places ? digits.slice(digits.length - places).replace(/0+$/, "") : "";
  const text = frac ? `${whole}.${frac}` : whole;
  return negative && /[1-9]/.test(text) ? `-${text}` : text;
}

export const handlers = [
  http.post("/api/sums", async ({ request }) => {
    const input = (await request.json()) as Partial<SumRequest>;
    if (!input?.a || !input?.b || !DECIMAL.test(input.a) || !DECIMAL.test(input.b)) {
      return HttpResponse.json(
        { code: 400, message: "Invalid number", description: "a and b must be decimal numbers" },
        { status: 400 },
      );
    }
    return HttpResponse.json({ sum: addDecimals(input.a, input.b) });
  }),
];
