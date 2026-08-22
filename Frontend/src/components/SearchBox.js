import React, { useState, useCallback, useEffect, useRef } from 'react';
import { html, classNames } from '../utils.js';
import { Search, X, MapPin, Navigation, Building2, Landmark, Plane, Train, Loader2, Compass } from 'lucide-react';
import { api } from '../api/mockService.js';

const QUICK_SUGGESTIONS = [
    { name: "Mysore Palace", subtitle: "Sayyaji Rao Rd, Mysuru", icon: Landmark, coordinates: [76.6552, 12.3052] },
    { name: "Kempegowda Int. Airport (BLR)", subtitle: "Devanahalli, Bengaluru", icon: Plane, coordinates: [77.7066, 13.1986] },
    { name: "Koramangala", subtitle: "Bengaluru, Karnataka", icon: Building2, coordinates: [77.6180, 12.9350] },
    { name: "Chamundi Hill", subtitle: "Mysuru, Karnataka", icon: Landmark, coordinates: [76.6712, 12.2747] },
    { name: "Indiranagar", subtitle: "100ft Road, Bengaluru", icon: MapPin, coordinates: [77.6380, 12.9780] },
    { name: "Cubbon Park", subtitle: "Kasturba Rd, Bengaluru", icon: Compass, coordinates: [77.5930, 12.9750] }
];

export function SearchBox({ onDestinationSelect, onDestinationClear, userCoords }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    
    const debounceRef = useRef(null);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const handleSearch = useCallback((value) => {
        setQuery(value);
        setFocusedIndex(-1);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value.trim()) {
            setResults([]);
            setShowResults(true); // show quick suggestions
            setSearching(false);
            return;
        }

        setSearching(true);
        setShowResults(true);

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await api.searchDestinations(value, userCoords);
                setResults(res);
            } catch (err) {
                console.warn("Search geocoding error:", err);
            } finally {
                setSearching(false);
            }
        }, 220);
    }, [userCoords]);

    const handleSelect = (result) => {
        setQuery(result.name);
        setSelectedDestination(result);
        setShowResults(false);
        setResults([]);
        if (onDestinationSelect) {
            onDestinationSelect(result);
        }
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setShowResults(false);
        setSelectedDestination(null);
        setFocusedIndex(-1);
        if (inputRef.current) inputRef.current.focus();
        if (onDestinationClear) {
            onDestinationClear();
        }
    };

    // Close results dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        const items = results.length > 0 ? results : QUICK_SUGGESTIONS;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedIndex >= 0 && items[focusedIndex]) {
                handleSelect(items[focusedIndex]);
            }
        } else if (e.key === 'Escape') {
            setShowResults(false);
        }
    };

    const getCategoryIcon = (category) => {
        if (!category) return MapPin;
        const cat = category.toLowerCase();
        if (cat.includes('tourism') || cat.includes('attraction') || cat.includes('historic') || cat.includes('monument')) return Landmark;
        if (cat.includes('aeroway') || cat.includes('airport') || cat.includes('air')) return Plane;
        if (cat.includes('railway') || cat.includes('station') || cat.includes('train')) return Train;
        if (cat.includes('highway') || cat.includes('road') || cat.includes('street')) return Navigation;
        if (cat.includes('building') || cat.includes('city') || cat.includes('administrative')) return Building2;
        return MapPin;
    };

    return html`
        <div ref=${containerRef} className="absolute top-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-lg pointer-events-auto z-40">
            <!-- Google Maps Style "From: Current Location" indicator -->
            ${selectedDestination && html`
                <div className="bg-white/95 backdrop-blur-md text-gray-700 text-xs font-bold px-4 py-1.5 rounded-t-2xl mx-2 shadow-sm border border-b-0 border-gray-100 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-blue-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200 inline-block animate-pulse"></span>
                        <span>From: Current Location</span>
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400">Road Quality Analysis Active</span>
                </div>
            `}

            <!-- Search Bar Pill (Google Maps Inspired) -->
            <div className=${classNames(
                "bg-white shadow-2xl border border-gray-100/80 transition-all duration-200 relative z-10",
                selectedDestination ? "rounded-b-2xl rounded-t-none" : "rounded-2xl",
                showResults ? "ring-2 ring-blue-500/20 shadow-blue-500/10" : ""
            )}>
                <div className="flex items-center px-4 py-3">
                    <div className="mr-3 flex-shrink-0 text-blue-600">
                        ${searching ? html`
                            <${Loader2} size=${20} className="animate-spin text-blue-500" />
                        ` : html`
                            <${Search} size=${20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        `}
                    </div>
                    
                    <input 
                        ref=${inputRef}
                        type="text" 
                        placeholder="Search places in India, Mysuru, Bengaluru..." 
                        className="flex-1 outline-none text-base bg-transparent text-gray-900 placeholder-gray-400 font-medium"
                        value=${query}
                        onChange=${(e) => handleSearch(e.target.value)}
                        onFocus=${() => setShowResults(true)}
                        onKeyDown=${handleKeyDown}
                        autoComplete="off"
                        spellCheck="false"
                    />
                    
                    ${query && html`
                        <button 
                            onClick=${handleClear} 
                            aria-label="Clear destination search" 
                            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors ml-1"
                        >
                            <${X} size=${18} />
                        </button>
                    `}
                </div>

                <!-- Autocomplete Dropdown Menu -->
                ${showResults && html`
                    <div className="border-t border-gray-100 max-h-80 overflow-y-auto bg-white rounded-b-2xl shadow-xl">
                        ${searching && results.length === 0 ? html`
                            <div className="px-4 py-6 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
                                <${Loader2} size=${16} className="animate-spin text-blue-500" />
                                <span>Searching open-source map locations...</span>
                            </div>
                        ` : results.length > 0 ? html`
                            <div className="py-1 divide-y divide-gray-50">
                                ${results.map((r, idx) => {
                                    const IconComponent = getCategoryIcon(r.category);
                                    const isFocused = idx === focusedIndex;
                                    return html`
                                        <button 
                                            key=${r.id || idx}
                                            onClick=${() => handleSelect(r)}
                                            onMouseEnter=${() => setFocusedIndex(idx)}
                                            className=${classNames(
                                                "w-full flex items-center gap-3.5 px-4 py-3 text-left transition-colors",
                                                isFocused ? "bg-blue-50/70" : "hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="p-2 bg-gray-100 text-gray-600 rounded-xl flex-shrink-0">
                                                <${IconComponent} size=${18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">${r.name}</p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">${r.subtitle || 'India'}</p>
                                            </div>
                                        </button>
                                    `;
                                })}
                            </div>
                        ` : query.trim() ? html`
                            <div className="p-6 text-center text-sm text-gray-400">
                                <p className="font-semibold text-gray-600">No matching places found</p>
                                <p className="text-xs text-gray-400 mt-1">Try searching a city, area, or landmark (e.g. Mysuru Palace, MG Road)</p>
                            </div>
                        ` : html`
                            <!-- Quick Popular Locations in Mysuru & Bengaluru -->
                            <div className="p-3 bg-gray-50/50">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">
                                    Popular Destinations
                                </div>
                                <div className="grid grid-cols-1 gap-1">
                                    ${QUICK_SUGGESTIONS.map((item, idx) => {
                                        const ItemIcon = item.icon || MapPin;
                                        return html`
                                            <button 
                                                key=${item.name}
                                                onClick=${() => handleSelect(item)}
                                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-blue-50 text-left transition-colors group"
                                            >
                                                <div className="p-1.5 bg-white text-gray-500 group-hover:text-blue-600 rounded-lg shadow-sm border border-gray-100">
                                                    <${ItemIcon} size=${15} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-800 group-hover:text-blue-600 truncate">${item.name}</p>
                                                    <p className="text-[11px] text-gray-400 truncate">${item.subtitle}</p>
                                                </div>
                                            </button>
                                        `;
                                    })}
                                </div>
                            </div>
                        `}
                    </div>
                `}
            </div>
        </div>
    `;
}
