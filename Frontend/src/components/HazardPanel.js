import React from 'react';
import { html, classNames } from '../utils.js';
import { X, AlertTriangle, Clock, MapPin, Shield, Eye } from 'lucide-react';

const SEVERITY_CONFIG = {
    HIGH: { color: "bg-red-100 text-red-700", label: "High Severity" },
    MEDIUM: { color: "bg-yellow-100 text-yellow-700", label: "Medium Severity" },
    LOW: { color: "bg-green-100 text-green-700", label: "Low Severity" }
};

const STATUS_CONFIG = {
    "Detected": { color: "bg-blue-100 text-blue-700", icon: Eye },
    "Verified": { color: "bg-indigo-100 text-indigo-700", icon: Shield },
    "Reported": { color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
    "Under Repair": { color: "bg-yellow-100 text-yellow-700", icon: Clock },
    "Resolved": { color: "bg-green-100 text-green-700", icon: Shield }
};

export function HazardPanel({ hazard, onClose }) {
    if (!hazard) return null;

    const { id, road_name, confidence, severity, verified_count, detected_at, status } = hazard;
    
    const confPercent = Math.round((confidence || 0) * 100);
    const dateStr = detected_at ? new Date(detected_at).toLocaleString() : 'Unknown';
    const sevConfig = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.MEDIUM;
    const statConfig = STATUS_CONFIG[status] || STATUS_CONFIG["Detected"];

    // Days since detected
    const daysAgo = detected_at ? Math.floor((Date.now() - new Date(detected_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return html`
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md pointer-events-auto transition-transform duration-300">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-start p-4 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <${AlertTriangle} size=${20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Pothole Hazard</h3>
                            <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                                <${MapPin} size=${12} />
                                ${road_name || 'Unknown Road'}
                            </p>
                        </div>
                    </div>
                    <button onClick=${onClose} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full">
                        <${X} size=${20} />
                    </button>
                </div>
                
                <!-- Stats Grid -->
                <div className="p-4 grid grid-cols-3 gap-3 bg-gray-50/50">
                    <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Confidence</p>
                        <p className="font-bold text-xl text-gray-900">${confPercent}%</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Observations</p>
                        <p className="font-bold text-xl text-gray-900">${verified_count}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Severity</p>
                        <span className=${classNames("px-2 py-0.5 rounded-full text-xs font-bold", sevConfig.color)}>
                            ${severity || "MEDIUM"}
                        </span>
                    </div>
                </div>

                <!-- Status & Timeline -->
                <div className="p-4 border-t border-gray-50">
                    <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-1.5 text-gray-500">
                            <${Clock} size=${14} />
                            ${dateStr}${daysAgo > 0 ? ` (${daysAgo}d ago)` : ''}
                        </span>
                        <span className=${classNames("px-2.5 py-1 rounded-full font-medium text-xs flex items-center gap-1", statConfig.color)}>
                            <${statConfig.icon} size=${12} />
                            ${status || "Detected"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}
