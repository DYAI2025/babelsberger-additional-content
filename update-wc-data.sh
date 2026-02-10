#!/bin/bash
# WC Data Update Script
# Updates WC locations from OpenStreetMap via Overpass API
# Usage: ./update-wc-data.sh

set -e

echo "🚽 WC-Daten Update Script"
echo "=========================="
echo ""

# Configuration
BBOX="52.380,13.060,52.405,13.120"  # Park Babelsberg area
OUTPUT="park-babelsberg/data/wc.geojson"
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

echo "📍 Bounding Box: $BBOX"
echo "📁 Output: $OUTPUT"
echo ""

# Create Overpass query
read -r -d '' QUERY <<'EOF' || true
[out:json][timeout:25];
(
  node["amenity"="toilets"](52.380,13.060,52.405,13.120);
  way["amenity"="toilets"](52.380,13.060,52.405,13.120);
  relation["amenity"="toilets"](52.380,13.060,52.405,13.120);
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
        name: (.tags.name // "Öffentliches WC"),
        access: (.tags.access // "public"),
        fee: (.tags.fee // "unknown"),
        operator: (.tags.operator // null),
        wheelchair: (.tags.wheelchair // null),
        opening_hours: (.tags.opening_hours // null)
      }
    }
  ]
}' > "$OUTPUT"

# Count features
FEATURE_COUNT=$(jq '.features | length' "$OUTPUT")

echo "✅ GeoJSON created successfully"
echo "📊 Found $FEATURE_COUNT WC locations"
echo ""

# Show breakdown by access type
echo "📈 Breakdown by access type:"
echo "  - Public: $(jq '[.features[] | select(.properties.access == "public" or .properties.access == "yes")] | length' "$OUTPUT")"
echo "  - Customers only: $(jq '[.features[] | select(.properties.access == "customers")] | length' "$OUTPUT")"
echo "  - Other: $(jq '[.features[] | select(.properties.access != "public" and .properties.access != "yes" and .properties.access != "customers")] | length' "$OUTPUT")"
echo ""

echo "📈 Breakdown by fee:"
echo "  - Free: $(jq '[.features[] | select(.properties.fee == "no")] | length' "$OUTPUT")"
echo "  - Paid: $(jq '[.features[] | select(.properties.fee == "yes")] | length' "$OUTPUT")"
echo "  - Unknown: $(jq '[.features[] | select(.properties.fee == "unknown")] | length' "$OUTPUT")"
echo ""

echo "✅ Done! Data saved to: $OUTPUT"
echo ""
echo "💡 Next steps:"
echo "   1. Review the data in $OUTPUT"
echo "   2. Commit changes: git add $OUTPUT && git commit -m 'Update WC locations'"
echo "   3. Deploy to production"
