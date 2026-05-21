import { authHandlers } from "./auth";
import { bannerHandlers } from "./banner";
import { catalogHandlers } from "./catalog";
import { categoryHandlers } from "./category";
import { chatHandlers } from "./chat";
import { companyHandlers } from "./company";
import { favoritesHandlers } from "./favorites";
import { leadHandlers } from "./lead";
import { notificationHandlers } from "./notification";
import { productHandlers } from "./product";
import { reportHandlers } from "./report";
import { sellerHandlers } from "./seller";
import { userHandlers } from "./user";

export const handlers = [
  ...authHandlers,
  ...bannerHandlers,
  ...categoryHandlers,
  ...catalogHandlers,
  // seller handlers must register before company handlers so the
  // `/api/v1/companies` listing wins over the legacy `:slug` matcher
  // for the bare path.
  ...sellerHandlers,
  // company handlers go before product so they win on `/api/v1/companies/:slug`.
  ...companyHandlers,
  ...productHandlers,
  ...favoritesHandlers,
  ...leadHandlers,
  ...chatHandlers,
  ...notificationHandlers,
  ...reportHandlers,
  ...userHandlers,
];

export { resetUserHandlers, setUserHandlerState } from "./user";
