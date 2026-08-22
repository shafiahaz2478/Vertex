import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import maplibregl from 'maplibre-gl';
import { html } from '../utils.js';
import { api } from '../api/mockService.js';

export const MapComponent = forwardRef(function MapComponent({ onHazardClick }, ref) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [potholes, setPotholes] = useState(null);

    // Expose flyTo method to parent
    useImperativeHandle(ref, () => ({
        flyTo(lng, lat) {
            if (map.current) {
                map.current.flyTo({ center: [lng, lat], zoom: 16, duration: 1500 });
            }
        }
    }));

    useEffect(() => {
        if (map.current) return; // initialize map only once
        
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            center: [77.5946, 12.9716], // Bangalore
            zoom: 13
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        
        // Add geolocate control
        map.current.addControl(
            new maplibregl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true
            }),
            'top-right'
        );

        map.current.on('load', async () => {
            // Fetch initial potholes
            const bounds = map.current.getBounds();
            const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
            const data = await api.fetchPotholes(bbox);
            setPotholes(data);
        });

        // Add event listener for map movement to fetch new data
        map.current.on('moveend', async () => {
            const bounds = map.current.getBounds();
            const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
            const data = await api.fetchPotholes(bbox);
            setPotholes(data);
        });

    }, []);

    // Update map when potholes data changes
    useEffect(() => {
        if (!map.current || !potholes) return;

        const sourceId = 'potholes-source';
        if (!map.current.getSource(sourceId)) {
            map.current.addSource(sourceId, {
                type: 'geojson',
                data: potholes,
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50
            });

            map.current.addLayer({
                id: 'clusters',
                type: 'circle',
                source: sourceId,
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': ['step', ['get', 'point_count'], '#fbbf24', 5, '#f97316', 15, '#ef4444'],
                    'circle-radius': ['step', ['get', 'point_count'], 20, 5, 30, 15, 40],
                    'circle-opacity': 0.85,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff'
                }
            });

            map.current.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: sourceId,
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 12
                },
                paint: {
                    'text-color': '#ffffff'
                }
            });

            map.current.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: sourceId,
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': '#ef4444',
                    'circle-radius': 8,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff'
                }
            });

            // Handle clicks on individual points
            map.current.on('click', 'unclustered-point', (e) => {
                const properties = e.features[0].properties;
                onHazardClick(properties);
            });

            // Zoom into cluster on click
            map.current.on('click', 'clusters', (e) => {
                const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                const clusterId = features[0].properties.cluster_id;
                map.current.getSource(sourceId).getClusterExpansionZoom(clusterId, (err, zoom) => {
                    if (err) return;
                    map.current.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                });
            });

            // Change cursor
            map.current.on('mouseenter', 'unclustered-point', () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'unclustered-point', () => {
                map.current.getCanvas().style.cursor = '';
            });
            map.current.on('mouseenter', 'clusters', () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'clusters', () => {
                map.current.getCanvas().style.cursor = '';
            });
        } else {
            map.current.getSource(sourceId).setData(potholes);
        }
    }, [potholes]);

    return html`
        <div ref=${mapContainer} className="map-container" />
    `;
});
