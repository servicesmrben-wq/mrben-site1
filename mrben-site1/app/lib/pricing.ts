export const BASE_HOURLY_RATE = 115; // $115 per hour
export const RATE_PER_MINUTE = BASE_HOURLY_RATE / 60;

export const PRICING_DATA = {
  pane_1st_base: {
    label: "1st Story / Basement Pane",
    minutes: 1.57, // Time per pane (exterior)
    desc: "Ground-level and foundation windows"
  },
  pane_2nd_story: {
    label: "2nd Story Pane",
    minutes: 1.8,
    desc: "Windows requiring extended reach"
  },
  pane_3rd_story: {
    label: "3rd Story Pane",
    minutes: 2.10,
    desc: "High-reach upper floor windows"
  },
  patio_door_pane: {
    label: "Patio Door Section",
    minutes: 2.0,
    desc: "Large sliding glass sections"
  },
  entry_door_pane: {
    label: "Entry Door Pane",
    minutes: 1.5, // 3.0 min total for a 2-pane door
    desc: "Standard front/back door glass"
  }
};

export type PricingKey = keyof typeof PRICING_DATA;
