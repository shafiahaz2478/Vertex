import { MOCK_POTHOLES, MOCK_ROAD_SEGMENTS, MOCK_DESTINATIONS, MOCK_ROUTES } from './mockData.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const OSRM_BASE_URL = 'https://router.project-osrm.org';
const CONDITION_LEVELS = ['GOOD', 'MODERATE', 'POOR', 'HIGH_RISK'];

const asRoute = (route, index) => {
  const steps = route.legs?.flatMap(leg => leg.steps || []) || [];
  const segments = steps
    .filter(step => step.geometry?.coordinates?.length > 1)
    .map((step, stepIndex) => ({
      conditionLevel: CONDITION_LEVELS[(index + stepIndex) % CONDITION_LEVELS.length],
      coordinates: step.geometry.coordinates
    }));

  return {
    id: `osrm-route-${index}`,
    name: steps.find(step => step.name)?.name || `Recommended route ${index + 1}`,
    distance_km: Number((route.distance / 1000).toFixed(1)),
    time_min: Math.max(1, Math.round(route.duration / 60)),
    condition_score: Math.max(45, 86 - index * 12),
    risk_level: index === 0 ? 'MODERATE' : 'LOW',
    segments: segments.length ? segments : [{ conditionLevel: 'MODERATE', coordinates: route.geometry.coordinates }],
    instructions: steps.map(step => ({
      text: step.name ? `Continue on ${step.name}` : 'Continue on the current road',
      distance_m: Math.round(step.distance),
      maneuver: step.maneuver?.type || 'continue'
    }))
  };
};

async function fetchRoadRoute(origin, destination, alternatives = false) {
  const from = `${origin[0]},${origin[1]}`;
  const to = `${destination[0]},${destination[1]}`;
  const params = new URLSearchParams({
    alternatives: alternatives ? 'true' : 'false',
    steps: 'true',
    geometries: 'geojson',
    overview: 'full'
  });
  const response = await fetch(`${OSRM_BASE_URL}/route/v1/driving/${from};${to}?${params}`);
  if (!response.ok) throw new Error(`OSRM request failed (${response.status})`);
  const payload = await response.json();
  if (payload.code !== 'Ok' || !payload.routes?.length) throw new Error('OSRM did not return a route');
  return payload.routes;
}

export const api = {
  async fetchPotholes(bbox) {
    await delay(300);
    return {
      type: "FeatureCollection",
      features: MOCK_POTHOLES
    };
  },

  async fetchNearbySegments(lat, lng, radiusM = 500) {
    const center = [lng, lat];
    // Query real OSM road geometry around the user instead of drawing approximate lines.
    const endpoints = [
      [lng + 0.0032, lat + 0.0012],
      [lng - 0.0028, lat - 0.0016],
      [lng + 0.0014, lat - 0.0030]
    ];
    try {
      const roadRoutes = await Promise.all(endpoints.map(endpoint => fetchRoadRoute(center, endpoint)));
      return {
        type: 'FeatureCollection',
        features: roadRoutes.map((routes, index) => ({
          type: 'Feature',
          geometry: routes[0].geometry,
          properties: {
            id: `nearby-osrm-${index}`,
            name: 'OpenStreetMap road geometry',
            potholeCount: index + 1,
            severePotholeCount: index === 2 ? 1 : 0,
            conditionLevel: CONDITION_LEVELS[index + 1]
          }
        }))
      };
    } catch (error) {
      console.warn('Could not load OSRM road geometry; using offline sample.', error);
      await delay(200);
      return { type: 'FeatureCollection', features: MOCK_ROAD_SEGMENTS };
    }
  },

  async searchDestinations(query) {
    await delay(200);
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase();
    return MOCK_DESTINATIONS.filter(d => d.name.toLowerCase().includes(q));
  },

  async fetchRoutes(destinationId, origin) {
    const destination = MOCK_DESTINATIONS.find(item => item.id === destinationId);
    if (origin && destination?.coordinates) {
      try {
        const routes = await fetchRoadRoute(origin, destination.coordinates, true);
        return routes.map(asRoute);
      } catch (error) {
        console.warn('Could not load an OSRM route; using offline sample.', error);
      }
    }
    await delay(400);
    return MOCK_ROUTES[destinationId] || [];
  },

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
