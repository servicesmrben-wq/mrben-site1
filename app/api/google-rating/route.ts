const FALLBACK_RESPONSE = {
  rating: 5.0,
  count: null,
  source: "fallback" as const,
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GOOGLE_FIELDS = "rating,user_ratings_total";

export async function GET(request: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!key || !placeId) {
    return Response.json({
      ...FALLBACK_RESPONSE,
    });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", GOOGLE_FIELDS);
  url.searchParams.set("key", key);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 43200 },
    });

    if (!response.ok) {
      return Response.json({
        ...FALLBACK_RESPONSE,
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
      return Response.json({
        ...FALLBACK_RESPONSE,
      });
    }
    const rating = data?.result?.rating;
    const totalRatings = data?.result?.user_ratings_total;

    if (typeof rating !== "number" || !Number.isFinite(rating)) {
      return Response.json({
        ...FALLBACK_RESPONSE,
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
    });
  } catch {
    return Response.json({
      ...FALLBACK_RESPONSE,
    });
  }
}
