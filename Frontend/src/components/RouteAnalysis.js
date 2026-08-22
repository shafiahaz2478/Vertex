import React, { useState, useEffect } from 'react';
import { html, classNames } from '../utils.js';
import { api } from '../api/mockService.js';
import { X, Navigation, Shield, AlertTriangle, Clock, ChevronRight } from 'lucide-react';

export function RouteAnalysis({ onClose }) {
    const routeKeys = api.getRouteKeys();
    const [selectedRoute, setSelectedRoute] = useState(routeKeys[0] || '');
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleCompare = async () => {
        setLoading(true);
        const data = await api.fetchRouteOptions(selectedRoute);
        setRoutes(data);
        setLoading(false);
    };

    useEffect(() => {
        if (selectedRoute) handleCompare();
    }, []);

    const getScoreColor = (score) => {
        if (score >= 80) return "text-green-600 bg-green-100";
        if (score >= 60) return "text-yellow-600 bg-yellow-100";
        if (score >= 40) return "text-orange-600 bg-orange-100";
        return "text-red-600 bg-red-100";
    };

    const getRiskColor = (risk) => {
        if (risk === "CRITICAL") return "bg-red-100 text-red-700";
        if (risk === "HIGH") return "bg-orange-100 text-orange-700";
        if (risk === "MODERATE") return "bg-yellow-100 text-yellow-700";
        return "bg-green-100 text-green-700";
    };

    return html`
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick=${onClose} />
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-900">
                        <${Navigation} size=${22} className="text-blue-600" />
                        <h2 className="text-lg font-bold">Route Analysis</h2>
                    </div>
                    <button onClick=${onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <${X} size=${20} />
                    </button>
                </div>

                <div className="p-5 border-b border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Route</label>
                    <div className="flex gap-2">
                        <select
                            value=${selectedRoute}
                            onChange=${(e) => setSelectedRoute(e.target.value)}
                            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            ${routeKeys.map(k => html`<option key=${k} value=${k}>${k}</option>`)}
                        </select>
                        <button onClick=${handleCompare} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
                            Compare
                        </button>
                    </div>
                </div>

                <div className="p-5 overflow-y-auto flex-1">
                    ${loading ? html`<div className="text-center py-10 text-gray-500">Analyzing routes...</div>` : html`
                        <div className="space-y-4">
                            ${routes.map((r, i) => html`
                                <div key=${i} className=${classNames(
                                    "p-4 rounded-xl border-2 transition-shadow hover:shadow-md",
                                    i === 0 ? "border-blue-200 bg-blue-50/30" : "border-gray-100 bg-white"
                                )}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                ${i === 0 && html`<span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">RECOMMENDED</span>`}
                                                <h3 className="font-bold text-gray-900">${r.route_name}</h3>
                                            </div>
                                        </div>
                                        <span className=${classNames("px-2.5 py-1 rounded-full text-xs font-bold tracking-wide", getRiskColor(r.risk_level))}>
                                            ${r.risk_level}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <${ChevronRight} size=${14} />
                                            <span>${r.distance_km} km · ${r.time_min} min</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <${AlertTriangle} size=${14} />
                                            <span>${r.hazard_count} hazards (${r.high_severity} severe)</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2">
                                        <${Shield} size=${16} className=${r.condition_score >= 60 ? "text-green-600" : "text-red-500"} />
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className=${classNames("h-full rounded-full transition-all",
                                                r.condition_score >= 80 ? "bg-green-500" :
                                                r.condition_score >= 60 ? "bg-yellow-500" :
                                                r.condition_score >= 40 ? "bg-orange-500" : "bg-red-500"
                                            )} style=${{ width: r.condition_score + '%' }} />
                                        </div>
                                        <span className=${classNames("text-sm font-bold px-2 py-0.5 rounded-lg", getScoreColor(r.condition_score))}>
                                            ${r.condition_score}/100
                                        </span>
                                    </div>
                                </div>
                            `)}
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}
