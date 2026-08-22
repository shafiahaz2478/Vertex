import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { html } from './utils.js';
import { api } from './api/mockService.js';

import { MapComponent } from './components/Map.js';
import { SearchBox } from './components/SearchBox.js';
import { HazardPanel } from './components/HazardPanel.js';
import { MainMenu } from './components/MainMenu.js';
import { DashcamFlow } from './components/DashcamFlow.js';
import { PhoneCameraFlow } from './components/PhoneCameraFlow.js';
import { MyReports } from './components/MyReports.js';
import { ReportHazard } from './components/ReportHazard.js';
import { RoutePanel } from './components/RoutePanel.js';
import { AlertCircle } from 'lucide-react';

function App() {
    const [selectedHazard, setSelectedHazard] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [proximityAlert, setProximityAlert] = useState(null);
    const [showPotholes, setShowPotholes] = useState(true);
    
    // State machine for Map
    const [destination, setDestination] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    const [userLoc, setUserLoc] = useState([77.5946, 12.9716]); // Fallback Bangalore
    const [navigationActive, setNavigationActive] = useState(false);

    const mapRef = useRef(null);

    // Auto-detect and sync live location on initial startup
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const liveCoords = [pos.coords.longitude, pos.coords.latitude];
                    setUserLoc(liveCoords);
                    mapRef.current?.setUserLocation(liveCoords[0], liveCoords[1]);
                },
                (err) => {
                    console.info('Live location prompt dismissed/offline; using fallback:', err.message);
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
            );
        }
    }, []);

    // Simulate Proximity Alert system
    useEffect(() => {
        const alertInterval = setInterval(async () => {
            const result = await api.checkProximity({
                latitude: userLoc[1],
                longitude: userLoc[0],
                heading_degrees: 45,
                speed_kmh: 40
            });
            if (result.alert) {
                setProximityAlert(result);
                setTimeout(() => setProximityAlert(null), 5000);
            }
        }, 12000);

        return () => clearInterval(alertInterval);
    }, [userLoc]);

    // Effect for State A: Strictly load backend road condition segments for initial map view
    useEffect(() => {
        if (!destination && !navigationActive) {
            const loadNearby = async () => {
                const segments = await api.fetchNearbySegments(userLoc[1], userLoc[0], 500);
                if (mapRef.current) {
                    mapRef.current.showNearbySegments(segments);
                }
            };
            loadNearby();
        }
    }, [destination, userLoc, navigationActive]);

    // Effect for State B: Destination Selected -> Load routes with exact coordinates
    useEffect(() => {
        if (destination && !navigationActive) {
            setSelectedHazard(null); // Clear hazard card to prevent overlapping
            const loadRoutes = async () => {
                const fetchedRoutes = await api.fetchRoutes(destination.id, userLoc, destination.coordinates);
                setRoutes(fetchedRoutes);
                setSelectedRouteIndex(0);
                if (mapRef.current && fetchedRoutes.length > 0) {
                    mapRef.current.showRoutes(fetchedRoutes, 0, destination.coordinates);
                }
            };
            loadRoutes();
        }
    }, [destination]);

    // Effect for updating selected route highlight
    useEffect(() => {
        if (destination && !navigationActive && routes.length > 0 && mapRef.current) {
            mapRef.current.showRoutes(routes, selectedRouteIndex, destination.coordinates);
        }
    }, [selectedRouteIndex]);

    const handleDestinationSelect = (dest) => {
        setSelectedHazard(null);
        setNavigationActive(false);
        mapRef.current?.stopNavigation();
        setDestination(dest);
    };

    const handleDestinationClear = () => {
        setNavigationActive(false);
        mapRef.current?.stopNavigation();
        setDestination(null);
        setRoutes([]);
        setSelectedHazard(null);
        if (mapRef.current) {
            mapRef.current.clearRoutes();
        }
    };

    const handleUserLocationChange = (coords) => {
        setUserLoc(coords);
    };

    const handleRouteClickOnMap = (routeIndex) => {
        if (typeof routeIndex === 'number' && routeIndex >= 0 && routeIndex < routes.length) {
            setSelectedRouteIndex(routeIndex);
        }
    };

    const handleStartNavigation = async () => {
        if (!destination || !mapRef.current) return;
        setSelectedHazard(null);
        const currentLocation = await mapRef.current.startNavigation();
        setUserLoc(currentLocation);
        
        const activeRoute = routes[selectedRouteIndex] || routes[0];
        if (activeRoute) {
            mapRef.current.enterNavigationMode(activeRoute);
        }
        setNavigationActive(true);
    };

    const handleStopNavigation = () => {
        mapRef.current?.stopNavigation();
        setNavigationActive(false);
        if (destination && routes.length > 0 && mapRef.current) {
            mapRef.current.showRoutes(routes, selectedRouteIndex, destination.coordinates);
        }
    };

    const handleSegmentClick = (segmentProps) => {
        setSelectedHazard({
            road_name: segmentProps.name,
            severity: segmentProps.conditionLevel === 'HIGH_RISK' || segmentProps.conditionLevel === 'POOR' ? 'HIGH' : segmentProps.conditionLevel === 'MODERATE' ? 'MEDIUM' : 'LOW',
            lane: segmentProps.lane_advice?.includes('Left') ? 'Left Lane Hazard' : segmentProps.lane_advice?.includes('Right') ? 'Right Lane Hazard' : 'All Lanes Good',
            potholes_per_km: segmentProps.potholes_per_km,
            lane_advice: segmentProps.lane_advice,
            confidence: 0.92,
            verified_count: segmentProps.potholeCount || 1,
            status: 'Verified',
            detected_at: new Date().toISOString()
        });
    };

    return html`
        <${MapComponent} 
            ref=${mapRef} 
            onHazardClick=${(hazard) => setSelectedHazard(hazard)}
            onSegmentClick=${handleSegmentClick}
            onRouteClick=${handleRouteClickOnMap}
            onUserLocationChange=${handleUserLocationChange}
            showPotholes=${showPotholes}
            isOnRoute=${!!destination}
        />
        
        <div className="ui-layer">
            ${!navigationActive && html`
                <${SearchBox}
                    userCoords=${userLoc}
                    onDestinationSelect=${handleDestinationSelect}
                    onDestinationClear=${handleDestinationClear}
                />
                <${MainMenu} onSelectMode=${(mode) => setActiveModal(mode)} />
            `}
            
            ${proximityAlert && html`
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 pointer-events-none z-50 transition-all duration-300">
                    <div className="bg-red-500/95 backdrop-blur-md text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold border border-white/20 text-sm animate-bounce">
                        <${AlertCircle} size=${22} />
                        ${proximityAlert.message}
                    </div>
                </div>
            `}

            ${!destination && !navigationActive && html`
                <${HazardPanel} hazard=${selectedHazard} onClose=${() => setSelectedHazard(null)} />
            `}
            
            ${destination && html`
                <${RoutePanel} 
                    routes=${routes} 
                    selectedIndex=${selectedRouteIndex} 
                    onSelectRoute=${(idx) => setSelectedRouteIndex(idx)} 
                    navigationActive=${navigationActive}
                    onStartNavigation=${handleStartNavigation}
                    onStopNavigation=${handleStopNavigation}
                    onClose=${handleDestinationClear}
                />
            `}

            ${activeModal === 'report' && html`<${ReportHazard} onClose=${() => setActiveModal(null)} />`}
            ${activeModal === 'dashcam' && html`<${DashcamFlow} onClose=${() => setActiveModal(null)} />`}
            ${activeModal === 'phone' && html`<${PhoneCameraFlow} onClose=${() => setActiveModal(null)} />`}
            ${activeModal === 'reports' && html`<${MyReports} onClose=${() => setActiveModal(null)} />`}

            <div 
                className="absolute bottom-6 right-20 z-40 bg-white p-3 rounded-full shadow-lg border border-gray-100 text-blue-600 hover:bg-gray-50 focus:outline-none pointer-events-auto cursor-pointer font-bold text-sm"
                onClick=${() => setShowPotholes(!showPotholes)}
            >
                ${showPotholes ? 'Hide Potholes' : 'Show Potholes'}
            </div>
        </div>
    `;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);

