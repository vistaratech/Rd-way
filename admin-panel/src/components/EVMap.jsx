import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Create custom EV Station icon
export function createEVIcon(station, isSelected = false) {
  const is2W = station.twoWheeler;
  const is4W = station.fourWheeler;
  const isFast = (station.voltageValue || 0) >= 400;

  let badgeText = 'EV';
  if (is2W && is4W) badgeText = '2W+4W';
  else if (is2W) badgeText = '2W';
  else if (is4W) badgeText = '4W';

  const borderColor = isSelected ? '#00F0FF' : (isFast ? '#00E676' : '#38BDF8');
  const glow = isSelected ? '0 0 20px #00F0FF' : '0 0 12px rgba(0, 230, 118, 0.4)';

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: #0B132B;
      border: 2px solid ${borderColor};
      border-radius: 50%;
      box-shadow: ${glow};
      cursor: pointer;
      transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
      transition: all 0.2s ease;
    ">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="${borderColor}">
        <path d="M11 20V13.5H8.5L13 3V10.5H15.5L11 20Z" />
      </svg>
      <div style="
        position: absolute;
        bottom: -6px;
        background: #111827;
        color: ${borderColor};
        border: 1px solid ${borderColor};
        border-radius: 6px;
        font-size: 8px;
        font-weight: 800;
        padding: 1px 4px;
        font-family: 'Rajdhani', sans-serif;
        letter-spacing: 0.5px;
      ">${badgeText}</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-ev-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
}

// Create custom Target Placement pin
export function createTargetPinIcon() {
  const html = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -100%);
      pointer-events: none;
    ">
      <div style="
        width: 38px;
        height: 38px;
        background: #EF4444;
        border: 3px solid #FFFFFF;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 14px;
          height: 14px;
          background: #FFFFFF;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
      <div style="
        width: 10px;
        height: 10px;
        background: rgba(239, 68, 68, 0.4);
        border-radius: 50%;
        margin-top: -3px;
        box-shadow: 0 0 10px #EF4444;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-target-marker',
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
}

// Map Click Listener component
function MapEventsHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({
          lat: parseFloat(e.latlng.lat.toFixed(6)),
          lng: parseFloat(e.latlng.lng.toFixed(6))
        });
      }
    }
  });
  return null;
}

// Center map smoothly when focus target changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 14, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function EVMap({
  stations = [],
  selectedStation = null,
  onStationSelect,
  targetPin = null,
  onMapClick,
  center = [12.971598, 77.594566],
  zoom = 13,
  height = '500px'
}) {
  return (
    <div style={{ height, width: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={center} zoom={zoom} />
        <MapEventsHandler onMapClick={onMapClick} />

        {/* High-Tech Dark Map Tiles (CartoDB Dark Matter) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Placed EV Charging Stations */}
        {stations.map(station => {
          const isSelected = selectedStation && selectedStation.id === station.id;
          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={createEVIcon(station, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onStationSelect) {
                    onStationSelect(station);
                  }
                }
              }}
            >
              <Popup>
                <div style={{ minWidth: '180px', fontFamily: 'Exo 2, sans-serif' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#00E676', marginBottom: '4px' }}>
                    ⚡ {station.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>
                    {station.address}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid #1E293B', paddingTop: '6px' }}>
                    <span>⚡ {station.voltage}</span>
                    <span style={{ color: '#00F0FF', fontWeight: 600 }}>{station.availableChargers}/{station.totalChargers} Free</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Admin Placement Target Pin */}
        {targetPin && (
          <Marker
            position={[targetPin.lat, targetPin.lng]}
            icon={createTargetPinIcon()}
          />
        )}
      </MapContainer>
    </div>
  );
}
