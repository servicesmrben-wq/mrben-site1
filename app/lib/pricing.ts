export const PRICING_DATA = {
  standard_pane: { 
    label: "Window Pane", 
    price: 3.00, 
    desc: "Single distinct piece of glass" 
  },
  patio_door_2panel: {
    label: "Sliding Patio Door",
    price: 12.00,
    desc: "Standard 2-panel sliding door assembly"
  },
  screen_cleaning: {
    label: "Screen Cleaning",
    price: 3.00,
    desc: "Per screen"
  }
};

export type PricingKey = keyof typeof PRICING_DATA;
