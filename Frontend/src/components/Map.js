import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import maplibregl from 'maplibre-gl';
import { html } from '../utils.js';
import { api } from '../api/mockService.js';

const CONDITION_COLORS = {
    "GOOD": "#22c55e",       // Green
    "MODERATE": "#eab308",   // Amber
    "POOR": "#f97316",       // Orange
    "HIGH_RISK": "#ef4444"   // Red
};

export const MapComponent = forwardRef(function MapComponent({ onHazardClick, onUserLocationChange }, ref) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const isMapLoaded = useRef(false);
    const userMarkerRef = useRef(null);
    const destMarkerRef = useRef(null);
    const locationWatchRef = useRef(null);

    // Initial default location (Bangalore)
    const [currentLoc, setCurrentLoc] = useState([77.5946, 12.9716]);
    const currentLocRef = useRef([77.5946, 12.9716]);

    // Queued data in case methods are called before map load
    const pendingData = useRef({
        mode: 'nearby', // 'nearby' | 'routes'
        nearbySegments: null,
        routes: null,
        selectedIndex: 0,
        destinationCoords: null
    });

    const applyNearbySegments = (segmentsGeoJSON) => {
        if (!map.current || !isMapLoaded.current) {
            pendingData.current.mode = 'nearby';
            pendingData.current.nearbySegments = segmentsGeoJSON;
            return;
        }

        const source = map.current.getSource('nearby-segments');
        if (source) {
            source.setData(segmentsGeoJSON || { type: 'FeatureCollection', features: [] });
        }
        
        // Hide routes
        const routesSource = map.current.getSource('routes-source');
        if (routesSource) {
            routesSource.setData({ type: 'FeatureCollection', features: [] });
        }

        if (destMarkerRef.current) {
            destMarkerRef.current.remove();
            destMarkerRef.current = null;
        }
    };

    const applyRoutes = (routes, selectedIndex, destinationCoords) => {
        if (!map.current || !isMapLoaded.current) {
            pendingData.current.mode = 'routes';
            pendingData.current.routes = routes;
            pendingData.current.selectedIndex = selectedIndex;
            pendingData.current.destinationCoords = destinationCoords;
            return;
        }

        // Hide nearby segments
        const nearbySource = map.current.getSource('nearby-segments');
        if (nearbySource) {
            nearbySource.setData({ type: 'FeatureCollection', features: [] });
        }

        // Build GeoJSON for routes
        const features = [];
        (routes || []).forEach((route, rIdx) => {
            const isSelected = rIdx === selectedIndex;
            (route.segments || []).forEach((seg) => {
                features.push({
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: seg.coordinates },
                    properties: {
                        routeId: route.id,
                        isSelected: isSelected,
                        conditionLevel: seg.conditionLevel
                    }
                });
            });
        });

        const routesSource = map.current.getSource('routes-source');
        if (routesSource) {
            routesSource.setData({ type: 'FeatureCollection', features });
        }

        // Set destination marker
        if (destinationCoords) {
            if (destMarkerRef.current) {
                destMarkerRef.current.remove();
            }
            
            const el = document.createElement('div');
            el.className = 'dest-marker';
            el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3" fill="#ffffff"></circle></svg>';
            
            destMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
                .setLngLat(destinationCoords)
                .addTo(map.current);

            // Fit bounds to show start and end
            try {
                const bounds = new maplibregl.LngLatBounds();
                bounds.extend(currentLocRef.current);
                bounds.extend(destinationCoords);
                map.current.fitBounds(bounds, { padding: 80, duration: 1000 });
            } catch (err) {
                console.warn("Could not fit bounds:", err);
            }
        }
    };

    useImperativeHandle(ref, () => ({
        flyTo(lng, lat) {
            if (map.current) {
                map.current.flyTo({ center: [lng, lat], zoom: 14, duration: 1500 });
            }
        },
        showNearbySegments(segmentsGeoJSON) {
            applyNearbySegments(segmentsGeoJSON);
        },
        showRoutes(routes, selectedIndex, destinationCoords) {
            applyRoutes(routes, selectedIndex, destinationCoords);
        },
        clearRoutes() {
            if (map.current && isMapLoaded.current) {
                const routesSource = map.current.getSource('routes-source');
                if (routesSource) {
                    routesSource.setData({ type: 'FeatureCollection', features: [] });
                }
            }
            if (destMarkerRef.current) {
                destMarkerRef.current.remove();
                destMarkerRef.current = null;
            }
            if (map.current) {
                map.current.flyTo({ center: currentLocRef.current, zoom: 15, duration: 1000 });
            }
        },
        setUserLocation(lng, lat) {
            currentLocRef.current = [lng, lat];
            setCurrentLoc([lng, lat]);
            updateUserMarker(lng, lat);
            if (map.current) {
                map.current.flyTo({ center: [lng, lat], zoom: 15, duration: 1000 });
            }
        },
        getCurrentLocation() {
            return requestCurrentLocation();
        },
        startNavigation() {
            return requestCurrentLocation().then((coords) => {
                if (navigator.geolocation && locationWatchRef.current === null) {
                    locationWatchRef.current = navigator.geolocation.watchPosition(
                        (pos) => updateLocation([pos.coords.longitude, pos.coords.latitude], true),
                        (err) => console.warn('Navigation location update failed:', err),
                        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
                    );
                }
                return coords;
            });
        },
        stopNavigation() {
            if (locationWatchRef.current !== null && navigator.geolocation) {
                navigator.geolocation.clearWatch(locationWatchRef.current);
                locationWatchRef.current = null;
            }
        }
    }));

    const updateUserMarker = (lng, lat) => {
        if (!map.current) return;
        if (!userMarkerRef.current) {
            const el = document.createElement('div');
            el.className = 'user-location-marker';
            el.innerHTML = '<div class="pulse"></div><div class="dot"></div>';
            userMarkerRef.current = new maplibregl.Marker({ element: el })
                .setLngLat([lng, lat])
                .addTo(map.current);
        } else {
            userMarkerRef.current.setLngLat([lng, lat]);
        }
    };

    const updateLocation = (coords, follow = false) => {
        currentLocRef.current = coords;
        setCurrentLoc(coords);
        updateUserMarker(coords[0], coords[1]);
        if (map.current && follow) {
            map.current.easeTo({ center: coords, zoom: Math.max(map.current.getZoom(), 16), duration: 700 });
        }
        if (onUserLocationChange) onUserLocationChange(coords);
    };

    const requestCurrentLocation = () => new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(currentLocRef.current);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = [pos.coords.longitude, pos.coords.latitude];
                updateLocation(coords, true);
                resolve(coords);
            },
            (err) => {
                console.warn('Geolocation fallback to current map location:', err);
                resolve(currentLocRef.current);
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
    });

    const handleLocateClick = () => {
        requestCurrentLocation().then((coords) => {
            if (map.current) map.current.flyTo({ center: coords, zoom: 15, duration: 1000 });
        });
    };

    useEffect(() => {
        if (map.current) return; // init once
        
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            center: currentLocRef.current,
            zoom: 15
        });

        map.current.on('error', (e) => {
            console.warn('MapLibre error:', e);
        });

        map.current.on('load', async () => {
            isMapLoaded.current = true;
            updateUserMarker(currentLocRef.current[0], currentLocRef.current[1]);

            // Add nearby segments source
            map.current.addSource('nearby-segments', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            // Add nearby segments layer (State A)
            map.current.addLayer({
                id: 'nearby-segments-layer',
                type: 'line',
                source: 'nearby-segments',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': [
                        'match', ['get', 'conditionLevel'],
                        'GOOD', CONDITION_COLORS.GOOD,
                        'MODERATE', CONDITION_COLORS.MODERATE,
                        'POOR', CONDITION_COLORS.POOR,
                        'HIGH_RISK', CONDITION_COLORS.HIGH_RISK,
                        '#9ca3af'
                    ],
                    'line-width': 6,
                    'line-opacity': 0.95
                }
            });

            // Add routes source (State B)
            map.current.addSource('routes-source', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            // Add routes layer - Unselected backgrounds
            map.current.addLayer({
                id: 'routes-bg-layer',
                type: 'line',
                source: 'routes-source',
                filter: ['==', ['get', 'isSelected'], false],
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': [
                        'match', ['get', 'conditionLevel'],
                        'GOOD', CONDITION_COLORS.GOOD,
                        'MODERATE', CONDITION_COLORS.MODERATE,
                        'POOR', CONDITION_COLORS.POOR,
                        'HIGH_RISK', CONDITION_COLORS.HIGH_RISK,
                        '#9ca3af'
                    ],
                    'line-width': 4,
                    'line-opacity': 0.4
                }
            });

            // Add routes layer - Selected foreground
            map.current.addLayer({
                id: 'routes-fg-layer',
                type: 'line',
                source: 'routes-source',
                filter: ['==', ['get', 'isSelected'], true],
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': [
                        'match', ['get', 'conditionLevel'],
                        'GOOD', CONDITION_COLORS.GOOD,
                        'MODERATE', CONDITION_COLORS.MODERATE,
                        'POOR', CONDITION_COLORS.POOR,
                        'HIGH_RISK', CONDITION_COLORS.HIGH_RISK,
                        '#9ca3af'
                    ],
                    'line-width': 8,
                    'line-opacity': 1.0
                }
            });

            // Add secondary pothole points layer
            map.current.addSource('potholes-source', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            map.current.addLayer({
                id: 'pothole-points',
                type: 'circle',
                source: 'potholes-source',
                paint: {
                    'circle-color': '#ef4444',
                    'circle-radius': 5,
                    'circle-stroke-width': 1.5,
                    'circle-stroke-color': '#ffffff',
                    'circle-opacity': 0.85
                }
            });

            // Handle clicks on potholes
            map.current.on('click', 'pothole-points', (e) => {
                if (e.features && e.features.length > 0) {
                    const properties = e.features[0].properties;
                    onHazardClick(properties);
                }
            });
            map.current.on('mouseenter', 'pothole-points', () => { map.current.getCanvas().style.cursor = 'pointer'; });
            map.current.on('mouseleave', 'pothole-points', () => { map.current.getCanvas().style.cursor = ''; });

            // Fetch initial pothole points
            try {
                const potholeData = await api.fetchPotholes();
                if (map.current.getSource('potholes-source')) {
                    map.current.getSource('potholes-source').setData(potholeData);
                }
            } catch (err) {
                console.warn("Error fetching initial potholes:", err);
            }

            // Apply any pending data
            if (pendingData.current.mode === 'routes' && pendingData.current.routes) {
                applyRoutes(
                    pendingData.current.routes,
                    pendingData.current.selectedIndex,
                    pendingData.current.destinationCoords
                );
            } else if (pendingData.current.nearbySegments) {
                applyNearbySegments(pendingData.current.nearbySegments);
            } else {
                // Default: fetch nearby segments for current location
                try {
                    const segments = await api.fetchNearbySegments(currentLocRef.current[1], currentLocRef.current[0]);
                    applyNearbySegments(segments);
                } catch (err) {
                    console.warn("Error fetching nearby segments on load:", err);
                }
            }
        });

        return () => {
            if (locationWatchRef.current !== null && navigator.geolocation) {
                navigator.geolocation.clearWatch(locationWatchRef.current);
            }
            map.current?.remove();
            map.current = null;
        };
    }, []);

    return html`
        <div ref=${mapContainer} className="map-container" />
        <button 
            onClick=${handleLocateClick}
            className="absolute bottom-6 right-4 z-40 bg-white p-3 rounded-full shadow-lg border border-gray-100 text-blue-600 hover:bg-gray-50 focus:outline-none pointer-events-auto transition-transform active:scale-95"
            title="Current Location"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>
        </button>
    `;
});
