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
    
    // State machine for Map
    const [destination, setDestination] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    const [userLoc, setUserLoc] = useState([77.5946, 12.9716]); // Default Bangalore
    const [navigationActive, setNavigationActive] = useState(false);

    const mapRef = useRef(null);

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
        }, 10000);

        return () => clearInterval(alertInterval);
    }, [userLoc]);

    // Effect for State A: No Destination -> Load nearby segments
    useEffect(() => {
        if (!destination) {
            const loadNearby = async () => {
                const segments = await api.fetchNearbySegments(userLoc[1], userLoc[0], 500);
                if (mapRef.current) {
                    mapRef.current.showNearbySegments(segments);
                }
            };
            loadNearby();
        }
    }, [destination, userLoc]);

    // Effect for State B: Destination Selected -> Load routes
    useEffect(() => {
        if (destination) {
            const loadRoutes = async () => {
                const fetchedRoutes = await api.fetchRoutes(destination.id, userLoc);
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
        if (destination && routes.length > 0 && mapRef.current) {
            mapRef.current.showRoutes(routes, selectedRouteIndex, destination.coordinates);
        }
    }, [selectedRouteIndex]);

    const handleDestinationSelect = (dest) => {
        setNavigationActive(false);
        mapRef.current?.stopNavigation();
        setDestination(dest);
    };

    const handleDestinationClear = () => {
        setNavigationActive(false);
        mapRef.current?.stopNavigation();
        setDestination(null);
        setRoutes([]);
        if (mapRef.current) {
            mapRef.current.clearRoutes();
        }
    };

    const handleUserLocationChange = (coords) => {
        setUserLoc(coords);
    };

    const handleStartNavigation = async () => {
        if (!destination || !mapRef.current) return;
        const currentLocation = await mapRef.current.startNavigation();
        setUserLoc(currentLocation);
        const refreshedRoutes = await api.fetchRoutes(destination.id, currentLocation);
        if (refreshedRoutes.length > 0) {
            setRoutes(refreshedRoutes);
            setSelectedRouteIndex(0);
            mapRef.current.showRoutes(refreshedRoutes, 0, destination.coordinates);
            mapRef.current.enterNavigationMode(refreshedRoutes[0]);
        }
        setNavigationActive(true);
    };

    const handleStopNavigation = () => {
        mapRef.current?.stopNavigation();
        setNavigationActive(false);
    };

    return html`
        <${MapComponent} 
            ref=${mapRef} 
            onHazardClick=${(hazard) => setSelectedHazard(hazard)} 
            onUserLocationChange=${handleUserLocationChange}
        />
        
        <div className="ui-layer">
            ${!navigationActive && html`
                <${SearchBox}
                    onDestinationSelect=${handleDestinationSelect}
                    onDestinationClear=${handleDestinationClear}
                />
                <${MainMenu} onSelectMode=${(mode) => setActiveModal(mode)} />
            `}
            
            ${proximityAlert && html`
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-none z-50 transition-all duration-300">
                    <div className="bg-red-500 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-3 font-bold">
                        <${AlertCircle} size=${24} />
                        ${proximityAlert.message}
                    </div>
                </div>
            `}

            <${HazardPanel} hazard=${selectedHazard} onClose=${() => setSelectedHazard(null)} />
            
            ${destination && html`
                <${RoutePanel} 
                    routes=${routes} 
                    selectedIndex=${selectedRouteIndex} 
                    onSelectRoute=${(idx) => setSelectedRouteIndex(idx)} 
                    navigationActive=${navigationActive}
                    onStartNavigation=${handleStartNavigation}
                    onStopNavigation=${handleStopNavigation}
                />
            `}

            ${activeModal === 'report' && html`<${ReportHazard} onClose=${() => setActiveModal(null)} />`}
            ${activeModal === 'dashcam' && html`<${DashcamFlow} onClose=${() => setActiveModal(null)} />`}
            ${activeModal === 'phone' && html`<${PhoneCameraFlow} onClose=${() => setActiveModal(null)} />`}
            ${activeModal === 'reports' && html`<${MyReports} onClose=${() => setActiveModal(null)} />`}
        </div>
    `;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
