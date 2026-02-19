export const PRICING_DATA = {
  std_hung: { 
    label: "Standard Hung (Vertical)", 
    price: 6.00, 
    desc: "Per Pane (Top/Bottom)" 
  },
  window_slider_standard: {
    label: "Standard Slider",
    price: 6.00,
    desc: "Per Pane (Left/Right)" 
  },
  slider_double_set: {
    label: "Double Slider Set (Storms)",
    price: 6.00,
    desc: "Per Pane (Inner/Outer)" 
  },
  std_fixed: { 
    label: "Casement / Fixed", 
    price: 6.00, 
    desc: "Per Pane" 
  },
  alum_double_slider: { 
    label: "Vintage Double-Slider", 
    price: 6.00, 
    desc: "Per Pane" 
  },
  patio_door_2panel: {
    label: "Sliding Patio Door",
    price: 6.00,
    desc: "Per Door Panel" 
  },
  entry_door_glass: {
    label: "Entry Door (Glass Insert)",
    price: 6.00,
    desc: "Per Pane" 
  },
  small_french: { 
    label: "Small French Pane", 
    price: 0.66, 
    desc: "Per Small Square" 
  },
  large_picture: { 
    label: "Large Picture Window", 
    price: 10.00, 
    desc: "Per Large Pane" 
  },
  arch_special: { 
    label: "Architectural / Round", 
    price: 6.00, 
    desc: "Per Pane" 
  }
};

export type PricingKey = keyof typeof PRICING_DATA;
