export { ChatAvatar } from "./components/ChatAvatar";
export { ChatThreadView } from "./components/ChatThreadView";
export { MessageBubble } from "./components/MessageBubble";
export { MessageComposer } from "./components/MessageComposer";
export { MessageList } from "./components/MessageList";
export { MessagePaneHeader } from "./components/MessagePaneHeader";
export { StartChatButton } from "./components/StartChatButton";
export { ThreadEmpty } from "./components/ThreadEmpty";
export { ThreadList } from "./components/ThreadList";
export { ThreadListItem } from "./components/ThreadListItem";
export { TypingDots } from "./components/TypingDots";
export {
  createThread,
  fetchMessages,
  fetchThreads,
  fetchUnreadCount,
  fetchWsToken,
  hideThread,
  uploadAttachment,
  useCreateThread,
  useHideThread,
  useMessages,
  useThreads,
  useUnreadCount,
} from "./api/chat.client";
// `./api/chat.server` is server-only and must be imported directly from RSC
// routes (importing it through this barrel would drag `server-only` into the
// client bundle and break the build).
export { chatKeys } from "./api/queryKeys";
export {
  applyServerEvent,
  initialThreadState,
  isAnyoneTyping,
  pruneTyping,
  reconnectDelayMs,
  upsertMessages,
} from "./hooks/socketReducer";
export type { ChatThreadState, OptimisticMessage } from "./hooks/socketReducer";
export {
  RATE_LIMIT,
  RATE_WINDOW_MS,
  ackInflight,
  canSendNow,
  dequeueIfReady,
  dropMessage,
  enqueue,
  failInflight,
  initialSendQueue,
  nextSlotAt,
} from "./hooks/sendQueue";
export type { QueuedMessage, SendQueueState } from "./hooks/sendQueue";
export { useChatSocket } from "./hooks/useChatSocket";
