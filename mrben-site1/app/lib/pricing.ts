export const BASE_HOURLY_RATE = 115; // $115 per hour
export const RATE_PER_MINUTE = BASE_HOURLY_RATE / 60;

export const PRICING_DATA = {
  pane_1st_base: {
    label: "pane_1st_base_label",
    minutes_ext: 1.5, // Time per pane (exterior)
    minutes_int: 1.65, // Time per pane (interior)
    desc: "pane_1st_base_desc"
  },
  pane_2nd_story: {
    label: "pane_2nd_story_label",
    minutes_ext: 1.7,
    minutes_int: 1.65,
    desc: "pane_2nd_story_desc"
  },
  pane_3rd_story: {
    label: "pane_3rd_story_label",
    minutes_ext: 1.9,
    minutes_int: 1.65,
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
