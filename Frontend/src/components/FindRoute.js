import React, { useState } from 'react';
import maplibregl from 'maplibre-gl';
import { html } from '../utils.js';
import { Search, MapPin, Navigation, X } from 'lucide-react';
import { api } from '../api/mockService.js';

// Distance from point (p) to line segment (v, w)
function distToSegmentSquared(p, v, w) {
    let l2 = Math.pow(v[0] - w[0], 2) + Math.pow(v[1] - w[1], 2);
    if (l2 === 0) return Math.pow(p[0] - v[0], 2) + Math.pow(p[1] - v[1], 2);
    let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.pow(p[0] - (v[0] + t * (w[0] - v[0])), 2) + Math.pow(p[1] - (v[1] + t * (w[1] - v[1])), 2);
}

// rough conversion from degrees to meters
const DEG_TO_M = 111320; 

export function FindRoute({ mapRef }) {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleRoute = async () => {
        if (!start || !end) return;
        setLoading(true);
        try {
            // Geocode
            const resStart = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(start + ' Bangalore')}&format=json&limit=1`);
            const dataStart = await resStart.json();
            if(!dataStart.length) { alert("Start location not found"); setLoading(false); return; }
            
            const resEnd = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(end + ' Bangalore')}&format=json&limit=1`);
            const dataEnd = await resEnd.json();
            if(!dataEnd.length) { alert("End location not found"); setLoading(false); return; }

            const sLon = dataStart[0].lon, sLat = dataStart[0].lat;
            const eLon = dataEnd[0].lon, eLat = dataEnd[0].lat;

            // Route
            const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${sLon},${sLat};${eLon},${eLat}?overview=full&geometries=geojson`);
            const routeData = await routeRes.json();
            
            if (routeData.code !== 'Ok' || !routeData.routes.length) {
                alert("Could not find a route");
                setLoading(false);
                return;
            }

            const routeGeoJSON = routeData.routes[0].geometry;
            const coords = routeGeoJSON.coordinates;
            
            // Calculate route bbox for API call
            const lons = coords.map(c => c[0]);
            const lats = coords.map(c => c[1]);
            const minLon = Math.min(...lons);
            const minLat = Math.min(...lats);
            const maxLon = Math.max(...lons);
            const maxLat = Math.max(...lats);
            const routeBbox = `${minLon},${minLat},${maxLon},${maxLat}`;

            // Get potholes from real API for this route's bbox
            const potholesData = await api.fetchPotholes(routeBbox);
            const realPotholes = potholesData?.features || [];
            
            // Create segments and count potholes
            const features = [];
            for (let i = 0; i < coords.length - 1; i++) {
                const p1 = coords[i];
                const p2 = coords[i+1];
                let count = 0;
                
                for (const pothole of realPotholes) {
                    const pt = pothole.geometry.coordinates;
                    // dist in degrees squared
                    const distSq = distToSegmentSquared(pt, p1, p2);
                    // approx distance in meters
                    const distM = Math.sqrt(distSq) * DEG_TO_M;
                    if (distM < 150) { // within 150 meters
                        count += (pothole.properties.severity === 'HIGH' ? 2 : 1);
                    }
                }

                features.push({
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: [p1, p2]
                    },
                    properties: {
                        potholeCount: count
                    }
                });
            }

            const routeCollection = {
                type: "FeatureCollection",
                features: features
            };

            const map = mapRef.current?.getMap?.() || mapRef.current?.current || mapRef.current;
            if (map && map.getSource) {
                if (map.getSource('route-source')) {
                    map.getSource('route-source').setData(routeCollection);
                } else {
                    map.addSource('route-source', {
                        type: 'geojson',
                        data: routeCollection
                    });
                    
                    // Add background line for visibility
                    map.addLayer({
                        id: 'route-line-bg',
                        type: 'line',
                        source: 'route-source',
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': '#000000',
                            'line-width': 8,
                            'line-opacity': 0.3
                        }
                    });

                    map.addLayer({
                        id: 'route-line',
                        type: 'line',
                        source: 'route-source',
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': [
                                'step',
                                ['get', 'potholeCount'],
                                '#22c55e', // 0: Green (No potholes)
                                1,
                                '#eab308', // 1: Yellow (Some potholes)
                                3,
                                '#ef4444'  // >= 3: Red (Many/severe potholes)
                            ],
                            'line-width': 5
                        }
                    });
                }
                
                // Fit bounds
                const bounds = new maplibregl.LngLatBounds(coords[0], coords[0]);
                for (const coord of coords) {
                    bounds.extend(coord);
                }
                map.fitBounds(bounds, { padding: 50 });
            }
        } catch (err) {
            console.error(err);
            alert("Error routing");
        }
        setLoading(false);
    };

    if (!isOpen) {
        return html`
            <div className="absolute top-20 right-4 pointer-events-auto z-40">
                <button 
                    onClick=${() => setIsOpen(true)}
                    className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-gray-700 hover:text-blue-600 transition-colors"
                    title="Find Route"
                >
                    <${Navigation} size=${24} />
                </button>
            </div>
        `;
    }

    return html`
        <div className="absolute top-20 right-4 pointer-events-auto z-40 bg-white rounded-xl shadow-xl w-80 overflow-hidden border border-gray-100">
            <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-2 font-bold text-gray-700">
                    <${Navigation} size=${18} className="text-blue-600" />
                    Find Route
                </div>
                <button onClick=${() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <${X} size=${20} />
                </button>
            </div>
            <div className="p-4 space-y-4">
                <div className="relative">
                    <div className="absolute left-3 top-3.5 text-gray-400">
                        <${MapPin} size=${16} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Start location..." 
                        value=${start}
                        onChange=${e => setStart(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="relative">
                    <div className="absolute left-3 top-3.5 text-red-400">
                        <${MapPin} size=${16} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="End location..." 
                        value=${end}
                        onChange=${e => setEnd(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button 
                    onClick=${handleRoute}
                    disabled=${loading}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    ${loading ? 'Routing...' : 'Show Route'}
                </button>
            </div>
        </div>
    `;
}
