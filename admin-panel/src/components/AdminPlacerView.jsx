import React, { useState } from 'react';
import EVMap from './EVMap';
import {
  MapPin,
  PlusCircle,
  Trash2,
  Edit2,
  Zap,
  BatteryCharging,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle,
  RefreshCw,
  LocateFixed,
  Eye
} from 'lucide-react';

export default function AdminPlacerView({
  stations = [],
  onAddStation,
  onDeleteStation,
  onResetStations,
  onSwitchToUserApp
}) {
  // Placement Pin state
  const [targetPin, setTargetPin] = useState({ lat: 12.971598, lng: 77.594566 });
  
  // Form fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('12.971598');
  const [lng, setLng] = useState('77.594566');
  const [totalChargers, setTotalChargers] = useState(6);
  const [availableChargers, setAvailableChargers] = useState(5);
  const [voltage, setVoltage] = useState('480V DC Fast Charge');
  const [voltageValue, setVoltageValue] = useState(480);
  const [powerKw, setPowerKw] = useState(120);
  const [twoWheeler, setTwoWheeler] = useState(true);
  const [fourWheeler, setFourWheeler] = useState(true);
  const [pricing, setPricing] = useState('₹16.00 / kWh');
  const [status, setStatus] = useState('Available');
  const [connectorTypes, setConnectorTypes] = useState(['CCS2', 'Type 2 AC', '15A Socket']);
  
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);

  // Handle map click to place pin
  const handleMapClick = (coords) => {
    setTargetPin(coords);
    setLat(coords.lat.toString());
    setLng(coords.lng.toString());
    if (!address || address.startsWith('Dropped Pin')) {
      setAddress(`Placed Station at ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
    }
  };

  // Toggle connector type
  const toggleConnector = (connector) => {
    if (connectorTypes.includes(connector)) {
      setConnectorTypes(connectorTypes.filter(c => c !== connector));
    } else {
      setConnectorTypes([...connectorTypes, connector]);
    }
  };

  // Preset location setter
  const applyPresetLocation = (namePreset, latVal, lngVal) => {
    setTargetPin({ lat: latVal, lng: lngVal });
    setLat(latVal.toString());
    setLng(lngVal.toString());
    setName(namePreset);
    setAddress(`${namePreset}, Central Hub`);
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a station name');
      return;
    }

    setSubmitting(true);
    try {
      const stationData = {
        name: name.trim(),
        address: address.trim() || `Location (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        totalChargers: parseInt(totalChargers, 10),
        availableChargers: parseInt(availableChargers, 10),
        voltage,
        voltageValue: parseInt(voltageValue, 10),
        powerKw: parseInt(powerKw, 10),
        twoWheeler,
        fourWheeler,
        connectorTypes,
        pricing,
        status,
        operatingHours: '24/7 Open',
        amenities: ['Cafeteria', 'Restroom', 'Wi-Fi']
      };

      await onAddStation(stationData);
      setSuccessNotice(`✅ Station "${name}" placed successfully! Visible in User App.`);
      setTimeout(() => setSuccessNotice(null), 4000);

      // Reset some fields
      setName('');
      setAddress('');
    } catch (err) {
      alert('Error placing station: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Voltage options
  const voltageOptions = [
    { label: '240V AC — Standard Eco (7.4 kW)', volts: 240, kw: 7.4, text: '240V AC Standard Eco' },
    { label: '400V DC — Commercial Fast (50 kW)', volts: 400, kw: 50, text: '400V DC Fast Charge' },
    { label: '480V DC — SuperFast (120 kW)', volts: 480, kw: 120, text: '480V DC Fast Charge (120 kW)' },
    { label: '800V DC — Ultra-Fast HyperCharge (240 kW)', volts: 800, kw: 240, text: '800V Ultra-Fast DC (240 kW)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Total EV Stations', value: stations.length, icon: Layers, color: '#00E676' },
          { label: 'Total Charging Ports', value: stations.reduce((acc, s) => acc + (s.totalChargers || 0), 0), icon: BatteryCharging, color: '#00F0FF' },
          { label: 'Available Ports', value: stations.reduce((acc, s) => acc + (s.availableChargers || 0), 0), icon: Zap, color: '#10B981' },
          { label: '🛵 2-Wheeler Stations', value: stations.filter(s => s.twoWheeler).length, icon: Sparkles, color: '#A78BFA' },
          { label: '🚗 4-Wheeler Stations', value: stations.filter(s => s.fourWheeler).length, icon: Sparkles, color: '#38BDF8' }
        ].map((m, idx) => (
          <div key={idx} style={{ background: '#0F172A', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <m.icon size={22} color={m.color} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Orbitron, sans-serif', color: '#FFFFFF' }}>{m.value}</div>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, textTransform: 'uppercase' }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Interactive Placer Map + Station Config Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '24px', alignItems: 'start' }}>
        {/* Left: Interactive Map */}
        <div style={{ background: '#0F172A', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '20px', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="#00E676" />
                INTERACTIVE MAP PLACER
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                Click anywhere on the map to drop the red pin and set exact coordinates for a new EV charging station.
              </p>
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => applyPresetLocation('Whitefield Tech Park Hub', 12.9830, 77.7500)}
                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: '#1E293B', color: '#00E676', border: '1px solid rgba(0,230,118,0.3)', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}
              >
                + Whitefield
              </button>
              <button
                type="button"
                onClick={() => applyPresetLocation('Electronic City SuperCharge', 12.8399, 77.6770)}
                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: '#1E293B', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.3)', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}
              >
                + E-City
              </button>
            </div>
          </div>

          {/* Map Display */}
          <div style={{ height: '480px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0, 230, 118, 0.3)' }}>
            <EVMap
              stations={stations}
              targetPin={targetPin}
              onMapClick={handleMapClick}
              center={[targetPin.lat, targetPin.lng]}
              zoom={13}
              height="100%"
            />
          </div>

          {/* Selected Pin Readout */}
          <div style={{ background: '#151F33', padding: '12px 18px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 10px #EF4444' }}></span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0', fontFamily: 'Rajdhani, sans-serif' }}>
                Selected Target: Lat <strong style={{ color: '#00E676' }}>{parseFloat(lat).toFixed(6)}</strong>, Lng <strong style={{ color: '#00F0FF' }}>{parseFloat(lng).toFixed(6)}</strong>
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>Click anywhere on map to reposition</span>
          </div>
        </div>

        {/* Right: Station Placement Form */}
        <div style={{ background: '#0F172A', borderRadius: '20px', border: '1px solid rgba(0, 230, 118, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '22px', fontWeight: 800, color: '#00E676', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={22} color="#00E676" />
                PLACE EV CHARGING STATION
              </h3>
              <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '12px', background: 'rgba(0,230,118,0.15)', color: '#00E676', fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>
                ADMIN
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
              Configure EV specs, voltage rating, chargers count & vehicle support.
            </p>
          </div>

          {successNotice && (
            <div style={{ background: 'rgba(0, 230, 118, 0.15)', border: '1px solid #00E676', padding: '12px 16px', borderRadius: '12px', color: '#00E676', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} />
              <span>{successNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Station Name */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                Station Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rodeway SuperCharge Hub - Indiranagar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#151F33', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', fontSize: '13px', fontFamily: 'Exo 2, sans-serif', outline: 'none' }}
              />
            </div>

            {/* Address */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                Address / Location Landmark
              </label>
              <input
                type="text"
                placeholder="e.g. 100 Feet Rd, Defense Colony, Bengaluru"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#151F33', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', fontSize: '13px', fontFamily: 'Exo 2, sans-serif', outline: 'none' }}
              />
            </div>

            {/* Coordinates Lat / Lng */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={lat}
                  onChange={(e) => {
                    setLat(e.target.value);
                    setTargetPin({ lat: parseFloat(e.target.value) || 0, lng: parseFloat(lng) || 0 });
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#151F33', border: '1px solid rgba(255,255,255,0.12)', color: '#00E676', fontSize: '13px', fontFamily: 'Exo 2, sans-serif', outline: 'none', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={lng}
                  onChange={(e) => {
                    setLng(e.target.value);
                    setTargetPin({ lat: parseFloat(lat) || 0, lng: parseFloat(e.target.value) || 0 });
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#151F33', border: '1px solid rgba(255,255,255,0.12)', color: '#00F0FF', fontSize: '13px', fontFamily: 'Exo 2, sans-serif', outline: 'none', fontWeight: 600 }}
                />
              </div>
            </div>

            {/* Chargers Count: Total & Available */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                  Total Chargers
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={totalChargers}
                  onChange={(e) => setTotalChargers(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#151F33', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                  Available Chargers
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalChargers}
                  value={availableChargers}
                  onChange={(e) => setAvailableChargers(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#151F33', border: '1px solid rgba(255,255,255,0.12)', color: '#00E676', fontSize: '13px', outline: 'none', fontWeight: 600 }}
                />
              </div>
            </div>

            {/* Voltage & Power Rating */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                Voltage & Power Rating (Volts / kW)
              </label>
              <select
                value={voltageValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setVoltageValue(val);
                  const opt = voltageOptions.find(o => o.volts === val);
                  if (opt) {
                    setVoltage(opt.text);
                    setPowerKw(opt.kw);
                  }
                }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#151F33', border: '1px solid rgba(255,255,255,0.12)', color: '#00F0FF', fontSize: '13px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, outline: 'none' }}
              >
                {voltageOptions.map(opt => (
                  <option key={opt.volts} value={opt.volts} style={{ background: '#0F172A', color: '#FFF' }}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Compatibility Checkboxes (2W / 4W) */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '8px' }}>
                Vehicle Types Supported *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: twoWheeler ? 'rgba(0, 230, 118, 0.15)' : '#151F33',
                  border: twoWheeler ? '1px solid #00E676' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={twoWheeler}
                    onChange={(e) => setTwoWheeler(e.target.checked)}
                    style={{ accentColor: '#00E676' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: twoWheeler ? '#00E676' : '#94A3B8', fontFamily: 'Rajdhani, sans-serif' }}>
                    🛵 Two-Wheeler (2W)
                  </span>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: fourWheeler ? 'rgba(0, 240, 255, 0.15)' : '#151F33',
                  border: fourWheeler ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={fourWheeler}
                    onChange={(e) => setFourWheeler(e.target.checked)}
                    style={{ accentColor: '#00F0FF' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: fourWheeler ? '#00F0FF' : '#94A3B8', fontFamily: 'Rajdhani, sans-serif' }}>
                    🚗 Four-Wheeler (4W)
                  </span>
                </label>
              </div>
            </div>

            {/* Connectors */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                Connector Types
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['CCS2', 'Type 2 AC', 'GB/T', '15A Socket', 'CHAdeMO'].map(conn => {
                  const active = connectorTypes.includes(conn);
                  return (
                    <button
                      type="button"
                      key={conn}
                      onClick={() => toggleConnector(conn)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        fontFamily: 'Rajdhani, sans-serif',
                        cursor: 'pointer',
                        background: active ? 'rgba(0, 230, 118, 0.2)' : '#151F33',
                        border: active ? '1px solid #00E676' : '1px solid rgba(255,255,255,0.1)',
                        color: active ? '#00E676' : '#94A3B8'
                      }}
                    >
                      {active ? '✓ ' : '+ '}{conn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pricing & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                  Tariff / Pricing
                </label>
                <input
                  type="text"
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#151F33', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#151F33', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', fontSize: '13px', outline: 'none' }}
                >
                  <option value="Available">🟢 Available</option>
                  <option value="Busy">🟡 Busy</option>
                  <option value="Maintenance">🔴 Maintenance</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '10px',
                padding: '16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #00E676 0%, #00F0FF 100%)',
                color: '#090D16',
                border: 'none',
                fontWeight: 800,
                fontSize: '15px',
                fontFamily: 'Orbitron, sans-serif',
                letterSpacing: '1px',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(0,230,118,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}
            >
              <Zap size={20} color="#090D16" strokeWidth={2.5} />
              <span>{submitting ? 'PLACING STATION...' : 'PLACE EV CHARGING STATION ON MAP'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Placed Stations Roster / Management Table */}
      <div style={{ background: '#0F172A', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>
              PLACED EV CHARGING STATIONS ({stations.length})
            </h3>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>
              All stations placed by the admin are synchronized in real-time to the User App.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onResetStations}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: '#1E293B', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '12px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}
            >
              <RefreshCw size={14} />
              Reset Defaults
            </button>
            <button
              onClick={onSwitchToUserApp}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(0, 230, 118, 0.15)', color: '#00E676', border: '1px solid #00E676', cursor: 'pointer', fontSize: '12px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}
            >
              <Eye size={14} />
              Preview in User App
            </button>
          </div>
        </div>

        {/* Station Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {stations.map(station => (
            <div
              key={station.id}
              style={{
                background: '#151F33',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: '#FFFFFF', fontFamily: 'Rajdhani, sans-serif' }}>
                    ⚡ {station.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    {station.address}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteStation(station.id)}
                  title="Remove Station"
                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Badges: Voltage, Chargers, 2W/4W */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>
                <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(0, 240, 255, 0.15)', color: '#00F0FF', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                  ⚡ {station.voltage}
                </span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(0, 230, 118, 0.15)', color: '#00E676', border: '1px solid rgba(0, 230, 118, 0.3)' }}>
                  🔌 {station.availableChargers}/{station.totalChargers} Free
                </span>
                {station.twoWheeler && (
                  <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                    🛵 2W
                  </span>
                )}
                {station.fourWheeler && (
                  <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    🚗 4W
                  </span>
                )}
              </div>

              {/* Coordinates & Google Direction Link */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', fontSize: '11px', color: '#94A3B8' }}>
                <span>GPS: {station.lat.toFixed(4)}, {station.lng.toFixed(4)}</span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#00E676', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                >
                  <span>Google Route</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
