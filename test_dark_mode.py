#!/usr/bin/env python3
"""
Dark Mode Test Suite
Tests für die vollständige Dark Mode Implementierung
"""

import re
from pathlib import Path

class DarkModeTests:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.passed = []
        
    def test_css_variables_defined(self):
        """Test 1: Prüfe ob alle CSS Variablen für Dark Mode definiert sind"""
        print("🧪 Test 1: CSS Variablen für Dark Mode...")
        
        css_file = Path("park-babelsberg/assets/style.css")
        if not css_file.exists():
            self.errors.append("style.css nicht gefunden")
            return False
            
        content = css_file.read_text()
        
        # Prüfe ob Dark Mode Block existiert
        if '[data-theme="dark"]' not in content:
            self.errors.append("Dark Mode CSS Block fehlt")
            return False
            
        # Erforderliche Variablen
        required_vars = [
            '--bg-primary', '--bg-secondary', '--bg-tertiary',
            '--text-primary', '--text-secondary', '--text-muted',
            '--accent-primary', '--border-light', '--shadow-lg'
        ]
        
        dark_mode_section = content.split('[data-theme="dark"]')[1].split('}')[0]
        
        missing_vars = []
        for var in required_vars:
            if var not in dark_mode_section:
                missing_vars.append(var)
        
        if missing_vars:
            self.errors.append(f"Fehlende Dark Mode Variablen: {', '.join(missing_vars)}")
            return False
            
        self.passed.append("CSS Variablen für Dark Mode definiert")
        return True
    
    def test_toggle_button_exists(self):
        """Test 2: Prüfe ob Toggle Button im HTML existiert"""
        print("🧪 Test 2: Toggle Button HTML...")
        
        index_file = Path("park-babelsberg/index.html")
        if not index_file.exists():
            self.errors.append("index.html nicht gefunden")
            return False
            
        content = index_file.read_text()
        
        if 'id="theme-toggle"' not in content:
            self.errors.append("Theme Toggle Button fehlt im HTML")
            return False
            
        if 'theme-icon' not in content:
            self.errors.append("Theme Icons fehlen")
            return False
            
        self.passed.append("Toggle Button HTML vorhanden")
        return True
    
    def test_toggle_css_exists(self):
        """Test 3: Prüfe ob Toggle Button CSS existiert"""
        print("🧪 Test 3: Toggle Button CSS...")
        
        css_file = Path("park-babelsberg/assets/style.css")
        content = css_file.read_text()
        
        if '.theme-toggle' not in content:
            self.errors.append("Theme Toggle CSS fehlt")
            return False
            
        if '.theme-icon' not in content:
            self.errors.append("Theme Icon CSS fehlt")
            return False
            
        self.passed.append("Toggle Button CSS vorhanden")
        return True
    
    def test_javascript_exists(self):
        """Test 4: Prüfe ob Theme Toggle JavaScript existiert"""
        print("🧪 Test 4: Theme Toggle JavaScript...")
        
        index_file = Path("park-babelsberg/index.html")
        content = index_file.read_text()
        
        # Prüfe ob Theme Toggle Script vorhanden ist
        if 'data-theme' not in content:
            self.errors.append("Theme Toggle JavaScript fehlt")
            return False
            
        if 'localStorage' not in content or 'theme' not in content:
            self.warnings.append("LocalStorage Integration könnte fehlen")
            
        self.passed.append("Theme Toggle JavaScript vorhanden")
        return True
    
    def test_system_preference_detection(self):
        """Test 5: Prüfe System Preference Detection"""
        print("🧪 Test 5: System Preference Detection...")
        
        index_file = Path("park-babelsberg/index.html")
        content = index_file.read_text()
        
        if 'prefers-color-scheme' not in content:
            self.warnings.append("System Preference Detection könnte fehlen")
            return False
            
        self.passed.append("System Preference Detection vorhanden")
        return True
    
    def test_fouc_prevention(self):
        """Test 6: Prüfe FOUC Prevention"""
        print("🧪 Test 6: FOUC Prevention...")
        
        index_file = Path("park-babelsberg/index.html")
        content = index_file.read_text()
        
        # Script sollte vor DOMContentLoaded Theme setzen
        if 'DOMContentLoaded' in content and 'data-theme' in content:
            # Prüfe ob Theme vor DOMContentLoaded gesetzt wird
            theme_index = content.find('data-theme')
            dom_index = content.find('DOMContentLoaded')
            
            if theme_index > dom_index:
                self.warnings.append("FOUC könnte auftreten - Theme sollte vor DOMContentLoaded gesetzt werden")
                
        self.passed.append("FOUC Prevention geprüft")
        return True
    
    def test_accessibility(self):
        """Test 7: Prüfe Accessibility Features"""
        print("🧪 Test 7: Accessibility...")
        
        index_file = Path("park-babelsberg/index.html")
        content = index_file.read_text()
        
        if 'aria-label' not in content or 'theme-toggle' not in content:
            self.warnings.append("ARIA Label für Toggle Button könnte fehlen")
            
        css_file = Path("park-babelsberg/assets/style.css")
        css_content = css_file.read_text()
        
        if ':focus-visible' not in css_content:
            self.warnings.append("Focus Styles könnten fehlen")
            
        self.passed.append("Accessibility Features geprüft")
        return True
    
    def test_mobile_responsive(self):
        """Test 8: Prüfe Mobile Responsiveness"""
        print("🧪 Test 8: Mobile Responsiveness...")
        
        css_file = Path("park-babelsberg/assets/style.css")
        content = css_file.read_text()
        
        # Prüfe ob Media Query für Toggle Button existiert
        if '@media (max-width: 768px)' in content and '.theme-toggle' in content:
            self.passed.append("Mobile Responsiveness für Toggle Button vorhanden")
            return True
        else:
            self.warnings.append("Mobile Styles für Toggle Button könnten fehlen")
            return False
    
    def run_all_tests(self):
        """Führe alle Tests aus"""
        print("\n" + "="*60)
        print("🧪 DARK MODE TEST SUITE")
        print("="*60 + "\n")
        
        tests = [
            self.test_css_variables_defined,
            self.test_toggle_button_exists,
            self.test_toggle_css_exists,
            self.test_javascript_exists,
            self.test_system_preference_detection,
            self.test_fouc_prevention,
            self.test_accessibility,
            self.test_mobile_responsive
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                self.errors.append(f"{test.__name__}: {str(e)}")
        
        # Ergebnisse
        print("\n" + "="*60)
        print("📊 TEST ERGEBNISSE")
        print("="*60)
        
        print(f"\n✅ Bestanden: {len(self.passed)}")
        for p in self.passed:
            print(f"   ✓ {p}")
        
        if self.warnings:
            print(f"\n⚠️  Warnungen: {len(self.warnings)}")
            for w in self.warnings:
                print(f"   ⚠ {w}")
        
        if self.errors:
            print(f"\n❌ Fehler: {len(self.errors)}")
            for e in self.errors:
                print(f"   ✗ {e}")
            print("\n❌ TESTS FEHLGESCHLAGEN")
            return False
        else:
            print("\n✅ ALLE TESTS BESTANDEN")
            return True

if __name__ == "__main__":
    tests = DarkModeTests()
    success = tests.run_all_tests()
    exit(0 if success else 1)