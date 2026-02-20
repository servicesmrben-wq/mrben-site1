export const PRICING_DATA = {
  window_slider: {
    label: "Standard Slider",
    price: 10.00,  // 2 panes * $5
    desc: "2-panel horizontal sliding window"
  },
  window_casement: {
    label: "Casement / Picture",
    price: 5.00,  // 1 pane * $5
    desc: "Single crank-out or fixed pane"
  },
  entry_door_glass: {
    label: "Entry Door Glass",
    price: 5.00, // 1 pane * $5
    desc: "Glass insert in exterior door"
  },
  patio_door_panel: {
    label: "Patio Door Panel",
    price: 5.00, // Per panel
    desc: "Large glass panel (sliding or fixed) in a patio door assembly"
  }
};

export type PricingKey = keyof typeof PRICING_DATA;
