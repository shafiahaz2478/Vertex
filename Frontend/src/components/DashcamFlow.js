import React, { useState, useEffect } from 'react';
import { html, classNames } from '../utils.js';
import { X, Camera, Wifi, ShieldCheck, CheckCircle2, Loader2, Play, Pause } from 'lucide-react';
import { api } from '../api/mockService.js';

export function DashcamFlow({ onClose }) {
    // States: 'not_connected', 'connecting', 'connected', 'processing', 'paused'
    const [state, setState] = useState('not_connected');

    const handleConnect = () => {
        setState('connecting');
        setTimeout(() => setState('connected'), 1500);
    };

    const handleStartProcessing = () => {
        setState('processing');
    };

    const handlePause = () => {
        setState('paused');
    };

    // Simulate sending data while processing
    useEffect(() => {
        if (state !== 'processing') return;
        
        const interval = setInterval(async () => {
            if (Math.random() > 0.8) {
                // Queue device detections; the API flushes them in a 10-second batch.
                await api.queuePotholeDetection({
                    latitude: 12.9716 + (Math.random() - 0.5) * 0.01,
                    longitude: 77.5946 + (Math.random() - 0.5) * 0.01,
                    confidence: 0.7 + Math.random() * 0.25,
                    detected_at: new Date().toISOString()
                });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [state]);

    return html`
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick=${onClose} />
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col relative">
                
                <button onClick=${onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full z-20">
                    <${X} size=${20} />
                </button>
                
                <div className="p-8 flex flex-col items-center text-center mt-4">
                    <div className=${classNames(
                        "w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors duration-500",
                        state === 'not_connected' ? "bg-gray-100 text-gray-400" :
                        state === 'connecting' ? "bg-blue-100 text-blue-500" :
                        state === 'processing' ? "bg-green-100 text-green-500" :
                        "bg-indigo-100 text-indigo-500"
                    )}>
                        ${state === 'connecting' ? html`<${Loader2} size=${40} className="animate-spin" />` : 
                          state === 'processing' ? html`<${ShieldCheck} size=${40} />` : 
                          html`<${Camera} size=${40} />`}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        ${state === 'not_connected' ? 'Connect Dashcam' : 
                          state === 'connecting' ? 'Connecting...' : 
                          state === 'connected' ? 'Dashcam Connected' : 
                          state === 'paused' ? 'Processing Paused' : 
                          'AI Processing Active'}
                    </h2>
                    
                    <p className="text-gray-500 mb-8 text-sm px-4 leading-relaxed">
                        ${state === 'not_connected' ? 'Connect your dashcam via local WiFi to use Edge AI for real-time hazard detection.' : 
                          state === 'connecting' ? 'Establishing secure local connection...' : 
                          state === 'connected' ? 'Ready to begin monitoring road conditions.' : 
                          state === 'paused' ? 'Detection is paused. No data is being recorded.' : 
                          'Continuously analyzing road conditions. Data is anonymized locally.'}
                    </p>

                    <div className="w-full space-y-3">
                        ${state === 'not_connected' && html`
                            <button onClick=${handleConnect} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex justify-center items-center gap-2">
                                <${Wifi} size=${18} /> Connect Device
                            </button>
                        `}
                        
                        ${(state === 'connected' || state === 'paused') && html`
                            <button onClick=${handleStartProcessing} className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex justify-center items-center gap-2">
                                <${Play} size=${18} /> Start Detection
                            </button>
                        `}

                        ${state === 'processing' && html`
                            <button onClick=${handlePause} className="w-full py-3.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors flex justify-center items-center gap-2">
                                <${Pause} size=${18} /> Pause Detection
                            </button>
                        `}
                        
                        ${state !== 'not_connected' && state !== 'connecting' && html`
                            <button onClick=${() => setState('not_connected')} className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                                Disconnect
                            </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
}

