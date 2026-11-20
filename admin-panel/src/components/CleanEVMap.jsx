import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom Emerald Green EV Station Marker
export function createEVIcon(station, isSelected = false) {
  const is2W = station.twoWheeler;
  const is4W = station.fourWheeler;
  let badgeText = 'EV';
  if (is2W && is4W) badgeText = '2W+4W';
  else if (is2W) badgeText = '2W';
  else if (is4W) badgeText = '4W';

  const borderColor = isSelected ? '#059669' : '#10B981';
  const shadow = isSelected ? '0 0 16px rgba(16, 185, 129, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.15)';

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      background: #FFFFFF;
      border: 2.5px solid ${borderColor};
      border-radius: 50%;
      box-shadow: ${shadow};
      cursor: pointer;
      transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
      transition: all 0.2s ease;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="${borderColor}">
        <path d="M11 20V13.5H8.5L13 3V10.5H15.5L11 20Z" />
      </svg>
      <div style="
        position: absolute;
        bottom: -7px;
        background: #10B981;
        color: #FFFFFF;
        border-radius: 6px;
        font-size: 8px;
        font-weight: 700;
        padding: 1px 4px;
        font-family: 'Poppins', sans-serif;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
      ">${badgeText}</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-clean-ev-marker',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -21]
  });
}

// Custom Red Target Placement Pin
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
        width: 36px;
        height: 36px;
        background: #EF4444;
        border: 3px solid #FFFFFF;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 14px rgba(239, 68, 68, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: #FFFFFF;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
      <div style="
        width: 10px;
        height: 10px;
        background: rgba(239, 68, 68, 0.3);
        border-radius: 50%;
        margin-top: -3px;
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

// Map Click Listener
function MapClickHandler({ onMapClick }) {
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

// Center view controller
function ChangeCenterView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], zoom || 14, { duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function CleanEVMap({
  stations = [],
  selectedStation = null,
  onStationSelect,
  targetPin = null,
  onMapClick,
  center = { lat: 12.971598, lng: 77.594566 },
  zoom = 13,
  height = '500px'
}) {
  return (
    <div style={{ height, width: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeCenterView center={center} zoom={zoom} />
        <MapClickHandler onMapClick={onMapClick} />

        {/* Clean Standard OpenStreetMap (100% Free, Reliable, No API Key Required, Clean Light Road Map) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Placed Stations */}
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
                <div style={{ minWidth: '200px', fontFamily: "'Poppins', sans-serif" }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#10B981', marginBottom: '4px' }}>
                    ⚡ {station.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px', lineHeight: 1.4 }}>
                    {station.address}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '6px' }}>
                    <span style={{ color: '#0F172A', fontWeight: 600 }}>⚡ {station.voltage}</span>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>{station.availableChargers}/{station.totalChargers} Free</span>
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
