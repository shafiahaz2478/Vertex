import React, { useState, useEffect } from 'react';
import { html, classNames } from '../utils.js';
import { X, Smartphone, Play, Pause, Video, Crosshair } from 'lucide-react';
import { api } from '../api/mockService.js';

export function PhoneCameraFlow({ onClose }) {
    // States: 'ready', 'scanning', 'paused'
    const [state, setState] = useState('ready');
    const [hazardsDetected, setHazardsDetected] = useState(0);

    // Simulate sending data while scanning
    useEffect(() => {
        if (state !== 'scanning') return;
        
        const interval = setInterval(async () => {
            if (Math.random() > 0.7) {
                // Queue device detections; the API flushes them in a 10-second batch.
                await api.queuePotholeDetection({
                    latitude: 12.9716 + (Math.random() - 0.5) * 0.02,
                    longitude: 77.5946 + (Math.random() - 0.5) * 0.02,
                    confidence: 0.8 + Math.random() * 0.15,
                    detected_at: new Date().toISOString()
                });
                setHazardsDetected(prev => prev + 1);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [state]);

    return html`
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick=${onClose} />
            <div className="bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col relative text-white border border-gray-800">
                
                <button onClick=${onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-gray-800 rounded-full z-20 transition-colors">
                    <${X} size=${20} />
                </button>
                
                <div className="p-8 flex flex-col items-center text-center mt-4">
                    <div className="relative mb-8">
                        <div className=${classNames(
                            "w-48 h-64 border-2 rounded-xl flex items-center justify-center relative overflow-hidden transition-colors duration-300",
                            state === 'scanning' ? "border-green-500 bg-gray-800/50" : "border-gray-700 bg-gray-800"
                        )}>
                            ${state === 'scanning' ? html`
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent animate-scan" style=${{animation: "scan 2s linear infinite"}} />
                                <${Crosshair} size=${40} className="text-green-500/50 animate-pulse" />
                            ` : html`
                                <${Video} size=${40} className="text-gray-600" />
                            `}
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-2">
                        ${state === 'ready' ? 'Phone Camera Mode' : 
                          state === 'scanning' ? 'Scanning Road Surface' : 
                          'Scanning Paused'}
                    </h2>
                    <p className="text-sm text-gray-400 mb-8 h-10">
                        ${state === 'ready' ? 'Mount phone on dashboard to start mapping road conditions.' :
                          `Hazards Detected: ${hazardsDetected}`}
                    </p>

                    <button 
                        onClick=${() => setState(state === 'scanning' ? 'paused' : 'scanning')}
                        className=${classNames(
                            "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95",
                            state === 'scanning' 
                                ? "bg-red-500 hover:bg-red-600 text-white" 
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                    >
                        ${state === 'scanning' ? html`
                            <${Pause} size=${24} /> Pause Camera
                        ` : html`
                            <${Play} size=${24} /> Start Camera
                        `}
                    </button>
                </div>
            </div>
        </div>
    `;
}
