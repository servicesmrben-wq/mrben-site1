const FALLBACK_RESPONSE = {
  rating: 5.0,
  count: null,
  source: "fallback" as const,
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GOOGLE_FIELDS = "rating,user_ratings_total";

const truncate = (value: string, maxLength = 200) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;

export async function GET(request: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  const debugEnabled = new URL(request.url).searchParams.get("debug") === "1";
  const debugInfo = debugEnabled
    ? {
        hasKey: Boolean(key),
        hasPlaceId: Boolean(placeId),
        placeIdPrefix: placeId ? placeId.slice(0, 6) : null,
        httpStatus: null as number | null,
        googleError: null as string | null,
      }
    : null;

  if (!key || !placeId) {
    return Response.json({
      ...FALLBACK_RESPONSE,
      ...(debugInfo ? { debug: debugInfo } : {}),
    });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", GOOGLE_FIELDS);
  url.searchParams.set("key", key);

  try {
    const response = await fetch(url.toString(), {
      cache: "no-store", // Re-add revalidate when debugging is complete.
    });

    if (!response.ok) {
      const bodyText = await response.text();
      const bodySnippet = truncate(bodyText);
      console.error("google-rating error", {
        status: response.status,
        bodySnippet,
      });
      if (debugInfo) {
        debugInfo.httpStatus = response.status;
        debugInfo.googleError = bodySnippet || response.statusText || null;
      }
      return Response.json({
        ...FALLBACK_RESPONSE,
        ...(debugInfo ? { debug: debugInfo } : {}),
      });
    }

    let data: {
      result?: { rating?: number; user_ratings_total?: number };
    } | null = null;
    try {
      data = (await response.json()) as {
        result?: { rating?: number; user_ratings_total?: number };
      };
    } catch (error) {
      const bodySnippet = truncate(String(error));
      console.error("google-rating error", {
        status: response.status,
        bodySnippet,
      });
      if (debugInfo) {
        debugInfo.httpStatus = response.status;
        debugInfo.googleError = bodySnippet;
      }
      return Response.json({
        ...FALLBACK_RESPONSE,
        ...(debugInfo ? { debug: debugInfo } : {}),
      });
    }
    const rating = data?.result?.rating;
    const totalRatings = data?.result?.user_ratings_total;

    if (typeof rating !== "number" || !Number.isFinite(rating)) {
      return Response.json({
        ...FALLBACK_RESPONSE,
        ...(debugInfo ? { debug: debugInfo } : {}),
      });
    }

    const count =
      typeof totalRatings === "number" && Number.isFinite(totalRatings)
        ? totalRatings
        : null;

    return Response.json({
      rating,
      count,
      source: "google" as const,
      ...(debugInfo ? { debug: debugInfo } : {}),
    });
  } catch {
    return Response.json({
      ...FALLBACK_RESPONSE,
      ...(debugInfo ? { debug: debugInfo } : {}),
    });
  }
}
