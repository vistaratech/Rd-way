import React, { useState, useEffect } from 'react';
import AdminPanel from './components/AdminPanel';
import UserApp from './components/UserApp';
import { Layers, Smartphone, RefreshCw, Zap, ArrowRight, ExternalLink } from 'lucide-react';

export default function App() {
  // Determine initial view from URL path: /admin or default user app
  const getInitialView = () => {
    if (window.location.pathname === '/admin') return 'admin';
    return 'user';
  };

  const [currentView, setCurrentView] = useState(getInitialView());
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  // Fetch stations from backend API
  const fetchStations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stations');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.stations)) {
        setStations(data.stations);
        if (!selectedStation && data.stations.length > 0) {
          setSelectedStation(data.stations[0]);
        }
      }
    } catch (err) {
      console.error('Fetch stations error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Update URL history state when switching views
  const switchView = (view) => {
    setCurrentView(view);
    const newPath = view === 'admin' ? '/admin' : '/';
    window.history.pushState(null, '', newPath);
  };

  // Add station handler
  const handleAddStation = async (stationData) => {
    const res = await fetch('/api/stations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stationData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to place station');
    }
    await fetchStations();
  };

  // Delete station handler
  const handleDeleteStation = async (stationId) => {
    if (!confirm('Remove this EV charging station?')) return;
    const res = await fetch(`/api/stations/${stationId}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchStations();
      if (selectedStation && selectedStation.id === stationId) {
        setSelectedStation(null);
      }
    }
  };

  // Reset to default seed stations
  const handleResetStations = async () => {
    if (!confirm('Reset all stations to seed defaults?')) return;
    const res = await fetch('/api/stations/reset', { method: 'POST' });
    if (res.ok) {
      await fetchStations();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', display: 'flex', flexDirection: 'column', fontFamily: "'Poppins', sans-serif" }}>
      {/* Clean White Top Header with Official Rodeway Logo */}
      <header style={{
        padding: '14px 32px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        {/* Rodeway Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => switchView(currentView === 'admin' ? 'user' : 'admin')}>
          <img
            src="/rodeway_logo.png"
            alt="Rodeway"
            style={{ height: '40px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/app_logo.png';
            }}
          />
          <div style={{ borderLeft: '1.5px solid #CBD5E1', paddingLeft: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#10B981', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              EV Charging Network
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              {currentView === 'admin' ? '⚡ Station Placer & Management Dashboard' : '📱 Driver Navigation & Charging App'}
            </div>
          </div>
        </div>

        {/* View Switch Button: Switch between User App and Admin Panel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentView === 'user' ? (
            <button
              onClick={() => switchView('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                background: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <Layers size={16} />
              <span>Admin Station Placer</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => switchView('user')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <Smartphone size={16} />
              <span>Open User App</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, padding: '24px 32px', maxWidth: '1700px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {currentView === 'admin' ? (
          <AdminPanel
            stations={stations}
            onAddStation={handleAddStation}
            onDeleteStation={handleDeleteStation}
            onResetStations={handleResetStations}
            onOpenUserApp={() => switchView('user')}
          />
        ) : (
          <UserApp
            stations={stations}
            activeStation={selectedStation}
            onSelectStation={(st) => setSelectedStation(st)}
            onOpenAdmin={() => switchView('admin')}
          />
        )}
      </main>

      {/* Clean White Footer */}
      <footer style={{ padding: '16px 32px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
        <div>Rodeway EV Charging Network • Clean Light Theme with Emerald Green</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Poppins Font</span>
          <span>•</span>
          <span>Free Standard OpenStreetMap</span>
          <span>•</span>
          <span>Turn-by-turn Navigation</span>
        </div>
      </footer>
    </div>
  );
}
