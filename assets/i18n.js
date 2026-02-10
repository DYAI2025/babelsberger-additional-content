/**
 * i18n System for Park Babelsberg Website
 * Handles language switching between German (de) and English (en)
 */

(function() {
  'use strict';

  const i18n = {
    currentLang: 'de',
    translations: {},
    fallbackLang: 'de',

    /**
     * Initialize i18n system
     */
    async init() {
      // Load translations
      await this.loadTranslations();
      
      // Detect and set language
      const savedLang = localStorage.getItem('preferred-language');
      const browserLang = navigator.language.split('-')[0]; // 'en-US' -> 'en'
      const detectedLang = savedLang || (browserLang === 'en' ? 'en' : 'de');
      
      await this.setLanguage(detectedLang);
      
      // Setup language toggle button
      this.setupLanguageToggle();
      
      console.log('✅ i18n initialized:', this.currentLang);
    },

    /**
     * Load translation files
     */
    async loadTranslations() {
      try {
        const [de, en] = await Promise.all([
          fetch('assets/translations/de.json').then(r => r.json()),
          fetch('assets/translations/en.json').then(r => r.json())
        ]);
        
        this.translations = { de, en };
        console.log('✅ Translations loaded');
      } catch (error) {
        console.error('❌ Failed to load translations:', error);
      }
    },

    /**
     * Get translation by key path (e.g., 'hero.title')
     */
    t(keyPath) {
      const keys = keyPath.split('.');
      let value = this.translations[this.currentLang];
      
      for (const key of keys) {
        if (value && typeof value === 'object') {
          value = value[key];
        } else {
          // Fallback to German if key not found
          value = this.translations[this.fallbackLang];
          for (const k of keys) {
            if (value && typeof value === 'object') {
              value = value[k];
            } else {
              return keyPath; // Return key if not found
            }
          }
          break;
        }
      }
      
      return value || keyPath;
    },

    /**
     * Set language and update DOM
     */
    async setLanguage(lang) {
      if (!['de', 'en'].includes(lang)) {
        lang = this.fallbackLang;
      }
      
      this.currentLang = lang;
      localStorage.setItem('preferred-language', lang);
      
      // Update HTML lang attribute
      document.documentElement.lang = lang;
      
      // Update all elements with data-i18n attribute
      this.updateDOM();
      
      // Update meta tags
      this.updateMetaTags();
      
      // Update language toggle button
      this.updateLanguageToggle();
      
      console.log('🌍 Language set to:', lang);
    },

    /**
     * Update all DOM elements with translations
     */
    updateDOM() {
      // Update elements with data-i18n attribute
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = this.t(key);
        
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.placeholder) {
            el.placeholder = translation;
          }
        } else {
          el.textContent = translation;
        }
      });
      
      // Update elements with data-i18n-html (for HTML content)
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        el.innerHTML = this.t(key);
      });
      
      // Update aria-label attributes
      document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        el.setAttribute('aria-label', this.t(key));
      });
      
      // Update title attributes
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.setAttribute('title', this.t(key));
      });
    },

    /**
     * Update meta tags
     */
    updateMetaTags() {
      const title = this.t('meta.title');
      const description = this.t('meta.description');
      
      document.title = title;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.content = description;
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = title;
      
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.content = description;
      
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.content = title;
      
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (twitterDesc) twitterDesc.content = description;
    },

    /**
     * Setup language toggle button
     */
    setupLanguageToggle() {
      const toggle = document.getElementById('lang-toggle');
      if (!toggle) return;
      
      toggle.addEventListener('click', () => {
        const newLang = this.currentLang === 'de' ? 'en' : 'de';
        this.setLanguage(newLang);
      });
    },

    /**
     * Update language toggle button state
     */
    updateLanguageToggle() {
      const toggle = document.getElementById('lang-toggle');
      if (!toggle) return;
      
      const deText = toggle.querySelector('.lang-text-de');
      const enText = toggle.querySelector('.lang-text-en');
      
      if (this.currentLang === 'de') {
        deText.style.display = 'none';
        enText.style.display = 'block';
        toggle.setAttribute('aria-label', 'Switch to English');
        toggle.setAttribute('title', 'Switch to English');
      } else {
        deText.style.display = 'block';
        enText.style.display = 'none';
        toggle.setAttribute('aria-label', 'Auf Deutsch umschalten');
        toggle.setAttribute('title', 'Auf Deutsch umschalten');
      }
    }
  };

  // Make i18n globally available
  window.i18n = i18n;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => i18n.init());
  } else {
    i18n.init();
  }
})();