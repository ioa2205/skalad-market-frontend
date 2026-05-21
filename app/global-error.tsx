"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const correlationId = error.digest;
  return (
    <html lang="ru">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-6 font-sans text-fg">
        <h1 className="text-h2 font-semibold" role="alert">
          {correlationId
            ? `Что-то пошло не так. Код обращения: ${correlationId}`
            : "Что-то пошло не так."}
        </h1>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-border bg-bg-elevated px-4 py-2 text-body-sm font-medium text-fg hover:bg-bg-muted"
        >
          Попробовать снова
        </button>
      </body>
    </html>
  );
}
