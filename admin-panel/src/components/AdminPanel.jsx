import React, { useState } from 'react';
import GoogleMapsEV from './GoogleMapsEV';
import {
  MapPin,
  PlusCircle,
  Trash2,
  Zap,
  BatteryCharging,
  Layers,
  Sparkles,
  RefreshCw,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export default function AdminPanel({
  stations = [],
  onAddStation,
  onDeleteStation,
  onResetStations,
  onOpenUserApp
}) {
  const [targetPin, setTargetPin] = useState({ lat: 12.971598, lng: 77.594566 });
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('12.971598');
  const [lng, setLng] = useState('77.594566');
  const [totalChargers, setTotalChargers] = useState(6);
  const [availableChargers, setAvailableChargers] = useState(5);
  const [voltage, setVoltage] = useState('480V DC Fast Charge (120 kW)');
  const [voltageValue, setVoltageValue] = useState(480);
  const [powerKw, setPowerKw] = useState(120);
  const [twoWheeler, setTwoWheeler] = useState(true);
  const [fourWheeler, setFourWheeler] = useState(true);
  const [pricing, setPricing] = useState('₹16.00 / kWh');
  const [status, setStatus] = useState('Available');
  const [connectorTypes, setConnectorTypes] = useState(['CCS2', 'Type 2 AC', '15A Socket']);
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);

  const handleMapClick = (coords) => {
    setTargetPin(coords);
    setLat(coords.lat.toString());
    setLng(coords.lng.toString());
    if (!address || address.startsWith('Placed Station at')) {
      setAddress(`Placed Station at ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
    }
  };

  const toggleConnector = (conn) => {
    if (connectorTypes.includes(conn)) {
      setConnectorTypes(connectorTypes.filter(c => c !== conn));
    } else {
      setConnectorTypes([...connectorTypes, conn]);
    }
  };

  const applyPresetLocation = (presetName, latVal, lngVal) => {
    setTargetPin({ lat: latVal, lng: lngVal });
    setLat(latVal.toString());
    setLng(lngVal.toString());
    setName(presetName);
    setAddress(`${presetName}, Central Hub`);
  };

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
      setSuccessNotice(`✅ Station "${name}" placed at (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`);
      setTimeout(() => setSuccessNotice(null), 4000);

      setName('');
      setAddress('');
    } catch (err) {
      alert('Error placing station: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
          { label: 'Total EV Stations', value: stations.length, icon: Layers, color: '#10B981' },
          { label: 'Total Charging Ports', value: stations.reduce((acc, s) => acc + (s.totalChargers || 0), 0), icon: BatteryCharging, color: '#059669' },
          { label: 'Available Ports', value: stations.reduce((acc, s) => acc + (s.availableChargers || 0), 0), icon: Zap, color: '#10B981' },
          { label: '🛵 2-Wheeler Stations', value: stations.filter(s => s.twoWheeler).length, icon: Sparkles, color: '#8B5CF6' },
          { label: '🚗 4-Wheeler Stations', value: stations.filter(s => s.fourWheeler).length, icon: Sparkles, color: '#0284C7' }
        ].map((m, idx) => (
          <div key={idx} style={{ background: '#FFFFFF', padding: '18px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <m.icon size={22} color={m.color} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{m.value}</div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Interactive Map + Placement Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
        {/* Left: Clean Map */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="#EF4444" />
                INTERACTIVE MAP PLACER
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B' }}>
                Click anywhere on the map to drop a pin and set exact GPS coordinates.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => applyPresetLocation('Whitefield Tech Park Hub', 12.9830, 77.7500)}
                style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', cursor: 'pointer', fontWeight: 600 }}
              >
                + Whitefield
              </button>
              <button
                type="button"
                onClick={() => applyPresetLocation('Electronic City SuperCharge', 12.8399, 77.6770)}
                style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', cursor: 'pointer', fontWeight: 600 }}
              >
                + E-City
              </button>
            </div>
          </div>

          {/* Google Maps Component */}
          <div style={{ height: '520px', borderRadius: '16px', overflow: 'hidden' }}>
            <GoogleMapsEV
              stations={stations}
              targetPin={targetPin}
              onMapClick={handleMapClick}
              center={targetPin}
              zoom={13}
              height="100%"
            />
          </div>

          {/* Selected Pin Readout */}
          <div style={{ background: '#F8FAFC', padding: '12px 18px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                Target Pin: Lat <strong style={{ color: '#10B981' }}>{parseFloat(lat).toFixed(6)}</strong>, Lng <strong style={{ color: '#0284C7' }}>{parseFloat(lng).toFixed(6)}</strong>
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Click anywhere on the map to relocate</span>
          </div>
        </div>

        {/* Right: Station Placement Form */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={22} color="#10B981" />
                PLACE EV CHARGING STATION
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Configure station details, voltage rating, chargers & vehicle support.
              </p>
            </div>
            <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', fontWeight: 700, border: '1px solid #A7F3D0' }}>
              ADMIN
            </span>
          </div>

          {successNotice && (
            <div style={{ background: '#ECFDF5', border: '1px solid #10B981', padding: '12px 16px', borderRadius: '12px', color: '#059669', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} />
              <span>{successNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Station Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Station Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rodeway SuperCharge Hub - Indiranagar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* Address */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Address / Landmark
              </label>
              <input
                type="text"
                placeholder="e.g. 100 Feet Rd, Defense Colony, Bengaluru"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* Coordinates Lat / Lng */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#059669', fontSize: '13px', fontWeight: 600, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#2563EB', fontSize: '13px', fontWeight: 600, outline: 'none' }}
                />
              </div>
            </div>

            {/* Chargers: Total & Available */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Total Chargers
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={totalChargers}
                  onChange={(e) => setTotalChargers(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Available Chargers
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalChargers}
                  value={availableChargers}
                  onChange={(e) => setAvailableChargers(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#059669', fontSize: '13px', fontWeight: 600, outline: 'none' }}
                />
              </div>
            </div>

            {/* Voltage Rating */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
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
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '13px', fontWeight: 600, outline: 'none' }}
              >
                {voltageOptions.map(opt => (
                  <option key={opt.volts} value={opt.volts}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Compatibility (2W / 4W) */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Vehicle Types Supported *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: twoWheeler ? '#ECFDF5' : '#F8FAFC',
                  border: twoWheeler ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={twoWheeler}
                    onChange={(e) => setTwoWheeler(e.target.checked)}
                    style={{ accentColor: '#10B981' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: twoWheeler ? '#059669' : '#64748B' }}>
                    🛵 2-Wheeler (2W)
                  </span>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: fourWheeler ? '#EFF6FF' : '#F8FAFC',
                  border: fourWheeler ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={fourWheeler}
                    onChange={(e) => setFourWheeler(e.target.checked)}
                    style={{ accentColor: '#3B82F6' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: fourWheeler ? '#1D4ED8' : '#64748B' }}>
                    🚗 4-Wheeler (4W)
                  </span>
                </label>
              </div>
            </div>

            {/* Connectors */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
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
                        cursor: 'pointer',
                        background: active ? '#ECFDF5' : '#F8FAFC',
                        border: active ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                        color: active ? '#059669' : '#64748B'
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Tariff / Pricing
                </label>
                <input
                  type="text"
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '13px', outline: 'none' }}
                >
                  <option value="Available">🟢 Available</option>
                  <option value="Busy">🟡 Busy</option>
                  <option value="Maintenance">🔴 Maintenance</option>
                </select>
              </div>
            </div>

            {/* Submit Button in Primary Green */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '10px',
                padding: '15px',
                borderRadius: '12px',
                background: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Zap size={20} color="#FFFFFF" strokeWidth={2.5} />
              <span>{submitting ? 'PLACING STATION...' : 'PLACE EV CHARGING STATION ON MAP'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Placed Stations Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
              PLACED EV CHARGING STATIONS ({stations.length})
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B' }}>
              All placed stations are immediately live and visible in the User App.
            </p>
          </div>

          <button
            onClick={onOpenUserApp}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', border: '1.5px solid #10B981', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
          >
            <span>Open User App</span>
            <ExternalLink size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {stations.map(station => (
            <div
              key={station.id}
              style={{
                background: '#F8FAFC',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#0F172A' }}>
                    ⚡ {station.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    {station.address}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteStation(station.id)}
                  title="Remove Station"
                  style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#EF4444', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px', fontWeight: 600 }}>
                <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                  ⚡ {station.voltage}
                </span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                  🔌 {station.availableChargers}/{station.totalChargers} Free
                </span>
                {station.twoWheeler && (
                  <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}>
                    🛵 2W
                  </span>
                )}
                {station.fourWheeler && (
                  <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
                    🚗 4W
                  </span>
                )}
              </div>

              {/* Bottom coords & route */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '10px', fontSize: '12px', color: '#64748B' }}>
                <span>GPS: {station.lat.toFixed(4)}, {station.lng.toFixed(4)}</span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#059669', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
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
