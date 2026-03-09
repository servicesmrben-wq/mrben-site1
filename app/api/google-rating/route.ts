const FALLBACK_RESPONSE = {
  rating: 5.0,
  count: null,
  reviews: [],
  source: "fallback" as const,
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GOOGLE_FIELDS = "rating,user_ratings_total,reviews";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location");

  const key = process.env.GOOGLE_PLACES_API_KEY;
  // Use Lévis ID if requested, otherwise fallback to the main ID
  const placeId = location === "levis" 
    ? process.env.GOOGLE_PLACE_ID_LEVIS 
    : process.env.GOOGLE_PLACE_ID;

  if (!key || !placeId) {
    return Response.json({
      ...FALLBACK_RESPONSE,
    });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", GOOGLE_FIELDS);
  url.searchParams.set("key", key);
  url.searchParams.set("language", "fr"); // Prefer French reviews/dates if available

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      return Response.json({
        ...FALLBACK_RESPONSE,
      });
    }

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      return Response.json({
        ...FALLBACK_RESPONSE,
      });
    }
    
    const result = data?.result;
    const rating = result?.rating;
    const totalRatings = result?.user_ratings_total;
    // Get top 5 reviews, ensuring they have text
    const reviews = (result?.reviews || [])
      .filter((r: any) => r.text && r.text.length > 10)
      .slice(0, 3)
      .map((r: any) => ({
        author_name: r.author_name,
        profile_photo_url: r.profile_photo_url,
        rating: r.rating,
        relative_time_description: r.relative_time_description,
        text: r.text,
      }));

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
      reviews,
      source: "google" as const,
    });
  } catch {
    return Response.json({
      ...FALLBACK_RESPONSE,
    });
  }
}
