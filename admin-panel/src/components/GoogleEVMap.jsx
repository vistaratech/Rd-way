import React, { useEffect, useRef } from 'react';

// Google Maps Dark Style Array (completely eliminates white tiles)
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0F172A" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#090D16" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94A3B8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38BDF8" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748B" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0D2818" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#34A853" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1E293B" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0F172A" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#CBD5E1" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1E293B" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FBBF24" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1E293B" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4285F4" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#08101E" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38BDF8" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#08101E" }]
  }
];

export default function GoogleEVMap({
  stations = [],
  targetPin = null,
  onMapClick,
  center = { lat: 12.971598, lng: 77.594566 },
  zoom = 13,
  height = '500px'
}) {
  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const targetMarkerRef = useRef(null);
  const stationMarkersRef = useRef([]);
  const infoWindowRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!window.google || !window.google.maps || !mapRef.current) return;

    if (!googleMapInstance.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: darkMapStyle,
        backgroundColor: '#090D16',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
      });

      infoWindowRef.current = new window.google.maps.InfoWindow();

      // Listen for map click to place new station pin
      map.addListener('click', (e) => {
        if (onMapClick && e.latLng) {
          onMapClick({
            lat: parseFloat(e.latLng.lat().toFixed(6)),
            lng: parseFloat(e.latLng.lng().toFixed(6))
          });
        }
      });

      googleMapInstance.current = map;
    }
  }, []);

  // Update Target Pin Marker (Red Google-Style Pin)
  useEffect(() => {
    if (!googleMapInstance.current || !window.google || !targetPin) return;

    if (!targetMarkerRef.current) {
      targetMarkerRef.current = new window.google.maps.Marker({
        position: targetPin,
        map: googleMapInstance.current,
        title: "Station Placement Target",
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
          fillColor: "#EA4335",
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
  }, [targetPin]);

  // Update EV Station Markers
  useEffect(() => {
    if (!googleMapInstance.current || !window.google) return;

    // Clear old markers
    stationMarkersRef.current.forEach(m => m.setMap(null));
    stationMarkersRef.current = [];

    // Add marker for each station
    stations.forEach(station => {
      const isFast = (station.voltageValue || 0) >= 400;
      const markerColor = isFast ? "#34A853" : "#4285F4"; // Google Green or Google Blue

      const marker = new window.google.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map: googleMapInstance.current,
        title: station.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: markerColor,
          fillOpacity: 0.95,
          strokeColor: "#FFFFFF",
          strokeWeight: 2
        }
      });

      marker.addListener('click', () => {
        const content = `
          <div style="font-family: 'Poppins', sans-serif; min-width: 200px; padding: 4px;">
            <div style="font-size: 15px; font-weight: 700; color: #34A853; margin-bottom: 4px;">
              ⚡ ${station.name}
            </div>
            <div style="font-size: 12px; color: #CBD5E1; margin-bottom: 8px;">
              ${station.address}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
              <span style="color: #4285F4; font-weight: 600;">⚡ ${station.voltage}</span>
              <span style="color: #34A853; font-weight: 700;">${station.availableChargers}/${station.totalChargers} Free</span>
            </div>
            <div style="display: flex; gap: 6px; font-size: 11px;">
              ${station.twoWheeler ? '<span style="background: rgba(167,139,250,0.2); color: #C084FC; padding: 2px 6px; border-radius: 4px;">🛵 2W</span>' : ''}
              ${station.fourWheeler ? '<span style="background: rgba(56,189,248,0.2); color: #38BDF8; padding: 2px 6px; border-radius: 4px;">🚗 4W</span>' : ''}
            </div>
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(googleMapInstance.current, marker);
      });

      stationMarkersRef.current.push(marker);
    });
  }, [stations]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height,
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#090D16',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    />
  );
}
