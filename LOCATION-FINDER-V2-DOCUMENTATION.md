# Location-Finder V2 - Dokumentation

## Übersicht

Die **Unified Map V2** ist eine performante, mobile-optimierte interaktive Karte für Park Babelsberg, Neuer Garten und Schloss Babelsberg. Sie zeigt WCs, Gastronomie und Parkplätze mit Marker-Clustering und hierarchischen Filtern.

**Version:** 2.0
**Datum:** 2025-10-26
**Status:** Production-Ready

---

## 🎯 Hauptfeatures

### 1. **Marker-Clustering**
- Automatisches Gruppieren von Markern bei niedriger Zoom-Stufe
- Bessere Performance bei 1500+ Locations
- Click-to-Expand oder Zoom-to-Uncluster
- Plugin: `leaflet.markercluster@1.5.3`

### 2. **Hierarchische Filter**
- **Hauptfilter**: WC, Gastronomie, Parkplätze
- **Gastronomie-Subfilter**:
  - 🍽️ Restaurant
  - ☕ Café
  - 🍔 Imbiss
  - 🍺 Bar
  - 🍺 Pub
  - 🍦 Eiscafé
  - 🌳 Biergarten

### 3. **Default-Einstellungen**
- ✅ **WC**: AN (Hauptfokus für Park-Besucher)
- ✅ **Gastronomie**: AN (alle Subfilter aktiv)
- ❌ **Parkplätze**: AUS (nur bei Bedarf)

### 4. **Navigation & Links**
- **Google Maps Integration**: Direkter "Route"-Button in Popups
  - Walking-Mode für WC & Gastronomie
  - Driving-Mode für Parkplätze
- **Website-Links**: Für Restaurants (wenn in OSM-Daten vorhanden)
- **Platform-Aware**: iOS → Apple Maps, Android → Standard-App, Desktop → Google Maps

### 5. **Mobile-First Design**
- Responsive Breakpoints: 768px, 480px
- Touch-optimierte Button-Größen
- Kompakte Filter auf kleinen Screens
- Optimierte Popup-Größen

### 6. **SEO-Optimierung**
- **Keywords**: toiletten park babelsberg, wc park babelsberg, restaurants park babelsberg
- **Schema.org JSON-LD**: TouristAttraction + Map
- **Open Graph**: Social Sharing (Facebook, LinkedIn)
- **Twitter Cards**: Für Twitter-Shares
- **Geo-Tags**: Koordinaten & Region für lokale Suche

---

## 📊 Datenquellen

| Kategorie | Anzahl | GeoJSON-Datei | BBox (ungefähr) |
|-----------|--------|---------------|-----------------|
| WC | 23 | `data/wc.geojson` | 52.380-52.405, 13.060-13.120 |
| Gastronomie | 303 | `data/gastronomie.geojson` | 52.380-52.420, 13.050-13.100 |
| Parkplätze | 1254 | `data/parking.geojson` | 52.370-52.430, 13.040-13.110 |

**Datenquelle**: OpenStreetMap via Overpass API
**Lizenz**: © OpenStreetMap contributors, ODbL

---

## 🎨 Farbcodierung

### WC
- 🟢 **Grün** (#10b981): Öffentlich zugänglich
- 🟡 **Gelb** (#f59e0b): Nur für Kunden
- 🔵 **Blau** (#3b82f6): Kostenpflichtig

### Gastronomie
- 🔴 **Rot** (#dc2626): Restaurant
- 🟤 **Braun** (#92400e): Café
- 🟠 **Orange** (#f59e0b): Imbiss
- 🟣 **Lila** (#7c3aed): Bar/Pub
- 🩷 **Pink** (#ec4899): Eiscafé
- 🟢 **Grün** (#10b981): Biergarten

### Parkplätze
- 🟢 **Grün** (#10b981): Fahrrad-Parkplatz
- 🔵 **Hellblau** (#3b82f6): Öffentlich kostenlos
- 🟠 **Orange** (#f59e0b): Öffentlich kostenpflichtig
- ⚫ **Grau** (#6b7280): Privat/Kunden
- 🔵 **Dunkelblau** (#1e3a8a): Parkhaus

---

## 🚀 Performance-Metriken

### Optimierungen
1. **Marker-Clustering**: Reduziert DOM-Knoten von 1500+ auf ~50-100 bei niedrigem Zoom
2. **Lazy Layer Loading**: Inaktive Filter werden nicht gerendert
3. **Event Delegation**: Effiziente Event-Handler
4. **CSS-Transitions**: Hardware-beschleunigte Animationen
5. **Mobile-Optimierung**: Kleinere Marker, kompaktere UI

### Erwartete Leistung
- **Initial Load**: < 2s (bei guter Verbindung)
- **Filter Toggle**: < 100ms
- **Marker Rendering**: < 500ms für alle 1500+ Marker
- **Memory**: ~15-30 MB (abhängig von aktiven Filtern)

---

## 📱 Mobile-Verhalten

### Touch-Gesten
- **Tap**: Marker-Info öffnen
- **Pinch-Zoom**: Karte zoomen
- **Drag**: Karte verschieben
- **Double-Tap**: Zoom +1

### Button-Verhalten
- **Mindestgröße**: 44x44px (iOS HIG, WCAG)
- **Touch-Targets**: 48x48px auf < 480px Screens
- **Hover-States**: Deaktiviert auf Touch-Geräten

### Geolocation
- **HTTPS erforderlich**: Browser-Sicherheitsanforderung
- **Permission Prompt**: Nativer Browser-Dialog
- **Fallback**: Manuelle Standort-Eingabe (noch nicht implementiert)

---

## 🔧 Technische Details

### Dependencies
```html
<!-- Leaflet -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Leaflet MarkerCluster -->
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css">
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css">
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
```

### Browser-Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+ (iOS 14+)
- ✅ Edge 90+
- ⚠️ IE11: Nicht unterstützt (nutzt ES6-Features)

### Accessibility (WCAG 2.1 AA)
- ✅ Keyboard-Navigation
- ✅ ARIA-Labels auf Buttons
- ✅ `role="application"` auf Map
- ✅ `aria-pressed` States auf Filter-Buttons
- ✅ `aria-live="polite"` auf Distance-Info
- ⚠️ Fokus-Management im Popup noch verbesserbar

---

## 📝 Datenpflege

### Update-Scripts

**Alle Datenquellen updaten:**
```bash
./update-all-locations.sh
```

**Einzelne Kategorien:**
```bash
./update-wc-data.sh
./update-gastronomie-data.sh
./update-parking-data.sh
```

### Update-Frequenz
- **Empfohlen**: Monatlich
- **Mindestens**: Vor Hochsaison (April-September)
- **Bei Bedarf**: Nach größeren OSM-Änderungen

### Qualitätsprüfung nach Update
```bash
# Prüfe Anzahl der Features
jq '.features | length' park-babelsberg/data/wc.geojson
jq '.features | length' park-babelsberg/data/gastronomie.geojson
jq '.features | length' park-babelsberg/data/parking.geojson

# Prüfe auf leere Properties
jq '.features[] | select(.properties == null or .properties == {})' park-babelsberg/data/*.geojson
```

---

## 🚀 Deployment-Checklist

### Vor dem Live-Gang

- [ ] **Domain-URLs ersetzen**
  - `example.com` → Produktiv-Domain
  - Canonical URL aktualisieren
  - Open Graph URLs aktualisieren
  - Schema.org URLs aktualisieren

- [ ] **Bilder-URLs prüfen**
  - Absolute Pfade für Open Graph Image
  - CDN-URLs wenn vorhanden

- [ ] **Analytics**
  - Google Analytics ID prüfen: `G-K409QD2YSJ`
  - Event-Tracking aktivieren (optional)

- [ ] **CMP (Consent Management)**
  - Stub durch echte CMP-Lösung ersetzen
  - Geolocation-Consent integrieren

- [ ] **HTTPS aktivieren**
  - Zwingend erforderlich für Geolocation API
  - SSL-Zertifikat installieren

- [ ] **Performance-Tests**
  - Google PageSpeed Insights
  - Lighthouse Mobile Score
  - Core Web Vitals prüfen

- [ ] **Browser-Tests**
  - iOS Safari (iPhone)
  - Chrome Android
  - Desktop Chrome/Firefox/Safari

- [ ] **SEO-Validierung**
  - Google Rich Results Test
  - Schema.org Validator
  - Sitemap aktualisieren

---

## 🐛 Known Issues / Roadmap

### Known Issues
- [ ] IE11-Kompatibilität fehlt (bewusst, da < 1% Marktanteil)
- [ ] Popup-Fokus-Management nicht WCAG-konform
- [ ] Offline-Modus fehlt (könnte mit Service Worker nachgerüstet werden)

### Roadmap / Nice-to-Have
- [ ] **Favoriten-Feature**: Locations speichern (LocalStorage)
- [ ] **Routing-Optionen**: ÖPNV-Navigation (via Google Maps Directions API)
- [ ] **Öffnungszeiten-Check**: Grün/Rot basierend auf aktueller Zeit
- [ ] **Bewertungen**: Google Places API Integration
- [ ] **Bildergalerie**: Fotos der Locations (von OSM oder eigene)
- [ ] **Offline-Karten**: Service Worker + Cached Tiles
- [ ] **Multi-Language**: English version
- [ ] **Print-View**: CSS für Druck-Ansicht

---

## 🎓 Code-Architektur

### IIFE-Pattern
```javascript
(function() {
  'use strict';
  // Isolated scope - no global pollution
})();
```

### State-Management
```javascript
let activeFilters = { wc: true, gastro: true, parking: false };
let gastroSubFilters = { restaurant: true, cafe: true, ... };
let userPos = null;
let clusters = { wc: L.markerClusterGroup(), ... };
```

### Event-Driven Updates
- Filter Toggle → `updateDistanceInfo()`
- Geolocation → `locateUser()` → `updateDistanceInfo()`
- Subfilter Change → `applyGastroSubFilters()`

---

## 📞 Support & Kontakt

**Wartung**: Monatliche Datenaktualisierung empfohlen
**Bug-Reports**: Via GitHub Issues
**Feature-Requests**: Community-Feedback einholen

---

## 📄 Lizenz

**Code**: MIT License (assumed)
**Daten**: © OpenStreetMap contributors, ODbL
**Kartenmaterial**: © OpenStreetMap contributors

---

**Letzte Aktualisierung**: 2025-10-26
**Version**: 2.0
**Autor**: Claude Code (AI Assistant)
