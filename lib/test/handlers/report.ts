import { http, HttpResponse } from "msw";

const PROXY = "http://localhost:3000/api/proxy/api/v1/reports";

interface ReportPayload {
  targetType: "PRODUCT" | "COMPANY" | "CHAT";
  targetId: number;
  reasonCode: "SAME" | "FAKE" | "OFFENSIVE" | "DUPLICATE" | "SCAM";
  comment?: string;
}

/**
 * Sentinel for the error path: targetId 999 returns 500 so component tests
 * can assert the correlation id surfaces in the UI.
 */
export const reportHandlers = [
  http.post(PROXY, async ({ request }) => {
    const body = (await request.json()) as ReportPayload;

    if (body.targetId === 999) {
      return HttpResponse.json(
        { success: false, message: "report.create.failed" },
        { status: 500, headers: { "x-request-id": "req-test-report-fail" } },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: { reportId: 12345, reportStatus: "NEW" },
      },
      { headers: { "x-request-id": "req-test-report-ok" } },
    );
  }),
];
