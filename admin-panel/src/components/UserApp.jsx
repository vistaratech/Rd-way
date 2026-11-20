import React, { useState } from 'react';
import GoogleMapsEV from './GoogleMapsEV';
import {
  Zap,
  MapPin,
  Navigation,
  BatteryCharging,
  Search,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function UserApp({
  stations = [],
  onSelectStation,
  activeStation = null,
  onOpenAdmin
}) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState(activeStation || (stations.length > 0 ? stations[0] : null));

  // Filter stations
  const filteredStations = stations.filter(s => {
    if (filterType === '2W' && !s.twoWheeler) return false;
    if (filterType === '4W' && !s.fourWheeler) return false;
    if (filterType === 'FAST' && (s.voltageValue || 0) < 400) return false;
    if (filterType === 'AVAILABLE' && (s.availableChargers || 0) <= 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStationTouch = (station) => {
    setSelectedStation(station);
    if (onSelectStation) onSelectStation(station);
  };

  const currentStation = selectedStation || (filteredStations.length > 0 ? filteredStations[0] : null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '820px', background: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
      {/* Top Header */}
      <div style={{ padding: '16px 24px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/rodeway_logo.png" alt="Rodeway" style={{ height: '36px', objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              EV CHARGE <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontWeight: 700 }}>USER APP</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              Tap any charging station on the map to view slots, voltage & directions
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F0FDF4', padding: '6px 14px', borderRadius: '20px', border: '1px solid #BBF7D0' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
              {filteredStations.length} STATIONS ONLINE
            </span>
          </div>

          <button
            onClick={onOpenAdmin}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#334155', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
          >
            <span>Admin Station Placer</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div style={{ padding: '14px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search EV station by name or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: '⚡ All Stations' },
            { id: '2W', label: '🛵 2-Wheelers' },
            { id: '4W', label: '🚗 4-Wheelers' },
            { id: 'FAST', label: '⚡ Fast (>400V)' },
            { id: 'AVAILABLE', label: '🟢 Available' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: filterType === tab.id ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                background: filterType === tab.id ? '#ECFDF5' : '#FFFFFF',
                color: filterType === tab.id ? '#059669' : '#64748B',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Clean Map + Selected Station Details Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', flex: 1, minHeight: '620px', position: 'relative' }}>
        {/* Interactive Google Map */}
        <div style={{ position: 'relative', height: '100%' }}>
          <GoogleMapsEV
            stations={filteredStations}
            selectedStation={currentStation}
            onStationSelect={handleStationTouch}
            center={currentStation ? { lat: currentStation.lat, lng: currentStation.lng } : { lat: 12.971598, lng: 77.594566 }}
            zoom={13}
            height="100%"
          />

          {/* Floating Map Hint */}
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, background: '#FFFFFF', padding: '10px 18px', borderRadius: '30px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: '18px' }}>👆</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
              Touch any <strong style={{ color: '#10B981' }}>⚡ EV marker</strong> to view slots, voltage rating & directions
            </span>
          </div>
        </div>

        {/* Selected EV Station Details Card */}
        <div style={{ background: '#FFFFFF', borderLeft: '1px solid #E2E8F0', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {currentStation ? (
            <>
              {/* Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: currentStation.status === 'Available' ? '#ECFDF5' : '#FEE2E2',
                    color: currentStation.status === 'Available' ? '#059669' : '#DC2626',
                    border: `1px solid ${currentStation.status === 'Available' ? '#A7F3D0' : '#FECACA'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentStation.status === 'Available' ? '#10B981' : '#EF4444' }}></span>
                    {currentStation.status}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                    {currentStation.operatingHours || '24/7 Open'}
                  </span>
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', lineHeight: 1.25, marginBottom: '6px' }}>
                  {currentStation.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#64748B', fontSize: '13px' }}>
                  <MapPin size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{currentStation.address}</span>
                </div>
              </div>

              {/* 1. HOW MANY CHARGERS & 2. HOW MANY VOLTS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Chargers Count (Green) */}
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    <BatteryCharging size={16} color="#10B981" />
                    <span>CHARGERS STATUS</span>
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#10B981' }}>
                    {currentStation.availableChargers} <span style={{ fontSize: '16px', color: '#94A3B8', fontWeight: 400 }}>/ {currentStation.totalChargers}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                    Available Ports
                  </div>

                  {/* Visual slot breakdown */}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                    {Array.from({ length: currentStation.totalChargers }).map((_, i) => (
                      <span
                        key={i}
                        title={i < currentStation.availableChargers ? 'Available Slot' : 'In Use'}
                        style={{
                          height: '6px',
                          flex: 1,
                          borderRadius: '3px',
                          background: i < currentStation.availableChargers ? '#10B981' : '#E2E8F0'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Voltage & Power Rating */}
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    <Zap size={16} color="#0284C7" />
                    <span>VOLTAGE & POWER</span>
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284C7' }}>
                    {currentStation.voltageValue || 480}V
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                    {currentStation.powerKw || 60} kW Fast Charge
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748B' }}>
                    {currentStation.voltage}
                  </div>
                </div>
              </div>

              {/* 3. TWO-WHEELER OR FOUR-WHEELER SUPPORT */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, marginBottom: '12px' }}>
                  VEHICLE COMPATIBILITY
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {/* Two-Wheeler */}
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: currentStation.twoWheeler ? '#F5F3FF' : '#F1F5F9',
                    border: currentStation.twoWheeler ? '1.5px solid #DDD6FE' : '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '22px' }}>🛵</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: currentStation.twoWheeler ? '#7C3AED' : '#94A3B8' }}>
                        2-WHEELER
                      </div>
                      <div style={{ fontSize: '11px', color: currentStation.twoWheeler ? '#475569' : '#94A3B8' }}>
                        {currentStation.twoWheeler ? 'Supported (Ather, Ola)' : 'Not Supported'}
                      </div>
                    </div>
                  </div>

                  {/* Four-Wheeler */}
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: currentStation.fourWheeler ? '#EFF6FF' : '#F1F5F9',
                    border: currentStation.fourWheeler ? '1.5px solid #BFDBFE' : '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '22px' }}>🚗</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: currentStation.fourWheeler ? '#2563EB' : '#94A3B8' }}>
                        4-WHEELER
                      </div>
                      <div style={{ fontSize: '11px', color: currentStation.fourWheeler ? '#475569' : '#94A3B8' }}>
                        {currentStation.fourWheeler ? 'Supported (Cars/SUVs)' : 'Not Supported'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. CONNECTORS & TARIFF */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>
                    SUPPORTED CONNECTORS
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>
                    {currentStation.pricing || '₹16.00 / kWh'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentStation.connectorTypes || ['CCS2', 'Type 2 AC']).map((c, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '5px 12px',
                        background: '#FFFFFF',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#334155',
                        border: '1px solid #CBD5E1',
                        fontWeight: 600
                      }}
                    >
                      🔌 {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* 5. DIRECTIONS & GOOGLE MAPS NAVIGATION */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${currentStation.lat},${currentStation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '16px 24px',
                    borderRadius: '14px',
                    background: '#10B981',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '15px',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Navigation size={20} strokeWidth={2.4} />
                  <span>START NAVIGATION (GOOGLE MAPS)</span>
                  <ExternalLink size={16} />
                </a>

                <div style={{ fontSize: '12px', textAlign: 'center', color: '#64748B' }}>
                  Target: {currentStation.lat.toFixed(5)}, {currentStation.lng.toFixed(5)} • Turn-by-turn guidance
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', textAlign: 'center', gap: '12px' }}>
              <Zap size={48} strokeWidth={1.5} color="#CBD5E1" />
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#334155' }}>
                No EV Station Selected
              </div>
              <p style={{ fontSize: '13px', maxWidth: '280px' }}>
                Touch any charging station marker on the map to view live slots, voltage rating, and driving directions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
