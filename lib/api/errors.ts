export interface ApiErrorInit {
  code: string;
  message: string;
  status: number;
  correlationId?: string | undefined;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly correlationId: string | undefined;

  constructor({ code, message, status, correlationId }: ApiErrorInit) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.correlationId = correlationId;
  }

  static from(value: unknown): ApiError {
    if (value instanceof ApiError) return value;
    const message = value instanceof Error ? value.message : "unknown.error";
    return new ApiError({ code: "unknown.error", message, status: 0 });
  }
}
