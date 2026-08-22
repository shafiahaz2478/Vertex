import React, { useState, useCallback, useEffect, useRef } from 'react';
import { html } from '../utils.js';
import { Search, X, MapPin } from 'lucide-react';
import { api } from '../api/mockService.js';

export function SearchBox({ onDestinationSelect, onDestinationClear }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);
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
            const res = await api.searchDestinations(value);
            setResults(res);
            setShowResults(true);
            setSearching(false);
        }, 250);
    }, []);

    const handleSelect = (result) => {
        setQuery(result.name);
        setSelectedDestination(result);
        setShowResults(false);
        if (onDestinationSelect) {
            onDestinationSelect(result);
        }
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setShowResults(false);
        setSelectedDestination(null);
        if (onDestinationClear) {
            onDestinationClear();
        }
    };

    return html`
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md pointer-events-auto z-40">
            ${selectedDestination && html`
                <div className="bg-blue-50 text-blue-800 text-xs font-bold px-4 py-1.5 rounded-t-xl mx-2 shadow-sm border border-b-0 border-blue-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                    From: Current Location
                </div>
            `}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-visible relative z-10">
                <div className="flex items-center px-4 py-3">
                    <${Search} size=${20} className="text-gray-400 mr-3 flex-shrink-0" />
                    <input 
                        type="text" 
                        placeholder="Where do you want to go?" 
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
                            <div className="p-4 text-center text-sm text-gray-400">No destinations found</div>
                        ` : html`
                            ${results.map(r => html`
                                <button 
                                    key=${r.id}
                                    onClick=${() => handleSelect(r)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                >
                                    <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500 flex-shrink-0">
                                        <${MapPin} size=${14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">${r.name}</p>
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
