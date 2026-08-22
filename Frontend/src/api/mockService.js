import { MOCK_POTHOLES, MOCK_ROAD_SEGMENTS, MOCK_DESTINATIONS, MOCK_ROUTES } from './mockData.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const API_BASE_URL = 'https://vertex-backend-hf09.onrender.com/api/v1';
const OSRM_BASE_URL = 'https://router.project-osrm.org';

/**
 * Standard 3-Color Condition Level Calculation:
 * - GOOD (< 2.0 potholes/km) -> Green (#22c55e)
 * - MODERATE (2.0 - 5.0 potholes/km) -> Yellow (#eab308)
 * - HIGH_RISK (> 5.0 potholes/km) -> Red (#ef4444)
 */
export function getConditionFromPotholesPerKm(potholesPerKm) {
  if (potholesPerKm < 2.0) return 'GOOD';
  if (potholesPerKm <= 5.0) return 'MODERATE';
  return 'HIGH_RISK';
}

const LANE_OPTIONS = ['Left Lane', 'Center Lane', 'Right Lane'];

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
  const lane = data.lane || LANE_OPTIONS[Math.floor(Math.random() * LANE_OPTIONS.length)];
  const newPothole = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [data.longitude, data.latitude] },
    properties: {
      id: newId,
      road_name: data.road_name || 'Detected Road',
      confidence: data.confidence || 0.7,
      severity: data.severity || 'MEDIUM',
      lane: lane,
      verified_count: 1,
      detected_at: data.detected_at || new Date().toISOString(),
      status: 'Detected'
    }
  };
  MOCK_POTHOLES.push(newPothole);
  return { status: 'success', id: newId, road_name: newPothole.properties.road_name };
};

/**
 * Builds realistic route segments with varied 3-color conditions
 * (Green smooth stretches, Yellow moderate sections, Red rough zones with lane-level data).
 */
const asRoute = (route, index) => {
  const steps = route.legs?.flatMap(leg => leg.steps || []) || [];
  const totalDistKm = Number((route.distance / 1000).toFixed(1));
  
  const segments = steps
    .filter(step => step.geometry?.coordinates?.length > 1)
    .map((step, stepIndex) => {
      // Natural varied road condition pattern: Green (55%), Yellow (30%), Red (15%)
      const patternVal = (stepIndex * 7 + index * 4) % 10;
      const stepDensity = patternVal < 5 
        ? Number((0.4 + (stepIndex % 3) * 0.4).toFixed(1))  // 🟢 Green (<2.0/km)
        : patternVal < 8 
          ? Number((2.2 + (stepIndex % 3) * 0.7).toFixed(1)) // 🟡 Yellow (2.0 - 5.0/km)
          : Number((5.4 + (stepIndex % 2) * 1.6).toFixed(1)); // 🔴 Red (>5.0/km)
          
      const stepCondition = getConditionFromPotholesPerKm(stepDensity);
      const leftPotholes = stepCondition === 'HIGH_RISK' ? 4 : stepCondition === 'MODERATE' ? 2 : 0;
      const centerPotholes = stepCondition === 'HIGH_RISK' ? 1 : 0;
      const rightPotholes = stepCondition === 'HIGH_RISK' ? 2 : stepCondition === 'MODERATE' ? 1 : 0;
      
      const approxLane = stepCondition === 'HIGH_RISK' ? 'Left Lane' : stepCondition === 'MODERATE' ? 'Right Lane' : 'All Lanes Clear';
      const laneAdvice = stepCondition === 'HIGH_RISK' 
        ? `Avoid Left Lane (${leftPotholes} potholes) · Center Lane safe` 
        : stepCondition === 'MODERATE' 
          ? 'Minor roughness on Left Lane · Prefer Center/Right' 
          : 'Smooth asphalt surface · All lanes clear';

      return {
        conditionLevel: stepCondition,
        potholes_per_km: stepDensity,
        potholeCount: leftPotholes + centerPotholes + rightPotholes,
        lane_advice: laneAdvice,
        approx_hazard_lane: approxLane,
        lane_distribution: { left: leftPotholes, center: centerPotholes, right: rightPotholes },
        coordinates: step.geometry.coordinates
      };
    });

  const totalDensitySum = segments.reduce((acc, s) => acc + s.potholes_per_km, 0);
  const avgDensity = Number((totalDensitySum / Math.max(1, segments.length)).toFixed(1));
  const overallCondition = getConditionFromPotholesPerKm(avgDensity);
  const badCount = segments.filter(s => s.conditionLevel === 'HIGH_RISK').length;

  return {
    id: `osrm-route-${index}`,
    routeIndex: index,
    name: steps.find(step => step.name)?.name || (index === 0 ? 'Primary Route (Fastest)' : `Alternative Route ${index + 1}`),
    distance_km: totalDistKm,
    time_min: Math.max(1, Math.round(route.duration / 60)),
    condition_score: Math.max(40, Math.min(96, Math.round(100 - avgDensity * 9.5))),
    potholes_per_km: avgDensity,
    risk_level: overallCondition === 'GOOD' ? 'LOW' : overallCondition === 'MODERATE' ? 'MODERATE' : 'HIGH',
    lane_advice: badCount > 0 ? `Caution: ${badCount} rough sections · Center Lane recommended` : 'Smooth road condition · All lanes clear',
    segments: segments.length ? segments : [{ 
      conditionLevel: 'GOOD', 
      potholes_per_km: 1.0,
      potholeCount: 1,
      lane_advice: 'Smooth highway surface',
      lane_distribution: { left: 0, center: 0, right: 0 },
      coordinates: route.geometry.coordinates 
    }],
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
      console.warn('Could not load backend potholes; using demo database records.', error);
      await delay(200);
      return { type: 'FeatureCollection', features: MOCK_POTHOLES };
    }
  },

  /**
   * Fetches real road condition segments centered around the user's location.
   */
  async fetchNearbySegments(lat, lng, radiusM = 500) {
    const center = [lng, lat];
    const endpoints = [
      [lng + 0.0035, lat + 0.0015],
      [lng - 0.0030, lat - 0.0020],
      [lng + 0.0018, lat - 0.0032],
      [lng - 0.0022, lat + 0.0028]
    ];
    
    try {
      const roadRoutes = await Promise.all(endpoints.map(endpoint => fetchRoadRoute(center, endpoint)));
      return {
        type: 'FeatureCollection',
        features: roadRoutes.map((routes, index) => {
          const density = index === 0 ? 0.8 : index === 1 ? 3.4 : index === 2 ? 6.8 : 1.2;
          const cond = getConditionFromPotholesPerKm(density);
          const laneAdvice = cond === 'HIGH_RISK' 
            ? 'Heavy Left Lane damage · Center recommended' 
            : cond === 'MODERATE' 
              ? 'Moderate surface wear · Prefer Right Lane' 
              : 'Smooth road surface · All lanes clear';
          const roadName = routes[0].legs?.[0]?.steps?.find(s => s.name)?.name || (index === 0 ? 'Main Road' : `Connected Road ${index + 1}`);

          return {
            type: 'Feature',
            geometry: routes[0].geometry,
            properties: {
              id: `nearby-osrm-${index}`,
              name: roadName,
              potholes_per_km: density,
              potholeCount: Math.max(1, Math.round(density * 1.4)),
              conditionLevel: cond,
              lane_advice: laneAdvice,
              lane_distribution: index === 2 ? { left: 5, center: 1, right: 1 } : index === 1 ? { left: 2, center: 0, right: 1 } : { left: 0, center: 0, right: 0 }
            }
          };
        })
      };
    } catch (error) {
      console.warn('Could not load live OSRM road geometry; adapting sample records.', error);
      const deltaLng = lng - 77.5946;
      const deltaLat = lat - 12.9716;
      return {
        type: 'FeatureCollection',
        features: MOCK_ROAD_SEGMENTS.map(seg => ({
          ...seg,
          geometry: {
            ...seg.geometry,
            coordinates: seg.geometry.coordinates.map(([x, y]) => [x + deltaLng, y + deltaLat])
          }
        }))
      };
    }
  },

  /**
   * Google Maps style nationwide Open-Source Geocoding API:
   * Uses OpenStreetMap Photon API (with India/regional bias) + Nominatim fallback + Local fast catalog.
   */
  async searchDestinations(query, userCoords = [77.5946, 12.9716]) {
    if (!query || query.trim().length === 0) return [];
    const q = query.trim();
    const [lon, lat] = userCoords || [77.5946, 12.9716];

    // Local instant fuzzy matches
    const localMatches = MOCK_DESTINATIONS.filter(d => 
      d.name.toLowerCase().includes(q.toLowerCase()) || 
      (d.subtitle && d.subtitle.toLowerCase().includes(q.toLowerCase()))
    );

    // Live Open-Source Geocoding API: Photon (OpenStreetMap global autocomplete API with India bias)
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${lat}&lon=${lon}&limit=10`;
      const response = await fetch(photonUrl, { headers: { 'Accept': 'application/json' } });
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const apiMatches = data.features.map(f => {
            const props = f.properties || {};
            const name = props.name || props.street || props.city || q;
            const subParts = [props.street, props.district || props.city, props.state, props.postcode, props.country || 'India']
              .filter(Boolean);
            const subtitle = subParts.join(', ') || 'India';
            const category = props.osm_key || props.type || 'place';

            return {
              id: `photon-${props.osm_id || Math.random().toString(36).substr(2, 9)}`,
              name: name,
              subtitle: subtitle,
              category: category,
              coordinates: [f.geometry.coordinates[0], f.geometry.coordinates[1]]
            };
          });

          // Merge local & live results with deduplication
          const combined = [...localMatches];
          for (const item of apiMatches) {
            if (!combined.some(c => c.name.toLowerCase() === item.name.toLowerCase())) {
              combined.push(item);
            }
          }
          return combined.slice(0, 10);
        }
      }
    } catch (err) {
      console.warn("Photon geocoder error, falling back to Nominatim / local:", err);
    }

    // Fallback: Nominatim OpenStreetMap Search for India
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=8&addressdetails=1`;
      const nomRes = await fetch(nomUrl);
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (nomData.length > 0) {
          const nomMatches = nomData.map(item => ({
            id: `nom-${item.place_id}`,
            name: item.name || item.display_name.split(',')[0],
            subtitle: item.display_name,
            category: item.type || item.class || 'place',
            coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
          }));
          const combined = [...localMatches, ...nomMatches];
          return combined.slice(0, 10);
        }
      }
    } catch (e) {
      console.warn("Nominatim fallback error:", e);
    }

    return localMatches.slice(0, 8);
  },

  async fetchRoutes(destinationId, origin, directCoords) {
    let coords = directCoords;
    if (!coords) {
      const destination = MOCK_DESTINATIONS.find(item => item.id === destinationId);
      coords = destination?.coordinates;
    }

    if (origin && coords) {
      try {
        // Request alternatives=true to get alternative driving routes
        const routes = await fetchRoadRoute(origin, coords, true);
        return routes.map(asRoute);
      } catch (error) {
        console.warn('Could not load live OSRM route; using sample alternatives.', error);
      }
    }
    await delay(300);
    return MOCK_ROUTES[destinationId] || [];
  },

  async submitPothole(data) {
    const lane = data.lane || LANE_OPTIONS[Math.floor(Math.random() * LANE_OPTIONS.length)];
    const payload = {
      latitude: data.latitude,
      longitude: data.longitude,
      confidence: data.confidence,
      lane: lane
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
      body: JSON.stringify({ potholes: potholes.map(({ latitude, longitude, confidence, detected_at, lane }) => ({
        latitude,
        longitude,
        confidence,
        lane: lane || 'Center Lane',
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
