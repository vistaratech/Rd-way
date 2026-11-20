const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5050;
const DATA_FILE = path.join(__dirname, 'data', 'stations.json');

app.use(cors());
app.use(express.json());

// Helper to read stations
function readStations() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading stations:', err);
    return [];
  }
}

// Helper to write stations
function writeStations(stations) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(stations, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing stations:', err);
    return false;
  }
}

// Initial seed copy for reset
const DEFAULT_STATIONS = readStations();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Rodeway EV Backend',
    timestamp: new Date().toISOString(),
    stationsCount: readStations().length
  });
});

// GET /api/stations
app.get('/api/stations', (req, res) => {
  let stations = readStations();
  const { vehicleType, status, search, minVoltage } = req.query;

  if (vehicleType) {
    const v = vehicleType.toUpperCase();
    if (v === '2W') {
      stations = stations.filter(s => s.twoWheeler === true);
    } else if (v === '4W') {
      stations = stations.filter(s => s.fourWheeler === true);
    }
  }

  if (status) {
    stations = stations.filter(s => s.status.toLowerCase() === status.toLowerCase());
  }

  if (minVoltage) {
    const minV = Number(minVoltage);
    if (!isNaN(minV)) {
      stations = stations.filter(s => (s.voltageValue || 0) >= minV);
    }
  }

  if (search) {
    const q = search.toLowerCase();
    stations = stations.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: stations.length,
    stations
  });
});

// GET /api/stations/:id
app.get('/api/stations/:id', (req, res) => {
  const stations = readStations();
  const station = stations.find(s => s.id === req.params.id);
  if (!station) {
    return res.status(404).json({ success: false, message: 'Station not found' });
  }
  res.json({ success: true, station });
});

// POST /api/stations (Admin places new station)
app.post('/api/stations', (req, res) => {
  const {
    name,
    address,
    lat,
    lng,
    totalChargers,
    availableChargers,
    voltage,
    voltageValue,
    powerKw,
    twoWheeler,
    fourWheeler,
    connectorTypes,
    pricing,
    status,
    operatingHours,
    amenities
  } = req.body;

  if (!name || lat === undefined || lng === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Name, latitude, and longitude are required.'
    });
  }

  const stations = readStations();
  const newId = `ev-station-${Date.now()}`;
  
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const parsedTotal = parseInt(totalChargers || 4, 10);
  const parsedAvail = availableChargers !== undefined ? parseInt(availableChargers, 10) : parsedTotal;
  const is2W = twoWheeler === true || twoWheeler === 'true';
  const is4W = fourWheeler === true || fourWheeler === 'true';

  const vTypes = [];
  if (is2W) vTypes.push('2W');
  if (is4W) vTypes.push('4W');

  const newStation = {
    id: newId,
    name: name.trim(),
    address: address ? address.trim() : `Location (${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)})`,
    lat: parsedLat,
    lng: parsedLng,
    totalChargers: parsedTotal,
    availableChargers: parsedAvail,
    voltage: voltage || '480V DC Fast Charge',
    voltageValue: voltageValue ? Number(voltageValue) : (parseInt(voltage, 10) || 480),
    powerKw: powerKw ? Number(powerKw) : 60,
    twoWheeler: is2W,
    fourWheeler: is4W,
    vehicleTypes: vTypes.length > 0 ? vTypes : ['2W', '4W'],
    connectorTypes: Array.isArray(connectorTypes) && connectorTypes.length > 0
      ? connectorTypes
      : ['CCS2', 'Type 2 AC'],
    pricing: pricing || '₹15.00 / kWh',
    status: status || 'Available',
    operatingHours: operatingHours || '24/7 Open',
    amenities: Array.isArray(amenities) ? amenities : ['Restroom', 'Wi-Fi'],
    directions: {
      lat: parsedLat,
      lng: parsedLng,
      googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${parsedLat},${parsedLng}`
    },
    createdAt: new Date().toISOString()
  };

  stations.unshift(newStation);
  writeStations(stations);

  console.log(`[Admin] Placed new EV Station: ${newStation.name} at (${parsedLat}, ${parsedLng})`);

  res.status(201).json({
    success: true,
    message: 'EV Charging Station placed successfully',
    station: newStation
  });
});

// PUT /api/stations/:id
app.put('/api/stations/:id', (req, res) => {
  const stations = readStations();
  const index = stations.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Station not found' });
  }

  const existing = stations[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id // protect id
  };

  if (req.body.lat !== undefined) updated.lat = parseFloat(req.body.lat);
  if (req.body.lng !== undefined) updated.lng = parseFloat(req.body.lng);
  if (req.body.totalChargers !== undefined) updated.totalChargers = parseInt(req.body.totalChargers, 10);
  if (req.body.availableChargers !== undefined) updated.availableChargers = parseInt(req.body.availableChargers, 10);

  const is2W = updated.twoWheeler === true || updated.twoWheeler === 'true';
  const is4W = updated.fourWheeler === true || updated.fourWheeler === 'true';
  updated.twoWheeler = is2W;
  updated.fourWheeler = is4W;
  const vTypes = [];
  if (is2W) vTypes.push('2W');
  if (is4W) vTypes.push('4W');
  updated.vehicleTypes = vTypes;

  if (updated.lat && updated.lng) {
    updated.directions = {
      lat: updated.lat,
      lng: updated.lng,
      googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${updated.lat},${updated.lng}`
    };
  }

  stations[index] = updated;
  writeStations(stations);

  res.json({
    success: true,
    message: 'EV Station updated successfully',
    station: updated
  });
});

// DELETE /api/stations/:id
app.delete('/api/stations/:id', (req, res) => {
  let stations = readStations();
  const station = stations.find(s => s.id === req.params.id);
  if (!station) {
    return res.status(404).json({ success: false, message: 'Station not found' });
  }

  stations = stations.filter(s => s.id !== req.params.id);
  writeStations(stations);

  res.json({
    success: true,
    message: 'Station removed successfully',
    id: req.params.id
  });
});

// Reset to seed
app.post('/api/stations/reset', (req, res) => {
  writeStations(DEFAULT_STATIONS);
  res.json({
    success: true,
    message: 'Stations reset to default seed data',
    count: DEFAULT_STATIONS.length
  });
});

// Serve static admin panel build
const adminDist = path.join(__dirname, '..', 'admin-panel', 'dist');
if (fs.existsSync(adminDist)) {
  app.use(express.static(adminDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(adminDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`⚡ Rodeway EV Backend Server running on http://localhost:${PORT}`);
});
