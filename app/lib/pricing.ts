export const PRICING_DATA = {
  std_hung: { 
    label: "Standard Hung (Vertical)", 
    price: 5.00, 
    desc: "Common vertical sliding windows" 
  },
  window_slider_standard: {
    label: "Standard Slider",
    price: 5.00,
    desc: "Horizontal sliding sash window"
  },
  slider_double_set: {
    label: "Double Slider Set (Storms)",
    price: 10.00,
    desc: "Two full sets of sliding windows (inner + outer) for insulation."
  },
  std_fixed: { 
    label: "Casement / Fixed", 
    price: 4.50, 
    desc: "Crank-out or non-opening" 
  },
  alum_double_slider: { 
    label: "Vintage Double-Slider", 
    price: 10.00, 
    desc: "Old aluminum style with 2 sets of glass/tracks" 
  },
  patio_door_2panel: {
    label: "Sliding Patio Door (2 Panel)",
    price: 12.00,
    desc: "Standard sliding glass door with tracks"
  },
  entry_door_glass: {
    label: "Entry Door (Glass Insert)",
    price: 6.00,
    desc: "Glass pane inside a front or side door"
  },
  small_french: { 
    label: "Small French Pane", 
    price: 1.50, 
    desc: "Price per small square" 
  },
  large_picture: { 
    label: "Large Picture Window", 
    price: 8.00, 
    desc: "Large floor-to-ceiling glass" 
  },
  arch_special: { 
    label: "Architectural / Round", 
    price: 10.00, 
    desc: "Custom shapes" 
  }
};

export type PricingKey = keyof typeof PRICING_DATA;
