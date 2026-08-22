import os
import math
import base64
import smtplib
from email.message import EmailMessage
from typing import List, Optional
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
from pydantic import BaseModel, Field
from supabase import create_client, Client

load_dotenv()

# --- Configuration & Credentials ---
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your-anon-or-service-role-key")

EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Pothole Detection Backend (Render + Supabase)", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------- Helper Functions ----------------- #

async def get_road_name(lat: float, lon: float) -> str:
    """Reverse geocode coordinates using OpenStreetMap Nominatim with safety catches"""
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1"
    headers = {"User-Agent": "PotholeDetectorHackathonApp/1.0"}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers, timeout=2.5)
            if resp.status_code == 200:
                data = resp.json()
                address = data.get("address", {})
                return address.get("road") or address.get("suburb") or address.get("neighbourhood") or "Local Road"
    except httpx.RequestError as exc:
        print(f"Outbound network blocked or timeout: {exc}")
        return "Local Road"
    except Exception as exc:
        print(f"Unknown geocoding error: {exc}")
        return "Local Road"
    return "Local Road"


def calculate_haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ----------------- Pydantic Schemas ----------------- #

class PotholeItem(BaseModel):
    latitude: float
    longitude: float
    confidence: float
    detected_at: Optional[str] = None


class PotholeBatchRequest(BaseModel):
    potholes: List[PotholeItem]


class SinglePotholeCreate(BaseModel):
    latitude: float
    longitude: float
    confidence: float = Field(..., ge=0.0, le=1.0)
    image_base64: Optional[str] = None  # Added for civic reporting


class ProximityAlertRequest(BaseModel):
    latitude: float
    longitude: float
    heading_degrees: Optional[float] = 0.0
    speed_kmh: Optional[float] = 30.0


class ReportRequest(BaseModel):
    target_email: str


# ----------------- API Endpoints ----------------- #

@app.post("/api/v1/potholes/batch", status_code=200)
async def ingest_potholes_batch(payload: PotholeBatchRequest):
    """Batch ingest with deduplication against Supabase"""
    inserted = 0

    for item in payload.potholes:
        if item.confidence < 0.6:
            continue

        lat_min, lat_max = item.latitude - 0.0001, item.latitude + 0.0001
        lon_min, lon_max = item.longitude - 0.0001, item.longitude + 0.0001

        nearby_res = (
            supabase.table("potholes")
            .select("*")
            .gte("latitude", lat_min)
            .lte("latitude", lat_max)
            .gte("longitude", lon_min)
            .lte("longitude", lon_max)
            .limit(1)
            .execute()
        )

        if nearby_res.data:
            existing = nearby_res.data[0]
            new_conf = max(existing["confidence"], item.confidence)
            supabase.table("potholes").update({
                "verified_count": existing["verified_count"] + 1,
                "confidence": new_conf
            }).eq("id", existing["id"]).execute()
        else:
            road = await get_road_name(item.latitude, item.longitude)
            supabase.table("potholes").insert({
                "latitude": item.latitude,
                "longitude": item.longitude,
                "road_name": road,
                "confidence": item.confidence
            }).execute()
            inserted += 1

    return {"status": "success", "inserted_count": inserted}


@app.post("/api/v1/potholes", status_code=201)
async def ingest_single_pothole(payload: SinglePotholeCreate):
    """Single ingest endpoint fallback with optional Base64 Image support"""
    road = await get_road_name(payload.latitude, payload.longitude)

    # Calculate if an image is present (True/False)
    image_attached = bool(payload.image_base64)

    res = supabase.table("potholes").insert({
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "road_name": road,
        "confidence": payload.confidence,
        "image_base64": payload.image_base64,
        "has_image": image_attached  # <-- NEW: Save the flag
    }).execute()

    record = res.data[0] if res.data else {}
    return {"status": "success", "id": record.get("id"), "road_name": road}

@app.get("/api/v1/potholes")
def get_potholes_bbox(bbox: str = Query(..., description="min_lon,min_lat,max_lon,max_lat")):
    """GeoJSON bounding box query for map display"""
    try:
        min_lon, min_lat, max_lon, max_lat = map(float, bbox.split(","))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid bbox format. Use min_lon,min_lat,max_lon,max_lat")

    res = (
        supabase.table("potholes")
        .select("id, latitude, longitude, road_name, confidence, verified_count, detected_at, has_image")
        .gte("latitude", min_lat)
        .lte("latitude", max_lat)
        .gte("longitude", min_lon)
        .lte("longitude", max_lon)
        .execute()
    )
    # Note: We purposely do NOT select image_base64 here to keep the map fast

    features = [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [p["longitude"], p["latitude"]]
            },
            "properties": {
                "id": p["id"],
                "road_name": p["road_name"],
                "confidence": p["confidence"],
                "verified_count": p["verified_count"],
                "detected_at": p["detected_at"]
            }
        } for p in res.data
    ]
    return {"type": "FeatureCollection", "features": features}


@app.get("/api/v1/roads/summary")
def get_roads_summary():
    """Summary of hazard density per road"""
    res = supabase.table("potholes").select("road_name").execute()

    road_counts = {}
    for p in res.data:
        road = p.get("road_name") or "Unknown Road"
        road_counts[road] = road_counts.get(road, 0) + 1

    summary = []
    for road, count in road_counts.items():
        risk = "CRITICAL" if count >= 10 else ("MEDIUM" if count >= 4 else "LOW")
        summary.append({
            "road_name": road,
            "pothole_count": count,
            "risk_level": risk
        })

    summary.sort(key=lambda x: x["pothole_count"], reverse=True)
    return summary


@app.post("/api/v1/alerts/proximity")
def get_proximity_alert(payload: ProximityAlertRequest):
    """Driver proximity warning for potholes within 50m"""
    lat_min, lat_max = payload.latitude - 0.001, payload.latitude + 0.001
    lon_min, lon_max = payload.longitude - 0.001, payload.longitude + 0.001

    res = (
        supabase.table("potholes")
        .select("latitude, longitude, road_name")
        .gte("latitude", lat_min)
        .lte("latitude", lat_max)
        .gte("longitude", lon_min)
        .lte("longitude", lon_max)
        .execute()
    )

    for p in res.data:
        distance = calculate_haversine_meters(payload.latitude, payload.longitude, p["latitude"], p["longitude"])
        if distance <= 50:
            return {
                "alert": True,
                "distance_meters": round(distance, 1),
                "hazard_type": "pothole",
                "road_name": p["road_name"],
                "message": f"Hazard detected {round(distance)}m ahead on {p['road_name']}!"
            }

    return {"alert": False, "distance_meters": None, "message": "Clear road ahead"}


@app.post("/api/v1/potholes/{pothole_id}/report")
def report_pothole(pothole_id: int, payload: ReportRequest):
    """Generates an email report using the Resend HTTP API"""

    # 1. Fetch the pothole
    res = supabase.table("potholes").select("*").eq("id", pothole_id).execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Pothole not found")

    pothole = res.data[0]

    # 2. Check for image
    if not pothole.get("image_base64"):
        raise HTTPException(
            status_code=400,
            detail="Cannot generate report: No image attached to this pothole."
        )

    # 3. Check for Resend API Key
    resend_api_key = os.getenv("RESEND_API_KEY")
    if not resend_api_key:
        raise HTTPException(
            status_code=500,
            detail="RESEND_API_KEY not configured in environment variables."
        )

    # 4. Prepare the Base64 Image string for Resend
    # Resend wants just the raw base64 data, without the 'data:image/jpeg;base64,' prefix
    raw_base64 = pothole["image_base64"]
    if "," in raw_base64:
        raw_base64 = raw_base64.split(",")[1]

    # 5. Construct the Resend API payload
    email_payload = {
        "from": "Dashcam AI <onboarding@resend.dev>",  # Must be this for free tier
        "to": [payload.target_email],  # Must be your verified Resend email
        "subject": f"Official Hazard Report: Pothole on {pothole['road_name']}",
        "text": (
            f"Automated Civic Hazard Report\n\n"
            f"A severe pothole has been detected and verified by the system.\n\n"
            f"Location: {pothole['road_name']}\n"
            f"Coordinates: {pothole['latitude']}, {pothole['longitude']}\n"
            f"Confidence Score: {pothole['confidence']}\n\n"
            f"Please find the photographic evidence attached to this email."
        ),
        "attachments": [
            {
                "filename": f"pothole_evidence_{pothole_id}.jpg",
                "content": raw_base64
            }
        ]
    }

    # 6. Send the request via HTTPX
    try:
        response = httpx.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            },
            json=email_payload,
            timeout=10.0
        )

        if response.status_code >= 400:
            raise HTTPException(status_code=500, detail=f"Resend API Error: {response.text}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reach Resend API: {e}")

    return {"status": "success", "message": f"Report successfully emailed to {payload.target_email}"}
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)