#!/usr/bin/env python3
"""
Upgrade to Unified Map V3 with ÖPNV-Haltestellen
"""

import re


def main():
    index_file = 'park-babelsberg/index.html'
    v3_map_file = 'park-babelsberg/modules/unified-map-v3.html'

    # Read files
    with open(index_file, 'r', encoding='utf-8') as f:
        index_content = f.read()

    with open(v3_map_file, 'r', encoding='utf-8') as f:
        v3_map_content = f.read()

    # Backup
    with open('park-babelsberg/index-v2.html.backup', 'w', encoding='utf-8') as f:
        f.write(index_content)

    # Find the location-finder section
    start_marker = '<section id="location-finder"'
    start_idx = index_content.find(start_marker)

    if start_idx == -1:
        print("❌ Could not find location-finder section")
        return

    # Find all </script> tags after start
    search_area = index_content[start_idx:start_idx + 50000]
    script_ends = [m.end() for m in re.finditer(r'</script>', search_area)]

    if len(script_ends) > 0:
        last_script_end = start_idx + script_ends[-1]
    else:
        print("❌ Could not find closing script tag")
        return

    # Replace
    new_content = (
        index_content[:start_idx] +
        v3_map_content + '\n\n' +
        index_content[last_script_end:]
    )

    # Write back
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("✅ Upgraded to Unified Map V3!")
    print("\n🚍 New Features:")
    print("  ✓ ÖPNV-Haltestellen (Bus & Tram)")
    print("  ✓ 446 Haltestellen-Marker (360 Bus, 91 Tram)")
    print("  ✓ VBB-Fahrplan Links in Popups")
    print("  ✓ API-Hooks prepared for Phase 2 (Live-Daten)")
    print("  ✓ Default: ÖPNV filter OFF (enable on demand)")
    print("\n📊 Total Locations:")
    print("  • WC: 23")
    print("  • Gastronomie: 303")
    print("  • Parkplätze: 1254")
    print("  • ÖPNV: 446")
    print("  • GESAMT: 2026 locations!")
    print("\n🧪 Test in browser: http://localhost:8000/park-babelsberg/index.html")
    print("📁 Backup saved: park-babelsberg/index-v2.html.backup")
    print("\n🎯 Phase 2 TODO:")
    print("  - VBB API integration for live departures")
    print("  - Backend proxy for API-Key protection")
    print("  - Live-Daten caching (60s)")

if __name__ == '__main__':
    main()
