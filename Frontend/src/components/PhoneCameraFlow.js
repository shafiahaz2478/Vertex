import React from 'react';
import { html } from '../utils.js';
import { X } from 'lucide-react';

export function PhoneCameraFlow({ onClose }) {
    return html`
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick=${onClose} />
            <div className="bg-white p-6 rounded-2xl shadow-2xl z-10 flex flex-col relative items-center">
                
                <button onClick=${onClose} className="absolute -top-3 -right-3 p-1.5 text-white bg-gray-800 hover:bg-gray-700 rounded-full z-20 shadow-lg transition-colors">
                    <${X} size=${20} />
                </button>
                
                <h2 className="text-xl font-bold mb-4 text-gray-800">Scan to Use Phone Camera</h2>
                <div className="border-4 border-blue-100 rounded-xl overflow-hidden p-2 bg-white">
                    <img src="./src/assets/qr_code.png" alt="QR Code" className="w-64 h-64 object-contain" />
                </div>
            </div>
        </div>
    `;
}
