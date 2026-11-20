class EVStation {
  final String id;
  final String name;
  final String address;
  final double lat;
  final double lng;
  final int totalChargers;
  final int availableChargers;
  final String voltage;
  final int voltageValue;
  final double powerKw;
  final bool twoWheeler;
  final bool fourWheeler;
  final List<String> connectorTypes;
  final String pricing;
  final String status;
  final String operatingHours;
  final List<String> amenities;
  final String? googleMapsUrl;

  const EVStation({
    required this.id,
    required this.name,
    required this.address,
    required this.lat,
    required this.lng,
    required this.totalChargers,
    required this.availableChargers,
    required this.voltage,
    required this.voltageValue,
    required this.powerKw,
    required this.twoWheeler,
    required this.fourWheeler,
    required this.connectorTypes,
    required this.pricing,
    required this.status,
    required this.operatingHours,
    required this.amenities,
    this.googleMapsUrl,
  });

  factory EVStation.fromJson(Map<String, dynamic> json) {
    final directions = json['directions'] as Map<String, dynamic>?;
    return EVStation(
      id: json['id'] ?? '',
      name: json['name'] ?? 'EV Charging Station',
      address: json['address'] ?? '',
      lat: (json['lat'] as num?)?.toDouble() ?? 0.0,
      lng: (json['lng'] as num?)?.toDouble() ?? 0.0,
      totalChargers: (json['totalChargers'] as num?)?.toInt() ?? 4,
      availableChargers: (json['availableChargers'] as num?)?.toInt() ?? 2,
      voltage: json['voltage'] ?? '480V DC Fast Charge',
      voltageValue: (json['voltageValue'] as num?)?.toInt() ?? 480,
      powerKw: (json['powerKw'] as num?)?.toDouble() ?? 60.0,
      twoWheeler: json['twoWheeler'] == true,
      fourWheeler: json['fourWheeler'] == true,
      connectorTypes: (json['connectorTypes'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          ['CCS2', 'Type 2 AC'],
      pricing: json['pricing'] ?? '₹16.00 / kWh',
      status: json['status'] ?? 'Available',
      operatingHours: json['operatingHours'] ?? '24/7 Open',
      amenities: (json['amenities'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      googleMapsUrl: directions?['googleMapsUrl'] ??
          'https://www.google.com/maps/dir/?api=1&destination=${json['lat']},${json['lng']}',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'lat': lat,
      'lng': lng,
      'totalChargers': totalChargers,
      'availableChargers': availableChargers,
      'voltage': voltage,
      'voltageValue': voltageValue,
      'powerKw': powerKw,
      'twoWheeler': twoWheeler,
      'fourWheeler': fourWheeler,
      'connectorTypes': connectorTypes,
      'pricing': pricing,
      'status': status,
      'operatingHours': operatingHours,
      'amenities': amenities,
      'directions': {
        'lat': lat,
        'lng': lng,
        'googleMapsUrl': googleMapsUrl,
      }
    };
  }
}
