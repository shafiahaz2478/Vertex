import React, { useState } from 'react';
import { html, classNames } from '../utils.js';
import { api } from '../api/mockService.js';
import { X, AlertTriangle, MapPin, CheckCircle2, Send } from 'lucide-react';
import { KNOWN_LOCATIONS } from '../api/mockData.js';

export function ReportHazard({ onClose }) {
    const [location, setLocation] = useState('');
    const [severity, setSeverity] = useState('MEDIUM');
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const handleSubmit = async () => {
        if (!location.trim()) return;
        setSubmitting(true);
        const res = await api.reportHazard({
            location: location.trim(),
            severity,
            description
        });
        setResult(res);
        setSubmitted(true);
        setSubmitting(false);
    };

    return html`
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick=${onClose} />
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-900">
                        <${AlertTriangle} size=${22} className="text-orange-500" />
                        <h2 className="text-lg font-bold">Report Hazard</h2>
                    </div>
                    <button onClick=${onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                        <${X} size=${20} />
                    </button>
                </div>

                ${submitted ? html`
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                            <${CheckCircle2} size=${32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Report Submitted!</h3>
                        <p className="text-gray-500 text-sm mb-1">Hazard #${result?.id} logged on <span className="font-semibold">${result?.road_name}</span></p>
                        <p className="text-gray-400 text-xs mb-6">It will be verified by other vehicles passing through.</p>
                        <button onClick=${onClose} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors">
                            Done
                        </button>
                    </div>
                ` : html`
                    <div className="p-5 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location / Road Name *</label>
                            <div className="relative">
                                <${MapPin} size=${16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value=${location}
                                    onChange=${(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Outer Ring Road"
                                    list="location-suggestions"
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                                <datalist id="location-suggestions">
                                    ${KNOWN_LOCATIONS.map(l => html`<option key=${l} value=${l} />`)}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Severity</label>
                            <div className="flex gap-2">
                                ${["LOW", "MEDIUM", "HIGH"].map(s => html`
                                    <button
                                        key=${s}
                                        onClick=${() => setSeverity(s)}
                                        className=${classNames(
                                            "flex-1 py-2 rounded-xl text-sm font-bold transition-colors border-2",
                                            severity === s
                                                ? s === "HIGH" ? "border-red-500 bg-red-50 text-red-700"
                                                : s === "MEDIUM" ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                                                : "border-green-500 bg-green-50 text-green-700"
                                                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        ${s}
                                    </button>
                                `)}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (optional)</label>
                            <textarea
                                value=${description}
                                onChange=${(e) => setDescription(e.target.value)}
                                placeholder="Large pothole near the bus stop..."
                                rows="3"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                            />
                        </div>

                        <button
                            onClick=${handleSubmit}
                            disabled=${!location.trim() || submitting}
                            className=${classNames(
                                "w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-colors",
                                !location.trim() || submitting ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
                            )}
                        >
                            <${Send} size=${16} />
                            ${submitting ? "Submitting..." : "Submit Report"}
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;
}
