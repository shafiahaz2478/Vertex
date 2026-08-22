import React, { useState } from 'react';
import { html, classNames } from '../utils.js';
import { Menu, Camera, Smartphone, List, Settings, X, AlertTriangle, Shield } from 'lucide-react';

export function MainMenu({ onSelectMode }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return html`
        <div className="absolute top-4 left-4 pointer-events-auto z-50">
            <button 
                onClick=${toggleMenu}
                className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-gray-700 hover:text-black hover:bg-gray-50 transition-colors"
            >
                <${Menu} size=${24} />
            </button>

            <!-- Backdrop -->
            <div 
                className=${classNames(
                    "fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick=${toggleMenu}
            />

            <!-- Drawer -->
            <div 
                className=${classNames(
                    "fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Road Intelligence</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Distributed Hazard Detection</p>
                    </div>
                    <button onClick=${toggleMenu} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                        <${X} size=${20} />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <!-- Contribute Section -->
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">Contribute</p>
                    <div className="space-y-1 mb-4">
                        <${MenuItem} 
                            icon=${html`<${Smartphone} size=${20} />`} 
                            label="Phone Camera" 
                            subtitle="Use phone as sensor"
                            onClick=${() => { onSelectMode('phone'); toggleMenu(); }} 
                        />
                    </div>
                </div>
                
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <${Shield} size=${14} className="text-blue-600" />
                        <span className="text-xs font-bold text-gray-700">Road Intelligence Platform</span>
                    </div>
                    <span className="text-xs text-gray-400">v1.0.0 · Privacy-first design</span>
                </div>
            </div>
        </div>
    `;
}

function MenuItem({ icon, label, subtitle, onClick }) {
    return html`
        <button 
            onClick=${onClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-xl hover:bg-blue-50 transition-colors group"
        >
            <div className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0">
                ${icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">${label}</p>
                ${subtitle && html`<p className="text-xs text-gray-400">${subtitle}</p>`}
            </div>
        </button>
    `;
}
