import React, { useState, useEffect } from 'react';
import { html, classNames } from '../utils.js';
import { api } from '../api/mockService.js';
import { X, List, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { MOCK_POTHOLES } from '../api/mockData.js';

export function MyReports({ onClose }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetching user's reports. For now, we'll just show the mock potholes.
        // In a real app, this would be an API call specifically for the user's reports.
        setTimeout(() => {
            setReports(MOCK_POTHOLES.map(p => p.properties).sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at)));
            setLoading(false);
        }, 500);
    }, []);

    return html`
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick=${onClose} />
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-900">
                        <${List} size=${22} className="text-blue-600" />
                        <h2 className="text-lg font-bold">My Reports</h2>
                    </div>
                    <button onClick=${onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <${X} size=${20} />
                    </button>
                </div>
                
                <div className="p-5 overflow-y-auto flex-1 bg-gray-50">
                    ${loading ? html`<div className="text-center py-10 text-gray-500">Loading your reports...</div>` : html`
                        ${reports.length === 0 ? html`
                            <div className="text-center py-10 text-gray-500">
                                <p>You haven't submitted any reports yet.</p>
                            </div>
                        ` : html`
                            <div className="space-y-4">
                                ${reports.map(report => html`
                                    <div key=${report.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                                    <${AlertTriangle} size=${16} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">Pothole Hazard</h3>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                        <${MapPin} size=${12} />
                                                        ${report.road_name || 'Unknown Road'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className=${classNames(
                                                "px-2.5 py-1 rounded-full text-xs font-bold tracking-wide",
                                                report.verified_count > 5 ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"
                                            )}>
                                                ${report.verified_count > 5 ? "Verified" : "Under Review"}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-50">
                                            <span className="flex items-center gap-1">
                                                <${Clock} size=${12} />
                                                ${new Date(report.detected_at).toLocaleDateString()}
                                            </span>
                                            <span>Confidence: ${Math.round(report.confidence * 100)}%</span>
                                        </div>
                                    </div>
                                `)}
                            </div>
                        `}
                    `}
                </div>
            </div>
        </div>
    `;
}
