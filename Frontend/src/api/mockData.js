// Comprehensive Mock Pothole Database for Bangalore area
// ~25 potholes with severity, status, and accountability lifecycle

export const MOCK_POTHOLES = [
  // --- Kasturba Road ---
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.5946, 12.9716] },
    properties: { id: 1, road_name: "Kasturba Road", confidence: 0.88, severity: "HIGH", verified_count: 4, detected_at: "2026-08-22T06:10:00Z", status: "Reported" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.5952, 12.9720] },
    properties: { id: 2, road_name: "Kasturba Road", confidence: 0.79, severity: "MEDIUM", verified_count: 2, detected_at: "2026-08-20T10:30:00Z", status: "Verified" }
  },
  // --- MG Road ---
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.5980, 12.9740] },
    properties: { id: 3, road_name: "MG Road", confidence: 0.95, severity: "HIGH", verified_count: 12, detected_at: "2026-08-21T14:30:00Z", status: "Under Repair" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.5995, 12.9748] },
    properties: { id: 4, road_name: "MG Road", confidence: 0.72, severity: "LOW", verified_count: 1, detected_at: "2026-08-22T09:00:00Z", status: "Detected" }
  },
  // --- Richmond Road ---
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.5910, 12.9690] },
    properties: { id: 5, road_name: "Richmond Road", confidence: 0.76, severity: "MEDIUM", verified_count: 2, detected_at: "2026-08-22T08:15:00Z", status: "Detected" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.5920, 12.9685] },
    properties: { id: 6, road_name: "Richmond Road", confidence: 0.91, severity: "HIGH", verified_count: 8, detected_at: "2026-08-18T16:00:00Z", status: "Reported" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.5905, 12.9695] },
    properties: { id: 7, road_name: "Richmond Road", confidence: 0.68, severity: "LOW", verified_count: 1, detected_at: "2026-08-22T07:45:00Z", status: "Detected" }
  },
  // --- Residency Road ---
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.6020, 12.9700] },
    properties: { id: 8, road_name: "Residency Road", confidence: 0.91, severity: "HIGH", verified_count: 7, detected_at: "2026-08-20T11:00:00Z", status: "Verified" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.6030, 12.9710] },
    properties: { id: 9, road_name: "Residency Road", confidence: 0.83, severity: "MEDIUM", verified_count: 3, detected_at: "2026-08-19T13:20:00Z", status: "Reported" }
  },
  // --- Cubbon Park Road ---
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.5850, 12.9750] },
    properties: { id: 10, road_name: "Cubbon Park Road", confidence: 0.65, severity: "LOW", verified_count: 1, detected_at: "2026-08-22T09:45:00Z", status: "Detected" }
  },
  // --- Outer Ring Road ---
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.6150, 12.9560] },
    properties: { id: 11, road_name: "Outer Ring Road", confidence: 0.97, severity: "HIGH", verified_count: 22, detected_at: "2026-08-10T08:00:00Z", status: "Under Repair" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.6180, 12.9540] },
    properties: { id: 12, road_name: "Outer Ring Road", confidence: 0.94, severity: "HIGH", verified_count: 18, detected_at: "2026-08-11T09:30:00Z", status: "Reported" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.6200, 12.9530] },
    properties: { id: 13, road_name: "Outer Ring Road", confidence: 0.90, severity: "HIGH", verified_count: 15, detected_at: "2026-08-12T07:15:00Z", status: "Reported" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.6220, 12.9520] },
    properties: { id: 14, road_name: "Outer Ring Road", confidence: 0.88, severity: "MEDIUM", verified_count: 9, detected_at: "2026-08-14T11:45:00Z", status: "Verified" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.6240, 12.9510] },
    properties: { id: 15, road_name: "Outer Ring Road", confidence: 0.85, severity: "MEDIUM", verified_count: 6, detected_at: "2026-08-16T14:00:00Z", status: "Detected" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.6260, 12.9505] },
    properties: { id: 16, road_name: "Outer Ring Road", confidence: 0.92, severity: "HIGH", verified_count: 14, detected_at: "2026-08-13T10:30:00Z", status: "Reported" }
  },
  // --- Brigade Road ---
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.6070, 12.9730] },
    properties: { id: 17, road_name: "Brigade Road", confidence: 0.82, severity: "MEDIUM", verified_count: 5, detected_at: "2026-08-19T15:00:00Z", status: "Verified" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.6080, 12.9725] },
    properties: { id: 18, road_name: "Brigade Road", confidence: 0.71, severity: "LOW", verified_count: 2, detected_at: "2026-08-21T08:30:00Z", status: "Detected" }
  },
  // --- Lavelle Road ---
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.5960, 12.9680] },
    properties: { id: 19, road_name: "Lavelle Road", confidence: 0.74, severity: "LOW", verified_count: 1, detected_at: "2026-08-22T10:00:00Z", status: "Detected" }
  },
  // --- Hosur Road ---
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.6100, 12.9580] },
    properties: { id: 20, road_name: "Hosur Road", confidence: 0.93, severity: "HIGH", verified_count: 11, detected_at: "2026-08-15T06:30:00Z", status: "Reported" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.6110, 12.9570] },
    properties: { id: 21, road_name: "Hosur Road", confidence: 0.87, severity: "HIGH", verified_count: 9, detected_at: "2026-08-16T07:00:00Z", status: "Under Repair" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.6120, 12.9575] },
    properties: { id: 22, road_name: "Hosur Road", confidence: 0.78, severity: "MEDIUM", verified_count: 4, detected_at: "2026-08-18T12:00:00Z", status: "Verified" }
  },
  // --- Bannerghatta Road ---
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.5970, 12.9620] },
    properties: { id: 23, road_name: "Bannerghatta Road", confidence: 0.96, severity: "HIGH", verified_count: 16, detected_at: "2026-08-09T09:00:00Z", status: "Resolved" }
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.5975, 12.9610] },
    properties: { id: 24, road_name: "Bannerghatta Road", confidence: 0.84, severity: "MEDIUM", verified_count: 5, detected_at: "2026-08-17T14:30:00Z", status: "Reported" }
  },
  // --- Sankey Road ---
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [77.5780, 12.9880] },
    properties: { id: 25, road_name: "Sankey Road", confidence: 0.69, severity: "LOW", verified_count: 1, detected_at: "2026-08-22T11:00:00Z", status: "Detected" }
  }
];

export const MOCK_ROAD_SUMMARY = [
  { road_name: "Outer Ring Road", pothole_count: 6, risk_level: "CRITICAL", avg_severity: "HIGH", condition_score: 28 },
  { road_name: "Hosur Road", pothole_count: 3, risk_level: "HIGH", avg_severity: "HIGH", condition_score: 45 },
  { road_name: "Bannerghatta Road", pothole_count: 2, risk_level: "HIGH", avg_severity: "HIGH", condition_score: 52 },
  { road_name: "Richmond Road", pothole_count: 3, risk_level: "MODERATE", avg_severity: "MEDIUM", condition_score: 61 },
  { road_name: "Kasturba Road", pothole_count: 2, risk_level: "MODERATE", avg_severity: "MEDIUM", condition_score: 65 },
  { road_name: "Residency Road", pothole_count: 2, risk_level: "MODERATE", avg_severity: "MEDIUM", condition_score: 68 },
  { road_name: "Brigade Road", pothole_count: 2, risk_level: "LOW", avg_severity: "MEDIUM", condition_score: 75 },
  { road_name: "MG Road", pothole_count: 2, risk_level: "LOW", avg_severity: "LOW", condition_score: 82 },
  { road_name: "Cubbon Park Road", pothole_count: 1, risk_level: "LOW", avg_severity: "LOW", condition_score: 90 },
  { road_name: "Lavelle Road", pothole_count: 1, risk_level: "LOW", avg_severity: "LOW", condition_score: 88 },
  { road_name: "Sankey Road", pothole_count: 1, risk_level: "LOW", avg_severity: "LOW", condition_score: 92 }
];

export const MOCK_ROUTE_OPTIONS = {
  "Koramangala to Indiranagar": [
    { route_name: "Via Outer Ring Road", distance_km: 8.2, time_min: 25, hazard_count: 6, high_severity: 4, condition_score: 28, risk_level: "CRITICAL" },
    { route_name: "Via MG Road", distance_km: 10.1, time_min: 32, hazard_count: 2, high_severity: 0, condition_score: 82, risk_level: "LOW" },
    { route_name: "Via Hosur Road", distance_km: 9.5, time_min: 29, hazard_count: 3, high_severity: 2, condition_score: 45, risk_level: "HIGH" }
  ],
  "Whitefield to MG Road": [
    { route_name: "Via Outer Ring Road", distance_km: 18.5, time_min: 55, hazard_count: 6, high_severity: 4, condition_score: 28, risk_level: "CRITICAL" },
    { route_name: "Via Old Airport Road", distance_km: 16.2, time_min: 48, hazard_count: 2, high_severity: 1, condition_score: 72, risk_level: "MODERATE" }
  ],
  "Jayanagar to Cubbon Park": [
    { route_name: "Via Bannerghatta Road", distance_km: 7.8, time_min: 22, hazard_count: 2, high_severity: 1, condition_score: 52, risk_level: "HIGH" },
    { route_name: "Via Richmond Road", distance_km: 6.5, time_min: 20, hazard_count: 3, high_severity: 1, condition_score: 61, risk_level: "MODERATE" },
    { route_name: "Via Lavelle Road", distance_km: 7.1, time_min: 21, hazard_count: 1, high_severity: 0, condition_score: 88, risk_level: "LOW" }
  ]
};

// Known locations for search / route picking
export const KNOWN_LOCATIONS = [
  "Koramangala", "Indiranagar", "Whitefield", "MG Road", "Jayanagar",
  "Cubbon Park", "Bannerghatta Road", "Hosur Road", "Outer Ring Road",
  "Richmond Road", "Kasturba Road", "Residency Road", "Brigade Road",
  "Lavelle Road", "Sankey Road", "Electronic City", "HSR Layout",
  "BTM Layout", "Marathahalli", "Hebbal"
];
