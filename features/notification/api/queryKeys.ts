export interface NotificationsListParams {
  isRead?: boolean;
  page: number;
  perPage: number;
}

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params: NotificationsListParams) =>
    [...notificationKeys.all, "list", params] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
};
