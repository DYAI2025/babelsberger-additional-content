#!/bin/bash
# Parking Data Update Script
# Updates parking locations from OpenStreetMap via Overpass API
# Usage: ./update-parking-data.sh

set -e

echo "🅿️  Parkplatz-Daten Update Script"
echo "=================================="
echo ""

# Configuration
BBOX="52.370,13.040,52.430,13.110"  # Wider area for parking
OUTPUT="park-babelsberg/data/parking.geojson"
TIMEOUT=25

# Check dependencies
if ! command -v curl &> /dev/null; then
    echo "❌ Error: curl is required but not installed."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is required but not installed."
    echo "   Install: sudo apt install jq (Ubuntu/Debian) or brew install jq (macOS)"
    exit 1
fi

echo "📍 Bounding Box: $BBOX (wider area)"
echo "📁 Output: $OUTPUT"
echo "🏷️  Categories: parking, bicycle_parking"
echo ""

# Create Overpass query
read -r -d '' QUERY <<'EOF' || true
[out:json][timeout:25];
(
  node["amenity"~"^(parking|bicycle_parking)$"](52.370,13.040,52.430,13.110);
  way["amenity"~"^(parking|bicycle_parking)$"](52.370,13.040,52.430,13.110);
  relation["amenity"~"^(parking|bicycle_parking)$"](52.370,13.040,52.430,13.110);
);
out center;
EOF

echo "🌍 Fetching data from Overpass API..."

# Fetch data from Overpass
RESPONSE=$(curl -s "https://overpass-api.de/api/interpreter" --data "$QUERY")

# Check if response is valid
if [ -z "$RESPONSE" ]; then
    echo "❌ Error: Empty response from Overpass API"
    exit 1
fi

# Check for rate limit error
if echo "$RESPONSE" | grep -q "rate_limited"; then
    echo "❌ Error: Rate limited by Overpass API. Please try again later."
    exit 1
fi

echo "✅ Data received"
echo ""

# Transform to GeoJSON
echo "🔄 Converting to GeoJSON..."

echo "$RESPONSE" | jq '{
  type: "FeatureCollection",
  features: [
    .elements[] | {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [
          (.lon // .center.lon),
          (.lat // .center.lat)
        ]
      },
      properties: {
        name: (.tags.name // "Parkplatz"),
        amenity: (.tags.amenity // "parking"),
        parking: (.tags.parking // null),
        fee: (.tags.fee // "unknown"),
        capacity: (.tags.capacity // null),
        access: (.tags.access // "public"),
        wheelchair: (.tags.wheelchair // null),
        covered: (.tags.covered // null),
        supervised: (.tags.supervised // null),
        maxstay: (.tags.maxstay // null)
      }
    }
  ]
}' > "$OUTPUT"

# Count features
FEATURE_COUNT=$(jq '.features | length' "$OUTPUT")

echo "✅ GeoJSON created successfully"
echo "📊 Found $FEATURE_COUNT parking locations"
echo ""

# Show breakdown by amenity type
echo "📈 Breakdown by type:"
PARKING_COUNT=$(jq '[.features[] | select(.properties.amenity == "parking")] | length' "$OUTPUT")
BICYCLE_COUNT=$(jq '[.features[] | select(.properties.amenity == "bicycle_parking")] | length' "$OUTPUT")
echo "  - Car parking: $PARKING_COUNT"
echo "  - Bicycle parking: $BICYCLE_COUNT"
echo ""

# Show breakdown by parking type (for car parking)
echo "📈 Car parking types:"
echo "  - Surface: $(jq '[.features[] | select(.properties.parking == "surface")] | length' "$OUTPUT")"
echo "  - Underground: $(jq '[.features[] | select(.properties.parking == "underground")] | length' "$OUTPUT")"
echo "  - Multi-storey: $(jq '[.features[] | select(.properties.parking == "multi-storey")] | length' "$OUTPUT")"
echo "  - Street side: $(jq '[.features[] | select(.properties.parking == "street_side")] | length' "$OUTPUT")"
echo "  - Other/Unknown: $(jq '[.features[] | select(.properties.amenity == "parking" and (.properties.parking == null or (.properties.parking != "surface" and .properties.parking != "underground" and .properties.parking != "multi-storey" and .properties.parking != "street_side")))] | length' "$OUTPUT")"
echo ""

# Show breakdown by fee
echo "📈 Fee status:"
FREE_COUNT=$(jq '[.features[] | select(.properties.fee == "no")] | length' "$OUTPUT")
PAID_COUNT=$(jq '[.features[] | select(.properties.fee == "yes")] | length' "$OUTPUT")
UNKNOWN_COUNT=$(jq '[.features[] | select(.properties.fee == "unknown")] | length' "$OUTPUT")
echo "  - Free: $FREE_COUNT"
echo "  - Paid: $PAID_COUNT"
echo "  - Unknown: $UNKNOWN_COUNT"
echo ""

# Calculate total capacity (if available)
TOTAL_CAPACITY=$(jq '[.features[] | select(.properties.capacity != null) | .properties.capacity | tonumber] | add // 0' "$OUTPUT")
WITH_CAPACITY=$(jq '[.features[] | select(.properties.capacity != null)] | length' "$OUTPUT")
echo "📊 Capacity info:"
echo "  - Locations with capacity data: $WITH_CAPACITY"
echo "  - Total known capacity: $TOTAL_CAPACITY spots"
echo ""

echo "✅ Done! Data saved to: $OUTPUT"
echo ""
echo "💡 Next steps:"
echo "   1. Review the data in $OUTPUT"
echo "   2. Commit changes: git add $OUTPUT && git commit -m 'Update parking locations'"
echo "   3. Deploy to production"
