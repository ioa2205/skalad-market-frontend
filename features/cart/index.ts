export { useCartStore, MAX_CART_QTY, CART_STORE_VERSION } from "./store";
export { useCartItems, useCartItemCount } from "./hooks/useCartItems";
export { CartItem, CartStateV1 } from "./schemas";
export type { CartItem as CartItemType } from "./schemas";

export { AddToCartButton, type AddToCartButtonProps } from "./components/AddToCartButton";
export { CartLineItem, type CartLineItemProps } from "./components/CartLineItem";
export { CartSummary, type CartSummaryProps } from "./components/CartSummary";
export { CartView, type CartViewProps } from "./components/CartView";
export { ContactConfirmDialog } from "./components/ContactConfirmDialog";

export {
  submitCart,
  type SubmitCartInput,
  type CartContactInfo,
  type CompanySubmissionResult,
} from "./api/cart.client";
export { cartKeys } from "./api/queryKeys";

export {
  groupByCompany,
  totalsByCurrency,
  lineTotal,
  itemCount,
  clampQty,
  type CompanyGroup,
  type CurrencyTotal,
} from "./selectors";
