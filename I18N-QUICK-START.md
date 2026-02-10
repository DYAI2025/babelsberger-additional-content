# 🌍 i18n Quick Start Guide

## 🚀 Sofort loslegen

### **Sprache wechseln:**
1. Öffne http://localhost:8000/park-babelsberg/index.html
2. Klicke auf den 🇩🇪/🇬🇧 Button unten rechts
3. Die Seite wechselt sofort zwischen Deutsch und Englisch

### **Features:**
- ✅ Automatische Browser-Spracherkennung
- ✅ Speichert deine Auswahl (LocalStorage)
- ✅ 150+ übersetzte Elemente
- ✅ Mobile-friendly
- ✅ Dark Mode kompatibel

---

## 📝 Neue Übersetzung hinzufügen

### **1. Übersetzungen hinzufügen:**

**de.json:**
```json
{
  "new": {
    "section": {
      "title": "Neuer Titel",
      "description": "Neue Beschreibung"
    }
  }
}
```

**en.json:**
```json
{
  "new": {
    "section": {
      "title": "New Title",
      "description": "New Description"
    }
  }
}
```

### **2. HTML aktualisieren:**

```html
<h2 data-i18n="new.section.title">Neuer Titel</h2>
<p data-i18n="new.section.description">Neue Beschreibung</p>
```

### **3. Fertig!** 🎉

---

## 🔧 Entwickler-Tipps

### **Programmatisch Sprache wechseln:**
```javascript
window.i18n.setLanguage('en'); // Zu Englisch
window.i18n.setLanguage('de'); // Zu Deutsch
```

### **Übersetzung abrufen:**
```javascript
const title = window.i18n.t('hero.title');
console.log(title); // "Parks und Schlösser..." oder "Parks and Palaces..."
```

### **Aktuelle Sprache prüfen:**
```javascript
console.log(window.i18n.currentLang); // 'de' oder 'en'
```

---

## 📊 Was wurde übersetzt?

- ✅ Hero Section (Titel, Untertitel)
- ✅ Navigation (5 Links)
- ✅ Areale (4 Karten)
- ✅ Location Finder (Filter, Buttons)
- ✅ Kategorien (6 Karten)
- ✅ Highlights (4 Locations)
- ✅ Anreise (Auto, ÖPNV)
- ✅ FAQ (8 Fragen)
- ✅ Footer

**Gesamt:** 280 Übersetzungs-Keys, 150+ Elemente

---

## 🐛 Probleme?

### **Übersetzung wird nicht angezeigt:**
1. Browser-Cache leeren (Strg+Shift+R)
2. LocalStorage löschen: `localStorage.clear()`
3. Seite neu laden

### **Neue Keys funktionieren nicht:**
1. JSON-Syntax prüfen (keine Kommas am Ende!)
2. Key-Pfad korrekt? (`hero.title` nicht `hero/title`)
3. Browser-Console auf Fehler prüfen

---

## 📚 Mehr Infos

Siehe `I18N-IMPLEMENTATION.md` für vollständige Dokumentation.

---

**Status:** ✅ PRODUCTION READY  
**Preview:** http://localhost:8000/park-babelsberg/index.html