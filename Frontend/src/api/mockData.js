// Comprehensive Mock Data for Map-First UI

// Individual Pothole markers for detailed inspection (kept as secondary info)
export const MOCK_POTHOLES = [
  { type: "Feature", geometry: { type: "Point", coordinates: [77.594697, 12.971848] }, properties: { id: 1, road_name: "Vittal Mallya Road", confidence: 0.88, severity: "HIGH", verified_count: 4, detected_at: "2026-08-22T06:10:00Z", status: "Reported" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.597964, 12.973816] }, properties: { id: 3, road_name: "MG Road area", confidence: 0.95, severity: "HIGH", verified_count: 12, detected_at: "2026-08-21T14:30:00Z", status: "Under Repair" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.590834, 12.969129] }, properties: { id: 5, road_name: "Richmond Road area", confidence: 0.76, severity: "MEDIUM", verified_count: 2, detected_at: "2026-08-22T08:15:00Z", status: "Detected" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.602447, 12.969455] }, properties: { id: 8, road_name: "Residency Road", confidence: 0.91, severity: "HIGH", verified_count: 7, detected_at: "2026-08-20T11:00:00Z", status: "Verified" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.614991, 12.955908] }, properties: { id: 11, road_name: "Inner Ring Road area", confidence: 0.97, severity: "HIGH", verified_count: 22, detected_at: "2026-08-10T08:00:00Z", status: "Under Repair" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.609729, 12.958036] }, properties: { id: 20, road_name: "Hosur Road area", confidence: 0.93, severity: "HIGH", verified_count: 11, detected_at: "2026-08-15T06:30:00Z", status: "Reported" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.597013, 12.962132] }, properties: { id: 23, road_name: "Langford Road", confidence: 0.96, severity: "HIGH", verified_count: 16, detected_at: "2026-08-09T09:00:00Z", status: "Resolved" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.578137, 12.987919] }, properties: { id: 25, road_name: "Sankey Road area", confidence: 0.69, severity: "LOW", verified_count: 1, detected_at: "2026-08-22T11:00:00Z", status: "Detected" } }
];

// 500m nearby road segments for initial state (State A)
export const MOCK_ROAD_SEGMENTS = [
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5910, 12.9725], [77.5946, 12.9716], [77.5980, 12.9708]] },
    properties: { id: "seg1", name: "Kasturba Road", potholeCount: 2, severePotholeCount: 1, conditionLevel: "POOR" }
  },
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5946, 12.9716], [77.5950, 12.9760], [77.5960, 12.9790]] },
    properties: { id: "seg2", name: "Cubbon Road", potholeCount: 0, severePotholeCount: 0, conditionLevel: "GOOD" }
  },
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5960, 12.9740], [77.6010, 12.9745], [77.6070, 12.9750]] },
    properties: { id: "seg3", name: "MG Road", potholeCount: 5, severePotholeCount: 2, conditionLevel: "HIGH_RISK" }
  },
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5890, 12.9680], [77.5930, 12.9695], [77.5970, 12.9705]] },
    properties: { id: "seg4", name: "Richmond Road", potholeCount: 1, severePotholeCount: 0, conditionLevel: "MODERATE" }
  },
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5970, 12.9690], [77.6020, 12.9700], [77.6060, 12.9710]] },
    properties: { id: "seg5", name: "Residency Road", potholeCount: 3, severePotholeCount: 1, conditionLevel: "POOR" }
  },
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5920, 12.9670], [77.5950, 12.9680], [77.5980, 12.9690]] },
    properties: { id: "seg6", name: "Lavelle Road", potholeCount: 0, severePotholeCount: 0, conditionLevel: "GOOD" }
  },
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5946, 12.9716], [77.5910, 12.9660], [77.5880, 12.9630]] },
    properties: { id: "seg7", name: "Vittal Mallya Road", potholeCount: 1, severePotholeCount: 0, conditionLevel: "MODERATE" }
  }
];

// Destinations for search
export const MOCK_DESTINATIONS = [
  { id: "dest1", name: "Koramangala", coordinates: [77.6180, 12.9350] },
  { id: "dest2", name: "Indiranagar", coordinates: [77.6380, 12.9780] },
  { id: "dest3", name: "Cubbon Park", coordinates: [77.5930, 12.9750] },
  { id: "dest4", name: "Whitefield", coordinates: [77.7490, 12.9690] },
  { id: "dest5", name: "HSR Layout", coordinates: [77.6410, 12.9120] },
  { id: "dest6", name: "Electronic City", coordinates: [77.6720, 12.8450] },
  { id: "dest7", name: "Jayanagar", coordinates: [77.5830, 12.9250] },
  { id: "dest8", name: "Mysuru", coordinates: [76.6499, 12.2958] },
  { id: "dest9", name: "Kushalanagara", coordinates: [75.9583, 12.4578] },
  { id: "dest10", name: "Madikeri", coordinates: [75.7402, 12.4244] },
  { id: "dest11", name: "Periyapatna", coordinates: [76.1017, 12.3392] },
  { id: "dest12", name: "Hunsur", coordinates: [76.2917, 12.3083] },
  { id: "dest13", name: "Gundlupet", coordinates: [76.6896, 11.8080] },
  { id: "dest14", name: "Gudalur", coordinates: [76.4950, 11.5039] },
  { id: "dest15", name: "Udhagamandalam", coordinates: [76.6932, 11.4102] },
  { id: "dest16", name: "Mandya", coordinates: [76.8951, 12.5218] }
];

// Known locations for autocomplete and reports
export const KNOWN_LOCATIONS = [
  "Koramangala", "Indiranagar", "Whitefield", "MG Road", "Jayanagar",
  "Cubbon Park", "Bannerghatta Road", "Hosur Road", "Outer Ring Road",
  "Richmond Road", "Kasturba Road", "Residency Road", "Brigade Road",
  "Lavelle Road", "Sankey Road", "Electronic City", "HSR Layout",
  "BTM Layout", "Marathahalli", "Hebbal", "Mysuru",
  "Kushalanagara", "Madikeri", "Periyapatna", "Hunsur",
  "Gundlupet", "Gudalur", "Udhagamandalam", "Mandya"
];

// Routes for when destination is selected (State B)
export const MOCK_ROUTES = {
  // Routes to Koramangala
  "dest1": [
    {
      id: "route1",
      name: "Via Hosur Road",
      distance_km: 6.2,
      time_min: 18,
      condition_score: 45,
      risk_level: "HIGH",
      segments: [
        { conditionLevel: "GOOD", coordinates: [[77.5946, 12.9716], [77.5960, 12.9650]] },
        { conditionLevel: "HIGH_RISK", coordinates: [[77.5960, 12.9650], [77.6050, 12.9450]] },
        { conditionLevel: "MODERATE", coordinates: [[77.6050, 12.9450], [77.6180, 12.9350]] }
      ]
    },
    {
      id: "route2",
      name: "Via Inner Ring Road",
      distance_km: 7.1,
      time_min: 22,
      condition_score: 82,
      risk_level: "LOW",
      segments: [
        { conditionLevel: "GOOD", coordinates: [[77.5946, 12.9716], [77.6100, 12.9700]] },
        { conditionLevel: "GOOD", coordinates: [[77.6100, 12.9700], [77.6150, 12.9550]] },
        { conditionLevel: "MODERATE", coordinates: [[77.6150, 12.9550], [77.6180, 12.9350]] }
      ]
    }
  ],
  // Routes to Indiranagar
  "dest2": [
    {
      id: "route3",
      name: "Via MG Road",
      distance_km: 5.5,
      time_min: 15,
      condition_score: 30,
      risk_level: "CRITICAL",
      segments: [
        { conditionLevel: "POOR", coordinates: [[77.5946, 12.9716], [77.6000, 12.9730]] },
        { conditionLevel: "HIGH_RISK", coordinates: [[77.6000, 12.9730], [77.6200, 12.9750]] },
        { conditionLevel: "MODERATE", coordinates: [[77.6200, 12.9750], [77.6380, 12.9780]] }
      ]
    },
    {
      id: "route4",
      name: "Via Old Madras Road",
      distance_km: 6.8,
      time_min: 20,
      condition_score: 75,
      risk_level: "MODERATE",
      segments: [
        { conditionLevel: "GOOD", coordinates: [[77.5946, 12.9716], [77.6050, 12.9850]] },
        { conditionLevel: "MODERATE", coordinates: [[77.6050, 12.9850], [77.6250, 12.9820]] },
        { conditionLevel: "GOOD", coordinates: [[77.6250, 12.9820], [77.6380, 12.9780]] }
      ]
    }
  ],
  // Routes to Cubbon Park
  "dest3": [
    {
      id: "route5",
      name: "Via Kasturba Road",
      distance_km: 1.2,
      time_min: 5,
      condition_score: 88,
      risk_level: "LOW",
      segments: [
        { conditionLevel: "GOOD", coordinates: [[77.5946, 12.9716], [77.5930, 12.9750]] }
      ]
    }
  ],
  // Routes to Whitefield
  "dest4": [
    {
      id: "route6",
      name: "Via HAL Old Airport Road",
      distance_km: 16.5,
      time_min: 45,
      condition_score: 65,
      risk_level: "MODERATE",
      segments: [
        { conditionLevel: "GOOD", coordinates: [[77.5946, 12.9716], [77.6350, 12.9600]] },
        { conditionLevel: "MODERATE", coordinates: [[77.6350, 12.9600], [77.6950, 12.9550]] },
        { conditionLevel: "POOR", coordinates: [[77.6950, 12.9550], [77.7490, 12.9690]] }
      ]
    },
    {
      id: "route7",
      name: "Via Outer Ring Road",
      distance_km: 19.0,
      time_min: 52,
      condition_score: 35,
      risk_level: "CRITICAL",
      segments: [
        { conditionLevel: "GOOD", coordinates: [[77.5946, 12.9716], [77.6200, 12.9800]] },
        { conditionLevel: "HIGH_RISK", coordinates: [[77.6200, 12.9800], [77.6800, 12.9900]] },
        { conditionLevel: "HIGH_RISK", coordinates: [[77.6800, 12.9900], [77.7490, 12.9690]] }
      ]
    }
  ],
  // Routes to HSR Layout
  "dest5": [
    {
      id: "route8",
      name: "Via Hosur Road & Silk Board",
      distance_km: 9.8,
      time_min: 26,
      condition_score: 50,
      risk_level: "HIGH",
      segments: [
        { conditionLevel: "GOOD", coordinates: [[77.5946, 12.9716], [77.6050, 12.9500]] },
        { conditionLevel: "HIGH_RISK", coordinates: [[77.6050, 12.9500], [77.6250, 12.9200]] },
        { conditionLevel: "MODERATE", coordinates: [[77.6250, 12.9200], [77.6410, 12.9120]] }
      ]
    },
    {
      id: "route9",
      name: "Via Intermediate Ring Road",
      distance_km: 11.2,
      time_min: 30,
      condition_score: 78,
      risk_level: "LOW",
      segments: [
        { conditionLevel: "GOOD", coordinates: [[77.5946, 12.9716], [77.6200, 12.9650]] },
        { conditionLevel: "GOOD", coordinates: [[77.6200, 12.9650], [77.6350, 12.9300]] },
        { conditionLevel: "MODERATE", coordinates: [[77.6350, 12.9300], [77.6410, 12.9120]] }
      ]
    }
  ],
  // Routes to Mysuru
  "dest8": [
    {
      id: "route10",
      name: "Via Bengaluru - Mysuru Expressway",
      distance_km: 145.2,
      time_min: 120,
      condition_score: 95,
      risk_level: "LOW",
      segments: [
        { 
          conditionLevel: "HIGH_RISK", 
          coordinates: [[77.5946, 12.9716], [77.5100, 12.8700], [77.4000, 12.7500], [76.9000, 12.5000], [76.6499, 12.2958]],
          potholes: [[77.5100, 12.8700], [77.4000, 12.7500], [76.9000, 12.5000]]
        }
      ]
    }
  ],
  "dest9": [
    {
      id: "route_kush", name: "Route to Kushalanagara", distance_km: 235.4, time_min: 240, condition_score: 75, risk_level: "MODERATE",
      segments: [{ conditionLevel: "POOR", coordinates: [[77.5946, 12.9716], [76.6499, 12.2958], [75.9583, 12.4578]], potholes: [[76.6499, 12.2958]] }]
    }
  ],
  "dest10": [
    {
      id: "route_madikeri", name: "Route to Madikeri", distance_km: 265.1, time_min: 275, condition_score: 65, risk_level: "HIGH",
      segments: [{ conditionLevel: "HIGH_RISK", coordinates: [[77.5946, 12.9716], [76.6499, 12.2958], [75.9583, 12.4578], [75.7402, 12.4244]], potholes: [[75.9583, 12.4578], [75.8, 12.44]] }]
    }
  ],
  "dest11": [
    {
      id: "route_periya", name: "Route to Periyapatna", distance_km: 210.3, time_min: 210, condition_score: 82, risk_level: "LOW",
      segments: [{ conditionLevel: "GOOD", coordinates: [[77.5946, 12.9716], [76.6499, 12.2958], [76.1017, 12.3392]] }]
    }
  ],
  "dest12": [
    {
      id: "route_hunsur", name: "Route to Hunsur", distance_km: 190.5, time_min: 195, condition_score: 88, risk_level: "LOW",
      segments: [{ conditionLevel: "MODERATE", coordinates: [[77.5946, 12.9716], [76.6499, 12.2958], [76.2917, 12.3083]], potholes: [[76.4, 12.3]] }]
    }
  ],
  "dest13": [
    {
      id: "route_gundlupet", name: "Route to Gundlupet", distance_km: 205.8, time_min: 215, condition_score: 72, risk_level: "MODERATE",
      segments: [{ conditionLevel: "POOR", coordinates: [[77.5946, 12.9716], [76.6499, 12.2958], [76.6896, 11.8080]], potholes: [[76.66, 12.0]] }]
    }
  ],
  "dest14": [
    {
      id: "route_gudalur", name: "Route to Gudalur", distance_km: 255.4, time_min: 280, condition_score: 60, risk_level: "HIGH",
      segments: [{ conditionLevel: "HIGH_RISK", coordinates: [[77.5946, 12.9716], [76.6499, 12.2958], [76.6896, 11.8080], [76.4950, 11.5039]], potholes: [[76.6, 11.6]] }]
    }
  ],
  "dest15": [
    {
      id: "route_ooty", name: "Route to Udhagamandalam", distance_km: 285.2, time_min: 320, condition_score: 55, risk_level: "HIGH",
      segments: [{ conditionLevel: "HIGH_RISK", coordinates: [[77.5946, 12.9716], [76.6499, 12.2958], [76.6896, 11.8080], [76.4950, 11.5039], [76.6932, 11.4102]], potholes: [[76.6, 11.45]] }]
    }
  ],
  "dest16": [
    {
      id: "route_mandya", name: "Route to Mandya", distance_km: 98.5, time_min: 105, condition_score: 92, risk_level: "LOW",
      segments: [{ conditionLevel: "GOOD", coordinates: [[77.5946, 12.9716], [77.4000, 12.7500], [76.8951, 12.5218]] }]
    }
  ]
};
