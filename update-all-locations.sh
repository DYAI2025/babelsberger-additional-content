#!/bin/bash
# Master Update Script for All Location Data
# Updates WC, Gastronomie, and Parking locations from OpenStreetMap
# Usage: ./update-all-locations.sh

set -e

echo "🗺️  Location Data Master Update Script"
echo "======================================"
echo ""
echo "This script will update all location data:"
echo "  1. WC locations"
echo "  2. Gastronomie locations"
echo "  3. Parking locations"
echo "  4. ÖPNV-Haltestellen (Bus & Tram)"
echo ""
echo "Press Ctrl+C to cancel, or wait 3 seconds to continue..."
sleep 3
echo ""

# Track timing and results
START_TIME=$(date +%s)
TOTAL_LOCATIONS=0
ERRORS=0

# Function to run update script and handle errors
run_update() {
    local script_name=$1
    local display_name=$2

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📍 Updating: $display_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    if [ ! -f "$script_name" ]; then
        echo "❌ Error: Script not found: $script_name"
        ((ERRORS++))
        return 1
    fi

    if [ ! -x "$script_name" ]; then
        echo "⚠️  Making script executable: $script_name"
        chmod +x "$script_name"
    fi

    if ./"$script_name"; then
        echo "✅ $display_name update completed successfully"
        echo ""
        return 0
    else
        echo "❌ Error: $display_name update failed"
        ((ERRORS++))
        echo ""
        return 1
    fi
}

# Update WC locations
if run_update "update-wc-data.sh" "WC-Finder"; then
    WC_COUNT=$(jq '.features | length' park-babelsberg/data/wc.geojson 2>/dev/null || echo "0")
    TOTAL_LOCATIONS=$((TOTAL_LOCATIONS + WC_COUNT))
fi

# Update Gastronomie locations
if run_update "update-gastronomie-data.sh" "Gastronomie-Finder"; then
    GASTRO_COUNT=$(jq '.features | length' park-babelsberg/data/gastronomie.geojson 2>/dev/null || echo "0")
    TOTAL_LOCATIONS=$((TOTAL_LOCATIONS + GASTRO_COUNT))
fi

# Update Parking locations
if run_update "update-parking-data.sh" "Parkplatz-Finder"; then
    PARKING_COUNT=$(jq '.features | length' park-babelsberg/data/parking.geojson 2>/dev/null || echo "0")
    TOTAL_LOCATIONS=$((TOTAL_LOCATIONS + PARKING_COUNT))
fi

# Update ÖPNV locations
if run_update "update-oepnv-data.sh" "ÖPNV-Haltestellen"; then
    OEPNV_COUNT=$(jq '.features | length' park-babelsberg/data/oepnv.geojson 2>/dev/null || echo "0")
    TOTAL_LOCATIONS=$((TOTAL_LOCATIONS + OEPNV_COUNT))
fi

# Calculate elapsed time
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
MINUTES=$((ELAPSED / 60))
SECONDS=$((ELAPSED % 60))

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Final Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Updates completed in ${MINUTES}m ${SECONDS}s"
echo ""
echo "📈 Location counts:"
echo "  - WC locations: ${WC_COUNT:-N/A}"
echo "  - Gastronomie locations: ${GASTRO_COUNT:-N/A}"
echo "  - Parking locations: ${PARKING_COUNT:-N/A}"
echo "  - ÖPNV-Haltestellen: ${OEPNV_COUNT:-N/A}"
echo "  - Total: $TOTAL_LOCATIONS locations"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "⚠️  Completed with $ERRORS error(s)"
    echo ""
    exit 1
else
    echo "✅ All updates completed successfully!"
    echo ""
    echo "💡 Next steps:"
    echo "   1. Review the data files in park-babelsberg/data/"
    echo "   2. Test the maps in your browser: http://localhost:8000/park-babelsberg/index.html"
    echo "   3. Commit changes: git add park-babelsberg/data/*.geojson"
    echo "   4. Commit: git commit -m 'Update all location data from OpenStreetMap'"
    echo ""
fi
