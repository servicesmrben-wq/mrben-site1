const BASE_HOURLY_RATE = 115; // $115 per hour
const RATE_PER_MINUTE = BASE_HOURLY_RATE / 60;

// Centralized 7.5% markup to replace the hardcoded safety buffer in your frontend
const MARKUP_MULTIPLIER = 1.075; 

// Multipliers for the V1 route
const VIBE_MULTIPLIERS = {
  very_dense: 0.40,
  dense: 0.60,
  normal_dense: 0.80,
  normal: 1.0,
  normal_large: 1.25,
  large_open: 2.50
};

const PRICING_DATA = {
  single_window: {
    label: "Single Window",
    minutes_ext: 1.5,
    minutes_int: 1.5,
    desc: "Single pane or standard casement"
  },
  double_window: {
    label: "Double Window",
    minutes_ext: 3.0,
    minutes_int: 3.0,
    desc: "Double hung or side-by-side slider"
  },
  large_complex_grouping: {
    label: "Large Complex Grouping",
    minutes_ext: 10.0,
    minutes_int: 10.0,
    desc: "Bay windows, large multi-pane sets"
  },
  architectural_cut_up: {
    label: "Architectural Cut-Up",
    minutes_ext: 20.0,
    minutes_int: 20.0,
    desc: "Intricate multi-pane architectural windows"
  },
  doors: {
    label: "Doors",
    minutes_ext: 5.0,
    minutes_int: 5.0,
    desc: "Patio sliders or entry doors"
  }
};

module.exports = {
  BASE_HOURLY_RATE,
  RATE_PER_MINUTE,
  MARKUP_MULTIPLIER,
  VIBE_MULTIPLIERS,
  PRICING_DATA
};
