import { MAX_CART_QTY, type CartItem } from "./schemas";

export function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 1;
  if (qty < 1) return 1;
  if (qty > MAX_CART_QTY) return MAX_CART_QTY;
  return Math.floor(qty);
}

export function lineTotal(item: CartItem): number | null {
  if (item.unitPrice === null) return null;
  return item.unitPrice * item.qty;
}

export interface CompanyGroup {
  companyId: number;
  companyName: string | undefined;
  items: CartItem[];
}

export function groupByCompany(items: CartItem[]): CompanyGroup[] {
  const map = new Map<number, CompanyGroup>();
  for (const item of items) {
    const group = map.get(item.companyId);
    if (group) {
      group.items.push(item);
    } else {
      map.set(item.companyId, {
        companyId: item.companyId,
        companyName: item.companyName,
        items: [item],
      });
    }
  }
  return Array.from(map.values());
}

export interface CurrencyTotal {
  currency: CartItem["currency"];
  amount: number;
}

/**
 * Cart can mix currencies (UZS / USD / RUB / EUR). We never invent an FX
 * rate — present each currency on its own line. Items with null price
 * (NEGOTIABLE) contribute nothing to the rolled-up total but still ship.
 */
export function totalsByCurrency(items: CartItem[]): CurrencyTotal[] {
  const map = new Map<CartItem["currency"], number>();
  for (const item of items) {
    if (item.unitPrice === null) continue;
    map.set(item.currency, (map.get(item.currency) ?? 0) + item.unitPrice * item.qty);
  }
  return Array.from(map.entries()).map(([currency, amount]) => ({ currency, amount }));
}

export function itemCount(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.qty, 0);
}
