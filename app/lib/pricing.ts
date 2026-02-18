export const PRICING_DATA = {
  std_hung: { 
    label: "Standard Hung (Vertical)", 
    price_ext: 5.00, 
    price_in_out: 9.00,
    desc: "Common vertical sliding windows" 
  },
  window_slider_standard: {
    label: "Standard Slider",
    price_ext: 5.00,
    price_in_out: 10.00,
    desc: "Horizontal sliding sash window"
  },
  slider_double_set: {
    label: "Double Slider Set (Storms)",
    price_ext: 10.00,
    price_in_out: 20.00,
    desc: "Two full sets of sliding windows (inner + outer) for insulation."
  },
  std_fixed: { 
    label: "Casement / Fixed", 
    price_ext: 4.50, 
    price_in_out: 8.00,
    desc: "Crank-out or non-opening" 
  },
  alum_double_slider: { 
    label: "Vintage Double-Slider", 
    price_ext: 10.00, 
    price_in_out: 18.00,
    desc: "Old aluminum style with 2 sets of glass/tracks" 
  },
  patio_door_2panel: {
    label: "Sliding Patio Door (2 Panel)",
    price_ext: 12.00,
    price_in_out: 22.00,
    desc: "Standard sliding glass door with tracks"
  },
  entry_door_glass: {
    label: "Entry Door (Glass Insert)",
    price_ext: 6.00,
    price_in_out: 10.00,
    desc: "Glass pane inside a front or side door"
  },
  small_french: { 
    label: "Small French Pane", 
    price_ext: 1.50, 
    price_in_out: 2.50,
    desc: "Price per small square" 
  },
  large_picture: { 
    label: "Large Picture Window", 
    price_ext: 8.00, 
    price_in_out: 14.00,
    desc: "Large floor-to-ceiling glass" 
  },
  arch_special: { 
    label: "Architectural / Round", 
    price_ext: 10.00, 
    price_in_out: 16.00,
    desc: "Custom shapes" 
  }
};

export type PricingKey = keyof typeof PRICING_DATA;
