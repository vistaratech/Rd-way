import React, { useEffect, useRef, useState } from 'react';
import CleanEVMap from './CleanEVMap';
import { AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function GoogleMapsEV({
  stations = [],
  selectedStation = null,
  onStationSelect,
  targetPin = null,
  onMapClick,
  center = { lat: 12.971598, lng: 77.594566 },
  zoom = 13,
  height = '500px'
}) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const targetMarkerRef = useRef(null);
  const stationMarkersRef = useRef([]);
  const infoWindowRef = useRef(null);
  
  const [googleMapsReady, setGoogleMapsReady] = useState(false);
  const [authBlocked, setAuthBlocked] = useState(false);
  const [useFallbackOSM, setUseFallbackOSM] = useState(false);

  // Hook into Google Maps auth failure callback
  useEffect(() => {
    window.gm_authFailure = () => {
      console.warn('Google Maps auth error: Key is restricted or blocked (ApiTargetBlockedMapError)');
      setAuthBlocked(true);
    };

    // Check if google maps script has loaded
    if (window.google && window.google.maps) {
      setGoogleMapsReady(true);
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          setGoogleMapsReady(true);
          clearInterval(interval);
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!window.google || !window.google.maps) {
          setAuthBlocked(true);
        }
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  // Initialize Google Maps instance
  useEffect(() => {
    if (!googleMapsReady || !containerRef.current || mapInstanceRef.current || useFallbackOSM) return;

    try {
      const map = new window.google.maps.Map(containerRef.current, {
        center,
        zoom,
        mapTypeId: 'roadmap',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      infoWindowRef.current = new window.google.maps.InfoWindow();

      // Click listener for station placement
      map.addListener('click', (e) => {
        if (onMapClick && e.latLng) {
          onMapClick({
            lat: parseFloat(e.latLng.lat().toFixed(6)),
            lng: parseFloat(e.latLng.lng().toFixed(6))
          });
        }
      });

      mapInstanceRef.current = map;
    } catch (err) {
      console.error('Google Maps initialization error:', err);
      setAuthBlocked(true);
    }
  }, [googleMapsReady, useFallbackOSM]);

  // Update target pin (Admin placement red marker)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google || !targetPin || useFallbackOSM) return;

    if (!targetMarkerRef.current) {
      targetMarkerRef.current = new window.google.maps.Marker({
        position: targetPin,
        map: mapInstanceRef.current,
        title: "Station Placement Target",
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
          fillColor: "#EF4444",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
          scale: 1.8,
          anchor: new window.google.maps.Point(12, 22)
        }
      });
    } else {
      targetMarkerRef.current.setPosition(targetPin);
    }
  }, [targetPin, useFallbackOSM]);

  // Update station markers on Google Map
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google || useFallbackOSM) return;

    // Clear old markers
    stationMarkersRef.current.forEach(m => m.setMap(null));
    stationMarkersRef.current = [];

    // Add marker for each EV station
    stations.forEach(station => {
      const isSelected = selectedStation && selectedStation.id === station.id;
      const markerColor = isSelected ? "#059669" : "#10B981";

      const marker = new window.google.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map: mapInstanceRef.current,
        title: station.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 13 : 11,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2.5
        }
      });

      marker.addListener('click', () => {
        if (onStationSelect) {
          onStationSelect(station);
        }

        const infoContent = `
          <div style="font-family: 'Poppins', sans-serif; min-width: 210px; padding: 6px;">
            <div style="font-size: 14px; font-weight: 700; color: #10B981; margin-bottom: 3px;">
              ⚡ ${station.name}
            </div>
            <div style="font-size: 11px; color: #64748B; margin-bottom: 6px; line-height: 1.4;">
              ${station.address}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; border-top: 1px solid #E2E8F0; padding-top: 6px;">
              <span style="color: #0F172A;">⚡ ${station.voltage}</span>
              <span style="color: #10B981;">${station.availableChargers}/${station.totalChargers} Free</span>
            </div>
            <div style="display: flex; gap: 4px; margin-top: 6px;">
              ${station.twoWheeler ? '<span style="background: #F5F3FF; color: #7C3AED; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">🛵 2W</span>' : ''}
              ${station.fourWheeler ? '<span style="background: #EFF6FF; color: #2563EB; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">🚗 4W</span>' : ''}
            </div>
          </div>
        `;

        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
      });

      stationMarkersRef.current.push(marker);
    });
  }, [stations, selectedStation, googleMapsReady, useFallbackOSM]);

  // Center pan when selected station changes
  useEffect(() => {
    if (mapInstanceRef.current && center && center.lat && center.lng && !useFallbackOSM) {
      mapInstanceRef.current.panTo(center);
    }
  }, [center, useFallbackOSM]);

  // If user toggled to OSM fallback
  if (useFallbackOSM) {
    return (
      <div style={{ position: 'relative', width: '100%', height }}>
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 1000,
          background: '#FFFFFF',
          padding: '6px 12px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          fontWeight: 600
        }}>
          <span style={{ color: '#64748B' }}>Map: OpenStreetMap</span>
          <button
            type="button"
            onClick={() => setUseFallbackOSM(false)}
            style={{
              background: '#ECFDF5',
              color: '#059669',
              border: '1px solid #A7F3D0',
              padding: '3px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Switch to Google Maps
          </button>
        </div>
        <CleanEVMap
          stations={stations}
          selectedStation={selectedStation}
          onStationSelect={onStationSelect}
          targetPin={targetPin}
          onMapClick={onMapClick}
          center={center}
          zoom={zoom}
          height="100%"
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      {/* Auth restriction alert banner if Google blocks API key */}
      {authBlocked && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          zIndex: 10,
          background: '#FFFBEB',
          border: '1.5px solid #F59E0B',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 8px 24px rgba(245, 158, 11, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontFamily: "'Poppins', sans-serif"
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: 700, fontSize: '13px' }}>
              <AlertCircle size={18} color="#D97706" />
              <span>Google Maps API Key: Key Restriction Warning (ApiTargetBlockedMapError)</span>
            </div>
            <button
              type="button"
              onClick={() => setUseFallbackOSM(true)}
              style={{
                background: '#059669',
                color: '#FFFFFF',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              Preview on OSM Map
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#92400E', lineHeight: '1.5' }}>
            In your Google Cloud Project (<strong>Rent A Home</strong>), the API key has <strong>Application restrictions</strong> set to <em>Android apps</em> or blocking web.
            <br />
            <strong>Fix:</strong> In Google Cloud Console &gt; <strong>APIs &amp; Services</strong> &gt; <strong>Credentials</strong> &gt; click your API key &gt; under <strong>Application restrictions</strong> select <strong>None</strong> &gt; Click <strong>SAVE</strong>.
          </div>
        </div>
      )}

      {/* Google Maps Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#F1F5F9'
        }}
      />
    </div>
  );
}
