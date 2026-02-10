#!/bin/bash
# Update ÖPNV-Haltestellen (Bus & Tram) via Overpass API
# Gebiet: Park Babelsberg, Neuer Garten, Schloss Babelsberg

set -e  # Exit on error

# Configuration
OUTPUT_FILE="park-babelsberg/data/oepnv.geojson"
BBOX="52.370,13.040,52.430,13.110"  # Wider area for better coverage

# Overpass API endpoint
OVERPASS_URL="https://overpass-api.de/api/interpreter"

echo "🚍 Fetching ÖPNV-Haltestellen from OpenStreetMap..."
echo "📍 BBox: $BBOX"

# Overpass Query
# Fetch all public transport stops (bus and tram)
read -r -d '' QUERY << 'EOF' || true
[out:json][timeout:30];
(
  // Bus stops (platforms and positions)
  node["public_transport"="platform"]["bus"="yes"](52.370,13.040,52.430,13.110);
  node["public_transport"="stop_position"]["bus"="yes"](52.370,13.040,52.430,13.110);
  node["highway"="bus_stop"](52.370,13.040,52.430,13.110);

  // Tram stops (platforms and positions)
  node["public_transport"="platform"]["tram"="yes"](52.370,13.040,52.430,13.110);
  node["public_transport"="stop_position"]["tram"="yes"](52.370,13.040,52.430,13.110);
  node["railway"="tram_stop"](52.370,13.040,52.430,13.110);
);
out body;
>;
out skel qt;
EOF

# Execute query
echo "⏳ Querying Overpass API..."

curl -s -X POST "$OVERPASS_URL" \
  --data-urlencode "data=$QUERY" \
  -o /tmp/oepnv_raw.json

# Check if file is valid JSON
if ! jq empty /tmp/oepnv_raw.json 2>/dev/null; then
  echo "❌ Error: Invalid JSON response from Overpass API"
  exit 1
fi

# Convert OSM JSON to GeoJSON
echo "🔄 Converting to GeoJSON..."

jq -r '
{
  "type": "FeatureCollection",
  "features": [
    .elements[] |
    select(.type == "node") |
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [.lon, .lat]
      },
      "properties": {
        "name": (.tags.name // "Haltestelle"),
        "ref": (.tags.ref // null),
        "network": (.tags.network // "VBB"),
        "operator": (.tags.operator // null),
        "bus": (.tags.bus // (.tags.highway == "bus_stop") // false),
        "tram": (.tags.tram // (.tags.railway == "tram_stop") // false),
        "public_transport": (.tags.public_transport // null),
        "shelter": (.tags.shelter // null),
        "bench": (.tags.bench // null),
        "wheelchair": (.tags.wheelchair // null),
        "osm_id": .id,
        "osm_type": .type
      }
    }
  ]
}
' /tmp/oepnv_raw.json > "$OUTPUT_FILE"

# Count features
FEATURE_COUNT=$(jq '.features | length' "$OUTPUT_FILE")

echo "✅ Success!"
echo "📊 Found $FEATURE_COUNT ÖPNV stops"
echo "💾 Saved to: $OUTPUT_FILE"
echo ""
echo "🔍 Breakdown:"
BUS_COUNT=$(jq '[.features[] | select(.properties.bus == true or .properties.bus == "yes")] | length' "$OUTPUT_FILE")
TRAM_COUNT=$(jq '[.features[] | select(.properties.tram == true or .properties.tram == "yes")] | length' "$OUTPUT_FILE")
echo "   🚌 Bus stops: $BUS_COUNT"
echo "   🚊 Tram stops: $TRAM_COUNT"
echo ""
echo "🗓️  Next: Run this script monthly or before major updates"

# Cleanup
rm -f /tmp/oepnv_raw.json

exit 0
