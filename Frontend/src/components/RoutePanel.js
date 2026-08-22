import React from 'react';
import { html, classNames } from '../utils.js';
import { Navigation, ShieldAlert } from 'lucide-react';

export function RoutePanel({ routes, selectedIndex = 0, onSelectRoute, navigationActive, onStartNavigation, onStopNavigation }) {
    if (!routes || routes.length === 0) return null;

    const getScoreColor = (score) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        if (score >= 40) return "text-orange-600";
        return "text-red-600";
    };

    const getBarColor = (score) => {
        if (score >= 80) return "bg-green-500";
        if (score >= 60) return "bg-yellow-500";
        if (score >= 40) return "bg-orange-500";
        return "bg-red-500";
    };

    const getExposureText = (score) => {
        if (score >= 80) return "Low pothole exposure";
        if (score >= 60) return "Moderate pothole exposure";
        if (score >= 40) return "Significant pothole exposure";
        return "High pothole exposure";
    };

    const getExposureColor = (score) => {
        if (score >= 80) return "bg-green-500";
        if (score >= 60) return "bg-yellow-500";
        if (score >= 40) return "bg-orange-500";
        return "bg-red-500";
    };

    const activeRoute = routes[selectedIndex] || routes[0];
    const nextInstruction = activeRoute?.instructions?.[0];

    return html`
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md pointer-events-auto z-40 transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
                <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <${Navigation} size=${14} className="text-blue-600" />
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Route</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">${routes.length} options</span>
                </div>
                
                <div className="flex flex-col max-h-60 overflow-y-auto">
                    ${routes.map((route, index) => {
                        const isSelected = index === selectedIndex;
                        const badSegmentsCount = (route.segments || []).reduce(
                            (acc, s) => acc + (s.conditionLevel === 'POOR' || s.conditionLevel === 'HIGH_RISK' ? 1 : 0), 0
                        );

                        return html`
                            <button 
                                key=${route.id || index}
                                onClick=${() => onSelectRoute && onSelectRoute(index)}
                                className=${classNames(
                                    "px-4 py-3 text-left transition-all border-b border-gray-50 last:border-0 relative",
                                    isSelected ? "bg-blue-50/40" : "hover:bg-gray-50 bg-white opacity-85"
                                )}
                            >
                                ${isSelected && html`<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600"></div>`}
                                
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className=${classNames("font-bold text-base", isSelected ? "text-gray-900" : "text-gray-700")}>
                                            ${route.time_min} min <span className="text-gray-400 font-normal text-sm">· ${route.distance_km} km</span>
                                        </h3>
                                    </div>
                                    <span className=${classNames("text-xs font-bold px-2 py-0.5 rounded-lg bg-gray-100", getScoreColor(route.condition_score))}>
                                        ${route.condition_score}/100
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <div className=${classNames("w-2 h-2 rounded-full flex-shrink-0", getExposureColor(route.condition_score))}></div>
                                    <span className=${classNames("font-medium text-xs", isSelected ? "text-gray-700" : "text-gray-500")}>
                                        ${getExposureText(route.condition_score)}
                                    </span>
                                </div>
                                
                                ${isSelected && html`
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div className=${classNames("h-full rounded-full transition-all duration-300", getBarColor(route.condition_score))} style=${{ width: (route.condition_score || 0) + '%' }} />
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <${ShieldAlert} size=${12} className=${badSegmentsCount > 0 ? "text-orange-500" : "text-green-500"} /> 
                                                ${badSegmentsCount} hazardous section${badSegmentsCount !== 1 ? 's' : ''}
                                            </span>
                                            <span className="font-medium text-gray-600">${route.name}</span>
                                        </div>
                                    </div>
                                `}
                            </button>
                        `;
                    })}
                </div>
                
                <div className="p-3 bg-white border-t border-gray-100">
                    ${navigationActive && html`
                        <div className="mb-3 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5 text-left">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Navigation active</div>
                            <div className="mt-0.5 text-sm font-semibold text-gray-800">${nextInstruction?.text || 'Follow the highlighted route'}</div>
                            ${nextInstruction?.distance_m && html`<div className="mt-0.5 text-xs text-gray-500">In ${nextInstruction.distance_m} m</div>`}
                        </div>
                    `}
                    <button 
                        onClick=${navigationActive ? onStopNavigation : onStartNavigation}
                        className=${classNames(
                            "w-full py-2.5 active:scale-[0.99] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm",
                            navigationActive ? "bg-gray-800 hover:bg-gray-900" : "bg-blue-600 hover:bg-blue-700"
                        )}
                    >
                        <${Navigation} size=${16} /> ${navigationActive ? 'Stop Navigation' : 'Start Navigation'}
                    </button>
                </div>
            </div>
        </div>
    `;
}
