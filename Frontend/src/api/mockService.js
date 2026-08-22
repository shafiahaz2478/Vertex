import { MOCK_POTHOLES, MOCK_ROAD_SEGMENTS, MOCK_DESTINATIONS, MOCK_ROUTES } from './mockData.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const API_BASE_URL = 'https://vertex-backend-hf09.onrender.com/api/v1';
const OSRM_BASE_URL = 'https://router.project-osrm.org';
const CONDITION_LEVELS = ['GOOD', 'MODERATE', 'POOR', 'HIGH_RISK'];
let pendingDetections = [];
let batchTimer = null;

const notifyPotholesUpdated = () => window.dispatchEvent(new Event('potholes:updated'));

async function requestBackend(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || payload.message || `Backend request failed (${response.status})`);
  }
  return payload;
}

const asFallbackPothole = (data) => {
  const newId = Math.max(...MOCK_POTHOLES.map(p => p.properties.id)) + 1;
  const newPothole = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [data.longitude, data.latitude] },
    properties: {
      id: newId,
      road_name: data.road_name || 'Detected Road',
      confidence: data.confidence || 0.7,
      severity: data.severity || 'MEDIUM',
      verified_count: 1,
      detected_at: data.detected_at || new Date().toISOString(),
      status: 'Detected'
    }
  };
  MOCK_POTHOLES.push(newPothole);
  return { status: 'success', id: newId, road_name: newPothole.properties.road_name };
};

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
      text: step.maneuver?.type === 'turn'
        ? `Turn ${step.maneuver?.modifier || 'ahead'}${step.name ? ` onto ${step.name}` : ''}`
        : step.maneuver?.type === 'depart'
          ? `Head ${step.maneuver?.modifier || 'straight'}${step.name ? ` on ${step.name}` : ''}`
          : step.name ? `Continue on ${step.name}` : 'Continue on the current road',
      distance_m: Math.round(step.distance),
      maneuver: step.maneuver?.type || 'continue',
      modifier: step.maneuver?.modifier || 'straight'
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
    try {
      const query = bbox ? `?${new URLSearchParams({ bbox })}` : '';
      return await requestBackend(`/potholes${query}`);
    } catch (error) {
      console.warn('Could not load backend potholes; using demo data.', error);
      await delay(300);
      return { type: 'FeatureCollection', features: MOCK_POTHOLES };
    }
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
    const payload = {
      latitude: data.latitude,
      longitude: data.longitude,
      confidence: data.confidence
    };
    try {
      const result = await requestBackend('/potholes', { method: 'POST', body: JSON.stringify(payload) });
      notifyPotholesUpdated();
      return result;
    } catch (error) {
      console.warn('Could not submit pothole to backend; storing demo record.', error);
      const result = asFallbackPothole(data);
      notifyPotholesUpdated();
      return result;
    }
  },

  async submitPotholeBatch(potholes) {
    if (!potholes.length) return { status: 'success', inserted_count: 0 };
    const result = await requestBackend('/potholes/batch', {
      method: 'POST',
      body: JSON.stringify({ potholes: potholes.map(({ latitude, longitude, confidence, detected_at }) => ({
        latitude,
        longitude,
        confidence,
        detected_at: detected_at || new Date().toISOString()
      })) })
    });
    notifyPotholesUpdated();
    return result;
  },

  queuePotholeDetection(data) {
    pendingDetections.push({ ...data, detected_at: data.detected_at || new Date().toISOString() });
    if (pendingDetections.length >= 20) return this.flushPotholeBatch();
    if (!batchTimer) {
      batchTimer = setTimeout(() => this.flushPotholeBatch(), 10000);
    }
    return Promise.resolve({ queued: true });
  },

  async flushPotholeBatch() {
    if (batchTimer) clearTimeout(batchTimer);
    batchTimer = null;
    const batch = pendingDetections;
    pendingDetections = [];
    if (!batch.length) return { status: 'success', inserted_count: 0 };
    try {
      return await this.submitPotholeBatch(batch);
    } catch (error) {
      console.warn('Could not batch-submit potholes; keeping demo records.', error);
      batch.forEach(asFallbackPothole);
      notifyPotholesUpdated();
      return { status: 'offline', inserted_count: 0 };
    }
  },

  async checkProximity(data) {
    try {
      return await requestBackend('/alerts/proximity', { method: 'POST', body: JSON.stringify(data) });
    } catch (error) {
      console.warn('Could not check backend proximity alert.', error);
      return { alert: false };
    }
  },

  async reportHazard(data) {
    return this.submitPothole({ ...data, confidence: data.confidence || 0.7 });
  },

  async fetchRoadSummary() {
    return requestBackend('/roads/summary');
  }
};
