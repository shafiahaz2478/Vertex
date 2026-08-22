const fetch = require('node-fetch'); // wait node 18+ has fetch natively

async function test() {
  const origin = [77.5946, 12.9716];
  const destination = [76.6499, 12.2958];
  const from = `${origin[0]},${origin[1]}`;
  const to = `${destination[0]},${destination[1]}`;
  const params = new URLSearchParams({
    alternatives: 'true',
    steps: 'true',
    geometries: 'geojson',
    overview: 'full'
  });
  
  const url = `https://router.project-osrm.org/route/v1/driving/${from};${to}?${params}`;
  console.log("URL:", url);
  try {
      const response = await fetch(url);
      const data = await response.json();
      if (!data.routes) {
        console.log("NO ROUTES", data);
        return;
      }
      console.log(`Got ${data.routes.length} routes.`);
  } catch (e) {
      console.log("Error:", e);
  }
}
test();
