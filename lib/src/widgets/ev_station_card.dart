import 'dart:ui';
import 'package:cleadr/src/models/ev_station.dart';
import 'package:cleadr/src/util/branding.dart';
import 'package:flutter/material.dart';

class EVStationCard extends StatelessWidget {
  final EVStation station;
  final VoidCallback onClose;
  final VoidCallback onNavigate;

  const EVStationCard({
    super.key,
    required this.station,
    required this.onClose,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    final isAvailable = station.status.toLowerCase() == 'available';

    return Positioned(
      left: 16,
      right: 16,
      bottom: 24,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.96),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.8),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.16),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Status & Close
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isAvailable
                            ? RodewayBrand.green.withValues(alpha: 0.12)
                            : RodewayBrand.red.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isAvailable
                              ? RodewayBrand.green
                              : RodewayBrand.red,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.circle,
                            size: 8,
                            color: isAvailable ? RodewayBrand.green : RodewayBrand.red,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            station.status.toUpperCase(),
                            style: TextStyle(
                              color: isAvailable ? RodewayBrand.green : RodewayBrand.red,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.black54, size: 20),
                      onPressed: onClose,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Station Name
                Text(
                  station.name,
                  style: const TextStyle(
                    color: Color(0xFF1E293B),
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),

                // Address
                Row(
                  children: [
                    const Icon(Icons.location_on_rounded, size: 14, color: RodewayBrand.red),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        station.address,
                        style: const TextStyle(color: Colors.black54, fontSize: 12),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Key Specs Grid: Chargers & Voltage in Rodeway Brand Colors
                Row(
                  children: [
                    // Chargers Count (Green)
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: RodewayBrand.green.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.battery_charging_full_rounded, color: RodewayBrand.green, size: 16),
                                SizedBox(width: 4),
                                Text(
                                  "CHARGERS",
                                  style: TextStyle(
                                    color: Colors.black54,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            RichText(
                              text: TextSpan(
                                text: '${station.availableChargers} ',
                                style: const TextStyle(
                                  color: RodewayBrand.green,
                                  fontSize: 20,
                                  fontWeight: FontWeight.w900,
                                ),
                                children: [
                                  TextSpan(
                                    text: '/ ${station.totalChargers} Free',
                                    style: const TextStyle(
                                      color: Colors.black54,
                                      fontSize: 12,
                                      fontWeight: FontWeight.normal,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),

                    // Voltage (Blue)
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: RodewayBrand.blue.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.bolt_rounded, color: RodewayBrand.blue, size: 16),
                                SizedBox(width: 4),
                                Text(
                                  "VOLTAGE",
                                  style: TextStyle(
                                    color: Colors.black54,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${station.voltageValue}V',
                              style: const TextStyle(
                                color: RodewayBrand.blue,
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            Text(
                              '${station.powerKw.toInt()} kW Fast Charge',
                              style: const TextStyle(color: Colors.black54, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Vehicle Support Badges (Two-Wheeler & Four-Wheeler)
                Row(
                  children: [
                    if (station.twoWheeler)
                      Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: RodewayBrand.yellow.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: RodewayBrand.yellow),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text("🛵 ", style: TextStyle(fontSize: 12)),
                            Text(
                              "2-Wheeler",
                              style: TextStyle(color: Color(0xFFB45309), fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    if (station.fourWheeler)
                      Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: RodewayBrand.blue.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: RodewayBrand.blue),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text("🚗 ", style: TextStyle(fontSize: 12)),
                            Text(
                              "4-Wheeler",
                              style: TextStyle(color: RodewayBrand.blue, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    const Spacer(),
                    Text(
                      station.pricing,
                      style: const TextStyle(color: RodewayBrand.green, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Directions / Navigation Button in Rodeway Blue
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: RodewayBrand.blue,
                      foregroundColor: Colors.white,
                      elevation: 3,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    onPressed: onNavigate,
                    icon: const Icon(Icons.navigation_rounded, size: 20, color: Colors.white),
                    label: const Text(
                      "START NAVIGATION (GOOGLE MAPS)",
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
