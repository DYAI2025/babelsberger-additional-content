# Dev-Server Deployment Guide

## Option 1: Vercel (Empfohlen)

### Schritt 1: Vercel Account erstellen
1. Gehe zu https://vercel.com
2. "Sign Up" mit GitHub Account
3. Erlaube Vercel Zugriff auf deine Repositories

### Schritt 2: Projekt importieren
1. Dashboard → "Add New" → "Project"
2. Repository auswählen
3. **Root Directory:** `.` (leer lassen)
4. **Framework Preset:** "Other" (statische HTML-Site)
5. "Deploy" klicken

### Schritt 3: Password-Protection aktivieren
1. Project Settings → "Deployment Protection"
2. "Password Protection" aktivieren
3. Passwort festlegen (z.B. "dev-2025")
4. Speichern

**Fertig!** Die Seite ist jetzt unter `https://dein-projekt.vercel.app` erreichbar.

### Automatische Updates
- Bei jedem Git Push wird die Seite automatisch neu deployed
- Preview-URLs für Pull Requests
- Rollback zu älteren Versionen möglich

---

## Option 2: Netlify

### Schritt 1: Netlify Account erstellen
1. Gehe zu https://netlify.com
2. "Sign Up" mit GitHub
3. Repository verbinden

### Schritt 2: Build Settings
```
Build command: (leer lassen)
Publish directory: park-babelsberg
```

### Schritt 3: Password-Protection
1. Site Settings → "Access Control"
2. "Visitor access" → "Password protect this site"
3. Passwort setzen

---

## Option 3: GitHub Pages (Private)

**Achtung:** Nur mit GitHub Pro verfügbar.

### netlify.toml Konfiguration
Falls du Netlify nutzt, erstelle diese Datei:

```toml
[build]
  publish = "park-babelsberg"

[[headers]]
  for = "/*"
  [headers.values]
    X-Robots-Tag = "noindex, nofollow"
```

---

## Testing lokal

Vor dem Deployment solltest du lokal testen:

```bash
# Python HTTP Server
python3 -m http.server 8000

# PHP Built-in Server
php -S localhost:8000

# Node.js http-server (npm install -g http-server)
http-server -p 8000
```

Dann öffne: http://localhost:8000/park-babelsberg/index.html

---

## Checklist vor Go-Live

### Für Dev-Server
- [x] vercel.json erstellt (noindex header)
- [x] Password-Protection aktiviert
- [ ] GitHub Repository ist private
- [ ] Nur Development-Team hat Zugriff
- [ ] Placeholder-Bilder durch echte Fotos ersetzen

### Für Production (später)
- [ ] Domain konfigurieren
- [ ] Sitemap.xml mit korrekter Domain
- [ ] robots.txt anpassen (noindex entfernen)
- [ ] Google Analytics Property konfigurieren
- [ ] HTTPS aktivieren (automatisch bei Vercel/Netlify)
- [ ] CMP (Consent Management) aktivieren
- [ ] Bilder optimieren (WebP)
- [ ] Performance-Test (Lighthouse)

---

## Aktueller Stand

**Deployment-Ready:**
✅ Statische HTML-Files
✅ Location-Finder mit Live-Daten
✅ Responsive Design
✅ SEO-optimiert (Schema.org)

**TODO vor Public-Launch:**
- [ ] Placeholder-Bilder ersetzen:
  - `cafe-placeholder.webp`
  - `parking-placeholder.webp`
  - `bus-placeholder.webp`
- [ ] Domain kaufen
- [ ] CMP implementieren (statt stub.js)

---

## Nützliche Links

- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **GitHub Pages:** https://pages.github.com

---

**Empfehlung:** Start mit **Vercel** → am einfachsten, kostenloses Password-Protection, automatische HTTPS.
