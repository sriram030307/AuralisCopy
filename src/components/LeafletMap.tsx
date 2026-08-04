import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationCoords, NearbyPlace, Guardian } from '../types';
import { WifiOff, Database } from 'lucide-react';

interface LeafletMapProps {
  center: LocationCoords;
  nearbyPlaces?: NearbyPlace[];
  guardians?: Guardian[];
  height?: string;
  showRoute?: boolean;
  destinationCoords?: { lat: number; lng: number };
  onPlaceClick?: (place: NearbyPlace) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  nearbyPlaces = [],
  guardians = [],
  height = '320px',
  showRoute = false,
  destinationCoords,
  onPlaceClick
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastCacheTime, setLastCacheTime] = useState<string>('');

  // Online / Offline state listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache Map View & Emergency Markers locally for offline resilience
  useEffect(() => {
    if (center && center.latitude && center.longitude) {
      try {
        const cacheData = {
          center,
          nearbyPlaces: nearbyPlaces.slice(0, 10),
          guardians: guardians.slice(0, 5),
          timestamp: new Date().toLocaleTimeString()
        };
        localStorage.setItem('auralis_offline_map_cache', JSON.stringify(cacheData));
        setLastCacheTime(cacheData.timestamp);
      } catch (err) {
        // storage quota fallback
      }
    }
  }, [center, nearbyPlaces, guardians]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const leafletLib = L || (window as any).L;
    if (!leafletLib) return;

    // Load active or cached center
    let mapCenterLat = center.latitude;
    let mapCenterLng = center.longitude;

    if (isOffline) {
      try {
        const saved = localStorage.getItem('auralis_offline_map_cache');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.center?.latitude) {
            mapCenterLat = parsed.center.latitude;
            mapCenterLng = parsed.center.longitude;
          }
        }
      } catch {}
    }

    // Initialize Map if not existing
    if (!mapInstanceRef.current) {
      try {
        const map = leafletLib.map(mapContainerRef.current, {
          center: [mapCenterLat, mapCenterLng],
          zoom: 14,
          zoomControl: false,
          attributionControl: false
        });

        // Dark Map Tile Layer (CartoDB Dark Matter with tile fallback)
        const tileLayer = leafletLib.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        });
        
        tileLayer.addTo(map);
        mapInstanceRef.current = map;
      } catch (e) {
        console.warn('Map initialization note:', e);
      }
    } else {
      mapInstanceRef.current.setView([mapCenterLat, mapCenterLng], 14);
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Invalidate size in case of layout shifts
    setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {}
    }, 100);

    // Clear previous markers
    markersRef.current.forEach(m => {
      try {
        map.removeLayer(m);
      } catch {}
    });
    markersRef.current = [];

    // 1. User Location Pulsing Marker
    const userIcon = leafletLib.divIcon({
      className: 'user-pin-icon',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <span class="absolute inline-flex w-full h-full rounded-full ${isOffline ? 'bg-amber-500' : 'bg-rose-500'} opacity-75 animate-ping"></span>
          <span class="relative inline-flex w-5 h-5 rounded-full bg-gradient-to-tr ${isOffline ? 'from-amber-600 to-amber-400' : 'from-rose-600 to-rose-400'} border-2 border-white shadow-lg"></span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const userMarker = leafletLib.marker([mapCenterLat, mapCenterLng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`
        <div class="p-2 text-slate-900 font-sans text-xs">
          <strong class="${isOffline ? 'text-amber-600' : 'text-rose-600'}">${isOffline ? 'Last Cached GPS Position' : 'You are Here'}</strong><br/>
          ${center.address || 'Emergency GPS Grid'}
        </div>
      `);
    markersRef.current.push(userMarker);

    // Accuracy circle
    const circle = leafletLib.circle([mapCenterLat, mapCenterLng], {
      color: isOffline ? '#f59e0b' : '#f43f5e',
      fillColor: isOffline ? '#f59e0b' : '#f43f5e',
      fillOpacity: 0.12,
      radius: center.accuracy || 80
    }).addTo(map);
    markersRef.current.push(circle);

    // 2. Nearby Emergency Places
    nearbyPlaces.forEach(place => {
      let bgClass = 'bg-blue-600';
      let emoji = '🏥';

      if (place.category === 'police') { bgClass = 'bg-amber-500'; emoji = '🚨'; }
      else if (place.category === 'women_helpline') { bgClass = 'bg-purple-600'; emoji = '🛡️'; }
      else if (place.category === 'hospital') { bgClass = 'bg-rose-600'; emoji = '🏥'; }
      else if (place.category === 'pharmacy') { bgClass = 'bg-emerald-600'; emoji = '💊'; }
      else if (place.category === 'petrol_pump') { bgClass = 'bg-cyan-600'; emoji = '⛽'; }
      else if (place.category === 'metro') { bgClass = 'bg-indigo-600'; emoji = '🚇'; }

      const placeIcon = leafletLib.divIcon({
        className: 'place-pin-icon',
        html: `
          <div class="${bgClass} w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs shadow-md cursor-pointer transform hover:scale-110 transition-transform">
            ${emoji}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const pMarker = leafletLib.marker([place.latitude, place.longitude], { icon: placeIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2 font-sans text-xs text-slate-900">
            <span class="font-bold text-slate-800">${place.name}</span><br/>
            <span class="text-slate-600">${place.address} (${place.distanceKm} km)</span><br/>
            <a href="tel:${place.phone}" class="inline-block mt-1.5 px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold">Call ${place.phone}</a>
          </div>
        `);

      if (onPlaceClick) {
        pMarker.on('click', () => onPlaceClick(place));
      }
      markersRef.current.push(pMarker);
    });

    // 3. Guardians
    guardians.forEach(g => {
      if (!g.latitude || !g.longitude) return;
      const gIcon = leafletLib.divIcon({
        className: 'guardian-pin-icon',
        html: `
          <div class="bg-indigo-600 text-white font-bold text-[10px] px-2 py-1 rounded-full border border-white/50 shadow-lg flex items-center gap-1">
            <span>🛡️</span> ${g.name.split(' ')[0]}
          </div>
        `,
        iconSize: [85, 24],
        iconAnchor: [42, 12]
      });

      const gMarker = leafletLib.marker([g.latitude, g.longitude], { icon: gIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2.5 font-sans text-xs text-slate-900 min-w-[170px]">
            <div class="font-bold text-indigo-950 text-sm">${g.name}</div>
            <div class="text-[11px] text-slate-600 font-medium">${g.relation} • <span class="font-mono text-slate-800 font-bold">${g.phone}</span></div>
            <div class="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
              <span>📱 Signal Active</span> • <span>🔋 ${g.batteryLevel || 90}%</span>
            </div>
            <div class="text-[10px] text-slate-500 font-semibold">${g.distanceKm || 1.2} km from your GPS location</div>
            <a href="tel:${g.phone}" class="inline-block w-full text-center mt-2 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow">
              📞 Call ${g.phone}
            </a>
          </div>
        `);
      markersRef.current.push(gMarker);
    });

    // 4. Route Polyline if active journey
    if (showRoute && destinationCoords) {
      const routeLine = leafletLib.polyline([
        [mapCenterLat, mapCenterLng],
        [destinationCoords.lat, destinationCoords.lng]
      ], {
        color: '#a855f7',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.8
      }).addTo(map);
      markersRef.current.push(routeLine);

      // Destination Marker
      const destIcon = leafletLib.divIcon({
        className: 'dest-pin',
        html: `
          <div class="bg-purple-600 text-white w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-lg">
            🎯
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      const destMarker = leafletLib.marker([destinationCoords.lat, destinationCoords.lng], { icon: destIcon }).addTo(map);
      markersRef.current.push(destMarker);
    }

    return () => {
      markersRef.current.forEach(m => {
        try { map.removeLayer(m); } catch {}
      });
    };
  }, [center, nearbyPlaces, guardians, showRoute, destinationCoords, onPlaceClick, isOffline]);

  // Clean up map instance on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <div id="leaflet-map-container" ref={mapContainerRef} style={{ height, width: '100%' }} />
      
      {/* Top Status Badges */}
      <div className="absolute top-2 right-2 z-[400] flex items-center gap-1.5">
        {isOffline ? (
          <div className="bg-amber-950/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-lg">
            <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Offline Map Cache</span>
          </div>
        ) : (
          <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-rose-400 border border-white/10 flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live GPS</span>
          </div>
        )}
      </div>

      {/* Offline Emergency Info Bar at Bottom of Map */}
      <div className="absolute bottom-1.5 left-2 right-2 z-[400] bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] text-slate-300 border border-white/10 flex items-center justify-between">
        <span className="flex items-center gap-1 text-slate-400">
          <Database className="w-3 h-3 text-cyan-400" />
          <span>Cache: {lastCacheTime || 'Active'}</span>
        </span>
        <button
          onClick={() => setIsOffline(prev => !prev)}
          className="text-[9px] font-bold text-cyan-300 hover:text-white underline underline-offset-2"
        >
          {isOffline ? 'Simulate Online' : 'Simulate Offline Cache'}
        </button>
      </div>
    </div>
  );
};
