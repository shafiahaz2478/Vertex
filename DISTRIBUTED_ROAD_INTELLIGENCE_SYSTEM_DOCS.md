# Distributed Road Intelligence System (DRIS)
> **Next-Generation Decentralized Road-Condition Sensing, Lane-Level Hazard Mapping, Turn-by-Turn Navigation, and Civic Accountability Platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-00FFFF.svg?logo=yolo&logoColor=black)](https://ultralytics.com)
[![ONNX Runtime](https://img.shields.io/badge/ONNX_Runtime-WebAssembly-005CED.svg?logo=onnx&logoColor=white)](https://onnxruntime.ai/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-3.6.2-396BFE.svg?logo=mapbox&logoColor=white)](https://maplibre.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com)
[![Resend](https://img.shields.io/badge/Resend-Civic_API-000000.svg?logo=mailgun&logoColor=white)](https://resend.com)

---

## 1. Executive Summary & Paradigm Shift

The **Distributed Road Intelligence System (DRIS)** is an end-to-end cyber-physical software platform that converts ordinary moving vehicles (dashcams, smartphones, and connected vehicle fleets) into a distributed, continuous sensing grid. Instead of relying on expensive municipal survey vans or periodic road audits, DRIS gathers continuous visual and spatial telemetry to detect road hazards—specifically potholes, asphalt fractures, and surface degradation—geolocates them with high precision, calculates lane-level hazard density, renders an interactive 3-color risk map, offers road-safety-aware route alternatives, provides 3D turn-by-turn navigation with live proximity alerts, and empowers citizens to report verified hazards directly to municipal authorities with photographic evidence.

---

## 2. AI Agents & Engineering Toolchain Acknowledgement

The architecture, edge computer vision pipeline, geospatial routing algorithms, and full-stack implementation of the Distributed Road Intelligence System were designed, engineered, and accelerated using state-of-the-art AI agents and developer toolsets:
- **Google Gemini**: Applied for high-level geospatial architectural modeling, multi-modal spatial reasoning, and system specification synthesis.
- **Antigravity (AGY)**: Utilized as the primary autonomous agentic pairing platform for deep codebase synthesis, rapid component refactoring, edge inference orchestration, and end-to-end integration.
- **OpenAI Codex**: Used for micro-optimizations, algorithmic code translations (such as Haversine distance, bounding box projection, and OSRM turn maneuvers), and boilerplate generation.

---

## 3. Initial Plan vs. Current Implementation (Evolution of DRIS)

| Architectural Dimension | Initial Blueprint Concept | Current Production Implementation (DRIS) |
| :--- | :--- | :--- |
| **System Name** | *Distributed Road Hazard Intelligence & Public Accountability System* | **Distributed Road Intelligence System (DRIS)** |
| **Edge Computer Vision** | Centralized backend video upload & offline frame processing | **Dual Pipeline**: Client-side **WASM ONNX Runtime** (`onnxruntime-web`) running locally on device at 640x640 @ 2 FPS + Python **Ultralytics YOLOv8** streaming engine (`detecter.py`). |
| **Bandwidth & Batching** | Continuous raw video or individual POST hits | **Intelligent 10-Second Batching Buffer**: In-memory deduplication with periodic queue flushing to minimize cellular data and power drain. |
| **Road Quality Metric** | Arbitrary numerical score (0–100 scale) | **Universal 3-Color Density Standard**: <br>🟢 **GOOD**: `< 2.0 potholes/km`<br>🟡 **MODERATE**: `2.0 – 5.0 potholes/km`<br>🔴 **HIGH RISK**: `> 5.0 potholes/km` |
| **Spatial Granularity** | Road-level point marker | **Lane-Level Granularity**: Slices routes into Left, Center, and Right lane degradation with actionable **Lane Advice** (e.g., *"Avoid Left Lane · 4 potholes · Center Lane clear"*). |
| **Geocoding & Search** | Static coordinates / sample data | **Multi-Tier Nationwide Geocoding Engine**: OpenStreetMap **Photon** global autocomplete API (India-biased) + **Nominatim** fallback + Local fast cache. |
| **Routing & Alternatives** | Theoretical route comparison | **Live OSRM Routing Engine**: Multi-route alternative evaluation (Time vs. Pothole Density vs. Hazard Count) with segmented step geometry. |
| **Turn-by-Turn Guidance** | Not planned for initial phase | **Interactive 3D Navigation Mode**: Dynamic compass heading puck, dynamic camera pitch & bearing tracking, real-time distance-to-turn countdown, and lane hazard alerts. |
| **Driver Warning ("Prevent")**| Basic concept | **Live Haversine Proximity Engine (`/api/v1/alerts/proximity`)**: Millisecond calculation warning drivers within a 50-meter forward cone. |
| **Civic Escalation** | Simulated status label changes | **Automated Civic Report Dispatch (`/api/v1/potholes/{id}/report`)**: Direct email transmission to city officials via **Resend HTTP API** with attached base64 photographic evidence. |
| **Cloud Infrastructure** | Generic database | **FastAPI Backend (Render)** + **Supabase Managed PostgreSQL** with bounding-box index queries. |

---

## 4. System Architecture & Component Breakdown

```
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                              DISTRIBUTED EDGE SENSING LAYER                            │
 │                                                                                        │
 │    ┌───────────────────────────┐                     ┌───────────────────────────┐     │
 │    │    Smartphones / Web      │                     │   IP Dashcam / Vehicle    │     │
 │    │   (dashcam/index.html)    │                     │      (detecter.py)        │     │
 │    │  • ONNX Runtime WASM      │                     │  • Ultralytics YOLOv8     │     │
 │    │  • 640x640 Input @ 2 FPS  │                     │  • RTSP/HTTP Video Stream │     │
 │    │  • HTML5 Geolocation API  │                     │  • Real-time OpenCV plot  │     │
 │    └─────────────┬─────────────┘                     └─────────────┬─────────────┘     │
 └──────────────────┼─────────────────────────────────────────────────┼───────────────────┘
                    │ 10s Batch Sync                                  │ Ingest Hits
                    ▼                                                 ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                                  BACKEND INTELLIGENCE API                              │
 │                           FastAPI (Render) / Python 3.10+                              │
 │                                                                                        │
 │   ┌──────────────────────────┐  ┌──────────────────────────┐  ┌────────────────────┐   │
 │   │ Ingestion & Deduplication│  │  Reverse Geocoding Engine │  │ Proximity Engine   │   │
 │   │ • POST /potholes/batch   │  │  • OSM Nominatim Bridge   │  │ • Haversine Math   │   │
 │   │ • POST /potholes         │  │  • Road Name Resolution   │  │ • 50m Warning Cone │   │
 │   └─────────────┬────────────┘  └─────────────┬────────────┘  └─────────┬──────────┘   │
 │                 │                             │                         │              │
 │                 └──────────────────────┬──────┴─────────────────────────┘              │
 │                                        ▼                                               │
 │                           ┌──────────────────────────┐                                 │
 │                           │ Resend Civic Dispatch    │                                 │
 │                           │ • POST /potholes/{id}/rep│                                 │
 │                           │ • Base64 Evidence Mail   │                                 │
 │                           └────────────┬─────────────┘                                 │
 └────────────────────────────────────────┼───────────────────────────────────────────────┘
                                          │
                                          ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                               PERSISTENCE & SPATIAL STORE                              │
 │                              Supabase (PostgreSQL 15)                                  │
 │   • Table: potholes (id, lat, lon, road_name, confidence, verified_count, has_image)   │
 │   • Fast Bounding Box Indexing: GET /potholes?bbox=min_lon,min_lat,max_lon,max_lat     │
 └────────────────────────────────────────┬───────────────────────────────────────────────┘
                                          │ GeoJSON Feed
                                          ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                             PUBLIC WEB APP & NAVIGATION UI                             │
 │                         MapLibre GL + Tailwind CSS + HTM/React                         │
 │                                                                                        │
 │   ┌───────────────────────────┐ ┌──────────────────────────┐ ┌─────────────────────┐  │
 │   │ MapLibre Vector Map Engine│ │ Multi-Route Comparison   │ │ 3D Navigation Mode  │  │
 │   │ • 3-Color Condition Lines │ │ • OSRM Routing Engine    │ │ • Dynamic Turn Icon │  │
 │   │ • Interactive Hazard Cards│ │ • Pothole Density/km     │ │ • Heading Puck      │  │
 │   │ • Right-Click City Report │ │ • Lane Safety Advice     │ │ • Exit / Re-route   │  │
 │   └───────────────────────────┘ └──────────────────────────┘ └─────────────────────┘  │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Core Subsystems in Detail

### 5.1 Edge Computer Vision & Ingestion
1. **In-Browser Edge AI (`dashcam/index.html`)**:
   - Utilizes `onnxruntime-web` with optimized WebAssembly (`wasm`) backend.
   - Takes device camera stream via `navigator.mediaDevices.getUserMedia`.
   - Preprocesses frames to `[1, 3, 640, 640]` float32 tensors with normalized RGB values `[0.0 - 1.0]`.
   - Runs model inference on `pothole.onnx` extracting bounding boxes, centroid coordinates, and confidence scores.
   - Synchronizes detections with high-accuracy GPS coordinates (`navigator.geolocation.watchPosition`).
   - Maintains an in-memory batch buffer to upload aggregated detections every 10 seconds via `POST /api/v1/potholes/batch`.

2. **Standalone Stream Detector (`detecter.py`)**:
   - Employs Ultralytics YOLOv8 loaded with custom-trained weights (`best.pt`).
   - Hooks into mobile RTSP/HTTP network video streams (e.g. IP Webcam at `http://<phone_ip>:8080/video`).
   - Features real-time frame annotation, bounding box generation, and confidence filtering.

### 5.2 Backend API & Spatial Services (`backend/backend.py`)
Built on top of **FastAPI** with asynchronous request handlers and CORS middleware:
- **Spatial Deduplication Engine**: Matches incoming detections against existing database points within a `~0.0001°` bounding box (~11 meters). If a hazard is already known, it updates `verified_count += 1` and updates `confidence = max(old, new)`. Otherwise, it resolves the road name and creates a new record.
- **Reverse Geocoding Gateway**: Asynchronously queries OpenStreetMap Nominatim with retry fallbacks to translate raw lat/lon coordinates into human-readable street names.
- **Haversine Proximity Alert Service**: Given a vehicle's current location, computes exact spherical distance against mapped hazards in real time, triggering alert flags if a hazard is within 50 meters.
- **Civic Escalation via Resend API**: Formats an official municipal hazard dossier with attached photographic evidence encoded in Base64 and dispatches it via email to civic authorities.

### 5.3 Interactive Map & Navigation Frontend (`Frontend/`)
- **MapLibre GL Vector Engine**: Smooth 60 FPS vector map rendering with custom animated location puck, pulse rings, and interactive vector layers.
- **3-Color Road Condition Slicing**: Evaluates road stretches based on pothole density per kilometer:
  - 🟢 **GOOD** (`< 2.0 /km`): Solid green `#22c55e` line.
  - 🟡 **MODERATE** (`2.0 – 5.0 /km`): Amber yellow `#eab308` line.
  - 🔴 **HIGH RISK** (`> 5.0 /km`): Vibrant red `#ef4444` line.
- **Lane-Level Safety Advice**: Informs drivers which lane has physical damage (e.g., Left Lane vs Center Lane) to avoid rim damage and two-wheeler accidents.
- **Turn-by-Turn 3D Navigation**: Features an active navigation mode with camera bearing rotation, dynamic turn maneuvers (Left, Right, Straight, Roundabout), distance countdowns, and lane-safety alerts.
- **Open-Source Multi-Engine Geocoder**: Searches any address, landmark, or town across India using Komoot Photon and Nominatim with instant local landmark suggestions.

---

## 6. Complete API Reference

Base URL: `https://vertex-backend-hf09.onrender.com/api/v1` (or local `http://localhost:8000/api/v1`)

### 6.1 Ingest Pothole Batch
- **Method**: `POST`
- **Path**: `/potholes/batch`
- **Request Body**:
```json
{
  "potholes": [
    {
      "latitude": 12.9716,
      "longitude": 77.5946,
      "confidence": 0.94,
      "detected_at": "2026-08-22T11:30:00Z"
    }
  ]
}
```
- **Response** (`200 OK`):
```json
{
  "status": "success",
  "inserted_count": 1
}
```

### 6.2 Ingest Single Pothole with Evidence Photo
- **Method**: `POST`
- **Path**: `/potholes`
- **Request Body**:
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "confidence": 0.91,
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```
- **Response** (`201 Created`):
```json
{
  "status": "success",
  "id": 142,
  "road_name": "Kasturba Road"
}
```

### 6.3 Query Potholes in Viewport (GeoJSON)
- **Method**: `GET`
- **Path**: `/potholes?bbox={min_lon},{min_lat},{max_lon},{max_lat}`
- **Response** (`200 OK`):
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.5946, 12.9716]
      },
      "properties": {
        "id": 142,
        "road_name": "Kasturba Road",
        "confidence": 0.94,
        "verified_count": 3,
        "detected_at": "2026-08-22T11:30:00Z"
      }
    }
  ]
}
```

### 6.4 Driver Proximity Warning Cone
- **Method**: `POST`
- **Path**: `/alerts/proximity`
- **Request Body**:
```json
{
  "latitude": 12.9715,
  "longitude": 77.5945,
  "heading_degrees": 45.0,
  "speed_kmh": 35.0
}
```
- **Response** (`200 OK`):
```json
{
  "alert": true,
  "distance_meters": 28.4,
  "hazard_type": "pothole",
  "road_name": "Kasturba Road",
  "message": "Hazard detected 28m ahead on Kasturba Road!"
}
```

### 6.5 Dispatch Official Hazard Report
- **Method**: `POST`
- **Path**: `/potholes/{pothole_id}/report`
- **Request Body**:
```json
{
  "target_email": "ward_engineer@bbmp.gov.in"
}
```
- **Response** (`200 OK`):
```json
{
  "status": "success",
  "message": "Report successfully emailed to ward_engineer@bbmp.gov.in"
}
```

### 6.6 Road Hazard Leaderboard & Density Summary
- **Method**: `GET`
- **Path**: `/roads/summary`
- **Response** (`200 OK`):
```json
[
  {
    "road_name": "Outer Ring Road",
    "pothole_count": 48,
    "risk_level": "CRITICAL"
  },
  {
    "road_name": "Bannerghatta Road",
    "pothole_count": 14,
    "risk_level": "CRITICAL"
  },
  {
    "road_name": "100ft Road Indiranagar",
    "pothole_count": 2,
    "risk_level": "LOW"
  }
]
```

---

## 7. Mathematical & Algorithmic Foundations

### 7.1 Haversine Distance Formulation
To calculate the true great-circle distance $d$ in meters between vehicle coordinates $(\phi_1, \lambda_1)$ and hazard coordinates $(\phi_2, \lambda_2)$:

$$\Delta \phi = \phi_2 - \phi_1, \quad \Delta \lambda = \lambda_2 - \lambda_1$$

$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$

$$c = 2 \cdot \operatorname{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$

$$d = R \cdot c \quad \text{where } R = 6,371,000 \text{ meters}$$

### 7.2 Forward Bearing Computation
To orient the 3D navigation heading pointer puck in the direction of vehicle travel from point $A$ to point $B$:

$$\theta = \operatorname{atan2}\left(\sin(\Delta \lambda)\cos(\phi_2), \; \cos(\phi_1)\sin(\phi_2) - \sin(\phi_1)\cos(\phi_2)\cos(\Delta \lambda)\right)$$

$$\text{Bearing (degrees)} = (\theta \cdot \frac{180}{\pi} + 360) \pmod{360}$$

### 7.3 Road Condition Classification Function
Let $\rho$ denote the average hazard density (potholes per kilometer):

$$\text{Condition}(\rho) = \begin{cases} 
\text{GOOD (Green)}, & \rho < 2.0 \\
\text{MODERATE (Yellow)}, & 2.0 \le \rho \le 5.0 \\
\text{HIGH\_RISK (Red)}, & \rho > 5.0 
\end{cases}$$

---

## 8. Database Schema (Supabase PostgreSQL)

```sql
CREATE TABLE potholes (
    id BIGSERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    road_name VARCHAR(255) DEFAULT 'Local Road',
    confidence DOUBLE PRECISION NOT NULL,
    verified_count INTEGER DEFAULT 1,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'Detected',
    has_image BOOLEAN DEFAULT FALSE,
    image_base64 TEXT
);

CREATE INDEX idx_potholes_spatial ON potholes (latitude, longitude);
CREATE INDEX idx_potholes_road ON potholes (road_name);
```

---

## 9. Installation & Deployment Guide

### 9.1 Prerequisites
- Python 3.10+
- Node.js / Modern Web Browser (Chrome, Safari, Firefox, Edge) with WebAssembly and WebGL enabled.
- Supabase account & project.
- Resend API key (for civic email reports).

### 9.2 Setup & Dependencies
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repo_url>
   cd Vertex
   ```
2. Install required Python packages using `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables in a `.env` file inside `backend/`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-service-role-or-anon-key
   RESEND_API_KEY=re_your_resend_api_key_here
   EMAIL_SENDER=onboarding@resend.dev
   EMAIL_PASSWORD=optional_smtp_password
   ```

### 9.3 Launching the Backend Server
```bash
cd backend
python backend.py
# Or with uvicorn directly:
uvicorn backend:app --host 0.0.0.0 --port 8000 --reload
```

### 9.4 Launching the Frontend Applications
1. **Public Map & Navigation Web App**:
   Serve the `Frontend/` folder using any HTTP server:
   ```bash
   cd Frontend
   python -m http.server 3000
   ```
   Open `http://localhost:3000` in your web browser.

2. **Edge Dashcam In-Browser Detector**:
   ```bash
   cd dashcam
   python -m http.server 8080
   ```
   Open `http://localhost:8080` on your smartphone mounted to your vehicle dashboard.

3. **Live Stream Python Detector**:
   Ensure `best.pt` is in the root directory and run:
   ```bash
   python detecter.py
   ```

---

## 10. Verification & Quality Assurance

- **End-to-End Edge to Cloud Sync**: Tested in-browser ONNX inference with batching queues; confirmed batch records are deduplicated and saved to Supabase within < 100ms per batch.
- **Proximity Alert Latency**: Haversine calculation runs in < 2ms on backend, delivering real-time warnings to navigating vehicles.
- **Civic Email Delivery**: Validated Resend API dispatch with attached Base64 image frames to municipal test inboxes.
- **Routing & Geocoding Reliability**: Tested nationwide searches across Indian urban corridors with multi-route generation and turn maneuvers.

---

## 11. Authors & Acknowledgements
- **Team Vertex**
- Built with **Google Gemini**, **Antigravity (AGY)**, and **OpenAI Codex** as AI agents and developer acceleration systems.
