# Gastronomie-Map Integration Documentation

## Overview

The **Gastronomie-Finder** module provides an interactive map to help visitors find restaurants, cafés, bars, pubs, ice cream shops, and biergartens near Park Babelsberg, Neuer Garten, and Schloss Babelsberg.

**Key Features**:
- 🗺️ Interactive Leaflet map with OpenStreetMap tiles
- 📍 Geolocation support with user permission
- 🧭 Platform-aware navigation (iOS→Apple Maps, Android→Maps app, Desktop→Google Maps)
- 🎨 Color-coded markers by category (6 categories)
- 📊 Static GeoJSON data from OpenStreetMap via Overpass API
- 🔒 Privacy-first: Map loads without consent, geolocation requires permission

## Quick Start

### Files Involved

```
park-babelsberg/
├── index.html                      # Main page with integrated Gastronomie-Finder
├── data/
│   └── gastronomie.geojson        # Location data (303 features)
└── modules/
    └── gastronomie-map.html       # Standalone module (can be included elsewhere)

update-gastronomie-data.sh         # Data update script
update-all-locations.sh             # Master update script (updates all finders)
```

### Module Integration

The Gastronomie-Finder is integrated into `park-babelsberg/index.html` as a `<section>` with:
- Map container: `<div id="gastro-map">`
- Locate button: `<button id="btn-gastro-locate">`
- Navigation button: `<button id="btn-gastro-nearest">`
- Distance info: `<span id="gastro-distance-info">`

**Navigation Link**: Added to sticky nav badges:
```html
<a class="badge" href="#gastronomie-finder">Gastronomie</a>
```

## Data Management

### Current Data

**Bounding Box**: 52.380,13.050,52.420,13.100 (focused on Park Babelsberg, Neuer Garten, Schloss Babelsberg area)

**Location Count**: 303 gastronomie locations (as of initial fetch)

**Categories**:
- 🍽️ Restaurant (`amenity=restaurant`)
- ☕ Café (`amenity=cafe`)
- 🍔 Imbiss/Fast Food (`amenity=fast_food`)
- 🍺 Bar (`amenity=bar`)
- 🍺 Pub (`amenity=pub`)
- 🍦 Eiscafé (`amenity=ice_cream`)
- 🌳 Biergarten (`amenity=biergarten`)

### Updating Data

**Option 1: Update only Gastronomie data**
```bash
./update-gastronomie-data.sh
```

**Option 2: Update all location data (recommended)**
```bash
./update-all-locations.sh
```

**Dependencies**: Requires `curl` and `jq` installed

**Data Source**: OpenStreetMap via Overpass API

**Update Frequency**: Recommended once per month or before major content updates

### Overpass Query

The update script uses this Overpass API query:

```overpass
[out:json][timeout:25];
(
  node["amenity"~"^(restaurant|cafe|fast_food|bar|pub|ice_cream|biergarten)$"](52.380,13.050,52.420,13.100);
  way["amenity"~"^(restaurant|cafe|fast_food|bar|pub|ice_cream|biergarten)$"](52.380,13.050,52.420,13.100);
);
out center;
```

### GeoJSON Structure

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [13.075123, 52.405678]
      },
      "properties": {
        "name": "Café am See",
        "amenity": "cafe",
        "cuisine": "german",
        "opening_hours": "Mo-Su 10:00-18:00",
        "outdoor_seating": "yes",
        "wheelchair": "yes",
        "website": "https://example.com",
        "phone": "+49 331 1234567",
        "takeaway": "yes"
      }
    }
  ]
}
```

## Customization

### Adjusting Bounding Box

Edit `update-gastronomie-data.sh`:

```bash
# Configuration
BBOX="52.380,13.050,52.420,13.100"  # minLat,minLng,maxLat,maxLng
```

**Current Coverage**: Park Babelsberg, Neuer Garten, Schloss Babelsberg, and areas between

**To Expand**: Increase coordinates to cover wider area (e.g., for "all of Potsdam": `52.360,13.020,52.430,13.140`)

### Changing Marker Colors

Edit `park-babelsberg/modules/gastronomie-map.html` (lines 113-121):

```javascript
const CATEGORY_COLORS = {
  'restaurant': '#ef4444',    // Red
  'cafe': '#92400e',          // Brown
  'fast_food': '#f59e0b',     // Orange
  'bar': '#8b5cf6',           // Purple
  'pub': '#8b5cf6',           // Purple
  'ice_cream': '#ec4899',     // Pink
  'biergarten': '#10b981'     // Green
};
```

### Modifying Popup Content

Edit popup content generation in `addGastroMarker()` function (lines 202-231):

```javascript
let popupContent = `<strong>${props.name || 'Gastronomie'}</strong><br>`;
popupContent += `${CATEGORY_LABELS[props.amenity] || props.amenity}<br>`;

if (props.cuisine) {
  popupContent += `🍴 ${props.cuisine}<br>`;
}

if (props.outdoor_seating === 'yes') {
  popupContent += `🌞 Außensitzplätze<br>`;
}

if (props.opening_hours) {
  popupContent += `🕐 ${props.opening_hours}<br>`;
}
```

**Available Properties**: name, amenity, cuisine, opening_hours, outdoor_seating, wheelchair, website, phone, takeaway

### Changing Navigation Mode

Edit `navigateToNearest()` function (line 430):

```javascript
// Current: walking mode
url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;

// Alternative: driving mode
url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

// Alternative: bicycling mode
url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=bicycling`;
```

## Technical Details

### Architecture

**Pattern**: IIFE (Immediately Invoked Function Expression) for scope isolation

**Key Functions**:
- `initMap()`: Initialize Leaflet map with OSM tiles
- `loadGastroData()`: Fetch and render GeoJSON data
- `addGastroMarker(feature)`: Add marker to map with popup
- `locateUser()`: Use browser geolocation API
- `findNearestGastro()`: Calculate nearest location using Haversine distance
- `navigateToNearest()`: Platform-aware navigation deep links

### Platform Detection

```javascript
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isAndroid = /Android/i.test(navigator.userAgent);
```

### Navigation URLs

**iOS (Apple Maps)**:
```
maps://maps.apple.com/?saddr=52.405,13.075&daddr=52.407,13.078&dirflg=w
```
- Fallback to Google Maps after 500ms if Apple Maps not available

**Android (Default Maps App)**:
```
geo:52.407,13.078?q=52.407,13.078(Café am See)
```

**Desktop (Google Maps in new tab)**:
```
https://www.google.com/maps/dir/?api=1&origin=52.405,13.075&destination=52.407,13.078&travelmode=walking
```

### Distance Calculation

Uses **Haversine formula** for great-circle distance:

```javascript
function haversine(pos1, pos2) {
  const R = 6371000; // Earth radius in meters
  const toRad = x => x * Math.PI / 180;

  const dLat = toRad(pos2.lat - pos1.lat);
  const dLng = toRad(pos2.lng - pos1.lng);
  const lat1 = toRad(pos1.lat);
  const lat2 = toRad(pos2.lat);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLng/2) * Math.sin(dLng/2);

  return 2 * R * Math.asin(Math.sqrt(a));
}
```

### Privacy & Consent

**CMP Integration Stub** (line 299-334):

```javascript
function checkGeolocationConsent() {
  // TODO: Integrate with real CMP
  // For now, we use browser's native geolocation permission
  return true;
}
```

**Privacy Model**:
1. Map tiles load immediately (no consent required)
2. Geolocation requires explicit user action (button click)
3. Browser handles geolocation permission prompt
4. Future: Integrate with site-wide CMP (e.g., Cookiebot, OneTrust)

### Mobile Optimization

**Responsive Map Height** (lines 79-82):
```css
@media (max-width: 768px) {
  #gastro-map {
    height: 320px;
  }
}
```

**Button Layout** (lines 84-93):
```css
.gastro-btn {
  flex: 1;
  min-width: 140px;
}

#gastro-distance-info {
  flex-basis: 100%;
  margin-left: 0 !important;
  text-align: center;
}
```

## Troubleshooting

### Map Not Loading

**Symptoms**: Gray box where map should be

**Causes**:
1. Leaflet.js not loaded (check `<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">`)
2. Leaflet CSS not loaded (check `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">`)
3. JavaScript error before map initialization

**Fix**: Open browser console (F12) and check for errors

### No Markers Appearing

**Symptoms**: Map loads but no locations shown

**Causes**:
1. GeoJSON file missing or empty
2. Incorrect path to `data/gastronomie.geojson`
3. Invalid GeoJSON format

**Fix**:
```bash
# Check if file exists
ls -lh park-babelsberg/data/gastronomie.geojson

# Validate GeoJSON
jq . park-babelsberg/data/gastronomie.geojson

# Re-fetch data
./update-gastronomie-data.sh
```

### "Standortzugriff fehlgeschlagen"

**Symptoms**: Geolocation fails when clicking "Standort nutzen"

**Causes**:
1. User denied browser permission
2. HTTPS required (geolocation doesn't work on HTTP except localhost)
3. Browser doesn't support geolocation

**Fix**:
1. Instruct user to allow location access in browser settings
2. Ensure site is served over HTTPS in production
3. Test in modern browser (Chrome, Firefox, Safari, Edge)

### Navigation Button Stays Disabled

**Symptoms**: "Zum nächsten Restaurant" button never enables

**Causes**:
1. Geolocation not successful
2. No markers loaded

**Fix**: Button only enables after successful geolocation. Check console for errors.

### Multiple Maps Conflict

**Symptoms**: When three finders (WC, Gastronomie, Parking) are on same page, one or more fail

**Causes**:
1. Duplicate element IDs
2. Global variable conflicts
3. Leaflet instance conflicts

**Prevention**: Each module uses:
- Unique element IDs (`gastro-map`, `btn-gastro-locate`, etc.)
- IIFE scope isolation
- Unique Leaflet map instance variable

**Fix**: Verify no duplicate IDs in HTML

## Testing

### Local Testing

```bash
# Start local server
python3 -m http.server 8000

# Open in browser
http://localhost:8000/park-babelsberg/index.html#gastronomie-finder
```

### Test Checklist

- [ ] Map loads and displays OSM tiles
- [ ] Markers appear at correct locations
- [ ] Markers have correct colors by category
- [ ] Clicking marker opens popup with location info
- [ ] "Standort nutzen" button requests geolocation permission
- [ ] After granting permission, red user marker appears
- [ ] "Zum nächsten Restaurant" button enables
- [ ] Distance info shows "Nächstes [Category]: X m/km"
- [ ] Clicking navigation button opens maps app/tab
- [ ] Navigation works on mobile (iOS/Android)
- [ ] Navigation works on desktop (new tab)
- [ ] Map is responsive on mobile (320px width)

### Browser Compatibility

**Tested**:
- Chrome 120+ ✅
- Firefox 120+ ✅
- Safari 17+ ✅
- Edge 120+ ✅

**Requirements**:
- ES6 support (arrow functions, const/let, template literals)
- Geolocation API
- Fetch API

## Deployment

### Pre-deployment Checklist

- [ ] Update data: Run `./update-gastronomie-data.sh`
- [ ] Verify GeoJSON file is not empty: `jq '.features | length' park-babelsberg/data/gastronomie.geojson`
- [ ] Test map in production-like environment (HTTPS)
- [ ] Verify mobile navigation on actual devices
- [ ] Check page load performance (Lighthouse, WebPageTest)
- [ ] Integrate real CMP if GDPR compliance required

### Performance Considerations

**Current Data**: 303 locations

**Impact**:
- GeoJSON file size: ~150 KB
- Rendering: Leaflet can handle 1000+ markers efficiently
- No performance issues expected

**Optimization** (if needed):
1. Implement marker clustering (Leaflet.markercluster plugin)
2. Lazy-load map when scrolled into view
3. Reduce bounding box to show fewer locations

### Maintenance Schedule

**Monthly**: Update location data
```bash
./update-all-locations.sh
git add park-babelsberg/data/gastronomie.geojson
git commit -m "Update gastronomie data from OpenStreetMap"
```

**Quarterly**: Review data quality
- Check for duplicate entries
- Verify coordinates are accurate
- Remove closed businesses (manually or via OSM updates)

**Annually**: Review bounding box and categories
- Adjust area coverage if needed
- Add new amenity types if relevant

## Related Documentation

- **WC-MAP-INTEGRATION.md**: WC-Finder module documentation
- **PARKING-MAP-INTEGRATION.md**: Parkplatz-Finder module documentation
- **IMPLEMENTATION-PLAN.md**: Original implementation plan for all three finders
- **CLAUDE.md**: Project overview and maintenance guide

## Support

For issues or questions:
1. Check browser console for JavaScript errors
2. Verify GeoJSON data is valid: `jq . park-babelsberg/data/gastronomie.geojson`
3. Test with fresh data: `./update-gastronomie-data.sh`
4. Review this documentation
5. Check OpenStreetMap status: https://status.openstreetmap.org/

---

**Last Updated**: 2025-10-24
**Module Version**: 1.0
**Data Source**: OpenStreetMap via Overpass API
**License**: Data © OpenStreetMap contributors, ODbL
