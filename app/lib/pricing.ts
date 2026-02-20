export const PRICING_DATA = {
  pane_1st_base: {
    label: "1st Story / Basement Pane",
    price: 2.50,
    desc: "Ground-level and foundation windows"
  },
  pane_2nd_story: {
    label: "2nd Story Pane",
    price: 3.00,
    desc: "Windows requiring extended reach"
  },
  pane_3rd_story: {
    label: "3rd Story Pane",
    price: 4.00,
    desc: "High-reach upper floor windows"
  },
  patio_door_panel: {
    label: "Patio Door / Entry Glass",
    price: 5.00,
    desc: "Large glass doors or entry inserts"
  }
};

export type PricingKey = keyof typeof PRICING_DATA;
