#!/usr/bin/env python3
"""
Script to integrate the unified map into index.html
Replaces the three separate map sections with one unified map module
"""

def main():
    # File paths
    index_file = 'park-babelsberg/index.html'
    unified_map_file = 'park-babelsberg/modules/unified-map.html'
    output_file = 'park-babelsberg/index.html'
    backup_file = 'park-babelsberg/index.html.backup'

    # Read the files
    with open(index_file, 'r', encoding='utf-8') as f:
        index_lines = f.readlines()

    with open(unified_map_file, 'r', encoding='utf-8') as f:
        unified_map_content = f.read()

    # Create backup
    with open(backup_file, 'w', encoding='utf-8') as f:
        f.writelines(index_lines)

    print(f"✓ Backup created: {backup_file}")

    # Update navigation (lines 27-29, but 0-indexed so 26-28)
    # Replace three separate links with one unified link
    old_nav = """      <a class="badge" href="#wc-finder">WC-Finder</a>
      <a class="badge" href="#gastronomie-finder">Gastronomie</a>
      <a class="badge" href="#parkplatz-finder">Parkplätze</a>"""

    new_nav = """      <a class="badge" href="#location-finder">Location-Finder</a>"""

    # Join lines and replace navigation
    index_content = ''.join(index_lines)
    index_content = index_content.replace(old_nav, new_nav)

    # Split back into lines
    index_lines = index_content.split('\n')

    print("✓ Navigation updated")

    # Find the start and end of the map sections
    # Start: line 95 (index 94) - the comment before wc-finder
    # End: line 1541 (index 1540) - the </section> before highlights

    # We need to keep lines 0-93 (first 94 lines)
    # Insert unified map content
    # Keep lines from 1541 onwards

    before_maps = '\n'.join(index_lines[0:94])
    after_maps = '\n'.join(index_lines[1541:])

    # Build new content
    new_content = before_maps + '\n' + unified_map_content + '\n\n' + after_maps

    # Write the new file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"✓ Unified map integrated into {output_file}")
    print(f"✓ Removed {1541 - 94} lines of old map code")
    print(f"✓ Added unified map module")
    print("\nChanges:")
    print("  - Updated navigation: 3 links → 1 link")
    print("  - Replaced 3 separate maps with 1 unified map")
    print("  - All data sources (WC, Gastronomie, Parking) now on one map")
    print("  - Filter buttons to toggle layers on/off")
    print("\nNext steps:")
    print("  1. Test the site in your browser: http://localhost:8000/park-babelsberg/index.html")
    print("  2. Verify all filters work correctly")
    print("  3. Test geolocation and navigation features")
    print(f"  4. If needed, restore from backup: {backup_file}")

if __name__ == '__main__':
    main()
