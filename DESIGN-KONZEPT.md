# Design-Konzept: Park Babelsberg Website

## 🎨 Design-Philosophie

**Minimalistisch · Naturnah · Elegant · Zugänglich**

Die Website verbindet die historische Eleganz des UNESCO-Welterbes mit modernem, minimalistischem Design. 
Inspiriert von der Natur des Parks: Grüntöne der Wiesen, Blautöne der Havel, warme Erdtöne der Architektur.

---

## 🎯 Kernprinzipien

### 1. Visuelle Hierarchie
- **Hero-Bereich**: Großformatiges Jagdschloss-Bild mit dramatischem Overlay
- **Primäre Inhalte**: Gastronomie-Teaser, Highlights, Praktisches
- **Sekundäre Inhalte**: Detaillierte Regeln, FAQ, Anreise

### 2. Konsistente Komponenten
- **Cards**: Einheitliche Abstände, Schatten, Hover-Effekte
- **Buttons**: Primär (Blau), Sekundär (Outline), Tertiär (Text)
- **Badges**: Runde Pills für Kategorien und Status
- **Info-Boxen**: Farbcodiert (Grün=Erlaubt, Gelb=Eingeschränkt, Rot=Verboten)

### 3. Typografie-System
- **Display**: Playfair Display (Überschriften, elegant, serif)
- **Body**: Inter (Fließtext, modern, sans-serif)
- **Hierarchie**: 6 Stufen (Hero → XL → LG → MD → SM → Base)

### 4. Farb-System
```
Primär:     #0ea5e9 (Sky Blue - Havel)
Sekundär:   #06b6d4 (Cyan - Frische)
Erfolg:     #10b981 (Grün - Natur)
Warnung:    #f59e0b (Orange - Achtung)
Fehler:     #ef4444 (Rot - Verbot)
```

### 5. Spacing-System
- **8px Grid**: Alle Abstände sind Vielfache von 8px
- **Konsistente Margins**: Sections (80px), Cards (32px), Elements (16px)

---

## 📐 Layout-Struktur

### Desktop (>768px)
```
┌─────────────────────────────────────┐
│         Hero (75vh)                 │
│    Jagdschloss + Overlay            │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│    Lead Text (Glassmorphism)        │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│    Sticky Navigation (Badges)       │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Gastronomie Teaser (2-Spalten)     │
│  [Bild] | [Text + Button]           │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Highlights (3-Spalten Grid)        │
│  [Card] [Card] [Card]               │
└─────────────────────────────────────┘
```

### Mobile (<768px)
- Single Column Layout
- Hero reduziert auf 60vh
- Cards stapeln sich vertikal
- Touch-optimierte Buttons (min 44px)

---

## 🎨 Komponenten-Bibliothek

### 1. Hero Section
```css
- Min-Height: 75vh (Desktop), 60vh (Mobile)
- Background: Cover, Center, No-Repeat
- Overlay: Linear Gradient (Dark → Transparent)
- Text: Centered, White, Text-Shadow
```

### 2. Card Component
```css
- Background: White
- Border: 1px solid #e2e8f0
- Border-Radius: 16px
- Shadow: Subtle (hover: elevated)
- Padding: 32px
- Transition: 250ms ease
```

### 3. Button Variants
```css
Primary:   bg-blue-500, text-white, hover:bg-blue-600
Secondary: border-blue-500, text-blue-500, hover:bg-blue-50
Tertiary:  text-blue-500, hover:underline
```

### 4. Info-Box (Status)
```css
Erlaubt:      bg-green-50, border-left-green-500
Eingeschränkt: bg-yellow-50, border-left-yellow-500
Verboten:     bg-red-50, border-left-red-500
Info:         bg-blue-50, border-left-blue-500
```

---

## 🔄 Interaktionen

### Hover-Effekte
- **Cards**: translateY(-4px) + Shadow-Elevation
- **Buttons**: Color-Shift + translateY(-1px)
- **Links**: Color-Change + Underline
- **Images**: Scale(1.03) innerhalb Card

### Transitions
- **Fast**: 150ms (Hover-States)
- **Base**: 250ms (Standard)
- **Slow**: 400ms (Image-Transforms)

### Scroll-Behavior
- **Smooth Scrolling**: Aktiviert
- **Sticky Nav**: Ab Scroll-Position
- **Fade-In**: Sections beim Scrollen (optional)

---

## 📱 Responsive Breakpoints

```css
Mobile:     < 480px
Tablet:     480px - 768px
Desktop:    768px - 1200px
Wide:       > 1200px
```

### Anpassungen pro Breakpoint
- **Mobile**: 1-Spalten-Grid, reduzierte Font-Sizes, Stack-Layout
- **Tablet**: 2-Spalten-Grid, optimierte Abstände
- **Desktop**: 3-Spalten-Grid, volle Typografie
- **Wide**: Max-Width Container (1200px), zentriert

---

## ♿ Accessibility

### WCAG 2.1 AA Konformität
- **Kontrast**: Min. 4.5:1 (Text), 3:1 (UI)
- **Focus-States**: Sichtbare Outlines (2px solid)
- **Alt-Texte**: Alle Bilder beschrieben
- **Semantic HTML**: Korrekte Heading-Hierarchie
- **Keyboard-Navigation**: Alle Elemente erreichbar

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## 🎯 Implementierungs-Plan

### Phase 1: Basis-Konsistenz ✓
- [x] Einheitliches Spacing-System
- [x] Konsistente Typografie
- [x] Farbpalette definiert
- [x] Card-Komponenten standardisiert

### Phase 2: Komponenten-Verfeinerung
- [ ] Einheitliche Button-Styles auf allen Seiten
- [ ] Info-Box-Komponente standardisieren
- [ ] Breadcrumb-Navigation vereinheitlichen
- [ ] Footer-Design konsistent machen

### Phase 3: Interaktions-Verbesserungen
- [ ] Hover-Effekte vereinheitlichen
- [ ] Smooth-Scroll-Anchors optimieren
- [ ] Loading-States für Bilder
- [ ] Micro-Animations hinzufügen

### Phase 4: Mobile-Optimierung
- [ ] Touch-Targets vergrößern (min 44px)
- [ ] Gastronomie-Teaser auf Mobile stapeln
- [ ] Navigation für Mobile optimieren
- [ ] Bilder für Mobile komprimieren

---

## 📊 Design-Metriken

### Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Accessibility
- **Lighthouse Score**: > 90
- **WCAG Level**: AA
- **Keyboard Navigation**: 100%

### Visual Consistency
- **Component Reuse**: > 80%
- **Color Palette**: 5 Hauptfarben
- **Font Families**: 2 (Display + Body)

---

## 🔧 Technische Umsetzung

### CSS-Architektur
```
style.css
├── Variables (Design Tokens)
├── Reset & Base Styles
├── Typography Utilities
├── Layout Components
├── UI Components
├── Responsive Breakpoints
└── Accessibility Overrides
```

### Naming Convention
- **BEM-inspiriert**: `.component__element--modifier`
- **Utility-First**: Tailwind-ähnliche Klassen
- **Semantic**: Bedeutungsvolle Namen

---

## 🎨 Nächste Schritte

1. **Unterseiten angleichen**: Parkordnung & Gastronomie an Hauptseite anpassen
2. **Komponenten extrahieren**: Wiederverwendbare Patterns dokumentieren
3. **Dark Mode**: Optional für Abendbesucher
4. **Print-Styles**: Optimierte Druckansicht
5. **Animation-Library**: Subtile Scroll-Animationen

---

**Ziel**: Eine Website, die die Eleganz des historischen Parks widerspiegelt, 
dabei modern und zugänglich bleibt, und Besuchern praktische Informationen 
in einer visuell ansprechenden Form präsentiert.