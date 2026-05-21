import { http, HttpResponse } from "msw";

import { TEST_GATEWAY } from "./auth";

export const bannerHandlers = [
  http.get(`${TEST_GATEWAY}/api/v1/banners/getAll`, ({ request }) => {
    const url = new URL(request.url);
    const placement = url.searchParams.get("placementCode");

    if (placement === "HOME_TOP") {
      return HttpResponse.json({
        success: true,
        data: [
          { id: 1, imageUrl: "https://stub.skladx.test/banners/home-top-1.jpg" },
          { id: 2, imageUrl: "https://stub.skladx.test/banners/home-top-2.jpg" },
        ],
      });
    }
    if (placement === "HOME_MIDDLE") {
      return HttpResponse.json({
        success: true,
        data: [
          { id: 10, imageUrl: "https://stub.skladx.test/banners/home-middle.jpg" },
        ],
      });
    }
    if (placement === "SIDEBAR") {
      return HttpResponse.json({
        success: true,
        data: [],
      });
    }
    return HttpResponse.json(
      { success: false, message: "placement.invalid" },
      { status: 400 },
    );
  }),
];
