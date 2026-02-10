/**
 * DSGVO-konformer Cookie-Consent-Banner
 * Version: 1.0
 * Speichert Einwilligung in localStorage
 */

(function() {
  'use strict';

  const CONSENT_KEY = 'cookie_consent';
  const CONSENT_VERSION = '1.0';

  // Cookie-Banner HTML
  const bannerHTML = `
    <div id="cookie-banner" style="
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.95));
      backdrop-filter: blur(10px);
      color: white;
      padding: 24px;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideUp 0.3s ease-out;
    ">
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: start;">

          <!-- Text -->
          <div>
            <h3 style="margin: 0 0 12px 0; font-size: 1.25rem; font-weight: 700; color: white;">
              🍪 Cookie-Einstellungen
            </h3>
            <p style="margin: 0 0 16px 0; font-size: 0.95rem; line-height: 1.6; color: rgba(255,255,255,0.9);">
              Wir verwenden Cookies und Analyse-Tools, um die Nutzung unserer Website zu verbessern und relevante Werbung anzuzeigen.
              Mit Ihrer Einwilligung aktivieren wir <strong>Google Analytics</strong> (Statistiken) und <strong>Google AdSense</strong> (Werbung).
              Sie können Ihre Einwilligung jederzeit widerrufen.
            </p>
            <p style="margin: 0; font-size: 0.85rem; color: rgba(255,255,255,0.7);">
              <a href="datenschutz.html" style="color: #60a5fa; text-decoration: underline;">Datenschutzerklärung</a> ·
              <a href="impressum.html" style="color: #60a5fa; text-decoration: underline;">Impressum</a>
            </p>
          </div>

          <!-- Buttons -->
          <div style="display: flex; flex-direction: column; gap: 12px; min-width: 200px;">
            <button id="cookie-accept-all" style="
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s, box-shadow 0.2s;
              box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.4)';" onmouseout="this.style.transform=''; this.style.boxShadow='0 2px 8px rgba(16, 185, 129, 0.3)';">
              ✓ Alle akzeptieren
            </button>

            <button id="cookie-accept-essential" style="
              background: transparent;
              color: white;
              border: 2px solid rgba(255,255,255,0.3);
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            " onmouseover="this.style.borderColor='rgba(255,255,255,0.6)'; this.style.background='rgba(255,255,255,0.1)';" onmouseout="this.style.borderColor='rgba(255,255,255,0.3)'; this.style.background='transparent';">
              Nur notwendige
            </button>

            <button id="cookie-settings" style="
              background: transparent;
              color: rgba(255,255,255,0.7);
              border: none;
              padding: 8px 12px;
              font-size: 0.9rem;
              cursor: pointer;
              text-decoration: underline;
              transition: color 0.2s;
            " onmouseover="this.style.color='white';" onmouseout="this.style.color='rgba(255,255,255,0.7)';">
              Einstellungen
            </button>
          </div>
        </div>
      </div>

      <style>
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @media (max-width: 768px) {
          #cookie-banner > div > div {
            grid-template-columns: 1fr !important;
          }
          #cookie-banner button {
            width: 100%;
          }
        }
      </style>
    </div>
  `;

  // Detaillierte Einstellungen Modal
  const settingsHTML = `
    <div id="cookie-settings-modal" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease-out;
    ">
      <div style="
        background: white;
        border-radius: 16px;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        padding: 32px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      ">
        <h2 style="margin: 0 0 24px 0; font-size: 1.5rem; color: #0f172a;">Cookie-Einstellungen</h2>

        <!-- Notwendige Cookies -->
        <div style="margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 1.1rem; color: #0f172a;">Notwendige Cookies</strong>
            <span style="padding: 4px 12px; background: #10b981; color: white; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">Immer aktiv</span>
          </div>
          <p style="margin: 0; font-size: 0.9rem; color: #64748b; line-height: 1.6;">
            Diese Website verwendet keine technisch notwendigen Cookies. Alle Funktionen arbeiten ohne Cookies.
          </p>
        </div>

        <!-- Analytics -->
        <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 1.1rem; color: #0f172a;">Google Analytics</strong>
            <label style="position: relative; display: inline-block; width: 52px; height: 28px;">
              <input type="checkbox" id="consent-analytics" style="opacity: 0; width: 0; height: 0;">
              <span style="
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #cbd5e1;
                transition: 0.3s;
                border-radius: 28px;
              "></span>
              <span style="
                position: absolute;
                content: '';
                height: 20px;
                width: 20px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: 0.3s;
                border-radius: 50%;
              "></span>
            </label>
          </div>
          <p style="margin: 0; font-size: 0.9rem; color: #64748b; line-height: 1.6;">
            Hilft uns zu verstehen, wie Besucher die Website nutzen. Erfasst anonymisierte Statistiken über Seitenaufrufe, Verweildauer und Navigation.
          </p>
        </div>

        <!-- AdSense -->
        <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 1.1rem; color: #0f172a;">Google AdSense</strong>
            <label style="position: relative; display: inline-block; width: 52px; height: 28px;">
              <input type="checkbox" id="consent-adsense" style="opacity: 0; width: 0; height: 0;">
              <span style="
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #cbd5e1;
                transition: 0.3s;
                border-radius: 28px;
              "></span>
              <span style="
                position: absolute;
                content: '';
                height: 20px;
                width: 20px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: 0.3s;
                border-radius: 50%;
              "></span>
            </label>
          </div>
          <p style="margin: 0; font-size: 0.9rem; color: #64748b; line-height: 1.6;">
            Zeigt personalisierte Werbung basierend auf Ihren Interessen. Hilft uns, die Website kostenfrei anzubieten.
          </p>
        </div>

        <!-- Buttons -->
        <div style="display: flex; gap: 12px; margin-top: 32px;">
          <button id="settings-save" style="
            flex: 1;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
          ">Speichern</button>
          <button id="settings-cancel" style="
            flex: 1;
            background: #f1f5f9;
            color: #0f172a;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
          ">Abbrechen</button>
        </div>
      </div>

      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        /* Toggle Switch Styling */
        #consent-analytics:checked + span { background-color: #10b981; }
        #consent-adsense:checked + span { background-color: #10b981; }
        #consent-analytics:checked + span + span { transform: translateX(24px); }
        #consent-adsense:checked + span + span { transform: translateX(24px); }
      </style>
    </div>
  `;

  // Consent-Objekt aus localStorage laden
  function getConsent() {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  // Consent speichern
  function saveConsent(analytics, adsense) {
    const consent = {
      version: CONSENT_VERSION,
      analytics: analytics,
      adsense: adsense,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    return consent;
  }

  // Banner anzeigen
  function showBanner() {
    const existing = document.getElementById('cookie-banner');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', bannerHTML);

    // Event Listeners
    document.getElementById('cookie-accept-all').addEventListener('click', function() {
      saveConsent(true, true);
      hideBanner();
      loadScripts();
    });

    document.getElementById('cookie-accept-essential').addEventListener('click', function() {
      saveConsent(false, false);
      hideBanner();
    });

    document.getElementById('cookie-settings').addEventListener('click', function() {
      showSettings();
    });
  }

  // Banner ausblenden
  function hideBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.style.animation = 'slideDown 0.3s ease-out';
      setTimeout(() => banner.remove(), 300);
    }
  }

  // Einstellungen-Modal anzeigen
  function showSettings() {
    const existing = document.getElementById('cookie-settings-modal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', settingsHTML);

    // Aktuelle Einstellungen laden
    const consent = getConsent();
    if (consent) {
      document.getElementById('consent-analytics').checked = consent.analytics;
      document.getElementById('consent-adsense').checked = consent.adsense;
    }

    // Event Listeners
    document.getElementById('settings-save').addEventListener('click', function() {
      const analytics = document.getElementById('consent-analytics').checked;
      const adsense = document.getElementById('consent-adsense').checked;
      saveConsent(analytics, adsense);
      hideSettings();
      hideBanner();
      loadScripts();
      // Reload page to apply changes
      window.location.reload();
    });

    document.getElementById('settings-cancel').addEventListener('click', hideSettings);

    // Close on background click
    document.getElementById('cookie-settings-modal').addEventListener('click', function(e) {
      if (e.target.id === 'cookie-settings-modal') {
        hideSettings();
      }
    });
  }

  // Einstellungen-Modal ausblenden
  function hideSettings() {
    const modal = document.getElementById('cookie-settings-modal');
    if (modal) {
      modal.style.animation = 'fadeOut 0.2s ease-out';
      setTimeout(() => modal.remove(), 200);
    }
  }

  // Google Analytics laden
  function loadGoogleAnalytics() {
    if (window.gtag) return; // Already loaded

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-K409QD2YSJ';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-K409QD2YSJ', { 'anonymize_ip': true });
    `;
    document.head.appendChild(script2);

    console.log('[Cookie Consent] Google Analytics loaded');
  }

  // Google AdSense laden
  function loadGoogleAdSense() {
    if (document.querySelector('script[src*="adsbygoogle.js"]')) return; // Already loaded

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1712273263687132';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    console.log('[Cookie Consent] Google AdSense loaded');
  }

  // Scripts basierend auf Consent laden
  function loadScripts() {
    const consent = getConsent();
    if (!consent) return;

    if (consent.analytics) {
      loadGoogleAnalytics();
    }

    if (consent.adsense) {
      loadGoogleAdSense();
    }
  }

  // Initialisierung
  function init() {
    const consent = getConsent();

    if (!consent) {
      // Kein Consent vorhanden -> Banner anzeigen
      showBanner();
    } else {
      // Consent vorhanden -> Scripts laden
      loadScripts();
    }

    // Global function to show banner (for Datenschutz page)
    window.showCookieBanner = showSettings;
  }

  // Check geolocation consent (stub for compatibility)
  window.checkGeolocationConsent = function() {
    return true; // Geolocation requires explicit user action, no additional consent needed
  };

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Add slideDown animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(100%); opacity: 0; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);

})();
