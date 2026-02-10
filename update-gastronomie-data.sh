#!/bin/bash
# Gastronomie Data Update Script
# Updates restaurant/cafe/bar locations from OpenStreetMap via Overpass API
# Usage: ./update-gastronomie-data.sh

set -e

echo "🍽️  Gastronomie-Daten Update Script"
echo "===================================="
echo ""

# Configuration
BBOX="52.380,13.050,52.420,13.100"  # Park Babelsberg + Neuer Garten area
OUTPUT="park-babelsberg/data/gastronomie.geojson"
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
echo "🏷️  Categories: restaurant, cafe, fast_food, bar, pub, ice_cream, biergarten"
echo ""

# Create Overpass query
read -r -d '' QUERY <<'EOF' || true
[out:json][timeout:25];
(
  node["amenity"~"^(restaurant|cafe|fast_food|bar|pub|ice_cream|biergarten)$"](52.380,13.050,52.420,13.100);
  way["amenity"~"^(restaurant|cafe|fast_food|bar|pub|ice_cream|biergarten)$"](52.380,13.050,52.420,13.100);
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
        name: (.tags.name // "Restaurant"),
        amenity: (.tags.amenity // "restaurant"),
        cuisine: (.tags.cuisine // null),
        opening_hours: (.tags.opening_hours // null),
        website: (.tags.website // null),
        phone: (.tags.phone // null),
        outdoor_seating: (.tags.outdoor_seating // null),
        wheelchair: (.tags.wheelchair // null),
        takeaway: (.tags.takeaway // null)
      }
    }
  ]
}' > "$OUTPUT"

# Count features
FEATURE_COUNT=$(jq '.features | length' "$OUTPUT")

echo "✅ GeoJSON created successfully"
echo "📊 Found $FEATURE_COUNT gastronomie locations"
echo ""

# Show breakdown by amenity type
echo "📈 Breakdown by type:"
echo "  - Restaurant: $(jq '[.features[] | select(.properties.amenity == "restaurant")] | length' "$OUTPUT")"
echo "  - Cafe: $(jq '[.features[] | select(.properties.amenity == "cafe")] | length' "$OUTPUT")"
echo "  - Fast Food: $(jq '[.features[] | select(.properties.amenity == "fast_food")] | length' "$OUTPUT")"
echo "  - Bar: $(jq '[.features[] | select(.properties.amenity == "bar")] | length' "$OUTPUT")"
echo "  - Pub: $(jq '[.features[] | select(.properties.amenity == "pub")] | length' "$OUTPUT")"
echo "  - Ice Cream: $(jq '[.features[] | select(.properties.amenity == "ice_cream")] | length' "$OUTPUT")"
echo "  - Biergarten: $(jq '[.features[] | select(.properties.amenity == "biergarten")] | length' "$OUTPUT")"
echo ""

# Show breakdown by features
echo "📈 Additional features:"
WITH_OUTDOOR=$(jq '[.features[] | select(.properties.outdoor_seating == "yes")] | length' "$OUTPUT")
WITH_WHEELCHAIR=$(jq '[.features[] | select(.properties.wheelchair == "yes")] | length' "$OUTPUT")
WITH_HOURS=$(jq '[.features[] | select(.properties.opening_hours != null)] | length' "$OUTPUT")
echo "  - With outdoor seating: $WITH_OUTDOOR"
echo "  - Wheelchair accessible: $WITH_WHEELCHAIR"
echo "  - With opening hours: $WITH_HOURS"
echo ""

echo "✅ Done! Data saved to: $OUTPUT"
echo ""
echo "💡 Next steps:"
echo "   1. Review the data in $OUTPUT"
echo "   2. Commit changes: git add $OUTPUT && git commit -m 'Update gastronomie locations'"
echo "   3. Deploy to production"
