import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import maplibregl from 'maplibre-gl';
import { html } from '../utils.js';
import { api } from '../api/mockService.js';

// Predefined 3-Color Standard (based on potholes/km):
// - Level 1: GOOD (< 2.0 potholes/km) -> Green (#22c55e)
// - Level 2: MODERATE (2.0 - 5.0 potholes/km) -> Yellow (#eab308)
// - Level 3: HIGH_RISK (> 5.0 potholes/km) -> Red (#ef4444)
const CONDITION_COLORS = {
    "GOOD": "#22c55e",       // Green (< 2.0 potholes/km)
    "MODERATE": "#eab308",   // Yellow (2.0 - 5.0 potholes/km)
    "HIGH_RISK": "#ef4444",  // Red (> 5.0 potholes/km)
    "POOR": "#ef4444"        // Red (alias for compatibility)
};

const bearingBetween = ([lng1, lat1], [lng2, lat2]) => {
    const radians = Math.PI / 180;
    const y = Math.sin((lng2 - lng1) * radians) * Math.cos(lat2 * radians);
    const x = Math.cos(lat1 * radians) * Math.sin(lat2 * radians)
        - Math.sin(lat1 * radians) * Math.cos(lat2 * radians) * Math.cos((lng2 - lng1) * radians);
    return (Math.atan2(y, x) / radians + 360) % 360;
};

// Distance in meters between two coordinates (Haversine formula)
const distanceMeters = ([lng1, lat1], [lng2, lat2]) => {
    const R = 6371000; // meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const routeCoordinates = (route) => (route?.segments || []).flatMap(segment => segment.coordinates || []);

export const MapComponent = forwardRef(function MapComponent({ onHazardClick, onSegmentClick, onRouteClick, onUserLocationChange, showPotholes = true, isOnRoute = false }, ref) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const isMapLoaded = useRef(false);
    const userMarkerRef = useRef(null);
    const destMarkerRef = useRef(null);
    const locationWatchRef = useRef(null);
    const isAnimatingRef = useRef(false);
    const navigationRef = useRef({ active: false, bearing: 0, is3D: true, activeRoute: null });

    // Initial default location (Bangalore / fallback)
    const [currentLoc, setCurrentLoc] = useState([77.5946, 12.9716]);
    const currentLocRef = useRef([77.5946, 12.9716]);
    const [is3DMode, setIs3DMode] = useState(false);

    const activeRouteRef = useRef(null);
    const showPotholesRef = useRef(true);
    const isOnRouteRef = useRef(false);

    useEffect(() => {
        showPotholesRef.current = showPotholes !== false;
        isOnRouteRef.current = !!isOnRoute;
        if (map.current && isMapLoaded.current) {
            window.dispatchEvent(new Event('potholes:updated'));
        }
    }, [showPotholes, isOnRoute]);

    // Queued data in case methods are called before map load
    const pendingData = useRef({
        mode: 'nearby', // 'nearby' | 'routes'
        nearbySegments: null,
        routes: null,
        selectedIndex: 0,
        destinationCoords: null
    });

    const applyNearbySegments = (segmentsGeoJSON) => {
        activeRouteRef.current = null;
        pendingData.current.mode = 'nearby';
        pendingData.current.nearbySegments = segmentsGeoJSON;

        if (!map.current || !isMapLoaded.current) {
            return;
        }

        const source = map.current.getSource('nearby-segments');
        if (source) {
            source.setData(segmentsGeoJSON || { type: 'FeatureCollection', features: [] });
        }
        
        map.current.getSource('routes-source')?.setData({ type: 'FeatureCollection', features: [] });
        map.current.getSource('navigation-route')?.setData({ type: 'FeatureCollection', features: [] });

        if (destMarkerRef.current) {
            destMarkerRef.current.remove();
            destMarkerRef.current = null;
        }
    };

    const applyRoutes = (routes, selectedIndex, destinationCoords) => {
        activeRouteRef.current = routes?.[selectedIndex] || null;
        pendingData.current.mode = 'routes';
        pendingData.current.routes = routes;
        pendingData.current.selectedIndex = selectedIndex;
        pendingData.current.destinationCoords = destinationCoords;

        if (!map.current || !isMapLoaded.current) {
            return;
        }

        map.current.getSource('nearby-segments')?.setData({ type: 'FeatureCollection', features: [] });
        map.current.getSource('navigation-route')?.setData({ type: 'FeatureCollection', features: [] });

        const features = [];
        (routes || []).forEach((route, rIdx) => {
            const isSelected = rIdx === selectedIndex;
            (route.segments || []).forEach((seg) => {
                features.push({
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: seg.coordinates },
                    properties: {
                        routeId: route.id,
                        routeIndex: rIdx,
                        isSelected: isSelected,
                        conditionLevel: seg.conditionLevel || 'GOOD',
                        potholes_per_km: seg.potholes_per_km || 0,
                        lane_advice: seg.lane_advice || '',
                        approx_hazard_lane: seg.approx_hazard_lane || ''
                    }
                });
            });
        });

        const routesSource = map.current.getSource('routes-source');
        if (routesSource) {
            routesSource.setData({ type: 'FeatureCollection', features });
        }

        if (destinationCoords) {
            if (destMarkerRef.current) {
                destMarkerRef.current.remove();
            }
            
            const el = document.createElement('div');
            el.className = 'dest-marker';
            el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3" fill="#ffffff"></circle></svg>';
            
            destMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
                .setLngLat(destinationCoords)
                .addTo(map.current);

            try {
                const bounds = new maplibregl.LngLatBounds();
                bounds.extend(currentLocRef.current);
                bounds.extend(destinationCoords);
                map.current.fitBounds(bounds, { padding: 90, duration: 900 });
            } catch (err) {
                console.warn("Could not fit bounds:", err);
            }
        }
    };

    const setNavigationRoute = (route) => {
        if (!map.current || !route) return;
        
        map.current.getSource('routes-source')?.setData({ type: 'FeatureCollection', features: [] });
        map.current.getSource('nearby-segments')?.setData({ type: 'FeatureCollection', features: [] });

        const features = (route.segments || []).map((seg) => ({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: seg.coordinates },
            properties: {
                conditionLevel: seg.conditionLevel || 'GOOD',
                potholes_per_km: seg.potholes_per_km || 0,
                lane_advice: seg.lane_advice || ''
            }
        }));

        map.current.getSource('navigation-route')?.setData({
            type: 'FeatureCollection',
            features: features.length > 0 ? features : [{
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: routeCoordinates(route) },
                properties: { conditionLevel: 'GOOD' }
            }]
        });
    };

    useImperativeHandle(ref, () => ({
        flyTo(lng, lat) {
            if (map.current) {
                map.current.flyTo({ center: [lng, lat], zoom: 15, duration: 1000 });
            }
        },
        showNearbySegments(segmentsGeoJSON) {
            applyNearbySegments(segmentsGeoJSON);
        },
        showRoutes(routes, selectedIndex, destinationCoords) {
            applyRoutes(routes, selectedIndex, destinationCoords);
        },
        enterNavigationMode(route) {
            if (!map.current || !route) return;
            const coordinates = routeCoordinates(route);
            const routeBearing = coordinates.length > 1
                ? bearingBetween(coordinates[0], coordinates[1])
                : navigationRef.current.bearing;
            
            navigationRef.current = { active: true, bearing: routeBearing, is3D: true, activeRoute: route };
            setIs3DMode(true);
            
            updateUserMarker(currentLocRef.current[0], currentLocRef.current[1], routeBearing);
            setNavigationRoute(route);
            enable3DBuildings();

            isAnimatingRef.current = true;
            map.current.stop();
            map.current.easeTo({
                center: currentLocRef.current,
                zoom: 17.5,
                pitch: 60,
                bearing: routeBearing,
                duration: 900,
                essential: true
            });
            setTimeout(() => { isAnimatingRef.current = false; }, 950);
        },
        clearRoutes() {
            pendingData.current.mode = 'nearby';
            if (map.current && isMapLoaded.current) {
                map.current.getSource('routes-source')?.setData({ type: 'FeatureCollection', features: [] });
                map.current.getSource('navigation-route')?.setData({ type: 'FeatureCollection', features: [] });
            }
            if (destMarkerRef.current) {
                destMarkerRef.current.remove();
                destMarkerRef.current = null;
            }
            setIs3DMode(false);
            navigationRef.current.active = false;
            if (map.current) {
                map.current.stop();
                map.current.easeTo({ center: currentLocRef.current, zoom: 15, pitch: 0, bearing: 0, duration: 750 });
            }
            if (pendingData.current.nearbySegments) {
                applyNearbySegments(pendingData.current.nearbySegments);
            }
        },
        setUserLocation(lng, lat) {
            currentLocRef.current = [lng, lat];
            setCurrentLoc([lng, lat]);
            updateUserMarker(lng, lat);
            if (map.current && !navigationRef.current.active) {
                map.current.flyTo({ center: [lng, lat], zoom: 15, duration: 900 });
            }
        },
        getCurrentLocation() {
            return requestCurrentLocation();
        },
        startNavigation() {
            return requestCurrentLocation().then((coords) => {
                if (navigator.geolocation && locationWatchRef.current === null) {
                    locationWatchRef.current = navigator.geolocation.watchPosition(
                        (pos) => updateLocation([pos.coords.longitude, pos.coords.latitude], true, pos.coords.heading),
                        (err) => console.warn('Navigation location update failed:', err),
                        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
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
            navigationRef.current.active = false;
            setIs3DMode(false);
            updateUserMarker(currentLocRef.current[0], currentLocRef.current[1], 0);
            if (map.current) {
                map.current.stop();
                map.current.getSource('navigation-route')?.setData({ type: 'FeatureCollection', features: [] });
                map.current.easeTo({ pitch: 0, bearing: 0, zoom: 15, duration: 750, essential: true });
            }
            if (pendingData.current.nearbySegments) {
                applyNearbySegments(pendingData.current.nearbySegments);
            }
        }
    }));

    const updateUserMarker = (lng, lat, bearing = navigationRef.current.bearing) => {
        if (!map.current) return;
        if (!userMarkerRef.current) {
            const el = document.createElement('div');
            el.className = 'user-location-marker';
            el.innerHTML = `
                <div class="pulse"></div>
                <div class="dot"></div>
                <div class="navigation-pointer">
                    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="22" cy="22" r="16" fill="rgba(37, 99, 235, 0.2)" stroke="#ffffff" stroke-width="2"/>
                        <path d="M22 6L33 34L22 28L11 34L22 6Z" fill="#2563eb" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
                    </svg>
                </div>
            `;
            userMarkerRef.current = new maplibregl.Marker({ element: el })
                .setLngLat([lng, lat])
                .addTo(map.current);
        } else {
            userMarkerRef.current.setLngLat([lng, lat]);
        }
        
        const marker = userMarkerRef.current.getElement();
        marker.classList.toggle('is-navigating', navigationRef.current.active);
        const pointer = marker.querySelector('.navigation-pointer');
        if (pointer) {
            pointer.style.transform = `translate(-50%, -50%) rotate(${bearing}deg)`;
        }
    };

    const enable3DBuildings = () => {
        if (!map.current || map.current.getLayer('navigation-buildings')) return;
        try {
            const vectorSource = Object.entries(map.current.getStyle().sources)
                .find(([, source]) => source.type === 'vector')?.[0];
            if (!vectorSource) return;
            const labelLayer = map.current.getStyle().layers.find(layer => layer.type === 'symbol' && layer.layout?.['text-field'])?.id;
            map.current.addLayer({
                id: 'navigation-buildings',
                type: 'fill-extrusion',
                source: vectorSource,
                'source-layer': 'building',
                minzoom: 15,
                paint: {
                    'fill-extrusion-color': '#d1dced',
                    'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 10],
                    'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
                    'fill-extrusion-opacity': 0.85
                }
            }, labelLayer);
        } catch (error) {
            console.warn('3D buildings are not available in this basemap style.', error);
        }
    };

    // Smooth location update filter
    const updateLocation = (coords, follow = false, reportedHeading = null) => {
        const previousCoords = currentLocRef.current;
        const distMoved = distanceMeters(previousCoords, coords);
        
        let heading = navigationRef.current.bearing;
        if (distMoved >= 2.5) {
            const movementBearing = bearingBetween(previousCoords, coords);
            heading = Number.isFinite(reportedHeading) && reportedHeading >= 0 ? reportedHeading : movementBearing;
        } else if (Number.isFinite(reportedHeading) && reportedHeading >= 0) {
            heading = reportedHeading;
        }

        if (navigationRef.current.active) navigationRef.current.bearing = heading;
        currentLocRef.current = coords;
        setCurrentLoc(coords);
        updateUserMarker(coords[0], coords[1], heading);
        
        if (map.current && follow && navigationRef.current.active && !isAnimatingRef.current) {
            map.current.easeTo({
                center: coords,
                zoom: 17.5,
                pitch: 60,
                bearing: heading,
                duration: 500,
                essential: true
            });
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
                updateLocation(coords, false);
                resolve(coords);
            },
            (err) => {
                console.warn('Geolocation fallback to current map location:', err);
                resolve(currentLocRef.current);
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
        );
    });

    const handleLocateClick = () => {
        requestCurrentLocation().then((coords) => {
            if (map.current) {
                if (navigationRef.current.active) {
                    map.current.easeTo({ center: coords, zoom: 17.5, pitch: 60, bearing: navigationRef.current.bearing, duration: 750 });
                } else {
                    map.current.flyTo({ center: coords, zoom: 15, duration: 900 });
                }
            }
        });
    };

    const toggle3DView = () => {
        if (!map.current) return;
        const next3D = !is3DMode;
        setIs3DMode(next3D);
        if (next3D) {
            enable3DBuildings();
            map.current.easeTo({ pitch: 60, duration: 650 });
        } else {
            map.current.easeTo({ pitch: 0, duration: 650 });
        }
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

        const refreshViewportPotholes = async () => {
            if (!map.current || !isMapLoaded.current) return;
            
            if (!showPotholesRef.current) {
                map.current?.getSource('potholes-source')?.setData({ type: 'FeatureCollection', features: [] });
                return;
            }

            const bounds = map.current.getBounds();
            const bbox = [
                bounds.getWest(),
                bounds.getSouth(),
                bounds.getEast(),
                bounds.getNorth()
            ].join(',');
            try {
                const potholeData = await api.fetchPotholes(bbox);
                
                if (isOnRouteRef.current && activeRouteRef.current) {
                    const routePotholes = [];
                    activeRouteRef.current.segments.forEach(seg => {
                        if (seg.potholes) {
                            seg.potholes.forEach((coord, idx) => {
                                routePotholes.push({
                                    type: 'Feature',
                                    geometry: { type: 'Point', coordinates: coord },
                                    properties: { id: `route-pt-${idx}`, confidence: 0.9, severity: 'MEDIUM' }
                                });
                            });
                        }
                    });
                    map.current?.getSource('potholes-source')?.setData({ type: 'FeatureCollection', features: routePotholes });
                } else {
                    map.current?.getSource('potholes-source')?.setData(potholeData);
                }
            } catch (err) {
                console.warn('Error fetching viewport potholes:', err);
            }
        };

        map.current.on('load', async () => {
            isMapLoaded.current = true;
            updateUserMarker(currentLocRef.current[0], currentLocRef.current[1]);

            // ==========================================
            // 1. STATE A: ROAD CONDITION LANES (3-Color Density Lines)
            // ==========================================
            map.current.addSource('nearby-segments', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            // Crisp White Casing
            map.current.addLayer({
                id: 'nearby-segments-casing',
                type: 'line',
                source: 'nearby-segments',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 12,
                    'line-opacity': 0.98
                }
            });

            // 3-Color Condition Line
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
                        'HIGH_RISK', CONDITION_COLORS.HIGH_RISK,
                        'POOR', CONDITION_COLORS.POOR,
                        '#22c55e'
                    ],
                    'line-width': 8,
                    'line-opacity': 1.0
                }
            });

            // ==========================================
            // 2. STATE B: ROUTE OVERVIEW (Out of Navigation)
            // ==========================================
            map.current.addSource('routes-source', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            // Unselected Alternative Routes - Casing & 3 Colors
            map.current.addLayer({
                id: 'routes-bg-casing',
                type: 'line',
                source: 'routes-source',
                filter: ['==', ['get', 'isSelected'], false],
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 8,
                    'line-opacity': 0.75
                }
            });
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
                        'HIGH_RISK', CONDITION_COLORS.HIGH_RISK,
                        'POOR', CONDITION_COLORS.POOR,
                        '#9ca3af'
                    ],
                    'line-width': 5,
                    'line-opacity': 0.65
                }
            });

            // Selected Foreground Route - High Contrast Casing & 3 Colors
            map.current.addLayer({
                id: 'routes-fg-casing',
                type: 'line',
                source: 'routes-source',
                filter: ['==', ['get', 'isSelected'], true],
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 13,
                    'line-opacity': 0.98
                }
            });
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
                        'HIGH_RISK', CONDITION_COLORS.HIGH_RISK,
                        'POOR', CONDITION_COLORS.POOR,
                        '#22c55e'
                    ],
                    'line-width': 8.5,
                    'line-opacity': 1.0
                }
            });

            // ==========================================
            // 3. STATE C: ACTIVE 3D NAVIGATION ROUTE (3 Colors + Casing + Lane Dash)
            // ==========================================
            map.current.addSource('navigation-route', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            // 3D Navigation Outer Glow/Casing
            map.current.addLayer({
                id: 'navigation-route-casing',
                type: 'line',
                source: 'navigation-route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 16,
                    'line-opacity': 0.98
                }
            });

            // 3D Navigation Segmented 3-Color Line
            map.current.addLayer({
                id: 'navigation-route-line',
                type: 'line',
                source: 'navigation-route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': [
                        'match', ['get', 'conditionLevel'],
                        'GOOD', CONDITION_COLORS.GOOD,
                        'MODERATE', CONDITION_COLORS.MODERATE,
                        'HIGH_RISK', CONDITION_COLORS.HIGH_RISK,
                        'POOR', CONDITION_COLORS.POOR,
                        '#22c55e'
                    ],
                    'line-width': 10,
                    'line-opacity': 1.0
                }
            });

            // 3D Navigation Center Dashed Lane Divider
            map.current.addLayer({
                id: 'navigation-route-lane-dash',
                type: 'line',
                source: 'navigation-route',
                layout: { 'line-join': 'round', 'line-cap': 'butt' },
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 2,
                    'line-dasharray': [2, 3],
                    'line-opacity': 0.85
                }
            });

            // Segment click handler
            map.current.on('click', 'nearby-segments-layer', (e) => {
                if (e.features && e.features.length > 0 && onSegmentClick) {
                    onSegmentClick(e.features[0].properties);
                }
            });

            // Click directly on route lines on the map to switch routes!
            map.current.on('click', 'routes-bg-layer', (e) => {
                if (e.features && e.features.length > 0 && onRouteClick) {
                    const rIdx = e.features[0].properties.routeIndex;
                    onRouteClick(Number(rIdx));
                }
            });
            map.current.on('click', 'routes-fg-layer', (e) => {
                if (e.features && e.features.length > 0 && onRouteClick) {
                    const rIdx = e.features[0].properties.routeIndex;
                    onRouteClick(Number(rIdx));
                }
            });

            map.current.on('mouseenter', 'routes-bg-layer', () => { map.current.getCanvas().style.cursor = 'pointer'; });
            map.current.on('mouseleave', 'routes-bg-layer', () => { map.current.getCanvas().style.cursor = ''; });
            map.current.on('mouseenter', 'nearby-segments-layer', () => { map.current.getCanvas().style.cursor = 'pointer'; });
            map.current.on('mouseleave', 'nearby-segments-layer', () => { map.current.getCanvas().style.cursor = ''; });

            // Automatically detect and center on user's live GPS location on startup
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        const coords = [pos.coords.longitude, pos.coords.latitude];
                        currentLocRef.current = coords;
                        setCurrentLoc(coords);
                        updateUserMarker(coords[0], coords[1]);
                        map.current?.flyTo({ center: coords, zoom: 15, duration: 1000 });
                        if (onUserLocationChange) onUserLocationChange(coords);

                        // Load road segments for live coordinates
                        try {
                            const liveSegments = await api.fetchNearbySegments(coords[1], coords[0]);
                            applyNearbySegments(liveSegments);
                        } catch (e) {
                            console.warn("Could not load segments for live location:", e);
                        }
                    },
                    (err) => {
                        console.info('Live location not granted on startup; using default:', err.message);
                    },
                    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
                );
            }

            // Apply any pending data or load backend segments
            if (pendingData.current.mode === 'routes' && pendingData.current.routes) {
                applyRoutes(
                    pendingData.current.routes,
                    pendingData.current.selectedIndex,
                    pendingData.current.destinationCoords
                );
            } else if (pendingData.current.nearbySegments) {
                applyNearbySegments(pendingData.current.nearbySegments);
            } else {
                try {
                    const segments = await api.fetchNearbySegments(currentLocRef.current[1], currentLocRef.current[0]);
                    applyNearbySegments(segments);
                } catch (e) {
                    console.warn("Could not load backend nearby segments:", e);
                }
            }
            
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
                    if (onHazardClick) onHazardClick(properties);
                }
            });
            map.current.on('mouseenter', 'pothole-points', () => { map.current.getCanvas().style.cursor = 'pointer'; });
            map.current.on('mouseleave', 'pothole-points', () => { map.current.getCanvas().style.cursor = ''; });

            await refreshViewportPotholes();
        });

        map.current.on('moveend', refreshViewportPotholes);
        window.addEventListener('potholes:updated', refreshViewportPotholes);

        return () => {
            window.removeEventListener('potholes:updated', refreshViewportPotholes);
            if (locationWatchRef.current !== null && navigator.geolocation) {
                navigator.geolocation.clearWatch(locationWatchRef.current);
            }
            map.current?.remove();
            map.current = null;
        };
    }, []);

    return html`
        <div ref=${mapContainer} className="map-container" />
        
        <!-- Floating Map Controls (Locate & 3D Tilt Toggle) -->
        <div className="absolute bottom-6 right-4 z-40 flex flex-col gap-2.5 pointer-events-auto">
            <button 
                onClick=${toggle3DView}
                className="bg-white p-3 rounded-full shadow-lg border border-gray-100 text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus:outline-none transition-all active:scale-95 flex items-center justify-center font-bold text-xs"
                title=${is3DMode ? "Switch to 2D Top-Down View" : "Switch to 3D Navigation Perspective"}
            >
                ${is3DMode ? "2D" : "3D"}
            </button>
            
            <button 
                onClick=${handleLocateClick}
                className="bg-white p-3 rounded-full shadow-lg border border-gray-100 text-blue-600 hover:bg-gray-50 focus:outline-none transition-transform active:scale-95"
                title="Re-center on Live Location"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>
            </button>
        </div>
    `;
});
