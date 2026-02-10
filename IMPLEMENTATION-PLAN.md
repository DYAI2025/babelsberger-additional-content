# Implementation Plan: Location Finder Features

**Project:** Park Babelsberg Visitor Information Site
**Date:** 2025-10-25
**Author:** Claude Code

---

## 🎯 Objective

Integrate three location-based finder modules into the Park Babelsberg website:
1. **WC-Finder** (already built, needs integration)
2. **Gastronomie-Finder** (new feature)
3. **Parkplatz-Finder** (new feature)

All modules will use the same architecture: Leaflet maps, OpenStreetMap data, platform-aware navigation, and privacy-first consent handling.

---

## 📋 Architecture Overview

### Design Pattern: Modular Location Finders

Each finder module follows the same pattern:
- **Static GeoJSON data** (fetched via Overpass API, committed to repo)
- **Leaflet map** with OSM tiles
- **User geolocation** (with CMP consent)
- **Platform-aware navigation** (iOS → Apple Maps, Android → Maps App, Desktop → new tab)
- **Category-based markers** with color coding
- **Distance calculation** to nearest location

### File Structure

```
park-babelsberg/
├── index.html                    # Main page (integrate all finders here)
├── data/
│   ├── wc.geojson               # WC locations (✅ exists)
│   ├── gastronomie.geojson      # Food & drink locations (new)
│   └── parking.geojson          # Parking locations (new)
├── modules/
│   ├── wc-map.html              # WC finder module (✅ exists)
│   ├── gastronomie-map.html     # Gastro finder module (new)
│   ├── parking-map.html         # Parking finder module (new)
│   └── shared/
│       └── map-common.js        # Shared utilities (optional optimization)
└── assets/
    └── style.css                # Existing styles (compatible)

scripts/
├── update-wc-data.sh            # Update WC data (✅ exists)
├── update-gastronomie-data.sh   # Update gastro data (new)
├── update-parking-data.sh       # Update parking data (new)
└── update-all-locations.sh      # Update all data (new)
```

---

## 📝 Task Breakdown

### Phase 1: WC-Map Integration (READY)

#### Task 1.1: Integrate WC-Map into index.html
- **File:** `park-babelsberg/index.html`
- **Action:** Insert `modules/wc-map.html` content after section `#praktisches`
- **Line:** ~90 (after closing `</section>` of Praktisches)
- **Verification:** Map loads, shows 23 WC markers, geolocation works

#### Task 1.2: Add navigation link to WC-Finder
- **File:** `park-babelsberg/index.html`
- **Action:** Add `<a class="badge" href="#wc-finder">WC-Finder</a>` to navigation badges
- **Line:** ~30 (inside `.badges` div)
- **Verification:** Click navigates to map section

#### Task 1.3: Test WC-Map on all devices
- **Actions:**
  - Desktop: Chrome, Firefox, Safari
  - Mobile: iOS Safari, Android Chrome
  - Test geolocation permission flow
  - Test navigation deep-links (Maps app opens)
- **Verification:** All platforms work as expected

---

### Phase 2: Gastronomie-Finder (NEW)

#### Task 2.1: Fetch Gastronomie data from OpenStreetMap
- **Tool:** Overpass API
- **Query:** Restaurants, cafés, fast food, bars, pubs within Park Babelsberg area
- **Bounding Box:** `52.380,13.060,52.405,13.120` (same as WC)
- **Tags to query:**
  - `amenity=restaurant`
  - `amenity=cafe`
  - `amenity=fast_food`
  - `amenity=bar`
  - `amenity=pub`
  - `amenity=ice_cream`
  - `amenity=biergarten`
- **Output:** `park-babelsberg/data/gastronomie.geojson`
- **Properties to extract:**
  - `name`
  - `cuisine` (Italian, German, Asian, etc.)
  - `opening_hours`
  - `website`
  - `phone`
  - `outdoor_seating` (yes/no)
  - `wheelchair` (yes/no/limited)
  - `takeaway` (yes/no)

#### Task 2.2: Create update script for Gastronomie data
- **File:** `scripts/update-gastronomie-data.sh`
- **Template:** Copy from `update-wc-data.sh`
- **Modifications:**
  - Multi-tag query for all food/drink amenities
  - Add cuisine/opening_hours to properties
  - Breakdown statistics by amenity type
- **Verification:** `./scripts/update-gastronomie-data.sh` creates valid GeoJSON

#### Task 2.3: Create Gastronomie-Map HTML module
- **File:** `park-babelsberg/modules/gastronomie-map.html`
- **Template:** Copy from `modules/wc-map.html`
- **Modifications:**
  - Change section ID: `#gastronomie-finder`
  - Change heading: "Gastronomie in der Nähe"
  - Update data path: `data/gastronomie.geojson`
  - Update button text: "Nächstes Restaurant"
  - **Marker categories:**
    - 🍽️ **Restaurant** → Red marker
    - ☕ **Café** → Brown marker
    - 🍔 **Fast Food** → Orange marker
    - 🍺 **Bar/Pub** → Purple marker
    - 🍦 **Ice Cream** → Pink marker
    - 🌳 **Biergarten** → Green marker
  - **Popup content:**
    - Name
    - Cuisine type
    - Opening hours (if available)
    - Outdoor seating icon (if yes)
    - Navigation button
  - **Legend:** Show all category icons with labels

#### Task 2.4: Integrate Gastronomie-Map into index.html
- **File:** `park-babelsberg/index.html`
- **Position:** After section `#wc-finder`
- **Action:** Insert `modules/gastronomie-map.html` content
- **Navigation:** Add `<a class="badge" href="#gastronomie-finder">Gastronomie</a>`

#### Task 2.5: Test Gastronomie-Finder
- **Checklist:**
  - [ ] Map loads with all gastro markers
  - [ ] Different marker colors for categories
  - [ ] Popup shows name, cuisine, hours
  - [ ] "Nächstes Restaurant" finds closest by category
  - [ ] Navigation opens Maps app/tab
  - [ ] Mobile responsive

---

### Phase 3: Parkplatz-Finder (NEW)

#### Task 3.1: Fetch Parking data from OpenStreetMap
- **Tool:** Overpass API
- **Query:** All parking facilities near Park Babelsberg
- **Bounding Box:** `52.370,13.050,52.410,13.130` (wider area for parking)
- **Tags to query:**
  - `amenity=parking`
  - `amenity=parking_space`
  - `amenity=bicycle_parking`
  - `parking=*` (all parking types)
- **Output:** `park-babelsberg/data/parking.geojson`
- **Properties to extract:**
  - `name`
  - `parking` (surface, underground, multi-storey, street_side)
  - `fee` (yes/no)
  - `capacity` (number of spots)
  - `access` (public/customers/private)
  - `wheelchair` (yes/no)
  - `covered` (yes/no)
  - `supervised` (yes/no)
  - `maxstay` (time limit)

#### Task 3.2: Create update script for Parking data
- **File:** `scripts/update-parking-data.sh`
- **Template:** Copy from `update-wc-data.sh`
- **Modifications:**
  - Multi-tag query for parking types
  - Extract capacity, fee, parking type
  - Statistics: Total capacity, free vs paid, covered vs outdoor
- **Verification:** `./scripts/update-parking-data.sh` creates valid GeoJSON

#### Task 3.3: Create Parking-Map HTML module
- **File:** `park-babelsberg/modules/parking-map.html`
- **Template:** Copy from `modules/wc-map.html`
- **Modifications:**
  - Section ID: `#parkplatz-finder`
  - Heading: "Parkplätze in der Nähe"
  - Data path: `data/parking.geojson`
  - Button text: "Nächster Parkplatz"
  - **Marker categories:**
    - 🅿️ **Public Parking** → Blue marker
    - 💰 **Paid Parking** → Orange marker
    - 🔒 **Private/Customers** → Gray marker
    - 🏢 **Multi-storey** → Dark blue marker
    - 🚲 **Bicycle Parking** → Green marker
  - **Popup content:**
    - Name/Location
    - Parking type (surface/underground/multi-storey)
    - Fee status (free/paid + price if known)
    - Capacity (if available)
    - Access type (public/customers)
    - Navigation button
  - **Legend:** Show parking type icons
  - **Filter buttons (optional):**
    - "Nur kostenlose Parkplätze"
    - "Nur Auto-Parkplätze" (exclude bicycle)

#### Task 3.4: Integrate Parking-Map into index.html
- **File:** `park-babelsberg/index.html`
- **Position:** After section `#gastronomie-finder`
- **Action:** Insert `modules/parking-map.html` content
- **Navigation:** Add `<a class="badge" href="#parkplatz-finder">Parkplätze</a>`

#### Task 3.5: Test Parkplatz-Finder
- **Checklist:**
  - [ ] Map shows all parking locations
  - [ ] Markers color-coded by type/fee
  - [ ] Popup shows capacity, fee, type
  - [ ] "Nächster Parkplatz" finds closest
  - [ ] Filter works (if implemented)
  - [ ] Navigation opens Maps app/tab

---

### Phase 4: Optimization & Polish (OPTIONAL)

#### Task 4.1: Create shared map utilities
- **File:** `park-babelsberg/modules/shared/map-common.js`
- **Purpose:** Extract common functions (haversine, platform detection, etc.)
- **Benefits:** Reduce code duplication, easier maintenance
- **Modules to refactor:** All three map modules use shared utilities
- **Trade-off:** Adds dependency, slightly more complex

#### Task 4.2: Create unified update script
- **File:** `scripts/update-all-locations.sh`
- **Action:** Runs all three update scripts in sequence
- **Output:** Summary of all locations updated
- **Example:**
  ```bash
  ./scripts/update-all-locations.sh
  # Updates: WCs (23), Gastro (45), Parking (18)
  ```

#### Task 4.3: Add "Toggle all layers" feature
- **Location:** Each map module
- **Feature:** Checkbox to show/hide all markers of a category
- **Example:** "WCs anzeigen", "Restaurants anzeigen", "Parkplätze anzeigen"
- **Use case:** User can customize which POIs to see on each map

#### Task 4.4: Lazy-load maps on scroll (performance)
- **Goal:** Improve initial page load (LCP)
- **Implementation:** Use Intersection Observer to load Leaflet only when map enters viewport
- **Benefits:** Better Core Web Vitals, faster initial render
- **Trade-off:** Slight delay when scrolling to map

#### Task 4.5: Add "Directions from parking to park entrance"
- **Feature:** Multi-leg navigation (Parking → Park entrance → POI)
- **Example:** User selects parking, then navigates to nearest park entrance
- **Implementation:** Waypoints in Google Maps URL
- **Complexity:** Medium

---

## 🧪 Testing Plan

### Unit Tests (Manual)

For each finder module:

1. **Data Loading**
   - [ ] GeoJSON loads without errors
   - [ ] All expected features present
   - [ ] Properties correctly extracted

2. **Map Rendering**
   - [ ] Leaflet initializes
   - [ ] OSM tiles load
   - [ ] All markers visible
   - [ ] Correct marker colors/icons

3. **Geolocation**
   - [ ] Browser permission request appears
   - [ ] User location marker appears after grant
   - [ ] Map centers on user location
   - [ ] Distance calculation correct

4. **Navigation**
   - [ ] iOS: Opens Apple Maps app
   - [ ] Android: Opens Google Maps app
   - [ ] Desktop: Opens new tab with Google Maps
   - [ ] Walking directions set by default

5. **Responsive Design**
   - [ ] Desktop: 400px map height
   - [ ] Mobile: 320px map height
   - [ ] Buttons stack vertically on mobile
   - [ ] Legend readable on small screens

### Integration Tests

1. **Multi-map performance**
   - [ ] All three maps load without conflicts
   - [ ] Leaflet instances don't interfere
   - [ ] Page load time < 3s (Mobile 4G)
   - [ ] No JavaScript errors in console

2. **Navigation flow**
   - [ ] User can navigate to each finder via sticky nav
   - [ ] Smooth scroll to section
   - [ ] Sticky nav updates active state

3. **CMP Integration**
   - [ ] Geolocation respects consent
   - [ ] Maps load without consent
   - [ ] Error messages clear when denied

### Performance Benchmarks

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | TBD |
| FID | < 100ms | TBD |
| CLS | < 0.1 | TBD |
| Total JS | < 200KB | TBD |
| Map Init | < 1s | TBD |

---

## 📊 Data Expectations

### Estimated Locations (Park Babelsberg area)

| Category | Estimated Count | Source |
|----------|----------------|---------|
| WCs | 20-30 | ✅ 23 confirmed |
| Gastronomie | 40-60 | OSM (restaurants, cafés, etc.) |
| Parking | 15-25 | OSM (parking lots, street parking) |

### GeoJSON Size Estimates

| File | Features | Size (KB) |
|------|----------|-----------|
| `wc.geojson` | 23 | ~3 KB |
| `gastronomie.geojson` | ~50 | ~8 KB |
| `parking.geojson` | ~20 | ~4 KB |
| **Total** | ~93 | ~15 KB |

**Impact:** Negligible on page load (15KB gzipped < 5KB)

---

## 🔄 Maintenance Plan

### Quarterly Updates

**When:** Every 3 months
**Actions:**
1. Run `./scripts/update-all-locations.sh`
2. Review new/changed locations
3. Test maps on staging
4. Commit updated GeoJSON files
5. Deploy to production

### Ad-hoc Updates

**Triggers:**
- User reports incorrect location
- New major venue opens (restaurant, parking lot)
- Park renovations change facilities

**Process:**
1. Manually edit GeoJSON or re-run script
2. Test locally
3. Commit + deploy

---

## 🚀 Deployment Checklist

### Pre-deployment

- [ ] All three modules integrated into `index.html`
- [ ] Navigation links added
- [ ] All GeoJSON files committed to repo
- [ ] Update scripts tested and documented
- [ ] Mobile testing complete (iOS + Android)
- [ ] Desktop testing complete (Chrome, Firefox, Safari)
- [ ] Lighthouse score > 90 (Mobile)
- [ ] No console errors
- [ ] CMP integration confirmed (or stub documented)

### Deployment

- [ ] Upload all files to web server
- [ ] Verify HTTPS (required for geolocation)
- [ ] Test on production domain
- [ ] Verify all CDN resources load (Leaflet)
- [ ] Check Content Security Policy allows:
  - `unpkg.com` (Leaflet)
  - `tile.openstreetmap.org` (Map tiles)

### Post-deployment

- [ ] Monitor Analytics for usage (GA4 events optional)
- [ ] Check for error reports
- [ ] User feedback collection
- [ ] Performance monitoring (Core Web Vitals)

---

## 📝 Documentation Requirements

### User-facing

- [ ] **FAQ Section:** "Wie finde ich Parkplätze?" in `index.html`
- [ ] **Legend explanations** in each map module
- [ ] **Privacy notice** about geolocation consent

### Developer-facing

- [ ] **WC-MAP-INTEGRATION.md** (✅ already exists)
- [ ] **GASTRONOMIE-MAP-INTEGRATION.md** (create)
- [ ] **PARKING-MAP-INTEGRATION.md** (create)
- [ ] **Update CLAUDE.md** with new features

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| OSM data incomplete | Medium | Medium | Hybrid approach: Add manual curated locations |
| Overpass API rate limits | Low | Low | Static GeoJSON (already implemented) |
| Geolocation permission denied | Medium | High | Clear messaging, fallback to manual search |
| Map conflicts (multiple Leaflet instances) | High | Low | Use unique IDs, test thoroughly |
| Performance degradation (3 maps) | Medium | Medium | Lazy-load maps on scroll (Phase 4) |
| CMP integration breaks geolocation | High | Medium | Thorough testing, fallback to browser permission |

---

## 🎨 Design Consistency

### Marker Icons

All modules use **consistent icon style:**
- **Shape:** Circle with border
- **Size:** 24x24px
- **Border:** 3px white border
- **Shadow:** `0 2px 8px rgba(0,0,0,0.3)`

### Color Palette

Reuse existing CSS variables:
- `--accent-primary` (#0ea5e9) → Buttons, links
- `--nature-green` (#10b981) → Public/accessible
- `--text-muted` (#64748b) → Secondary info

New colors for categories:
- **Red** (#ef4444) → Restaurants, user location
- **Brown** (#92400e) → Cafés
- **Orange** (#f59e0b) → Fast food, paid parking
- **Purple** (#8b5cf6) → Bars/pubs
- **Pink** (#ec4899) → Ice cream
- **Gray** (#6b7280) → Private/customers only

### Typography

- **Headings:** Playfair Display (existing)
- **Body:** Inter (existing)
- **Buttons:** Inter, 500 weight

---

## 📦 Deliverables

### Code

1. ✅ `park-babelsberg/modules/wc-map.html`
2. ✅ `park-babelsberg/data/wc.geojson`
3. ✅ `scripts/update-wc-data.sh`
4. 🆕 `park-babelsberg/modules/gastronomie-map.html`
5. 🆕 `park-babelsberg/data/gastronomie.geojson`
6. 🆕 `scripts/update-gastronomie-data.sh`
7. 🆕 `park-babelsberg/modules/parking-map.html`
8. 🆕 `park-babelsberg/data/parking.geojson`
9. 🆕 `scripts/update-parking-data.sh`
10. 🔄 `park-babelsberg/index.html` (integrated)

### Documentation

1. ✅ `WC-MAP-INTEGRATION.md`
2. 🆕 `GASTRONOMIE-MAP-INTEGRATION.md`
3. 🆕 `PARKING-MAP-INTEGRATION.md`
4. 🔄 `CLAUDE.md` (updated with new features)
5. 🆕 `IMPLEMENTATION-PLAN.md` (this file)

### Scripts

1. ✅ `update-wc-data.sh`
2. 🆕 `update-gastronomie-data.sh`
3. 🆕 `update-parking-data.sh`
4. 🆕 `update-all-locations.sh` (optional)

---

## ⏱️ Time Estimates

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: WC Integration | 3 tasks | 30 min |
| Phase 2: Gastronomie | 5 tasks | 2-3 hours |
| Phase 3: Parking | 5 tasks | 2-3 hours |
| Phase 4: Optimization | 5 tasks | 2-4 hours (optional) |
| Testing | All modules | 1-2 hours |
| Documentation | All docs | 1 hour |
| **Total** | | **6-10 hours** |

---

## ✅ Success Criteria

The implementation is successful when:

1. ✅ All three finder modules integrated into `index.html`
2. ✅ All maps load without errors on all platforms
3. ✅ Geolocation works with proper consent flow
4. ✅ Platform-aware navigation opens correct apps
5. ✅ Mobile responsive (tested on iOS + Android)
6. ✅ Lighthouse Performance score > 90 (Mobile)
7. ✅ User can find nearest WC, restaurant, and parking
8. ✅ All data update scripts functional
9. ✅ Documentation complete and accurate
10. ✅ Zero JavaScript errors in production

---

## 🔮 Future Enhancements (v2+)

### Advanced Features (Post-MVP)

1. **Multi-category map view**
   - Single map showing WCs + Gastro + Parking
   - Toggle layers on/off
   - Color-coded by category

2. **Route planning**
   - Plan route with multiple stops
   - "Park here → Walk to entrance → Find WC"

3. **User contributions**
   - Report missing locations
   - Rate/review facilities
   - Upload photos (requires backend)

4. **Offline mode**
   - Service Worker for offline maps
   - Cached GeoJSON data
   - PWA installation

5. **Accessibility enhancements**
   - Wheelchair-accessible route highlighting
   - Audio directions
   - High-contrast map mode

6. **Real-time data**
   - Parking availability (requires API)
   - Restaurant wait times (Google Places)
   - WC cleanliness ratings

---

## 📞 Support & Questions

For implementation questions, refer to:
- **CLAUDE.md** (project overview)
- **WC-MAP-INTEGRATION.md** (detailed WC module docs)
- **This file** (IMPLEMENTATION-PLAN.md)

For technical issues:
- Check browser console (F12)
- Verify Leaflet CDN loads
- Test HTTPS requirement (geolocation needs HTTPS)

---

**Plan Status:** ✅ Ready for execution
**Next Action:** Begin Phase 1, Task 1.1 (Integrate WC-Map)
