// backend/src/services/paymentService.js
export const PRICES = {
  STARTER: 199,
  FOCUS_PACK: 499,
  GROWTH: 899,
  ELITE: 1499,
};

export const DURATION_DAYS = {
  STARTER: 30,
  FOCUS_PACK: 90,
  GROWTH: 180,
  ELITE: 365,
};

export function getPlanPrice(plan) {
  return PRICES[plan] || PRICES.STARTER;
}

export function getPlanDuration(plan) {
  return DURATION_DAYS[plan] || DURATION_DAYS.STARTER;
}
