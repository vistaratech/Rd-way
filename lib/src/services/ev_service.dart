import 'dart:convert';
import 'package:cleadr/src/models/ev_station.dart';
import 'package:cleadr/src/util/functions.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class EVService {
  EVService._internal();
  static final EVService instance = EVService._internal();

  // Primary API endpoints (localhost for web/desktop, 10.0.2.2 for Android emulator)
  static const String _webBaseUrl = 'http://localhost:5000/api/stations';
  static const String _androidBaseUrl = 'http://10.0.2.2:5000/api/stations';

  String get _apiUrl {
    if (kIsWeb) return _webBaseUrl;
    return defaultTargetPlatform == TargetPlatform.android
        ? _androidBaseUrl
        : _webBaseUrl;
  }

  // Fallback seed data if backend is offline
  final List<EVStation> _seedStations = [
    const EVStation(
      id: 'ev-station-1',
      name: 'Rodeway SuperCharge Hub - Indiranagar',
      address: '100 Feet Rd, Defense Colony, Indiranagar, Bengaluru',
      lat: 12.971598,
      lng: 77.641200,
      totalChargers: 8,
      availableChargers: 6,
      voltage: '480V DC Fast Charge (120 kW)',
      voltageValue: 480,
      powerKw: 120.0,
      twoWheeler: true,
      fourWheeler: true,
      connectorTypes: ['CCS2', 'Type 2 AC', 'GB/T', '15A Socket'],
      pricing: '₹16.50 / kWh',
      status: 'Available',
      operatingHours: '24/7 Open',
      amenities: ['Cafeteria', 'Restroom', 'Wi-Fi', 'Lounge'],
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=12.971598,77.641200',
    ),
    const EVStation(
      id: 'ev-station-2',
      name: 'VoltPulse HyperDrive - Koramangala',
      address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru',
      lat: 12.935193,
      lng: 77.624481,
      totalChargers: 6,
      availableChargers: 4,
      voltage: '800V Ultra-Fast DC (240 kW)',
      voltageValue: 800,
      powerKw: 240.0,
      twoWheeler: false,
      fourWheeler: true,
      connectorTypes: ['CCS2', 'CHAdeMO'],
      pricing: '₹19.00 / kWh',
      status: 'Available',
      operatingHours: '24/7 Open',
      amenities: ['Coffee Shop', 'Restroom'],
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=12.935193,77.624481',
    ),
    const EVStation(
      id: 'ev-station-3',
      name: 'EcoCharge 2W/4W Point - MG Road',
      address: 'Mahatma Gandhi Rd, Ashok Nagar, Bengaluru',
      lat: 12.975630,
      lng: 77.606628,
      totalChargers: 10,
      availableChargers: 7,
      voltage: '240V / 400V Dual AC/DC (50 kW)',
      voltageValue: 400,
      powerKw: 50.0,
      twoWheeler: true,
      fourWheeler: true,
      connectorTypes: ['Type 2 AC', 'CCS2', '15A Socket', 'Ather Dot'],
      pricing: '₹14.00 / kWh',
      status: 'Available',
      operatingHours: '06:00 AM - 11:30 PM',
      amenities: ['Metro Station', 'ATM', 'Food Court'],
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=12.975630,77.606628',
    ),
    const EVStation(
      id: 'ev-station-4',
      name: 'AeroVolt 2W Express - HSR Layout',
      address: '27th Main Rd, Sector 1, HSR Layout, Bengaluru',
      lat: 12.911622,
      lng: 77.653457,
      totalChargers: 4,
      availableChargers: 2,
      voltage: '240V AC Standard Eco (7.4 kW)',
      voltageValue: 240,
      powerKw: 7.4,
      twoWheeler: true,
      fourWheeler: false,
      connectorTypes: ['15A Socket', 'Type 2 AC'],
      pricing: '₹12.00 / kWh',
      status: 'Available',
      operatingHours: '24/7 Open',
      amenities: ['EV Service Bay'],
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=12.911622,77.653457',
    ),
  ];

  /// Fetch stations from backend with fallback
  Future<List<EVStation>> fetchStations({
    String? vehicleType,
    bool? fastOnly,
    bool? availableOnly,
  }) async {
    List<EVStation> stations = [];

    try {
      final response = await http
          .get(Uri.parse(_apiUrl))
          .timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded['success'] == true && decoded['stations'] is List) {
          stations = (decoded['stations'] as List)
              .map((item) => EVStation.fromJson(item))
              .toList();
          debugLog('EVService: Loaded ${stations.length} stations from API');
        }
      }
    } catch (e) {
      debugLog('EVService: Backend unreachable ($e). Using cached stations.');
      stations = List.from(_seedStations);
    }

    if (stations.isEmpty) {
      stations = List.from(_seedStations);
    }

    // Apply filters
    if (vehicleType != null) {
      final v = vehicleType.toUpperCase();
      if (v == '2W') {
        stations = stations.where((s) => s.twoWheeler).toList();
      } else if (v == '4W') {
        stations = stations.where((s) => s.fourWheeler).toList();
      }
    }

    if (fastOnly == true) {
      stations = stations.where((s) => s.voltageValue >= 400).toList();
    }

    if (availableOnly == true) {
      stations = stations.where((s) => s.availableChargers > 0).toList();
    }

    return stations;
  }
}
