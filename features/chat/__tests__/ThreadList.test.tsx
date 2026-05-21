import { describe, expect, it } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";
import type { ChatThreadResponse } from "@/lib/api/schemas/chat";

import { ThreadList } from "../components/ThreadList";

const seedThreads: ChatThreadResponse[] = [
  {
    thread_id: 101,
    other_party: {
      id: 7,
      type: "SELLER",
      display_name: "Алтын Цемент",
    },
    last_message: {
      id: 1003,
      body: "Минимальная партия для экспорта — 20 тонн.",
      sent_at: "2026-04-27T10:45:00",
      status: "DELIVERED",
    },
    unread_count: 3,
  },
  {
    thread_id: 102,
    other_party: {
      id: 8,
      type: "SELLER",
      display_name: "Стройсервис",
    },
    last_message: {
      id: 2002,
      body: "Готовы оформить",
      sent_at: "2026-04-27T10:10:00",
      status: "READ",
    },
    unread_count: 0,
  },
];

describe("ThreadList", () => {
  it("renders threads with unread count badge", () => {
    renderWithIntl(<ThreadList threads={seedThreads} />);
    const altyn = screen.getAllByText("Алтын Цемент");
    expect(altyn.length).toBeGreaterThan(0);
    // Unread count
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("filters by display name when the search input has a value", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    renderWithIntl(<ThreadList threads={seedThreads} />);

    await user.type(screen.getByLabelText("Поиск сообщений"), "Алт");
    expect(screen.getByText("Алтын Цемент")).toBeInTheDocument();
    expect(screen.queryByText("Стройсервис")).toBeNull();
  });

  it("renders the empty state when threads is an empty list", () => {
    renderWithIntl(<ThreadList threads={[]} />);
    expect(screen.getByText("Сообщений пока нет")).toBeInTheDocument();
  });

  it("renders the error state with correlation id", () => {
    renderWithIntl(
      <ThreadList
        threads={[]}
        isError
        errorCorrelationId="req-test-fail"
      />,
    );
    expect(screen.getByText("Не удалось загрузить сообщения")).toBeInTheDocument();
    expect(screen.getByText(/req-test-fail/)).toBeInTheDocument();
  });
});
