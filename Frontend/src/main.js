import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { html } from './utils.js';
import { api } from './api/mockService.js';

import { MapComponent } from './components/Map.js';
import { SearchBox } from './components/SearchBox.js';
import { HazardPanel } from './components/HazardPanel.js';
import { MainMenu } from './components/MainMenu.js';
import { RoadSummaries } from './components/RoadSummaries.js';
import { DashcamFlow } from './components/DashcamFlow.js';
import { PhoneCameraFlow } from './components/PhoneCameraFlow.js';
import { MyReports } from './components/MyReports.js';
import { RouteAnalysis } from './components/RouteAnalysis.js';
import { ReportHazard } from './components/ReportHazard.js';
import { AlertCircle } from 'lucide-react';

function App() {
    const [selectedHazard, setSelectedHazard] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [proximityAlert, setProximityAlert] = useState(null);
    const mapRef = useRef(null);

    // Simulate Proximity Alert system
    useEffect(() => {
        const alertInterval = setInterval(async () => {
            const result = await api.checkProximity({
                latitude: 12.9710,
                longitude: 77.5940,
                heading_degrees: 45,
                speed_kmh: 40
            });
            if (result.alert) {
                setProximityAlert(result);
                setTimeout(() => setProximityAlert(null), 5000);
            }
        }, 10000);

        return () => clearInterval(alertInterval);
    }, []);

    const handleSelectMode = (mode) => {
        setActiveModal(mode);
    };

    const handleSearchSelect = ({ coordinates, hazard }) => {
        // Fly the map to the selected location
        if (mapRef.current && coordinates) {
            mapRef.current.flyTo(coordinates[0], coordinates[1]);
        }
        // Open the hazard panel
        if (hazard) {
            setSelectedHazard(hazard);
        }
    };

    return html`
        <${MapComponent} ref=${mapRef} onHazardClick=${(hazard) => setSelectedHazard(hazard)} />
        
        <div className="ui-layer">
            <${SearchBox} onSearchSelect=${handleSearchSelect} />
            <${MainMenu} onSelectMode=${handleSelectMode} />
            
            ${proximityAlert && html`
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-none z-50 transition-all duration-300">
                    <div className="bg-red-500 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-3 font-bold">
                        <${AlertCircle} size=${24} />
                        ${proximityAlert.message}
                    </div>
                </div>
            `}

            <${HazardPanel} hazard=${selectedHazard} onClose=${() => setSelectedHazard(null)} />
            
            ${activeModal === 'summaries' && html`<${RoadSummaries} onClose=${() => setActiveModal(null)} />`}
            ${activeModal === 'routes' && html`<${RouteAnalysis} onClose=${() => setActiveModal(null)} />`}
            ${activeModal === 'report' && html`<${ReportHazard} onClose=${() => setActiveModal(null)} />`}
            ${activeModal === 'dashcam' && html`<${DashcamFlow} onClose=${() => setActiveModal(null)} />`}
            ${activeModal === 'phone' && html`<${PhoneCameraFlow} onClose=${() => setActiveModal(null)} />`}
            ${activeModal === 'reports' && html`<${MyReports} onClose=${() => setActiveModal(null)} />`}
        </div>
    `;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
