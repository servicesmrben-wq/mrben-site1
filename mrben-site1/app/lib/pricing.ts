export const BASE_HOURLY_RATE = 115; // $115 per hour
export const RATE_PER_MINUTE = BASE_HOURLY_RATE / 60;

export const PRICING_DATA = {
  // --- 1ST STORY & BASEMENT ---
  standard_panel_1st_base: {
    label: "standard_panel_1st_base_label",
    minutes_ext: 1.5, 
    minutes_int: 1.65, 
    desc: "Solid pane of glass on 1st floor/basement"
  },
  divided_panel_1st_base: {
    label: "divided_panel_1st_base_label",
    minutes_ext: 1.8,  // 1.5 x 1.2 multiplier
    minutes_int: 2.48, // 1.65 x 1.5 multiplier
    desc: "Divided pane of glass on 1st floor/basement"
  },

  // --- 2ND STORY ---
  standard_panel_2nd_story: {
    label: "standard_panel_2nd_story_label",
    minutes_ext: 1.7,
    minutes_int: 1.65,
    desc: "Solid pane of glass on 2nd floor"
  },
  divided_panel_2nd_story: {
    label: "divided_panel_2nd_story_label",
    minutes_ext: 2.04, // 1.7 x 1.2 multiplier
    minutes_int: 2.48, // 1.65 x 1.5 multiplier
    desc: "Divided pane of glass on 2nd floor"
  },

  // --- 3RD STORY ---
  standard_panel_3rd_story: {
    label: "standard_panel_3rd_story_label",
    minutes_ext: 1.9,
    minutes_int: 1.65,
    desc: "Solid pane of glass on 3rd floor"
  },
  divided_panel_3rd_story: {
    label: "divided_panel_3rd_story_label",
    minutes_ext: 2.28, // 1.9 x 1.2 multiplier
    minutes_int: 2.48, // 1.65 x 1.5 multiplier
    desc: "Divided pane of glass on 3rd floor"
  },

  // --- DOORS ---
  patio_door_pane: {
    label: "patio_door_pane_label",
    minutes_ext: 1.97,
    minutes_int: 1.97,
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
