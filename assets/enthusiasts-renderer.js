(function() {
  'use strict';

  // Configuration
  const DATA_PATHS = {
    photography: 'data/fotografie-spots.json',
    geocaching: 'data/geocaches.json',
    routes: 'data/routes.json'
  };

  // Season mapping
  const SEASON_CLASSES = {
    'frühling': 'spring',
    'sommer': 'summer',
    'herbst': 'autumn',
    'winter': 'winter'
  };

  // Difficulty mapping
  const DIFFICULTY_CLASSES = {
    'einfach': 'easy',
    'mittel': 'medium',
    'hügelig': 'medium',
    'anspruchsvoll': 'hard',
    'flach': 'easy'
  };

  /**
   * Render Photography Spots
   */
  async function renderPhotographySpots(containerId, parkFilter = null) {
    try {
      const response = await fetch(DATA_PATHS.photography);
      const data = await response.json();

      let spots = data.spots;
      if (parkFilter) {
        spots = spots.filter(spot => spot.park === parkFilter);
      }

      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'enthusiast-grid';

      spots.forEach(spot => {
        const card = createPhotographyCard(spot);
        grid.appendChild(card);
      });

      container.appendChild(grid);
    } catch (error) {
      console.error('Error loading photography spots:', error);
    }
  }

  function createPhotographyCard(spot) {
    const card = document.createElement('article');
    card.className = 'enthusiast-card';

    card.innerHTML = `
      <img src="${spot.image}" alt="${spot.name}" loading="lazy">
      <div class="enthusiast-card-content">
        <div class="enthusiast-card-header">
          <h3 class="enthusiast-card-title">${spot.name}</h3>
          <span class="season-badge ${getSeasonClass(spot.seasons[0])}">${spot.seasonLabels}</span>
        </div>
        <p class="enthusiast-card-description">${spot.description}</p>
        <div class="enthusiast-card-meta">
          <div class="enthusiast-card-meta-item">
            <span class="enthusiast-card-meta-icon">⏰</span>
            <span>${spot.bestTime}</span>
          </div>
          <div class="enthusiast-card-meta-item">
            <span class="enthusiast-card-meta-icon">📷</span>
            <span>${spot.equipment}</span>
          </div>
          ${spot.tips ? `
          <div class="enthusiast-card-meta-item">
            <span class="enthusiast-card-meta-icon">💡</span>
            <span>${spot.tips}</span>
          </div>
          ` : ''}
        </div>
      </div>
      <div class="enthusiast-card-footer">
        <a href="https://www.google.com/maps/dir/?api=1&destination=${spot.coordinates[0]},${spot.coordinates[1]}&travelmode=walking"
           target="_blank" rel="noopener" class="enthusiast-btn enthusiast-btn-primary">
          📍 Route
        </a>
      </div>
    `;

    return card;
  }

  /**
   * Render Geocaches
   */
  async function renderGeocaches(containerId) {
    try {
      const response = await fetch(DATA_PATHS.geocaching);
      const data = await response.json();

      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'enthusiast-grid';

      data.caches.forEach(cache => {
        const card = createGeocacheCard(cache);
        grid.appendChild(card);
      });

      container.appendChild(grid);
    } catch (error) {
      console.error('Error loading geocaches:', error);
    }
  }

  function createGeocacheCard(cache) {
    const card = document.createElement('article');
    card.className = 'enthusiast-card';

    const stationsList = cache.stations.slice(0, 4).join(', ') +
                        (cache.stations.length > 4 ? '...' : '');

    card.innerHTML = `
      <div class="enthusiast-card-content">
        <div class="enthusiast-card-header">
          <h3 class="enthusiast-card-title">${cache.name}</h3>
          <span class="season-badge ${getSeasonClass(cache.bestSeason)}">${cache.seasonLabels}</span>
        </div>
        <p class="enthusiast-card-description">${cache.description}</p>
        <div class="enthusiast-card-meta">
          <div class="enthusiast-card-meta-item">
            <span class="enthusiast-card-meta-icon">🎯</span>
            <span>${cache.type} - D${cache.difficulty}/T${cache.terrain}</span>
          </div>
          <div class="enthusiast-card-meta-item">
            <span class="enthusiast-card-meta-icon">📍</span>
            <span>${cache.stations.length} Stationen: ${stationsList}</span>
          </div>
          <div class="enthusiast-card-meta-item">
            <span class="enthusiast-card-meta-icon">💡</span>
            <span>${cache.reason}</span>
          </div>
          ${cache.warnings.map(warning => `
          <div class="enthusiast-card-meta-item" style="color: var(--warning);">
            <span>${warning}</span>
          </div>
          `).join('')}
        </div>
      </div>
      <div class="enthusiast-card-footer">
        <a href="${cache.url}" target="_blank" rel="noopener" class="enthusiast-btn enthusiast-btn-primary">
          🌐 Geocaching.com
        </a>
        <a href="https://www.geocaching.com/play/map?lat=${cache.stations.length > 0 ? '52.410' : '52.410'}&lng=13.095&zoom=15"
           target="_blank" rel="noopener" class="enthusiast-btn enthusiast-btn-secondary">
          🗺️ Karte
        </a>
      </div>
    `;

    return card;
  }

  /**
   * Render Running/Yoga Routes
   */
  async function renderRoutes(containerId, parkFilter = null, typeFilter = null) {
    try {
      const response = await fetch(DATA_PATHS.routes);
      const data = await response.json();

      let routes = data.routes;
      if (parkFilter) {
        routes = routes.filter(route => route.park === parkFilter);
      }
      if (typeFilter) {
        routes = routes.filter(route => route.type === typeFilter);
      }

      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'enthusiast-grid';

      routes.forEach(route => {
        const card = createRouteCard(route);
        grid.appendChild(card);
      });

      container.appendChild(grid);
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  }

  function createRouteCard(route) {
    const card = document.createElement('article');
    card.className = 'enthusiast-card';

    const difficultyClass = DIFFICULTY_CLASSES[route.difficulty] || 'medium';
    const difficultyLabel = route.difficulty.charAt(0).toUpperCase() + route.difficulty.slice(1);

    card.innerHTML = `
      <div class="enthusiast-card-content">
        <div class="enthusiast-card-header">
          <h3 class="enthusiast-card-title">${route.name}</h3>
          <span class="season-badge ${getSeasonClass(route.seasons[0])}">${route.seasonLabels}</span>
        </div>
        <p class="enthusiast-card-description">${route.type === 'running' ? '🏃 Laufroute' : '🧘 Yoga/Achtsamkeit'}</p>
        <div class="enthusiast-card-meta">
          ${route.distance ? `
          <div class="enthusiast-card-meta-item">
            <span class="enthusiast-card-meta-icon">📏</span>
            <span>${route.distance} km · ${route.duration}</span>
          </div>
          ` : `
          <div class="enthusiast-card-meta-item">
            <span class="enthusiast-card-meta-icon">⏱️</span>
            <span>${route.duration}</span>
          </div>
          `}
          ${route.elevation ? `
          <div class="enthusiast-card-meta-item">
            <span class="enthusiast-card-meta-icon">⛰️</span>
            <span>${route.elevation}m Höhenmeter</span>
          </div>
          ` : ''}
          <div class="enthusiast-card-meta-item">
            <span class="enthusiast-card-meta-icon">🏅</span>
            <span>Schwierigkeit: <span class="difficulty-badge ${difficultyClass}">${difficultyLabel}</span></span>
          </div>
          <div class="enthusiast-card-meta-item">
            <span class="enthusiast-card-meta-icon">⏰</span>
            <span>${route.bestTime}</span>
          </div>
          ${route.warnings ? `
          <div class="enthusiast-card-meta-item" style="color: var(--warning);">
            <span>${route.warnings}</span>
          </div>
          ` : ''}
        </div>
      </div>
      <div class="enthusiast-card-footer">
        ${route.gpx ? `
        <a href="${route.gpx}" download class="enthusiast-btn enthusiast-btn-primary">
          📥 GPX Download
        </a>
        ` : ''}
        ${route.type === 'running' && route.gpx ? `
        <a href="https://www.google.com/maps/dir/?api=1&destination=52.409,13.095&travelmode=walking"
           target="_blank" rel="noopener" class="enthusiast-btn enthusiast-btn-secondary">
          📍 Zum Start
        </a>
        ` : ''}
      </div>
    `;

    return card;
  }

  /**
   * Helper: Get season CSS class
   */
  function getSeasonClass(season) {
    return SEASON_CLASSES[season] || 'spring';
  }

  /**
   * Initialize renderers when DOM is ready
   */
  function init() {
    // Expose functions globally for page-specific use
    window.EnthusiastsRenderer = {
      renderPhotographySpots,
      renderGeocaches,
      renderRoutes
    };
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
