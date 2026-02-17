"use client";

import { useState, useEffect } from "react";

export type GoogleReview = {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
};

export type GoogleBusinessProfile = {
  rating: number;
  count: number | null;
  reviews: GoogleReview[];
  isLoading: boolean;
};

export function useGoogleBusinessProfile() {
  const [data, setData] = useState<GoogleBusinessProfile>({
    rating: 5.0, // Default fallback
    count: null,
    reviews: [],
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    fetch("/api/google-rating")
      .then((res) => res.json())
      .then((apiData) => {
        if (!isMounted) return;
        
        setData({
          rating: typeof apiData.rating === 'number' ? apiData.rating : 5.0,
          count: typeof apiData.count === 'number' ? apiData.count : null,
          reviews: Array.isArray(apiData.reviews) ? apiData.reviews : [],
          isLoading: false,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch Google Business Profile:", err);
        if (isMounted) {
          setData((prev) => ({ ...prev, isLoading: false }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return data;
}
