import React from 'react';
import { html, classNames } from '../utils.js';
import { Navigation, ShieldAlert, ArrowUp, CornerUpLeft, CornerUpRight, Flag, X, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export function RoutePanel({ 
    routes, 
    selectedIndex = 0, 
    onSelectRoute, 
    navigationActive, 
    onStartNavigation, 
    onStopNavigation,
    onClose 
}) {
    if (!routes || routes.length === 0) return null;

    // 3-Color Badges based purely on density / risk (NO numeric /100 scores)
    const getDensityBadgeStyle = (potholesPerKm) => {
        if (potholesPerKm < 2.0) return "text-green-700 bg-green-50 border-green-200";
        if (potholesPerKm <= 5.0) return "text-yellow-800 bg-yellow-50 border-yellow-200";
        return "text-red-700 bg-red-50 border-red-200";
    };

    const getDensityDotColor = (potholesPerKm) => {
        if (potholesPerKm < 2.0) return "bg-[#22c55e]";
        if (potholesPerKm <= 5.0) return "bg-[#eab308]";
        return "bg-[#ef4444]";
    };

    const getDensityLabel = (potholesPerKm) => {
        if (potholesPerKm < 2.0) return "Low Potholes (<2/km)";
        if (potholesPerKm <= 5.0) return "Moderate Potholes (2-5/km)";
        return "High Potholes (>5/km)";
    };

    const activeRoute = routes[selectedIndex] || routes[0];
    const nextInstruction = activeRoute?.instructions?.find(instruction => instruction.maneuver === 'turn' || instruction.maneuver === 'roundabout')
        || activeRoute?.instructions?.[1]
        || activeRoute?.instructions?.[0];
    const turnIcon = nextInstruction?.modifier?.includes('left') ? CornerUpLeft
        : nextInstruction?.modifier?.includes('right') ? CornerUpRight
        : ArrowUp;
    const distanceToTurn = nextInstruction?.distance_m >= 1000
        ? `${(nextInstruction.distance_m / 1000).toFixed(1)} km`
        : `${nextInstruction?.distance_m || 0} m`;

    if (navigationActive) {
        return html`
            <div className="absolute inset-0 pointer-events-none z-40">
                <!-- Top Turn Instruction Card -->
                <div className="absolute top-4 left-1/2 w-11/12 max-w-md -translate-x-1/2 pointer-events-auto">
                    <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
                        <div className="flex items-center gap-4 px-4 py-3.5">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#1a73e8] text-white shadow-sm">
                                <${turnIcon} size=${34} strokeWidth=${2.8} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-2xl font-bold leading-none text-gray-900">${distanceToTurn}</div>
                                <div className="mt-1 truncate text-sm font-semibold text-gray-700">${nextInstruction?.text || 'Continue on highlighted route'}</div>
                            </div>
                            <button 
                                onClick=${onStopNavigation} 
                                aria-label="Cancel navigation" 
                                title="Exit navigation"
                                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-800"
                            >
                                <${X} size=${22} />
                            </button>
                        </div>
                        
                        <!-- Real-time Lane & Road Safety Alert -->
                        <div className="border-t border-gray-100 bg-amber-50/80 px-4 py-2 flex items-center justify-between text-xs">
                            <span className="font-semibold text-amber-900 flex items-center gap-1.5 truncate">
                                <${AlertTriangle} size=${14} className="text-amber-600 shrink-0" />
                                ${activeRoute.lane_advice || 'Hazard warnings active on route'}
                            </span>
                            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide shrink-0 ml-2">
                                ${activeRoute.potholes_per_km ? `${activeRoute.potholes_per_km}/km` : 'Active'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Bottom Navigation Control Strip with Cancel/Exit -->
                <div className="absolute bottom-5 left-1/2 w-11/12 max-w-md -translate-x-1/2 pointer-events-auto">
                    <div className="flex items-center justify-between rounded-2xl bg-gray-900 px-4 py-3 text-white shadow-2xl">
                        <div>
                            <div className="text-lg font-bold leading-tight">
                                ${activeRoute.time_min} min 
                                <span className="text-sm font-medium text-gray-300 ml-1.5">· ${activeRoute.distance_km} km</span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-300">
                                <${Flag} size=${12} /> ${activeRoute.name}
                            </div>
                        </div>
                        <button 
                            onClick=${onStopNavigation} 
                            className="rounded-xl bg-red-600/90 hover:bg-red-600 px-3.5 py-2 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                            <${X} size=${14} /> Exit
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    return html`
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md pointer-events-auto z-40 transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
                <!-- Header with Close/Cancel Button & Route Count -->
                <div className="bg-gray-50/90 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <${Navigation} size=${15} className="text-blue-600" />
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Choose Route</span>
                        <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                            ${routes.length} Option${routes.length !== 1 ? 's' : ''} available
                        </span>
                    </div>
                    ${onClose && html`
                        <button 
                            onClick=${onClose} 
                            aria-label="Cancel route selection" 
                            title="Cancel and close"
                            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
                        >
                            <${X} size=${18} />
                        </button>
                    `}
                </div>

                <!-- Interactive Route Switcher Tabs -->
                ${routes.length > 1 && html`
                    <div className="grid grid-cols-2 p-1.5 bg-gray-100/70 gap-1.5 border-b border-gray-100">
                        ${routes.map((route, idx) => {
                            const isSel = idx === selectedIndex;
                            return html`
                                <button
                                    key=${route.id || idx}
                                    onClick=${() => onSelectRoute && onSelectRoute(idx)}
                                    className=${classNames(
                                        "py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                        isSel 
                                            ? "bg-white text-blue-700 shadow-sm border border-gray-200/80" 
                                            : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                                    )}
                                >
                                    ${isSel ? html`<${CheckCircle2} size=${13} className="text-blue-600" />` : html`<${Layers} size=${13} className="text-gray-400" />`}
                                    <span>Route ${idx + 1}: ${route.time_min}m</span>
                                </button>
                            `;
                        })}
                    </div>
                `}
                
                <!-- Routes List (Clean Without Scores) -->
                <div className="flex flex-col max-h-64 overflow-y-auto divide-y divide-gray-50">
                    ${routes.map((route, index) => {
                        const isSelected = index === selectedIndex;
                        const density = route.potholes_per_km !== undefined ? route.potholes_per_km : 1.2;
                        const badSegmentsCount = (route.segments || []).reduce(
                            (acc, s) => acc + (s.conditionLevel === 'HIGH_RISK' || s.conditionLevel === 'POOR' ? 1 : 0), 0
                        );

                        return html`
                            <div 
                                key=${route.id || index}
                                onClick=${() => onSelectRoute && onSelectRoute(index)}
                                role="button"
                                tabIndex="0"
                                className=${classNames(
                                    "px-4 py-3 text-left transition-all relative block w-full cursor-pointer",
                                    isSelected ? "bg-blue-50/40" : "hover:bg-gray-50 bg-white opacity-85"
                                )}
                            >
                                ${isSelected && html`<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600"></div>`}
                                
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className=${classNames("text-xs font-extrabold px-2 py-0.5 rounded-md", isSelected ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700")}>
                                                Route ${index + 1}
                                            </span>
                                            <h3 className=${classNames("font-bold text-base", isSelected ? "text-gray-900" : "text-gray-700")}>
                                                ${route.time_min} min 
                                                <span className="text-gray-400 font-normal text-sm ml-1.5">· ${route.distance_km} km</span>
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className=${classNames("text-[11px] font-bold px-2.5 py-0.5 rounded-lg border shadow-xs", getDensityBadgeStyle(density))}>
                                            ${density} /km
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs mt-1">
                                    <div className=${classNames("w-2.5 h-2.5 rounded-full flex-shrink-0", getDensityDotColor(density))}></div>
                                    <span className=${classNames("font-medium", isSelected ? "text-gray-800" : "text-gray-500")}>
                                        ${getDensityLabel(density)}
                                    </span>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-gray-500 truncate">${route.name}</span>
                                </div>
                                
                                ${isSelected && html`
                                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-col gap-1 text-xs">
                                        <div className="flex items-center justify-between text-gray-600">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <${ShieldAlert} size=${13} className=${badSegmentsCount > 0 ? "text-red-500" : "text-green-500"} /> 
                                                ${badSegmentsCount > 0 ? `${badSegmentsCount} hazard patch${badSegmentsCount !== 1 ? 'es' : ''} on route` : 'Full route clear & smooth'}
                                            </span>
                                        </div>
                                        
                                        ${route.lane_advice && html`
                                            <div className="mt-1 px-2.5 py-1.5 rounded-xl bg-blue-50/80 text-blue-950 font-medium text-[11px] flex items-center gap-2 border border-blue-100/60">
                                                <span className="font-bold text-blue-700 shrink-0">Lane Advice:</span> 
                                                <span className="truncate">${route.lane_advice}</span>
                                            </div>
                                        `}
                                    </div>
                                `}
                            </div>
                        `;
                    })}
                </div>
                
                <!-- Action Buttons: Start Navigation & Cancel -->
                <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                    <button 
                        onClick=${onStartNavigation}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                    >
                        <${Navigation} size=${16} /> Start Navigation
                    </button>
                    ${onClose && html`
                        <button 
                            onClick=${onClose} 
                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
                            title="Cancel and close route selection"
                        >
                            Cancel
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}
