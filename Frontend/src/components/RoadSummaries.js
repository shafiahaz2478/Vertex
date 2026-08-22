import React, { useEffect, useState } from 'react';
import { html, classNames } from '../utils.js';
import { api } from '../api/mockService.js';
import { X, Activity, AlertOctagon, Shield } from 'lucide-react';

export function RoadSummaries({ onClose }) {
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.fetchRoadSummary().then(data => {
            setSummaries(data);
            setLoading(false);
        });
    }, []);

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

    return html`
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick=${onClose} />
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-900">
                        <${Activity} size=${22} className="text-blue-600" />
                        <h2 className="text-lg font-bold">Road Summaries</h2>
                    </div>
                    <button onClick=${onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <${X} size=${20} />
                    </button>
                </div>
                
                <div className="p-5 overflow-y-auto flex-1">
                    ${loading ? html`<div className="text-center py-10 text-gray-500">Loading...</div>` : html`
                        <div className="space-y-3">
                            ${summaries.map(s => html`
                                <div key=${s.road_name} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-gray-900">${s.road_name}</p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                                <${AlertOctagon} size=${14} />
                                                ${s.pothole_count} potholes · Avg: ${s.avg_severity || 'N/A'}
                                            </p>
                                        </div>
                                        <span className=${classNames(
                                            "px-3 py-1 rounded-full text-xs font-bold tracking-wide",
                                            s.risk_level === 'CRITICAL' ? "bg-red-100 text-red-700" :
                                            s.risk_level === 'HIGH' ? "bg-orange-100 text-orange-700" :
                                            s.risk_level === 'MODERATE' ? "bg-yellow-100 text-yellow-700" :
                                            "bg-green-100 text-green-700"
                                        )}>
                                            ${s.risk_level}
                                        </span>
                                    </div>
                                    ${s.condition_score !== undefined && html`
                                        <div className="flex items-center gap-2 mt-2">
                                            <${Shield} size=${14} className=${getScoreColor(s.condition_score)} />
                                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div className=${classNames("h-full rounded-full", getBarColor(s.condition_score))} style=${{ width: s.condition_score + '%' }} />
                                            </div>
                                            <span className=${classNames("text-xs font-bold", getScoreColor(s.condition_score))}>${s.condition_score}/100</span>
                                        </div>
                                    `}
                                </div>
                            `)}
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}
