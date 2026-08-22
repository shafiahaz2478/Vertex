// Comprehensive Mock Data for Map-First UI with 3-Color Density & Lane Intelligence

/**
 * Pothole Density Standard:
 * - Level 1 (GOOD - Green #22c55e): < 2.0 potholes/km
 * - Level 2 (MODERATE - Yellow #eab308): 2.0 - 5.0 potholes/km
 * - Level 3 (HIGH RISK - Red #ef4444): > 5.0 potholes/km
 */

// Road hazards with approximate lane tracking
export const MOCK_POTHOLES = [
  { type: "Feature", geometry: { type: "Point", coordinates: [77.594697, 12.971848] }, properties: { id: 1, road_name: "Vittal Mallya Road", confidence: 0.88, severity: "HIGH", lane: "Left Lane", verified_count: 4, detected_at: "2026-08-22T06:10:00Z", status: "Reported" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.597964, 12.973816] }, properties: { id: 3, road_name: "MG Road area", confidence: 0.95, severity: "HIGH", lane: "Right Lane", verified_count: 12, detected_at: "2026-08-21T14:30:00Z", status: "Under Repair" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.590834, 12.969129] }, properties: { id: 5, road_name: "Richmond Road area", confidence: 0.76, severity: "MEDIUM", lane: "Center Lane", verified_count: 2, detected_at: "2026-08-22T08:15:00Z", status: "Detected" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.602447, 12.969455] }, properties: { id: 8, road_name: "Residency Road", confidence: 0.91, severity: "HIGH", lane: "Left Lane", verified_count: 7, detected_at: "2026-08-20T11:00:00Z", status: "Verified" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.614991, 12.955908] }, properties: { id: 11, road_name: "Inner Ring Road area", confidence: 0.97, severity: "HIGH", lane: "Left Lane", verified_count: 22, detected_at: "2026-08-10T08:00:00Z", status: "Under Repair" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.609729, 12.958036] }, properties: { id: 20, road_name: "Hosur Road area", confidence: 0.93, severity: "HIGH", lane: "Right Lane", verified_count: 11, detected_at: "2026-08-15T06:30:00Z", status: "Reported" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.597013, 12.962132] }, properties: { id: 23, road_name: "Langford Road", confidence: 0.96, severity: "HIGH", lane: "Center Lane", verified_count: 16, detected_at: "2026-08-09T09:00:00Z", status: "Resolved" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [77.578137, 12.987919] }, properties: { id: 25, road_name: "Sankey Road area", confidence: 0.69, severity: "LOW", lane: "Left Lane", verified_count: 1, detected_at: "2026-08-22T11:00:00Z", status: "Detected" } }
];

// 500m nearby road segments for initial state (State A) with 3 condition levels and lane distribution
export const MOCK_ROAD_SEGMENTS = [
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5910, 12.9725], [77.5946, 12.9716], [77.5980, 12.9708]] },
    properties: {
      id: "seg1",
      name: "Kasturba Road",
      length_km: 0.8,
      potholeCount: 6,
      potholes_per_km: 7.5,
      conditionLevel: "HIGH_RISK",
      lane_distribution: { left: 4, center: 1, right: 1 },
      lane_advice: "Avoid Left Lane (4 hazards)"
    }
  },
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5946, 12.9716], [77.5950, 12.9760], [77.5960, 12.9790]] },
    properties: {
      id: "seg2",
      name: "Cubbon Road",
      length_km: 0.9,
      potholeCount: 1,
      potholes_per_km: 1.1,
      conditionLevel: "GOOD",
      lane_distribution: { left: 0, center: 0, right: 1 },
      lane_advice: "All lanes clear"
    }
  },
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5960, 12.9740], [77.6010, 12.9745], [77.6070, 12.9750]] },
    properties: {
      id: "seg3",
      name: "MG Road",
      length_km: 1.2,
      potholeCount: 8,
      potholes_per_km: 6.7,
      conditionLevel: "HIGH_RISK",
      lane_distribution: { left: 5, center: 1, right: 2 },
      lane_advice: "Heavy Left Lane damage · Use Center"
    }
  },
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5890, 12.9680], [77.5930, 12.9695], [77.5970, 12.9705]] },
    properties: {
      id: "seg4",
      name: "Richmond Road",
      length_km: 1.0,
      potholeCount: 3,
      potholes_per_km: 3.0,
      conditionLevel: "MODERATE",
      lane_distribution: { left: 1, center: 2, right: 0 },
      lane_advice: "Right Lane optimal"
    }
  },
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5970, 12.9690], [77.6020, 12.9700], [77.6060, 12.9710]] },
    properties: {
      id: "seg5",
      name: "Residency Road",
      length_km: 1.1,
      potholeCount: 4,
      potholes_per_km: 3.6,
      conditionLevel: "MODERATE",
      lane_distribution: { left: 3, center: 1, right: 0 },
      lane_advice: "Keep to Right Lane"
    }
  },
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5920, 12.9670], [77.5950, 12.9680], [77.5980, 12.9690]] },
    properties: {
      id: "seg6",
      name: "Lavelle Road",
      length_km: 0.7,
      potholeCount: 0,
      potholes_per_km: 0.0,
      conditionLevel: "GOOD",
      lane_distribution: { left: 0, center: 0, right: 0 },
      lane_advice: "Smooth road · All lanes clear"
    }
  },
  {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[77.5946, 12.9716], [77.5910, 12.9660], [77.5880, 12.9630]] },
    properties: {
      id: "seg7",
      name: "Vittal Mallya Road",
      length_km: 0.9,
      potholeCount: 3,
      potholes_per_km: 3.3,
      conditionLevel: "MODERATE",
      lane_distribution: { left: 2, center: 0, right: 1 },
      lane_advice: "Center Lane recommended"
    }
  }
];

// Rich curated places across Mysuru, Bengaluru, Karnataka & India
export const MOCK_DESTINATIONS = [
  // --- Mysuru Locations ---
  { id: "mys-1", name: "Mysore Palace", subtitle: "Sayyaji Rao Rd, Chamrajpura, Mysuru, Karnataka", category: "tourism", coordinates: [76.6552, 12.3052] },
  { id: "mys-2", name: "Chamundi Hill", subtitle: "Chamundi Hill Rd, Mysuru, Karnataka", category: "landmark", coordinates: [76.6712, 12.2747] },
  { id: "mys-3", name: "Mysuru Railway Station", subtitle: "Medar Block, Yadavagiri, Mysuru, Karnataka", category: "transit", coordinates: [76.6437, 12.3164] },
  { id: "mys-4", name: "Brindavan Gardens (KRS)", subtitle: "KRS Dam Road, Mandya/Mysuru, Karnataka", category: "tourism", coordinates: [76.5746, 12.4228] },
  { id: "mys-5", name: "Gokulam", subtitle: "3rd Stage, Gokulam, Mysuru, Karnataka", category: "city", coordinates: [76.6272, 12.3325] },
  { id: "mys-6", name: "Vijayanagar, Mysuru", subtitle: "Vijayanagar 2nd Stage, Mysuru, Karnataka", category: "city", coordinates: [76.6080, 12.3350] },
  { id: "mys-7", name: "Mysore Airport (Mandakalli)", subtitle: "Kozhikode-Mysore-Kollegal Hwy, Mysuru", category: "transit", coordinates: [76.6508, 12.2300] },
  { id: "mys-8", name: "Infosys Mysuru Campus", subtitle: "Hebbal Industrial Estate, Mysuru, Karnataka", category: "building", coordinates: [76.5898, 12.3614] },
  { id: "mys-9", name: "KRS Road", subtitle: "Krishnaraja Sagara Road, Mysuru, Karnataka", category: "road", coordinates: [76.6025, 12.3780] },
  { id: "mys-10", name: "Mysuru Ring Road (Outer)", subtitle: "Outer Ring Rd, Mysuru, Karnataka", category: "road", coordinates: [76.6210, 12.3480] },

  // --- Bengaluru Locations ---
  { id: "blr-1", name: "Koramangala", subtitle: "Koramangala 4th & 5th Block, Bengaluru, Karnataka", category: "city", coordinates: [77.6180, 12.9350] },
  { id: "blr-2", name: "Indiranagar", subtitle: "100ft Road, Indiranagar, Bengaluru, Karnataka", category: "city", coordinates: [77.6380, 12.9780] },
  { id: "blr-3", name: "Kempegowda International Airport (BLR)", subtitle: "Devanahalli, Bengaluru, Karnataka", category: "transit", coordinates: [77.7066, 13.1986] },
  { id: "blr-4", name: "Cubbon Park", subtitle: "Kasturba Road, Bengaluru, Karnataka", category: "landmark", coordinates: [77.5930, 12.9750] },
  { id: "blr-5", name: "Whitefield", subtitle: "ITPL Main Rd, Whitefield, Bengaluru, Karnataka", category: "city", coordinates: [77.7490, 12.9690] },
  { id: "blr-6", name: "HSR Layout", subtitle: "Sector 1-7, HSR Layout, Bengaluru, Karnataka", category: "city", coordinates: [77.6410, 12.9120] },
  { id: "blr-7", name: "Electronic City", subtitle: "Hosur Rd, Phase 1 & 2, Bengaluru, Karnataka", category: "building", coordinates: [77.6760, 12.8390] },
  { id: "blr-8", name: "Jayanagar", subtitle: "4th Block, Jayanagar, Bengaluru, Karnataka", category: "city", coordinates: [77.5830, 12.9250] },
  { id: "blr-9", name: "MG Road (Mahatma Gandhi Rd)", subtitle: "CBD, Bengaluru, Karnataka", category: "road", coordinates: [77.6070, 12.9750] },
  { id: "blr-10", name: "Bangalore-Mysore Expressway (NH 275)", subtitle: "Kengeri to Mysuru, Karnataka", category: "road", coordinates: [77.3800, 12.8200] },

  // --- Major Karnataka & India Cities ---
  { id: "ind-1", name: "Mandya", subtitle: "Mandya, Karnataka, India", category: "city", coordinates: [76.8951, 12.5244] },
  { id: "ind-2", name: "Ramanagara", subtitle: "Ramanagara, Karnataka, India", category: "city", coordinates: [77.2754, 12.7209] },
  { id: "ind-3", name: "Channapatna", subtitle: "Ramanagara District, Karnataka, India", category: "city", coordinates: [77.2023, 12.6518] },
  { id: "ind-4", name: "Srirangapatna", subtitle: "Mandya District, Karnataka, India", category: "landmark", coordinates: [76.6946, 12.4238] },
  { id: "ind-5", name: "Nandi Hills", subtitle: "Chikkaballapur District, Karnataka", category: "landmark", coordinates: [77.6835, 13.3702] },
  { id: "ind-6", name: "Mangaluru", subtitle: "Dakshina Kannada, Karnataka, India", category: "city", coordinates: [74.8560, 12.9141] },
  { id: "ind-7", name: "Hubballi-Dharwad", subtitle: "Karnataka, India", category: "city", coordinates: [75.1240, 15.3647] },
  { id: "ind-8", name: "Chennai", subtitle: "Tamil Nadu, India", category: "city", coordinates: [80.2707, 13.0827] },
  { id: "ind-9", name: "Hyderabad", subtitle: "Telangana, India", category: "city", coordinates: [78.4867, 17.3850] },
  { id: "ind-10", name: "Mumbai", subtitle: "Maharashtra, India", category: "city", coordinates: [72.8777, 19.0760] },
  { id: "ind-11", name: "New Delhi", subtitle: "National Capital Region, Delhi, India", category: "city", coordinates: [77.2090, 28.6139] }
];

export const KNOWN_LOCATIONS = MOCK_DESTINATIONS.map(d => d.name);

// Fallback Routes when offline
export const MOCK_ROUTES = {
  "mys-1": [
    {
      id: "route-mys-1",
      name: "Via Bengaluru-Mysuru Expressway (NH 275)",
      distance_km: 142.5,
      time_min: 110,
      condition_score: 92,
      potholes_per_km: 0.8,
      risk_level: "LOW",
      lane_advice: "Expressway surface smooth · All lanes clear",
      segments: [
        { conditionLevel: "GOOD", potholes_per_km: 0.5, lane_advice: "Expressway smooth", coordinates: [[77.5946, 12.9716], [77.4500, 12.8800], [77.2000, 12.6500], [76.8900, 12.5200], [76.6900, 12.4200], [76.6552, 12.3052]] }
      ]
    },
    {
      id: "route-mys-2",
      name: "Via Kanakapura & Malavalli (NH 948)",
      distance_km: 156.0,
      time_min: 145,
      condition_score: 65,
      potholes_per_km: 3.4,
      risk_level: "MODERATE",
      lane_advice: "Moderate roughness near town crossings",
      segments: [
        { conditionLevel: "GOOD", potholes_per_km: 1.2, lane_advice: "Smooth road", coordinates: [[77.5946, 12.9716], [77.5400, 12.8200], [77.4200, 12.5500]] },
        { conditionLevel: "MODERATE", potholes_per_km: 3.8, lane_advice: "Use Center Lane", coordinates: [[77.4200, 12.5500], [77.0600, 12.3800], [76.6552, 12.3052]] }
      ]
    }
  ]
};
