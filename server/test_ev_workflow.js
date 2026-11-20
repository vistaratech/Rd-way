const http = require('http');

const PORT = process.env.PORT || 5050;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('⚡ RUNNING RODEWAY EV CHARGING & ADMIN PANEL TEST SUITE ⚡');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Healthcheck
    console.log('[Test 1] Testing Backend Health & Initial Stations...');
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'API health check responded OK');

    const initialStations = await request('GET', '/api/stations');
    assert(initialStations.status === 200 && initialStations.data.count > 0, `Initial stations loaded (Found: ${initialStations.data.count})`);

    // 2. Admin places EV Charging Station on the map
    console.log('\n[Test 2] Admin places a new EV Charging Station at coordinates...');
    const newStationPayload = {
      name: "Rodeway SuperCharge - BTM Tech Hub",
      address: "Outer Ring Rd, 2nd Stage, BTM Layout, Bengaluru, Karnataka 560076",
      lat: 12.9165,
      lng: 77.6101,
      totalChargers: 12,
      availableChargers: 9,
      voltage: "480V DC SuperFast (150 kW)",
      voltageValue: 480,
      powerKw: 150,
      twoWheeler: true,
      fourWheeler: true,
      connectorTypes: ["CCS2", "Type 2 AC", "15A 3-Pin Socket"],
      pricing: "₹15.50 / kWh",
      status: "Available",
      operatingHours: "24/7 Open",
      amenities: ["Cafeteria", "Restroom", "Wi-Fi", "24/7 Security"]
    };

    const placeRes = await request('POST', '/api/stations', newStationPayload);
    assert(placeRes.status === 201 && placeRes.data.success === true, 'Admin successfully placed EV station on map');
    const createdStation = placeRes.data.station;
    assert(createdStation.id && createdStation.name === newStationPayload.name, 'Station ID generated and Name matches');

    // 3. User App queries stations to display on user map
    console.log('\n[Test 3] User App loads stations from map location...');
    const userAppQuery = await request('GET', '/api/stations');
    const foundInUserApp = userAppQuery.data.stations.find(s => s.id === createdStation.id);
    assert(foundInUserApp !== undefined, 'Placed EV station appears in User App stations list');
    assert(foundInUserApp.lat === 12.9165 && foundInUserApp.lng === 77.6101, 'Station coordinates correctly plotted for map marker');

    // 4. User touches station marker -> Inspect all required details
    console.log('\n[Test 4] User touches the EV Station marker -> Verify detail sheet attributes:');
    const stationTouchRes = await request('GET', `/api/stations/${createdStation.id}`);
    assert(stationTouchRes.status === 200, 'User touch opens station details sheet');

    const details = stationTouchRes.data.station;
    // (a) Location
    assert(details.lat === 12.9165 && details.lng === 77.6101, `(a) Location coordinates: ${details.lat}, ${details.lng}`);
    assert(details.address.includes('BTM Layout'), `(a) Address verified: ${details.address}`);

    // (b) How many chargers
    assert(details.totalChargers === 12 && details.availableChargers === 9, `(b) Chargers count verified: ${details.availableChargers} of ${details.totalChargers} free`);

    // (c) Voltage
    assert(details.voltageValue === 480 && details.voltage.includes('480V'), `(c) Voltage verified: ${details.voltage} (${details.voltageValue}V)`);

    // (d) Two-wheeler and Four-wheeler support
    assert(details.twoWheeler === true, '(d) Two-Wheeler (2W) compatibility: SUPPORTED (🛵 Ather, Ola, Chetak)');
    assert(details.fourWheeler === true, '(d) Four-Wheeler (4W) compatibility: SUPPORTED (🚗 Tata, MG, Tesla)');

    // (e) Direction & Google Maps Navigation
    assert(details.directions && details.directions.googleMapsUrl.includes('destination=12.9165,77.6101'), `(e) Direction & Turn-by-Turn Navigation: ${details.directions.googleMapsUrl}`);

    // 5. Test Vehicle Filtering in User App (2W vs 4W)
    console.log('\n[Test 5] User App vehicle filters (2W & 4W)...');
    // Place a 2W-only scooter station
    const twoWheelerOnly = await request('POST', '/api/stations', {
      name: "Ather Express 2W Hub",
      address: "Jayanagar 4th Block",
      lat: 12.9300,
      lng: 77.5800,
      totalChargers: 4,
      availableChargers: 3,
      voltage: "240V AC",
      voltageValue: 240,
      twoWheeler: true,
      fourWheeler: false
    });
    const s2wId = twoWheelerOnly.data.station.id;

    const query2W = await request('GET', '/api/stations?vehicleType=2W');
    const has2W = query2W.data.stations.some(s => s.id === s2wId);
    assert(has2W, '2W filter correctly returns 2-Wheeler compatible stations');

    const query4W = await request('GET', '/api/stations?vehicleType=4W');
    const has2Win4W = query4W.data.stations.some(s => s.id === s2wId);
    assert(!has2Win4W, '4W filter correctly excludes 2-Wheeler-only stations');

    // 6. Test Live Update (Slot occupied)
    console.log('\n[Test 6] Real-time slot update...');
    const updateRes = await request('PUT', `/api/stations/${createdStation.id}`, {
      availableChargers: 8
    });
    assert(updateRes.status === 200 && updateRes.data.station.availableChargers === 8, 'Charger slot availability updated from 9 -> 8');

    // Cleanup created test stations
    await request('DELETE', `/api/stations/${createdStation.id}`);
    await request('DELETE', `/api/stations/${s2wId}`);
    console.log('\n[Cleanup] Cleaned up temporary test stations.');

    console.log('\n======================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

// Run test
runTests();
