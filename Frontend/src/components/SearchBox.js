import React, { useState, useCallback, useEffect, useRef } from 'react';
import { html } from '../utils.js';
import { Search, X, MapPin, AlertTriangle } from 'lucide-react';
import { api } from '../api/mockService.js';

export function SearchBox({ onSearchSelect }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const debounceRef = useRef(null);

    const handleSearch = useCallback((value) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value.trim()) {
            setResults([]);
            setShowResults(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            const res = await api.searchRoads(value);
            setResults(res);
            setShowResults(true);
            setSearching(false);
        }, 250);
    }, []);

    const handleSelect = (result) => {
        setQuery(result.road_name);
        setShowResults(false);
        if (onSearchSelect) {
            onSearchSelect({
                coordinates: result.coordinates,
                hazard: result.first_pothole
            });
        }
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    return html`
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md pointer-events-auto z-40">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-visible relative">
                <div className="flex items-center px-4 py-3">
                    <${Search} size=${20} className="text-gray-400 mr-3 flex-shrink-0" />
                    <input 
                        type="text" 
                        placeholder="Search roads or hazards..." 
                        className="flex-1 outline-none text-base bg-transparent text-gray-800 placeholder-gray-400 font-medium"
                        value=${query}
                        onChange=${(e) => handleSearch(e.target.value)}
                        onFocus=${() => { if (results.length > 0) setShowResults(true); }}
                    />
                    ${query && html`
                        <button onClick=${handleClear} className="p-1 text-gray-400 hover:text-gray-600">
                            <${X} size=${16} />
                        </button>
                    `}
                </div>

                ${showResults && html`
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-64 overflow-y-auto z-50">
                        ${searching ? html`
                            <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
                        ` : results.length === 0 ? html`
                            <div className="p-4 text-center text-sm text-gray-400">No roads found matching "${query}"</div>
                        ` : html`
                            ${results.map(r => html`
                                <button 
                                    key=${r.road_name}
                                    onClick=${() => handleSelect(r)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                >
                                    <div className="p-1.5 bg-red-100 rounded-lg text-red-500 flex-shrink-0">
                                        <${MapPin} size=${14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">${r.road_name}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <${AlertTriangle} size=${10} />
                                            ${r.pothole_count} pothole${r.pothole_count !== 1 ? 's' : ''} detected
                                        </p>
                                    </div>
                                </button>
                            `)}
                        `}
                    </div>
                `}
            </div>
        </div>
    `;
}
