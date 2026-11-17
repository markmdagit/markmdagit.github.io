
/* --- Simple Caching Utility --- */
class SimpleCache {
    constructor() {
        this.prefix = 'api_cache_';
    }

    get(key) {
        try {
            const itemStr = localStorage.getItem(this.prefix + key);
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);
            const now = Date.now();
            if (!item || typeof item.expiry !== 'number' || now > item.expiry) {
                localStorage.removeItem(this.prefix + key);
                return null;
            }
            return item.value;
        } catch (e) {
            console.warn('Cache parse error', e);
            return null;
        }
    }

    pruneExpired() {
        try {
            const now = Date.now();
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(this.prefix)) {
                    try {
                        const item = JSON.parse(localStorage.getItem(k));
                        if (!item || typeof item.expiry !== 'number' || now > item.expiry) {
                            keysToRemove.push(k);
                        }
                    } catch (_) {
                        keysToRemove.push(k);
                    }
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch (e) {
            console.warn('Cache prune error', e);
        }
    }

    set(key, value, ttlInMinutes = 60) {
        const now = Date.now();
        const item = {
            value: value,
            expiry: now + (ttlInMinutes * 60 * 1000)
        };
        const serialized = JSON.stringify(item);
        try {
            localStorage.setItem(this.prefix + key, serialized);
        } catch (e) {
            this.pruneExpired();
            try {
                localStorage.setItem(this.prefix + key, serialized);
            } catch (retryErr) {
                console.warn('Cache set error (quota exceeded?)', retryErr);
            }
        }
    }
}

const apiCache = new SimpleCache();

function fetchWithTimeout(url, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

/* --- Techy Text Generator --- */

/* --- Meme API & Generator --- */

/* --- LinkedIn Profile API --- */

/* --- Google Calendar Tracker --- */

/* --- Location Tracker (ipinfo.io) --- */

/* --- Weather Tracker --- */
class WeatherTracker {
    constructor() {
        this.apiKey = 'YOUR_OPENWEATHER_API_KEY';
        this.locationInput = document.getElementById('weather-location');
        this.getWeatherBtn = document.getElementById('get-weather-btn');
        this.displayContainer = document.getElementById('weather-display');
        this.init();
    }

    init() {
        if (!this.displayContainer || !this.locationInput) return;

        if (this.getWeatherBtn) {
            this.getWeatherBtn.addEventListener('click', () => {
                const location = this.locationInput.value.trim();
                if (location) this.fetchForecast(location);
                else alert('Please enter a location.');
            });
            this.locationInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const location = this.locationInput.value.trim();
                    if (location) this.fetchForecast(location);
                }
            });
        }
        // Sample: Load default location
        this.locationInput.value = "Seattle";
        this.fetchForecast("Seattle");
    }

    showLoading() {
        this.displayContainer.replaceChildren();
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        const spinner = document.createElement('i');
        spinner.className = 'fas fa-spinner fa-spin';
        loadingDiv.appendChild(spinner);
        loadingDiv.appendChild(document.createTextNode(' Fetching forecast...'));
        this.displayContainer.appendChild(loadingDiv);
    }

    async fetchForecast(location) {
        // Normalize location for cache key
        const cacheKey = `weather_${location.toLowerCase().replace(/\s+/g, '_')}`;
        const cached = apiCache.get(cacheKey);

        if (cached) {
            this.render(cached.daily, cached.name, cached.isSimulated);
            return;
        }

        this.showLoading();

        if (this.apiKey === 'YOUR_OPENWEATHER_API_KEY') {
            await new Promise(resolve => setTimeout(resolve, 800));
            const mockData = this.generateMockData(location);

            apiCache.set(cacheKey, mockData, 60);
            this.render(mockData.daily, mockData.name, true);
        } else {
            try {
                const geoResponse = await fetchWithTimeout(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${encodeURIComponent(this.apiKey)}`);
                if (!geoResponse.ok) throw new Error('Location not found');
                const geoData = await geoResponse.json();
                if (!Array.isArray(geoData) || geoData.length === 0) throw new Error('Location not found');

                const { lat, lon, name } = geoData[0];
                const weatherResponse = await fetchWithTimeout(`https://api.openweathermap.org/data/3.0/onecall?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&exclude=current,minutely,hourly,alerts&units=imperial&appid=${encodeURIComponent(this.apiKey)}`);
                if (!weatherResponse.ok) throw new Error('Failed to fetch weather');
                const weatherData = await weatherResponse.json();

                const dataToCache = { daily: weatherData.daily, name: name, isSimulated: false };
                apiCache.set(cacheKey, dataToCache, 60);
                this.render(weatherData.daily, name, false);

            } catch (error) {
                console.warn('Weather API Error (falling back to mock):', error);
                const mockData = this.generateMockData(location);
                this.render(mockData.daily, mockData.name, true);
            }
        }
    }

    generateMockData(location) {
        const days = [];
        const today = new Date();
        const conditions = ['Sunny', 'Cloudy', 'Rain', 'Partly Cloudy', 'Thunderstorm', 'Snow', 'Clear'];
        const icons = ['fa-sun', 'fa-cloud', 'fa-cloud-rain', 'fa-cloud-sun', 'fa-bolt', 'fa-snowflake', 'fa-moon'];
        const displayLocation = location.charAt(0).toUpperCase() + location.slice(1);

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const maxTemp = Math.floor(Math.random() * (85 - 60 + 1)) + 60;
            const minTemp = maxTemp - Math.floor(Math.random() * 15 + 10);
            const randIdx = Math.floor(Math.random() * conditions.length);

            days.push({
                dt: Math.floor(date.getTime() / 1000),
                temp: { max: maxTemp, min: minTemp },
                weather: [{ main: conditions[randIdx], description: conditions[randIdx], iconClass: icons[randIdx] }]
            });
        }
        return { daily: days, name: displayLocation, isSimulated: true };
    }

    render(dailyData, locationName, isSimulated = false) {
        this.displayContainer.replaceChildren();
        const fragment = document.createDocumentFragment();

        const header = document.createElement('div');
        header.className = 'weather-header';
        const h4 = document.createElement('h4');
        h4.textContent = `7-Day Forecast for ${locationName} `;
        if (isSimulated) {
            const simSpan = document.createElement('span');
            simSpan.style.fontSize = '0.8rem';
            simSpan.style.color = '#6c757d';
            simSpan.style.fontWeight = 'normal';
            simSpan.textContent = '(Simulated Data)';
            h4.appendChild(simSpan);
        }
        header.appendChild(h4);
        fragment.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'weather-grid';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
        grid.style.gap = '1rem';
        grid.style.marginTop = '1rem';

        (dailyData || []).slice(0, 7).forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const weatherInfo = (day.weather && day.weather[0]) ? day.weather[0] : {};

            const card = document.createElement('div');
            card.className = 'weather-card';
            card.style.background = '#f8f9fa';
            card.style.padding = '1rem';
            card.style.borderRadius = '8px';
            card.style.textAlign = 'center';
            card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';

            const dayDiv = document.createElement('div');
            dayDiv.className = 'weather-day';
            dayDiv.style.fontWeight = 'bold';
            dayDiv.style.marginBottom = '0.5rem';
            dayDiv.textContent = dayName;

            const dateDiv = document.createElement('div');
            dateDiv.className = 'weather-date';
            dateDiv.style.fontSize = '0.9rem';
            dateDiv.style.color = '#6c757d';
            dateDiv.style.marginBottom = '0.5rem';
            dateDiv.textContent = dateStr;

            const iconContainer = document.createElement('div');
            iconContainer.className = 'weather-icon-container';
            iconContainer.style.fontSize = '2rem';
            iconContainer.style.color = '#004A99';
            iconContainer.style.marginBottom = '0.5rem';

            if (weatherInfo.iconClass && /^fa-[a-z0-9-]+$/i.test(weatherInfo.iconClass)) {
                const iconEl = document.createElement('i');
                iconEl.className = `fas ${weatherInfo.iconClass} weather-icon`;
                iconContainer.appendChild(iconEl);
            } else if (weatherInfo.icon && /^[a-z0-9]+$/i.test(weatherInfo.icon)) {
                const imgEl = document.createElement('img');
                imgEl.src = `https://openweathermap.org/img/wn/${encodeURIComponent(weatherInfo.icon)}@2x.png`;
                imgEl.alt = weatherInfo.main || 'Weather icon';
                imgEl.width = 50;
                imgEl.height = 50;
                imgEl.loading = 'lazy';
                imgEl.decoding = 'async';
                imgEl.style.width = '50px';
                imgEl.style.height = '50px';
                iconContainer.appendChild(imgEl);
            }

            const tempsDiv = document.createElement('div');
            tempsDiv.className = 'weather-temps';
            tempsDiv.style.fontSize = '1.1rem';

            const highSpan = document.createElement('span');
            highSpan.className = 'high-temp';
            highSpan.style.fontWeight = 'bold';
            highSpan.textContent = `${Math.round(day.temp?.max ?? 0)}°`;

            const lowSpan = document.createElement('span');
            lowSpan.className = 'low-temp';
            lowSpan.style.color = '#6c757d';
            lowSpan.textContent = `${Math.round(day.temp?.min ?? 0)}°`;

            tempsDiv.appendChild(highSpan);
            tempsDiv.appendChild(document.createTextNode(' / '));
            tempsDiv.appendChild(lowSpan);

            const descDiv = document.createElement('div');
            descDiv.className = 'weather-desc';
            descDiv.style.fontSize = '0.9rem';
            descDiv.style.marginTop = '0.5rem';
            descDiv.style.textTransform = 'capitalize';
            descDiv.textContent = weatherInfo.description || '';

            card.appendChild(dayDiv);
            card.appendChild(dateDiv);
            card.appendChild(iconContainer);
            card.appendChild(tempsDiv);
            card.appendChild(descDiv);
            grid.appendChild(card);
        });

        fragment.appendChild(grid);
        this.displayContainer.appendChild(fragment);
    }
}

/* --- ESPN Game Tracker --- */
class ESPNGameTracker {
    constructor() {
        this.container = document.getElementById('espn-games-container');
        this.baseApiUrl = 'https://site.web.api.espn.com/apis/site/v2/sports';
        this.leagues = [
            { sport: 'football', league: 'nfl', name: 'NFL', section: 'Football (NFL & NCAA)' },
            { sport: 'football', league: 'college-football', name: 'NCAA Football', section: 'Football (NFL & NCAA)' },
            { sport: 'baseball', league: 'mlb', name: 'MLB', section: 'Baseball (MLB & NCAA)' },
            { sport: 'baseball', league: 'college-baseball', name: 'NCAA Baseball', section: 'Baseball (MLB & NCAA)' },
            { sport: 'basketball', league: 'nba', name: 'NBA', section: 'Basketball (NBA & NCAA)' },
            { sport: 'basketball', league: 'mens-college-basketball', name: 'NCAA Basketball', section: 'Basketball (NBA & NCAA)' },
            { sport: 'hockey', league: 'nhl', name: 'NHL', section: 'Hockey (NHL & NCAA)' },
            { sport: 'hockey', league: 'mens-college-hockey', name: 'NCAA Hockey', section: 'Hockey (NHL & NCAA)' }
        ];
        this.init();
    }

    async init() {
        if (!this.container) return;

        const cached = apiCache.get('espn_data');
        if (cached) {
            this.renderAll(cached);
            return;
        }

        try {
            const promises = this.leagues.map(l => this.fetchLeagueData(l));
            const results = await Promise.all(promises);
            apiCache.set('espn_data', results, 60); // Cache for 1 hour
            this.renderAll(results);
        } catch (error) {
            console.error('Error fetching ESPN data:', error);
            this.container.replaceChildren();
            const errorMsg = document.createElement('p');
            errorMsg.textContent = 'Failed to load games. Please try again later.';
            this.container.appendChild(errorMsg);
        }
    }

    async fetchLeagueData(leagueInfo) {
        const url = `${this.baseApiUrl}/${leagueInfo.sport}/${leagueInfo.league}/scoreboard`;
        try {
            const response = await fetchWithTimeout(url);
            if (!response.ok) throw new Error(`Failed to fetch ${leagueInfo.name}`);
            const data = await response.json();
            return { ...leagueInfo, events: data.events || [] };
        } catch (error) {
            console.warn(`Error fetching ${leagueInfo.name}:`, error);
            return { ...leagueInfo, events: [] };
        }
    }

    renderAll(results) {
        this.container.replaceChildren();
        const sections = {};
        results.forEach(result => {
            if (!sections[result.section]) sections[result.section] = [];
            if (Array.isArray(result.events)) {
                sections[result.section].push(...result.events);
            }
        });

        const sectionOrder = ['Football (NFL & NCAA)', 'Baseball (MLB & NCAA)', 'Basketball (NBA & NCAA)', 'Hockey (NHL & NCAA)'];
        const fragment = document.createDocumentFragment();

        sectionOrder.forEach(sectionTitle => {
            const events = sections[sectionTitle] || [];
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'sport-section';
            sectionDiv.style.marginBottom = '1rem';
            sectionDiv.style.border = '1px solid #dee2e6';
            sectionDiv.style.borderRadius = '8px';
            sectionDiv.style.overflow = 'hidden';

            const header = document.createElement('div');
            header.className = 'section-header';
            header.style.padding = '1rem';
            header.style.background = '#f8f9fa';
            header.style.cursor = 'pointer';
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.userSelect = 'none';

            const h4 = document.createElement('h4');
            h4.style.margin = '0';
            h4.style.color = '#212529';
            h4.style.fontSize = '1.1rem';
            h4.textContent = sectionTitle;

            const chevron = document.createElement('i');
            chevron.className = 'fas fa-chevron-down';
            chevron.style.transition = 'transform 0.3s ease';

            header.appendChild(h4);
            header.appendChild(chevron);
            sectionDiv.appendChild(header);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'section-content';
            contentDiv.style.display = 'none';
            contentDiv.style.padding = '1rem';
            contentDiv.style.borderTop = '1px solid #dee2e6';

            if (events.length === 0) {
                const emptyMsg = document.createElement('p');
                emptyMsg.style.margin = '0';
                emptyMsg.style.color = '#6c757d';
                emptyMsg.textContent = 'No active games scheduled today.';
                contentDiv.appendChild(emptyMsg);
            } else {
                const grid = document.createElement('div');
                grid.className = 'games-grid';
                const cardsFragment = document.createDocumentFragment();
                events.forEach(event => cardsFragment.appendChild(this.createGameCard(event)));
                grid.appendChild(cardsFragment);
                contentDiv.appendChild(grid);
            }
            sectionDiv.appendChild(contentDiv);
            fragment.appendChild(sectionDiv);

            header.addEventListener('click', () => {
                const isHidden = contentDiv.style.display === 'none';
                contentDiv.style.display = isHidden ? 'block' : 'none';
                chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            });
        });

        this.container.appendChild(fragment);
    }

    getSafeLogoUrl(url) {
        const fallback = 'https://placehold.co/50x50?text=Logo';
        if (!url || typeof url !== 'string') return fallback;
        try {
            const parsed = new URL(url);
            return (parsed.protocol === 'https:' || parsed.protocol === 'http:') ? parsed.href : fallback;
        } catch (_) {
            return fallback;
        }
    }

    createTeamElement(competitor) {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team';

        const teamData = competitor?.team || {};
        const fallbackLogo = 'https://placehold.co/50x50?text=Logo';

        const img = document.createElement('img');
        img.src = this.getSafeLogoUrl(teamData.logo);
        img.alt = teamData.displayName || 'Team';
        img.className = 'team-logo';
        img.width = 50;
        img.height = 50;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', () => {
            if (img.src !== fallbackLogo) {
                img.src = fallbackLogo;
            }
        }, { once: true });

        const nameSpan = document.createElement('span');
        nameSpan.className = 'team-name';
        nameSpan.textContent = teamData.shortDisplayName || 'TBD';

        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'team-score';
        scoreSpan.textContent = competitor?.score || '-';

        teamDiv.appendChild(img);
        teamDiv.appendChild(nameSpan);
        teamDiv.appendChild(scoreSpan);
        return teamDiv;
    }

    createGameCard(event) {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        const competitors = event?.competitions?.[0]?.competitors || [];
        const homeTeam = competitors.find(c => c.homeAway === 'home') || {};
        const awayTeam = competitors.find(c => c.homeAway === 'away') || {};
        const status = event?.status?.type?.detail || event?.status?.type?.description || '';

        const teamsDiv = document.createElement('div');
        teamsDiv.className = 'game-teams';

        const vsDiv = document.createElement('div');
        vsDiv.className = 'vs';
        vsDiv.textContent = '@';

        teamsDiv.appendChild(this.createTeamElement(awayTeam));
        teamsDiv.appendChild(vsDiv);
        teamsDiv.appendChild(this.createTeamElement(homeTeam));

        const statusDiv = document.createElement('div');
        statusDiv.className = 'game-status';
        statusDiv.textContent = status;

        gameCard.appendChild(teamsDiv);
        gameCard.appendChild(statusDiv);
        return gameCard;
    }
}

/* --- Gemini 2.5 Flash Image Generator --- */

/* --- QR Code Generator --- */

/* --- Dictionary API --- */

// Initialize
document.addEventListener('DOMContentLoaded', () => {

    new ESPNGameTracker();
    new WeatherTracker();

});
