export interface ChatThreadsParams {
  page: number;
  perPage: number;
}

export interface ChatMessagesParams {
  threadId: number;
  page: number;
  perPage: number;
  beforeId?: number;
}

export const chatKeys = {
  all: ["chat"] as const,
  threads: (params: ChatThreadsParams) =>
    [...chatKeys.all, "threads", params] as const,
  thread: (threadId: number) => [...chatKeys.all, "thread", threadId] as const,
  messages: (params: ChatMessagesParams) =>
    [...chatKeys.all, "thread", params.threadId, "messages", params] as const,
  unread: () => [...chatKeys.all, "unread"] as const,
  wsToken: () => [...chatKeys.all, "ws-token"] as const,
};
