import { MOCK_POTHOLES, MOCK_ROAD_SUMMARY, MOCK_ROUTE_OPTIONS } from './mockData.js';

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // GET /potholes?bbox=min_lon,min_lat,max_lon,max_lat
  async fetchPotholes(bbox) {
    await delay(300);
    return {
      type: "FeatureCollection",
      features: MOCK_POTHOLES
    };
  },

  // GET /roads/summary
  async fetchRoadSummary() {
    await delay(300);
    return MOCK_ROAD_SUMMARY;
  },

  // POST /potholes
  async submitPothole(data) {
    await delay(500);
    const newId = Math.max(...MOCK_POTHOLES.map(p => p.properties.id)) + 1;
    const newPothole = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [data.longitude, data.latitude] },
      properties: {
        id: newId,
        road_name: data.road_name || "Detected Road",
        confidence: data.confidence || 0.85,
        severity: data.severity || "MEDIUM",
        verified_count: 1,
        detected_at: new Date().toISOString(),
        status: "Detected"
      }
    };
    MOCK_POTHOLES.push(newPothole);
    return { status: "success", id: newId, road_name: newPothole.properties.road_name };
  },

  // POST /alerts/proximity
  async checkProximity(data) {
    await delay(200);
    const isAlert = Math.random() > 0.8;
    if (isAlert) {
      return {
        alert: true,
        distance_meters: Math.floor(Math.random() * 50) + 10,
        hazard_type: "pothole",
        message: "Pothole detected ahead."
      };
    }
    return { alert: false };
  },

  // Search roads/potholes by query string
  async searchRoads(query) {
    await delay(200);
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase();
    // Group potholes by road name, filter by query
    const roadMap = {};
    for (const p of MOCK_POTHOLES) {
      const name = p.properties.road_name;
      if (!name.toLowerCase().includes(q)) continue;
      if (!roadMap[name]) {
        roadMap[name] = { road_name: name, pothole_count: 0, coordinates: p.geometry.coordinates, first_pothole: p.properties };
      }
      roadMap[name].pothole_count++;
    }
    return Object.values(roadMap);
  },

  // Fetch route comparison options
  async fetchRouteOptions(routeKey) {
    await delay(400);
    return MOCK_ROUTE_OPTIONS[routeKey] || [];
  },

  // Get available route keys
  getRouteKeys() {
    return Object.keys(MOCK_ROUTE_OPTIONS);
  },

  // Report a hazard manually
  async reportHazard(data) {
    await delay(600);
    const newId = Math.max(...MOCK_POTHOLES.map(p => p.properties.id)) + 1;
    const newPothole = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [data.longitude || 77.5946, data.latitude || 12.9716] },
      properties: {
        id: newId,
        road_name: data.location || "Unknown Road",
        confidence: 0.70,
        severity: data.severity || "MEDIUM",
        verified_count: 1,
        detected_at: new Date().toISOString(),
        status: "Detected"
      }
    };
    MOCK_POTHOLES.push(newPothole);
    return { status: "success", id: newId, road_name: newPothole.properties.road_name };
  }
};
