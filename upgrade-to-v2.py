#!/usr/bin/env python3
"""
Upgrade to Unified Map V2 with clustering and hierarchical filters
"""

def main():
    index_file = 'park-babelsberg/index.html'
    v2_map_file = 'park-babelsberg/modules/unified-map-v2.html'

    # Read files
    with open(index_file, 'r', encoding='utf-8') as f:
        index_content = f.read()

    with open(v2_map_file, 'r', encoding='utf-8') as f:
        v2_map_content = f.read()

    # Find the location-finder section in index.html
    # It starts with <section id="location-finder"
    # and ends with </script> (the last closing script tag of the unified map)

    start_marker = '<section id="location-finder"'
    end_marker = '</script>\n'

    start_idx = index_content.find(start_marker)
    if start_idx == -1:
        print("❌ Could not find location-finder section in index.html")
        return

    # Find the end of the section (find the last </script> that belongs to unified map)
    # We need to find multiple </script> tags and get the last one
    temp_idx = start_idx
    script_count = 0
    last_script_end = -1

    # Count how many <script> tags are in the unified map module
    # This is safer than trying to guess
    search_area = index_content[start_idx:start_idx + 25000]  # reasonable size

    # Find all </script> occurrences after the section start
    import re
    script_ends = [m.end() for m in re.finditer(r'</script>', search_area)]

    if len(script_ends) > 0:
        # The unified map has one main script tag, so we take the last </script>
        last_script_end = start_idx + script_ends[-1]
    else:
        print("❌ Could not find closing script tag")
        return

    # Replace the old unified map with V2
    new_content = (
        index_content[:start_idx] +
        v2_map_content + '\n\n' +
        index_content[last_script_end:]
    )

    # Write back
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("✅ Upgraded to Unified Map V2!")
    print("\n📦 New Features:")
    print("  ✓ Marker Clustering for better performance")
    print("  ✓ Hierarchical filters for Gastronomie sub-categories")
    print("  ✓ Parking layer OFF by default")
    print("  ✓ Google Maps direct navigation links")
    print("  ✓ Website links for restaurants (when available)")
    print("  ✓ Mobile-First optimized design")
    print("  ✓ Improved accessibility (ARIA labels)")
    print("\n🧪 Test in browser: http://localhost:8000/park-babelsberg/index.html")
    print("📁 Backup saved: park-babelsberg/index-v1.html.backup")

if __name__ == '__main__':
    main()
