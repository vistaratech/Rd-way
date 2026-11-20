# Rd-way

# Rodeway EV — Electric Vehicle Charging & Navigation Platform

> **Rodeway EV** is an end-to-end smart Electric Vehicle (EV) infrastructure platform featuring a real-time **Admin Station Placer & Management Dashboard**, a modern **Driver / User Web Application**, an **Express.js REST API Backend**, and a **Flutter Android Navigation App** powered by Google Maps & Google Navigation SDK.

---

## 📋 Table of Contents
1. [Overhaul & Transition Summary](#-overhaul--transition-summary)
2. [Platform Architecture](#-platform-architecture)
3. [Features Overview](#-features-overview)
   - [Admin Station Placer Dashboard](#1-admin-station-placer-dashboard)
   - [Driver / User Web App](#2-driver--user-web-app)
   - [Backend REST API](#3-backend-rest-api)
   - [Flutter Mobile Navigation App](#4-flutter-mobile-navigation-app)
4. [Design & UI Standards](#-design--ui-standards)
5. [Google Cloud & Maps API Key Setup](#-google-cloud--maps-api-key-setup)
6. [Android & Build Environment Setup](#-android--build-environment-setup-for-partners)
7. [Getting Started (Run Guide)](#-getting-started)
   - [1. Backend & Web App](#step-1-start-the-backend--web-app)
   - [2. Automated Testing](#step-2-run-automated-test-suite)
   - [3. Flutter Mobile App](#step-3-run-the-flutter-mobile-app)
8. [Project File Structure](#-project-file-structure)

---

## 🚀 Overhaul & Transition Summary

The codebase has undergone a complete transformation from the legacy AR/Unity repository into a dedicated EV Charging Platform:

- ❌ **Removed Unity Engine & AR Module**:
  - Deleted `unity/` and `ios/UnityLibrary/`.
  - Deleted `flutter_unity_widget/` package and all Unity dependencies.
  - Removed `ar_navigation.dart`, `drone_navigation.dart`, `smart_navigation.dart`, and `drone_service.dart`.
- ❌ **Removed ESP32 & Hardware Relay Code**:
  - Deleted `esp32_firmware/` and BLE indicator firmware.
  - Removed `flutter_reactive_ble` plugin and `indicator_control_panel.dart`.
- ✅ **Added Full EV Charging Ecosystem**:
  - Built an **Admin Panel** in React + Vite for placing charging hubs on interactive Google Maps.
  - Built a **User App** with live slot availability, voltage metrics, 2W/4W vehicle filters, and Google Maps turn-by-turn directions.
  - Implemented an **Express.js REST API backend** with JSON data persistence and seed data.
  - Updated the **Flutter mobile app** with EV station models, services, branding, and Google Maps navigation integration.

---

## 🏗 Platform Architecture

```
                               ┌─────────────────────────────────┐
                               │   Rodeway EV Platform (Rd-way)  │
                               └────────────────┬────────────────┘
                                                │
         ┌──────────────────────────────┬───────┴──────────────────────────────┐
         ▼                              ▼                                      ▼
┌───────────────────┐          ┌───────────────────┐                  ┌───────────────────┐
│ React Web Frontend│          │ Express.js Backend│                  │ Flutter Mobile App│
│   (admin-panel)   │◄────────►│     (server)      │◄────────────────►│      (lib/)       │
│  Port: 5050/5000  │   REST   │    Port: 5050     │       REST       │  Android / iOS    │
│  Google Maps JS   │   API    │  Data Persistence │       API        │ Google Navigation │
└───────────────────┘          └───────────────────┘                  └───────────────────┘
```

---

## ✨ Features Overview

### 1. Admin Station Placer Dashboard (`/admin`)
- **Interactive Map Pin Drop**: Click anywhere on Google Maps to drop a placement marker and capture exact GPS latitude & longitude coordinates.
- **Station Attribute Configuration**:
  - Station Name & Detailed Address / Landmark.
  - Total Charging Ports & Currently Available Ports.
  - Voltage & Power Rating (e.g. `480V DC Fast Charge (120 kW)`).
  - Vehicle Compatibility Toggles: **Two-Wheeler (2W)** & **Four-Wheeler (4W)**.
  - Connector Types (CCS2, Type 2 AC, GB/T, CHAdeMO, 15A Socket).
  - Pricing per kWh and Operating Status (`Available`, `Busy`, `Under Maintenance`).
- **Live Sync**: Placed stations are immediately saved via REST API and rendered as custom pins on the map.
- **Station Roster**: View, inspect, filter, and delete stations in real time.

### 2. Driver / User Web App (`/` or `/user`)
- **Map View**: Displays all active EV stations across the region with status badges.
- **Quick Filters**:
  - `ALL`: View all stations.
  - `🛵 2W ONLY`: Stations supporting two-wheeler charging (scooters/bikes).
  - `🚗 4W ONLY`: Stations supporting four-wheeler charging (cars/SUVs).
  - `⚡ FAST CHARGE`: High-voltage DC Fast Chargers (≥400V).
  - `✅ AVAILABLE`: Stations with free ports right now.
- **Search Bar**: Quick lookup by station name or locality.
- **Detailed Station Card**:
  - Port availability ratio (e.g., `6/8 Free`).
  - Voltage & power rating (e.g., `800V Ultra-Fast DC 240 kW`).
  - Pricing & supported connector chips.
  - **"Get Google Maps Directions"** button: Opens native Google Maps route to the exact coordinates.

### 3. Backend REST API (`server/`)
- Express 4.x service running on port `5050` (or configured `PORT`).
- **Endpoints**:
  - `GET /api/stations` — Retrieve all EV charging stations.
  - `POST /api/stations` — Add a newly placed charging station.
  - `PUT /api/stations/:id` — Update existing station specifications.
  - `DELETE /api/stations/:id` — Delete a charging station by ID.
  - `POST /api/stations/reset` — Reset to default seed stations.
  - `GET /api/health` — Service health and station count.
- Serves the compiled React single-page app statically.

### 4. Flutter Mobile Navigation App (`lib/`)
- **Data Model**: `lib/src/models/ev_station.dart` with JSON serialization.
- **Service**: `lib/src/services/ev_service.dart` with API fetching and offline fallback seed data.
- **Components**: `lib/src/widgets/ev_station_card.dart` formatted in clean Rodeway emerald branding.
- **Screens**: `lib/src/screens/maps.dart` and `navigation.dart` integrated with Google Maps and turn-by-turn navigation.

---

## 🎨 Design & UI Standards

To maintain a clean, professional aesthetic:
- **Font**: Exclusively uses **Poppins** font (`'Poppins', sans-serif`).
- **Color Scheme**:
  - Primary Background: Crisp White (`#FFFFFF`) & Soft Gray (`#F8FAFC`).
  - Primary Brand Accent: **Emerald Green** (`#10B981` / `#059669`).
  - Border & Dividers: Clean Slate (`#E2E8F0`).
  - Text: Dark Charcoal (`#0F172A`) & Slate (`#64748B`).
- **Logo**: Uses official Rodeway branding (`app_logo.png` / `rodeway_logo.png`).

---

## 🔑 Google Cloud & Maps API Key Setup

The project uses Google Maps API Key:
`AIzaSyBC-9h-ad-8t_40wZCkUeB1TPhQUvfGelM`

### Important Google Cloud Console Configuration:
If you encounter `ApiTargetBlockedMapError` when loading Google Maps in web browsers:
1. Open the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Select Project: **`Rent A Home`** (`rent-a-home-7f6cf`).
3. Click on the API key: `AIzaSyBC-9h-ad-8t_40wZCkUeB1TPhQUvfGelM`.
4. Under **Application restrictions**:
   - Set to **None** (or select **Websites** and add `http://localhost:*/*`).
   - *(If it was set to "Android apps" only, requests from Chrome/localhost are blocked).*
5. Under **API restrictions**:
   - Set to **Don't restrict key** (or ensure **Maps JavaScript API**, **Directions API**, **Places API**, and **Geocoding API** are checked).
6. Click **SAVE** at the bottom and allow 1–2 minutes for Google's servers to sync.

---

## ⚙️ Android & Build Environment Setup (For Partners)

If compiling the Android APK on Windows, follow these exact environment requirements:

### 1. Java JDK Version (Critical!)
- **Use Java 17 LTS**: `D:\android-tools\jdk-17`.
- ⚠️ **DO NOT use Java 25 or Android Studio's bundled JBR 25** — Gradle 8.x will fail with `Unsupported class file major version 69`.
- Set environment variables before building:
  ```powershell
  $env:JAVA_HOME = "D:\android-tools\jdk-17"
  $env:PATH = "D:\android-tools\jdk-17\bin;$env:PATH"
  ```

### 2. Android SDK Path
- Set `sdk.dir` in `android/local.properties`:
  ```properties
  sdk.dir=D:\\android-tools\\sdk
  flutter.sdk=D:\\flutter
  GOOGLE_MAPS_API_KEY=AIzaSyBC-9h-ad-8t_40wZCkUeB1TPhQUvfGelM
  ```
- `D:\android-tools\sdk` contains the complete offline platforms (`android-33`, `android-34`, `android-35`, `android-36`) and build-tools (`34.0.0`, `35.0.0`, `36.0.0`).

### 3. Windows Developer Mode (Required for Symlinks)
- Flutter plugins on Windows require symbolic link support.
- Open Windows Settings (`Win + R` -> `ms-settings:developers`).
- Turn **Developer Mode** switch to **ON**.

### 4. Gradle & Plugin Versions in `android/settings.gradle`:
- Gradle Wrapper: **Gradle 8.14** (`gradle-8.14-all.zip`)
- Android Gradle Plugin: **8.11.1**
- Kotlin Gradle Plugin: **2.2.20**

---

## 🏁 Getting Started

### Step 1: Start the Backend & Web App
```bash
# Navigate to the server folder
cd server

# Install dependencies (first time only)
npm install

# Start the server (runs on http://localhost:5050)
node server.js
```
*Or simply double-click `start_ev_server.bat` in the project root.*

Access the web interfaces:
- **EV User App**: [http://localhost:5050/](http://localhost:5050/)
- **EV Admin Station Placer**: [http://localhost:5050/admin](http://localhost:5050/admin)
- **API Health Check**: [http://localhost:5050/api/health](http://localhost:5050/api/health)

---

### Step 2: Run Automated Test Suite
To verify the full EV workflow (creating stations, coordinate validation, voltage checks, 2W/4W support, deletion, and reset):
```bash
cd server
node test_ev_workflow.js
```
*Expected result: 17 Passed, 0 Failed.*

---

### Step 3: Run the Flutter Mobile App
```bash
# Ensure dependencies are fetched
flutter pub get

# Run on Chrome
flutter run -d chrome

# Or run on connected Android device
flutter run -d <device_id>
```

---

## 📁 Project File Structure

```
Rodeway/
├── README.md                      # Complete project documentation
├── start_ev_server.bat            # One-click script to launch backend & web app
├── .env                           # Environment variables & Google Maps API key
├── pubspec.yaml                   # Cleaned Flutter dependencies (no Unity / BLE)
│
├── admin-panel/                   # React EV Admin & User Web Application
│   ├── index.html                 # Poppins font & Google Maps JS API script
│   ├── vite.config.js             # Vite configuration with /api proxy
│   └── src/
│       ├── App.jsx                # Router (/admin for Admin, / for User App)
│       └── components/
│           ├── AdminPanel.jsx     # Station Placer, Pin Drop, Specs Form & Roster
│           ├── UserApp.jsx        # Driver EV Map, Slot Tracker & Directions
│           ├── GoogleMapsEV.jsx   # Core Google Maps Component with EV Pins
│           └── CleanEVMap.jsx     # OpenStreetMap fallback component
│
├── server/                        # Express.js REST API Backend
│   ├── server.js                  # Express API, CORS, static hosting
│   ├── test_ev_workflow.js        # Automated test suite (17 tests)
│   └── data/
│       └── stations.json          # Persisted EV station database
│
├── lib/                           # Flutter Mobile Application Source
│   ├── main.dart                  # App bootstrap with .env loader
│   └── src/
│       ├── models/
│       │   └── ev_station.dart    # EV Station Dart data model
│       ├── services/
│       │   └── ev_service.dart    # Station API service with offline fallback
│       ├── widgets/
│       │   └── ev_station_card.dart # EV Station Card widget
│       └── screens/
│           ├── maps.dart          # Native Google Map screen with EV pins
│           └── navigation.dart    # Google Navigation turn-by-turn routing
│
└── android/                       # Native Android Project
    ├── local.properties           # SDK & Google Maps API key configuration
    ├── build.gradle               # Cleaned top-level build file
    └── app/
        ├── build.gradle           # Configured for AGP 8.11.1 / MinSdk 24
        └── src/main/
            └── AndroidManifest.xml # Permissions & Google Maps API key meta-data
```

---

## 🤝 Collaboration & Next Steps
- **Branch**: `main`
- **Remote**: `https://github.com/vistaratech/Rd-way.git`
- To push your local commits manually:
  ```bash
  git push -u origin main
  ```
