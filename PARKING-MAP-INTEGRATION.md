# Parking-Map Integration Documentation

## Overview

The **Parkplatz-Finder** module provides an interactive map to help visitors find parking locations near Park Babelsberg, Neuer Garten, and Schloss Babelsberg, including both car parking and bicycle parking facilities.

**Key Features**:
- 🗺️ Interactive Leaflet map with OpenStreetMap tiles
- 📍 Geolocation support with user permission
- 🧭 Platform-aware navigation (iOS→Apple Maps, Android→Maps app, Desktop→Google Maps)
- 🎨 Color-coded markers by parking type (5 categories)
- 🚗 Car parking prioritized over bicycle parking for navigation
- 📊 Static GeoJSON data from OpenStreetMap via Overpass API
- 🔒 Privacy-first: Map loads without consent, geolocation requires permission

## Quick Start

### Files Involved

```
park-babelsberg/
├── index.html                      # Main page with integrated Parkplatz-Finder
├── data/
│   └── parking.geojson            # Location data (1254 features)
└── modules/
    └── parking-map.html           # Standalone module (can be included elsewhere)

update-parking-data.sh              # Data update script
update-all-locations.sh             # Master update script (updates all finders)
```

### Module Integration

The Parkplatz-Finder is integrated into `park-babelsberg/index.html` as a `<section>` with:
- Map container: `<div id="parking-map">`
- Locate button: `<button id="btn-parking-locate">`
- Navigation button: `<button id="btn-parking-nearest">`
- Distance info: `<span id="parking-distance-info">`

**Navigation Link**: Added to sticky nav badges:
```html
<a class="badge" href="#parkplatz-finder">Parkplätze</a>
```

## Data Management

### Current Data

**Bounding Box**: 52.370,13.040,52.430,13.110 (wider area than other finders to capture parking outside park areas)

**Location Count**: 1254 parking locations (as of initial fetch)
- Car parking: varies by query
- Bicycle parking: varies by query

**Categories**:
- 🅿️ Public Free (`fee=no` or default)
- 💰 Public Paid (`fee=yes`)
- 🔒 Private/Customers (`access=private` or `access=customers`)
- 🏢 Parkhaus/Multi-storey (`parking=multi-storey`)
- 🚲 Bicycle Parking (`amenity=bicycle_parking`)

### Updating Data

**Option 1: Update only Parking data**
```bash
./update-parking-data.sh
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
  node["amenity"~"^(parking|bicycle_parking)$"](52.370,13.040,52.430,13.110);
  way["amenity"~"^(parking|bicycle_parking)$"](52.370,13.040,52.430,13.110);
  relation["amenity"~"^(parking|bicycle_parking)$"](52.370,13.040,52.430,13.110);
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
        "name": "Parkplatz Schlossstraße",
        "amenity": "parking",
        "parking": "surface",
        "fee": "yes",
        "capacity": "120",
        "access": "public",
        "wheelchair": "yes",
        "covered": "no",
        "supervised": "no",
        "maxstay": "2 hours"
      }
    }
  ]
}
```

## Customization

### Adjusting Bounding Box

Edit `update-parking-data.sh`:

```bash
# Configuration
BBOX="52.370,13.040,52.430,13.110"  # Wider area for parking
```

**Current Coverage**: Park Babelsberg, Neuer Garten, Schloss Babelsberg, and surrounding areas

**Why Wider**: Parking is typically located outside park boundaries, so a wider search area is beneficial

**To Expand**: Increase coordinates to cover even wider area (e.g., "all nearby parking": `52.360,13.020,52.440,13.130`)

### Changing Marker Colors

Edit `park-babelsberg/modules/parking-map.html` (lines 113-119):

```javascript
const PARKING_COLORS = {
  'bicycle_parking': '#10b981',  // Green for bicycles
  'public_free': '#3b82f6',      // Blue for public free
  'public_paid': '#f59e0b',      // Orange for paid
  'private': '#6b7280',          // Gray for private/customers
  'multi-storey': '#1e3a8a'      // Dark blue for multi-storey
};
```

### Category Logic

Edit `getParkingCategory()` function (lines 190-197):

```javascript
function getParkingCategory(props) {
  if (props.amenity === 'bicycle_parking') return 'bicycle_parking';
  if (props.parking === 'multi-storey') return 'multi-storey';
  if (props.access === 'private' || props.access === 'customers') return 'private';
  if (props.fee === 'yes') return 'public_paid';
  if (props.fee === 'no') return 'public_free';
  return 'public_free'; // default
}
```

**Logic Priority**:
1. Bicycle parking first (distinct from car parking)
2. Multi-storey parking (Parkhaus)
3. Private/customers only access
4. Paid public parking
5. Free public parking (default)

### Modifying Popup Content

Edit popup content generation in `addParkingMarker()` function (lines 200-257):

```javascript
let popupContent = `<strong>${props.name || 'Parkplatz'}</strong><br>`;

if (props.amenity === 'bicycle_parking') {
  popupContent += '🚲 Fahrradparkplatz<br>';
} else {
  popupContent += '🅿️ Auto-Parkplatz<br>';

  if (props.parking) {
    const typeLabels = {
      'surface': 'Oberirdisch',
      'underground': 'Tiefgarage',
      'multi-storey': 'Parkhaus',
      'street_side': 'Straßenrand'
    };
    popupContent += `📍 ${typeLabels[props.parking] || props.parking}<br>`;
  }

  if (props.capacity) {
    popupContent += `🚗 Kapazität: ${props.capacity} Plätze<br>`;
  }
}

// Fee status
if (props.fee === 'yes') {
  popupContent += '💰 Kostenpflichtig<br>';
} else if (props.fee === 'no') {
  popupContent += '✓ Kostenlos<br>';
}

// Access restrictions
if (props.access === 'private') {
  popupContent += '🔒 Privat<br>';
} else if (props.access === 'customers') {
  popupContent += '🔒 Nur für Kunden<br>';
}

if (props.wheelchair === 'yes') {
  popupContent += '♿ Barrierefrei<br>';
}

if (props.maxstay) {
  popupContent += `⏱️ Max. Parkdauer: ${props.maxstay}<br>`;
}
```

**Available Properties**: name, amenity, parking (type), fee, capacity, access, wheelchair, covered, supervised, maxstay

### Navigation Prioritization

Edit `findNearestParking()` function (lines 296-319):

```javascript
// Prioritize car parking over bicycle
const carParking = markers.filter(p => p.props.amenity !== 'bicycle_parking');
const searchList = carParking.length > 0 ? carParking : markers;
```

**Logic**: When finding nearest parking, car parking is prioritized. Only if no car parking exists will bicycle parking be suggested.

**To Change**: Remove filtering to include all parking types equally:
```javascript
const searchList = markers; // No prioritization
```

### Changing Navigation Mode

Edit `navigateToNearest()` function (line 459):

```javascript
// Current: driving mode (appropriate for parking)
url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

// Alternative: walking mode
url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
```

**Current Choice**: Driving mode is used since users looking for parking are likely driving.

## Technical Details

### Architecture

**Pattern**: IIFE (Immediately Invoked Function Expression) for scope isolation

**Key Functions**:
- `initMap()`: Initialize Leaflet map with OSM tiles
- `loadParkingData()`: Fetch and render GeoJSON data
- `addParkingMarker(feature)`: Add marker to map with popup
- `getParkingCategory(props)`: Determine marker color based on properties
- `locateUser()`: Use browser geolocation API
- `findNearestParking()`: Calculate nearest car parking (prioritized) using Haversine distance
- `navigateToNearest()`: Platform-aware navigation deep links with driving mode

### Platform Detection

```javascript
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isAndroid = /Android/i.test(navigator.userAgent);
```

### Navigation URLs

**iOS (Apple Maps)**:
```
maps://maps.apple.com/?saddr=52.405,13.075&daddr=52.407,13.078&dirflg=d
```
- `dirflg=d` = driving mode
- Fallback to Google Maps after 500ms if Apple Maps not available

**Android (Default Maps App)**:
```
geo:52.407,13.078?q=52.407,13.078(Parkplatz)
```

**Desktop (Google Maps in new tab)**:
```
https://www.google.com/maps/dir/?api=1&origin=52.405,13.075&destination=52.407,13.078&travelmode=driving
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

**CMP Integration Stub** (line 329-334):

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
  #parking-map {
    height: 320px;
  }
}
```

**Button Layout** (lines 84-93):
```css
.parking-btn {
  flex: 1;
  min-width: 140px;
}

#parking-distance-info {
  flex-basis: 100%;
  margin-left: 0 !important;
  text-align: center;
}
```

## Data Analysis

The `update-parking-data.sh` script provides detailed statistics:

### Breakdown by Type
- Car parking count
- Bicycle parking count

### Breakdown by Parking Type (Car Only)
- Surface parking
- Underground parking (Tiefgarage)
- Multi-storey parking (Parkhaus)
- Street side parking
- Other/Unknown

### Breakdown by Fee Status
- Free parking
- Paid parking
- Unknown fee status

### Capacity Info
- Number of locations with capacity data
- Total known capacity (number of parking spots)

**Example Output**:
```
📊 Found 1254 parking locations

📈 Breakdown by type:
  - Car parking: 423
  - Bicycle parking: 831

📈 Car parking types:
  - Surface: 312
  - Underground: 15
  - Multi-storey: 8
  - Street side: 67
  - Other/Unknown: 21

📈 Fee status:
  - Free: 587
  - Paid: 234
  - Unknown: 433

📊 Capacity info:
  - Locations with capacity data: 156
  - Total known capacity: 8,743 spots
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
2. Incorrect path to `data/parking.geojson`
3. Invalid GeoJSON format

**Fix**:
```bash
# Check if file exists
ls -lh park-babelsberg/data/parking.geojson

# Validate GeoJSON
jq . park-babelsberg/data/parking.geojson

# Check feature count
jq '.features | length' park-babelsberg/data/parking.geojson

# Re-fetch data
./update-parking-data.sh
```

### Too Many Markers (Performance Issues)

**Symptoms**: Map is slow or unresponsive with 1254 markers

**Causes**: Large number of markers rendered simultaneously

**Solutions**:

1. **Implement Marker Clustering** (Recommended):
```html
<!-- Add Leaflet.markercluster plugin -->
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css">
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css">
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
```

```javascript
// Create cluster group
const markerCluster = L.markerClusterGroup();

// Add markers to cluster instead of map
geojson.features.forEach(feature => {
  const marker = L.marker([lat, lng], { icon });
  marker.bindPopup(popupContent);
  markerCluster.addLayer(marker);
});

// Add cluster to map
map.addLayer(markerCluster);
```

2. **Filter by Parking Type**:
Add checkboxes to show/hide categories (bicycle, paid/free, private, etc.)

3. **Reduce Bounding Box**:
Narrow search area to only immediate park vicinity

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

**Symptoms**: "Zum nächsten Parkplatz" button never enables

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
- Unique element IDs (`parking-map`, `btn-parking-locate`, etc.)
- IIFE scope isolation
- Unique Leaflet map instance variable

**Fix**: Verify no duplicate IDs in HTML

### Wrong Parking Type Prioritized

**Symptoms**: Navigation suggests bicycle parking when user likely needs car parking

**Cause**: Prioritization logic in `findNearestParking()`

**Fix**: Already implemented - car parking is prioritized by default (lines 302-304)

## Testing

### Local Testing

```bash
# Start local server
python3 -m http.server 8000

# Open in browser
http://localhost:8000/park-babelsberg/index.html#parkplatz-finder
```

### Test Checklist

- [ ] Map loads and displays OSM tiles
- [ ] Markers appear at correct locations
- [ ] Markers have correct colors by category
- [ ] Clicking marker opens popup with parking info (fee, capacity, type, etc.)
- [ ] "Standort nutzen" button requests geolocation permission
- [ ] After granting permission, red user marker appears
- [ ] "Zum nächsten Parkplatz" button enables
- [ ] Distance info shows "Nächster Parkplatz: X m/km"
- [ ] Clicking navigation button opens maps app/tab in driving mode
- [ ] Navigation prioritizes car parking over bicycle parking
- [ ] Navigation works on mobile (iOS/Android)
- [ ] Navigation works on desktop (new tab)
- [ ] Map is responsive on mobile (320px width)
- [ ] Performance is acceptable with 1254 markers

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

- [ ] Update data: Run `./update-parking-data.sh`
- [ ] Verify GeoJSON file is not empty: `jq '.features | length' park-babelsberg/data/parking.geojson`
- [ ] Test map in production-like environment (HTTPS)
- [ ] Verify mobile navigation on actual devices (especially driving mode)
- [ ] Check page load performance (Lighthouse, WebPageTest)
- [ ] Consider implementing marker clustering if performance issues occur
- [ ] Integrate real CMP if GDPR compliance required

### Performance Considerations

**Current Data**: 1254 locations (high count)

**Impact**:
- GeoJSON file size: ~400-500 KB
- Rendering: Leaflet can handle 1000+ markers, but may be sluggish
- Initial load time may increase

**Optimization** (if needed):
1. **Implement marker clustering** (recommended for 1000+ markers)
2. **Lazy-load map** when scrolled into view
3. **Reduce bounding box** to show fewer locations
4. **Filter by relevance**: Hide bicycle parking by default, show only car parking
5. **Server-side filtering**: Only include parking with capacity > X

### Maintenance Schedule

**Monthly**: Update location data
```bash
./update-all-locations.sh
git add park-babelsberg/data/parking.geojson
git commit -m "Update parking data from OpenStreetMap"
```

**Quarterly**: Review data quality
- Check for duplicate entries
- Verify coordinates are accurate
- Remove obsolete parking locations (manually or via OSM updates)

**Annually**: Review bounding box and filters
- Adjust area coverage if needed
- Consider adding capacity filters
- Review prioritization logic (car vs bicycle)

## Advanced Features

### Adding Capacity Filters

To show only parking with known capacity:

```javascript
// Filter during data load
geojson.features = geojson.features.filter(f => f.properties.capacity);

// Or filter by minimum capacity
geojson.features = geojson.features.filter(f => {
  const capacity = parseInt(f.properties.capacity);
  return capacity && capacity >= 20; // Minimum 20 spots
});
```

### Adding Fee Filters

Add checkboxes to toggle free/paid parking:

```html
<label>
  <input type="checkbox" id="filter-free" checked> Kostenlos
</label>
<label>
  <input type="checkbox" id="filter-paid" checked> Kostenpflichtig
</label>
```

```javascript
function updateMapFilters() {
  const showFree = document.getElementById('filter-free').checked;
  const showPaid = document.getElementById('filter-paid').checked;

  markers.forEach(parking => {
    const isFree = parking.props.fee === 'no' || parking.props.fee === 'unknown';
    const isPaid = parking.props.fee === 'yes';

    if ((isFree && showFree) || (isPaid && showPaid)) {
      map.addLayer(parking.marker);
    } else {
      map.removeLayer(parking.marker);
    }
  });
}

document.getElementById('filter-free').addEventListener('change', updateMapFilters);
document.getElementById('filter-paid').addEventListener('change', updateMapFilters);
```

### Adding Real-time Availability (Future)

To show real-time parking availability, integrate with parking APIs:
- ParkAPI (German cities): https://github.com/offenesdresden/ParkAPI
- City-specific APIs (e.g., Potsdam Verkehrsbetriebe)

## Related Documentation

- **WC-MAP-INTEGRATION.md**: WC-Finder module documentation
- **GASTRONOMIE-MAP-INTEGRATION.md**: Gastronomie-Finder module documentation
- **IMPLEMENTATION-PLAN.md**: Original implementation plan for all three finders
- **CLAUDE.md**: Project overview and maintenance guide

## Support

For issues or questions:
1. Check browser console for JavaScript errors
2. Verify GeoJSON data is valid: `jq . park-babelsberg/data/parking.geojson`
3. Test with fresh data: `./update-parking-data.sh`
4. Review this documentation
5. Check OpenStreetMap status: https://status.openstreetmap.org/
6. Consider marker clustering if performance is poor

---

**Last Updated**: 2025-10-24
**Module Version**: 1.0
**Data Source**: OpenStreetMap via Overpass API
**License**: Data © OpenStreetMap contributors, ODbL
