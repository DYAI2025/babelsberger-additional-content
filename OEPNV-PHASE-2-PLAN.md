# ÖPNV Phase 2: Live-Fahrplandaten Integration

## Phase 1 Status ✅ FERTIG

**Was ist implementiert:**
- ✅ 446 ÖPNV-Haltestellen auf der Map (360 Bus, 91 Tram)
- ✅ Eigener Filter-Button "🚍 ÖPNV" (default OFF)
- ✅ Marker-Clustering für Performance
- ✅ Statische Popups mit:
  - Haltestellenname
  - Bus/Tram-Typ
  - VBB-Fahrplan-Link (koordinaten-basiert)
  - Route-Button (Google Maps)
- ✅ Update-Script: `./update-oepnv-data.sh`
- ✅ API-Hooks vorbereitet (TODOs im Code)

---

## Phase 2: Live-Fahrplandaten (VBB API)

### Ziel
Anzeige von **Echtzeit-Abfahrten** beim Klick auf eine Haltestelle:

```
🚍 Haltestelle "Schloss Babelsberg"
  Bus 694 → Rathaus Babelsberg     3 Min
  Bus 690 → Hauptbahnhof          12 Min
  Tram 93 → Am Stern              18 Min
🕐 Aktualisiert: 14:32
[🔄 Aktualisieren]  [📱 VBB-App]
```

---

## Implementierungsplan

### 1. VBB-API Auswahl

#### Option A: VBB REST API (v6) ⭐ EMPFEHLUNG
**Endpoint:** `https://v6.vbb.transport.rest/`

**Vorteile:**
- ✅ Kostenlos
- ✅ Kein API-Key erforderlich
- ✅ Fair-Use-Policy (keine harten Limits)
- ✅ Gute Dokumentation
- ✅ CORS-fähig (direkt von Browser)

**Endpunkte:**
```javascript
// Haltestellen in der Nähe
GET https://v6.vbb.transport.rest/locations/nearby?latitude={lat}&longitude={lng}&results=1

// Abfahrten an einer Haltestelle
GET https://v6.vbb.transport.rest/stops/{stopId}/departures?duration=30

// Beispiel-Response:
{
  "tripId": "1|123456|0|80|26102025",
  "stop": { "type": "stop", "id": "900000195004", "name": "Schloss Babelsberg" },
  "when": "2025-10-26T14:35:00+02:00",
  "plannedWhen": "2025-10-26T14:35:00+02:00",
  "delay": 0,
  "line": {
    "type": "line",
    "id": "694",
    "name": "Bus 694",
    "mode": "bus",
    "product": "bus"
  },
  "direction": "Rathaus Babelsberg"
}
```

#### Option B: HAFAS Client (Node.js)
**Vorteil:** Mehr Features
**Nachteil:** Erfordert Backend

---

### 2. Architektur-Entscheidung

#### Variante A: Client-Side Fetch (Einfach) ⭐ EMPFEHLUNG
```javascript
// Direkt im Browser
async function fetchLiveDepartures(lat, lng) {
  try {
    // 1. Finde nächste Haltestelle
    const nearbyUrl = `https://v6.vbb.transport.rest/locations/nearby?latitude=${lat}&longitude=${lng}&results=1`;
    const nearbyRes = await fetch(nearbyUrl);
    const nearbyData = await nearbyRes.json();

    if (!nearbyData || nearbyData.length === 0) return null;

    const stopId = nearbyData[0].id;

    // 2. Hole Abfahrten
    const depsUrl = `https://v6.vbb.transport.rest/stops/${stopId}/departures?duration=30`;
    const depsRes = await fetch(depsUrl);
    const departures = await depsRes.json();

    return { stopId, departures: departures.departures.slice(0, 5) };
  } catch (error) {
    console.error('VBB API Error:', error);
    return null;
  }
}
```

**Vorteile:**
- ✅ Einfach
- ✅ Kein Backend nötig
- ✅ Schnell implementiert (2-3h)

**Nachteile:**
- ⚠️ API-Calls sichtbar (aber kein Key)
- ⚠️ Keine Rate-Limit-Kontrolle

#### Variante B: Backend-Proxy (Robust)
```
Browser → Backend (PHP/Node) → VBB API
```

**Vorteile:**
- ✅ Caching möglich
- ✅ Rate-Limit-Kontrolle
- ✅ Logging & Monitoring

**Nachteile:**
- ❌ Erfordert Backend (PHP/Node/Python)
- ❌ Mehr Aufwand (6-8h)

---

### 3. Implementierung (Client-Side)

#### Schritt 1: API-Funktion hinzufügen

```javascript
// In unified-map-v3.html nach createOEPNVPopup() einfügen

// Phase 2: VBB Live-Daten API
async function fetchLiveDepartures(lat, lng) {
  try {
    // Find nearest stop
    const nearbyUrl = `https://v6.vbb.transport.rest/locations/nearby?latitude=${lat}&longitude=${lng}&results=1&poi=false&distance=100`;
    const nearbyRes = await fetch(nearbyUrl);

    if (!nearbyRes.ok) throw new Error(`HTTP ${nearbyRes.status}`);

    const nearbyData = await nearbyRes.json();
    if (!nearbyData || nearbyData.length === 0) return null;

    const stop = nearbyData[0];

    // Get departures
    const depsUrl = `https://v6.vbb.transport.rest/stops/${stop.id}/departures?duration=60&results=10`;
    const depsRes = await fetch(depsUrl);

    if (!depsRes.ok) throw new Error(`HTTP ${depsRes.status}`);

    const depsData = await depsRes.json();

    return {
      stopId: stop.id,
      stopName: stop.name,
      departures: depsData.departures || []
    };
  } catch (error) {
    console.error('VBB API Error:', error);
    return null;
  }
}

// Format departure time (relative: "3 Min" or absolute: "14:35")
function formatDepartureTime(when) {
  const now = new Date();
  const depTime = new Date(when);
  const diffMs = depTime - now;
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 0) return 'Gerade abgefahren';
  if (diffMin === 0) return 'Jetzt';
  if (diffMin <= 20) return `${diffMin} Min`;

  return depTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

// Render departures HTML
function renderDepartures(departures) {
  if (!departures || departures.length === 0) {
    return '<p>Keine Abfahrten in den nächsten 60 Minuten.</p>';
  }

  const items = departures.slice(0, 5).map(dep => {
    const lineName = dep.line?.name || dep.line?.id || '?';
    const direction = dep.direction || 'Unbekannt';
    const when = dep.when || dep.plannedWhen;
    const delay = dep.delay || 0;
    const timeLabel = formatDepartureTime(when);

    let delayLabel = '';
    if (delay > 0) {
      delayLabel = `<span style="color:#ef4444;font-size:0.8rem;"> +${delay}'</span>`;
    }

    const lineColor = dep.line?.product === 'tram' ? '#3b82f6' : '#f59e0b';

    return `
      <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #e5e7eb;">
        <span style="background:${lineColor};color:white;padding:2px 6px;border-radius:4px;font-size:0.8rem;font-weight:700;min-width:50px;text-align:center;">
          ${lineName}
        </span>
        <span style="flex:1;font-size:0.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${direction}
        </span>
        <span style="font-weight:700;font-size:0.9rem;white-space:nowrap;">
          ${timeLabel}${delayLabel}
        </span>
      </div>
    `;
  }).join('');

  return `
    <div style="margin-top:8px;">
      <p style="font-weight:600;margin-bottom:4px;">Nächste Abfahrten:</p>
      ${items}
    </div>
  `;
}
```

#### Schritt 2: createOEPNVPopup() erweitern

```javascript
// Ersetze die createOEPNVPopup-Funktion:

async function createOEPNVPopupWithLive(props, lat, lng) {
  const name = props.name || 'Haltestelle';
  const ref = props.ref ? `#${props.ref}` : '';
  const isBus = props.bus === true || props.bus === 'yes';
  const isTram = props.tram === true || props.tram === 'yes';

  let types = [];
  if (isBus) types.push('🚌 Bus');
  if (isTram) types.push('🚊 Tram');
  const typeLabel = types.length > 0 ? types.join(' · ') : '🚍 ÖPNV';

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  const vbbUrl = `https://www.vbb.de/fahrplan/?origin=${lat},${lng}`;

  // Initial HTML (loading state)
  let popupHTML = `
    <div class="popup-header">🚍 ${name} ${ref}</div>
    <div class="popup-body">
      <p>${typeLabel}</p>
      <div id="live-departures-${lat}-${lng}" style="margin-top:8px;">
        <p style="color:#6b7280;">⏳ Lade Fahrplandaten...</p>
      </div>
    </div>
    <div class="popup-actions">
      <button id="btn-refresh-${lat}-${lng}" class="popup-btn popup-btn-primary">
        🔄 Aktualisieren
      </button>
      <a href="${vbbUrl}" target="_blank" rel="noopener" class="popup-btn popup-btn-secondary">
        📱 VBB-App
      </a>
      <a href="${mapsUrl}" target="_blank" rel="noopener" class="popup-btn popup-btn-secondary">
        📍 Route
      </a>
    </div>
  `;

  // Fetch live data asynchronously
  setTimeout(async () => {
    const liveData = await fetchLiveDepartures(lat, lng);
    const container = document.getElementById(`live-departures-${lat}-${lng}`);

    if (!container) return; // Popup already closed

    if (liveData && liveData.departures) {
      const now = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      container.innerHTML = renderDepartures(liveData.departures) +
        `<p style="color:#6b7280;font-size:0.8rem;margin-top:8px;">🕐 Aktualisiert: ${now}</p>`;
    } else {
      container.innerHTML = `<p style="color:#ef4444;">❌ Fahrplandaten nicht verfügbar.</p>`;
    }

    // Refresh button handler
    const btnRefresh = document.getElementById(`btn-refresh-${lat}-${lng}`);
    if (btnRefresh) {
      btnRefresh.addEventListener('click', async () => {
        btnRefresh.disabled = true;
        btnRefresh.textContent = '⏳ Lädt...';

        const refreshData = await fetchLiveDepartures(lat, lng);
        if (refreshData && refreshData.departures) {
          const now = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
          container.innerHTML = renderDepartures(refreshData.departures) +
            `<p style="color:#6b7280;font-size:0.8rem;margin-top:8px;">🕐 Aktualisiert: ${now}</p>`;
        }

        btnRefresh.disabled = false;
        btnRefresh.textContent = '🔄 Aktualisieren';
      });
    }
  }, 100);

  return popupHTML;
}
```

#### Schritt 3: addOEPNVMarker() anpassen

```javascript
// In addOEPNVMarker():
// Ändere:
const popup = createOEPNVPopup(props, lat, lng);
// Zu:
const popup = await createOEPNVPopupWithLive(props, lat, lng);

// Aber: async/await in forEach geht nicht!
// Lösung: Popup wird initial statisch erstellt, Live-Daten werden on-open gefetcht

// Besser: Popup-Event nutzen
marker.on('popupopen', async () => {
  const container = document.getElementById(`live-departures-${lat}-${lng}`);
  if (!container || container.dataset.loaded) return;

  container.dataset.loaded = 'true';
  const liveData = await fetchLiveDepartures(lat, lng);

  if (liveData && liveData.departures) {
    const now = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    container.innerHTML = renderDepartures(liveData.departures) +
      `<p style="color:#6b7280;font-size:0.8rem;margin-top:8px;">🕐 Aktualisiert: ${now}</p>`;
  } else {
    container.innerHTML = `<p style="color:#ef4444;">❌ Fahrplandaten nicht verfügbar.</p>`;
  }
});
```

---

### 4. Caching-Strategie (Optional)

```javascript
const departuresCache = new Map();
const CACHE_TTL = 60000; // 60 Sekunden

async function fetchLiveDeparturesWithCache(lat, lng) {
  const cacheKey = `${lat},${lng}`;
  const cached = departuresCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data; // Use cached data
  }

  const freshData = await fetchLiveDepartures(lat, lng);

  if (freshData) {
    departuresCache.set(cacheKey, {
      data: freshData,
      timestamp: Date.now()
    });
  }

  return freshData;
}
```

---

### 5. Error-Handling

```javascript
// Fallback wenn API nicht erreichbar
function handleAPIError(container) {
  container.innerHTML = `
    <div style="padding:8px;background:#fef2f2;border:1px solid #fecaca;border-radius:4px;">
      <p style="color:#dc2626;font-size:0.85rem;margin:0;">
        ⚠️ Live-Daten vorübergehend nicht verfügbar.
      </p>
      <p style="color:#6b7280;font-size:0.8rem;margin:4px 0 0;">
        Bitte nutze den VBB-Fahrplan-Link.
      </p>
    </div>
  `;
}
```

---

### 6. Testing

**Test-URLs:**
```
https://v6.vbb.transport.rest/locations/nearby?latitude=52.395&longitude=13.089&results=5

https://v6.vbb.transport.rest/stops/900000195004/departures?duration=60
```

**Test-Schritte:**
1. ✅ API-Call im Browser-DevTools prüfen
2. ✅ Response-Format validieren
3. ✅ Error-Cases testen (Timeout, 404, 500)
4. ✅ Mobile-Ansicht testen
5. ✅ Performance messen (API-Latency)

---

### 7. Performance-Überlegungen

**Optimierungen:**
- ✅ Lazy-Loading: API-Call nur beim Popup-Open
- ✅ Caching: 60s TTL pro Haltestelle
- ✅ Debouncing: Verhindere Multiple Clicks
- ✅ Prefetch: Optional bei Hover (riskant wg. Quota)

**Geschätzte Latency:**
- Nearby-API: ~200-500ms
- Departures-API: ~300-700ms
- **Total: ~500-1200ms** (akzeptabel mit Loading-State)

---

### 8. Aufwandsschätzung

| Task | Aufwand | Schwierigkeit |
|------|---------|---------------|
| API-Integration | 2h | Mittel |
| Popup-Redesign | 1h | Leicht |
| Error-Handling | 1h | Leicht |
| Caching | 0.5h | Leicht |
| Testing | 1.5h | Mittel |
| **GESAMT** | **6h** | **Mittel** |

---

### 9. Alternative: Backend-Proxy

Falls später Backend gewünscht (z.B. PHP):

**`/api/vbb-departures.php`:**
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$lat = $_GET['lat'] ?? null;
$lng = $_GET['lng'] ?? null;

if (!$lat || !$lng) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing lat/lng']);
  exit;
}

// Find nearby stop
$nearbyUrl = "https://v6.vbb.transport.rest/locations/nearby?latitude=$lat&longitude=$lng&results=1";
$nearbyData = json_decode(file_get_contents($nearbyUrl), true);

if (empty($nearbyData)) {
  echo json_encode(['error' => 'No stop found']);
  exit;
}

$stopId = $nearbyData[0]['id'];

// Get departures
$depsUrl = "https://v6.vbb.transport.rest/stops/$stopId/departures?duration=60";
$depsData = json_decode(file_get_contents($depsUrl), true);

echo json_encode([
  'stopId' => $stopId,
  'stopName' => $nearbyData[0]['name'],
  'departures' => $depsData['departures'] ?? []
]);
?>
```

**Client-Side:**
```javascript
const response = await fetch(`/api/vbb-departures.php?lat=${lat}&lng=${lng}`);
const data = await response.json();
```

---

## Zusammenfassung

**Phase 1 (✅ FERTIG):**
- Static Haltestellen-Marker
- VBB-Link zu Fahrplan
- 446 Locations

**Phase 2 (🎯 TODO):**
- Live-Abfahrten beim Popup-Open
- VBB REST API v6
- Client-Side Fetch (einfach & schnell)
- Caching (60s)
- 6h Aufwand

**Entscheidung erforderlich:**
- Client-Side (empfohlen) oder Backend-Proxy?
- Sofort implementieren oder später?

---

**Status:** Phase 1 Production-Ready ✅
**Nächster Schritt:** Testen in Browser, dann Phase 2 starten wenn gewünscht
