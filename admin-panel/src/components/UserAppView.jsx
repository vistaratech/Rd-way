import React, { useState } from 'react';
import EVMap from './EVMap';
import {
  Zap,
  MapPin,
  Navigation,
  BatteryCharging,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function UserAppView({ stations = [], onSelectStation, activeStation = null }) {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | '2W' | '4W' | 'FAST' | 'AVAILABLE'
  const [searchQuery, setSearchQuery] = useState('');
  const [touchModalOpen, setTouchModalOpen] = useState(false);
  const [navigatingStation, setNavigatingStation] = useState(null);

  // Filter stations based on selection and query
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
    if (onSelectStation) onSelectStation(station);
    setTouchModalOpen(true);
  };

  const currentStation = activeStation || (filteredStations.length > 0 ? filteredStations[0] : null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '850px', background: '#090D16', color: '#F8FAFC', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0, 230, 118, 0.25)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
      {/* Top Header / App Brand */}
      <div style={{ padding: '16px 24px', background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #00E676 0%, #00F0FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0,230,118,0.4)' }}>
            <Zap size={22} color="#090D16" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '18px', fontWeight: 800, letterSpacing: '1px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              RODEWAY <span style={{ color: '#00E676' }}>CHARGE</span>
              <span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(0,230,118,0.15)', color: '#00E676', borderRadius: '6px', border: '1px solid rgba(0,230,118,0.3)', fontFamily: 'Rajdhani, sans-serif' }}>USER APP</span>
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'Exo 2, sans-serif' }}>
              Tap any charging station on the map for live slots, voltage & directions
            </div>
          </div>
        </div>

        {/* Live Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 230, 118, 0.1)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(0,230,118,0.3)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E676', boxShadow: '0 0 8px #00E676' }}></span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#00E676', fontFamily: 'Rajdhani, sans-serif' }}>
            {filteredStations.length} STATIONS ONLINE
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ padding: '14px 24px', background: '#0D1527', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
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
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#F8FAFC',
              fontSize: '13px',
              fontFamily: 'Exo 2, sans-serif',
              outline: 'none'
            }}
          />
        </div>

        {/* Vehicle & Fast Charge Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Stations' },
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
                fontFamily: 'Rajdhani, sans-serif',
                cursor: 'pointer',
                border: filterType === tab.id ? '1px solid #00E676' : '1px solid rgba(255,255,255,0.08)',
                background: filterType === tab.id ? 'rgba(0, 230, 118, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                color: filterType === tab.id ? '#00E676' : '#94A3B8',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: Map + Side Details Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', flex: 1, minHeight: '620px', position: 'relative' }}>
        {/* Interactive Map */}
        <div style={{ position: 'relative', height: '100%' }}>
          <EVMap
            stations={filteredStations}
            selectedStation={currentStation}
            onStationSelect={handleStationTouch}
            center={currentStation ? [currentStation.lat, currentStation.lng] : [12.971598, 77.594566]}
            zoom={13}
            height="100%"
          />

          {/* Floating Map Hint */}
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', padding: '10px 18px', borderRadius: '30px', border: '1px solid rgba(0, 230, 118, 0.3)', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
            <span style={{ fontSize: '18px' }}>👆</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#E2E8F0', fontFamily: 'Exo 2, sans-serif' }}>
              Touch any <strong style={{ color: '#00E676' }}>⚡ EV pin</strong> to inspect voltage, chargers & get Google directions
            </span>
          </div>
        </div>

        {/* Selected EV Station Details Card (The core user experience requirement) */}
        <div style={{ background: '#0D1322', borderLeft: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {currentStation ? (
            <>
              {/* Header Info */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontFamily: 'Rajdhani, sans-serif',
                    background: currentStation.status === 'Available' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: currentStation.status === 'Available' ? '#00E676' : '#EF4444',
                    border: `1px solid ${currentStation.status === 'Available' ? 'rgba(0, 230, 118, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentStation.status === 'Available' ? '#00E676' : '#EF4444' }}></span>
                    {currentStation.status}
                  </span>
                  <span style={{ fontSize: '13px', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
                    {currentStation.operatingHours || '24/7 Open'}
                  </span>
                </div>

                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '24px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, marginBottom: '6px' }}>
                  {currentStation.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#94A3B8', fontSize: '13px' }}>
                  <MapPin size={16} color="#00F0FF" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{currentStation.address}</span>
                </div>
              </div>

              {/* STATS HIGHLIGHT GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* 1. HOW MANY CHARGERS */}
                <div style={{ background: 'rgba(21, 31, 51, 0.7)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0, 230, 118, 0.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                    <BatteryCharging size={16} color="#00E676" />
                    <span>CHARGERS STATUS</span>
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Orbitron, sans-serif', color: '#00E676' }}>
                    {currentStation.availableChargers} <span style={{ fontSize: '16px', color: '#94A3B8', fontWeight: 400 }}>/ {currentStation.totalChargers}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#E2E8F0', marginTop: '4px' }}>
                    Available Ports
                  </div>

                  {/* Visual slot breakdown dots */}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                    {Array.from({ length: currentStation.totalChargers }).map((_, i) => (
                      <span
                        key={i}
                        title={i < currentStation.availableChargers ? 'Available Slot' : 'In Use'}
                        style={{
                          height: '6px',
                          flex: 1,
                          borderRadius: '3px',
                          background: i < currentStation.availableChargers ? '#00E676' : 'rgba(255,255,255,0.15)'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. HOW MANY VOLTS / POWER */}
                <div style={{ background: 'rgba(21, 31, 51, 0.7)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0, 240, 255, 0.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                    <Zap size={16} color="#00F0FF" />
                    <span>VOLTAGE & POWER</span>
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Orbitron, sans-serif', color: '#00F0FF' }}>
                    {currentStation.voltageValue || 480}V
                  </div>
                  <div style={{ fontSize: '12px', color: '#E2E8F0', marginTop: '4px' }}>
                    {currentStation.powerKw || 60} kW High-Speed DC
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '11px', color: '#94A3B8' }}>
                    {currentStation.voltage}
                  </div>
                </div>
              </div>

              {/* 3. TWO-WHEELER OR FOUR-WHEELER COMPATIBILITY */}
              <div style={{ background: 'rgba(21, 31, 51, 0.7)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '12px' }}>
                  VEHICLE COMPATIBILITY
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {/* Two-Wheeler Card */}
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: currentStation.twoWheeler ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255,255,255,0.04)',
                    border: currentStation.twoWheeler ? '1px solid rgba(0, 230, 118, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '24px' }}>🛵</span>
                    <div>
                      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', fontWeight: 700, color: currentStation.twoWheeler ? '#00E676' : '#64748B' }}>
                        2-WHEELER
                      </div>
                      <div style={{ fontSize: '11px', color: currentStation.twoWheeler ? '#E2E8F0' : '#64748B' }}>
                        {currentStation.twoWheeler ? 'Supported (Ather, Ola)' : 'Not Supported'}
                      </div>
                    </div>
                  </div>

                  {/* Four-Wheeler Card */}
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: currentStation.fourWheeler ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255,255,255,0.04)',
                    border: currentStation.fourWheeler ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '24px' }}>🚗</span>
                    <div>
                      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', fontWeight: 700, color: currentStation.fourWheeler ? '#00F0FF' : '#64748B' }}>
                        4-WHEELER
                      </div>
                      <div style={{ fontSize: '11px', color: currentStation.fourWheeler ? '#E2E8F0' : '#64748B' }}>
                        {currentStation.fourWheeler ? 'Supported (Cars/SUVs)' : 'Not Supported'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. CONNECTORS & TARIFF */}
              <div style={{ background: 'rgba(21, 31, 51, 0.7)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>
                    SUPPORTED CONNECTORS
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#00E676', fontFamily: 'Orbitron, sans-serif' }}>
                    {currentStation.pricing || '₹16.00 / kWh'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(currentStation.connectorTypes || ['CCS2', 'Type 2 AC']).map((c, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#E2E8F0',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontFamily: 'Rajdhani, sans-serif',
                        fontWeight: 600
                      }}
                    >
                      🔌 {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* 5. DIRECTIONS & GOOGLE MAPS NAVIGATION (User core requirement) */}
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
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #00E676 0%, #00F0FF 100%)',
                    color: '#090D16',
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: '16px',
                    fontFamily: 'Rajdhani, sans-serif',
                    letterSpacing: '1px',
                    boxShadow: '0 8px 24px rgba(0, 230, 118, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Navigation size={20} strokeWidth={2.5} />
                  <span>GET DIRECTIONS (GOOGLE MAPS)</span>
                  <ExternalLink size={16} />
                </a>

                <div style={{ fontSize: '11px', textAlign: 'center', color: '#64748B', fontFamily: 'Exo 2, sans-serif' }}>
                  Target: {currentStation.lat.toFixed(5)}, {currentStation.lng.toFixed(5)} • Turn-by-turn routing enabled
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', textAlign: 'center', gap: '12px' }}>
              <Zap size={48} strokeWidth={1.5} color="#334155" />
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '18px', fontWeight: 700 }}>
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
