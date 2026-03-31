export const BASE_HOURLY_RATE = 115; // $115 per hour
export const RATE_PER_MINUTE = BASE_HOURLY_RATE / 60;

// Centralized 7.5% markup to replace the hardcoded safety buffer in your frontend
export const MARKUP_MULTIPLIER = 1.075; 

// The new 6-Tier AI Vibe Engine Multipliers
export const VIBE_MULTIPLIERS = {
  very_dense: 0.40,    // TRUE French doors, intense intricate transoms
  dense: 0.60,         // Multiple physical splits, garage door panes, mixed dense types
  normal_dense: 0.80,  // Standard double-hung (single split), half-grids
  normal: 1.0,         // Standard residential baseline (clear casements/sliders)
  normal_large: 1.25,  // Big sliding doors, large standard frames
  large_open: 2.50     // Massive architectural sheets (slowest per pane)
};

export type VibeKey = keyof typeof VIBE_MULTIPLIERS;

export const PRICING_DATA = {
  pane_1st_base: {
    label: "pane_1st_base_label",
    minutes_ext: 1.4, // Time per pane (exterior)
    minutes_int: 1.7, // Time per pane (interior)
    desc: "pane_1st_base_desc"
  },
  pane_2nd_story: {
    label: "pane_2nd_story_label",
    minutes_ext: 1.6,
    minutes_int: 1.7,
    desc: "pane_2nd_story_desc"
  },
  pane_3rd_story: {
    label: "pane_3rd_story_label",
    minutes_ext: 1.9,
    minutes_int: 1.7,
    desc: "pane_3rd_story_desc"
  },
  patio_door_pane: {
    label: "patio_door_pane_label",
    minutes_ext: 1.97,
    minutes_int: 2.5,
    desc: "patio_door_pane_desc"
  },
  entry_door_pane: {
    label: "entry_door_pane_label",
    minutes_ext: 2.5,
    minutes_int: 2.5,
    desc: "entry_door_pane_desc"
  }
};

export type PricingKey = keyof typeof PRICING_DATA;