import urllib.request
import json
url = "https://router.project-osrm.org/route/v1/driving/77.5946,12.9716;76.6499,12.2958?alternatives=true&steps=true&geometries=geojson&overview=full"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        if 'routes' in data:
            print(f"Got {len(data['routes'])} routes.")
        else:
            print("No routes found:", data)
except Exception as e:
    print(f"Error: {e}")
