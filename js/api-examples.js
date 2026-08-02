
/* --- Simple Caching Utility --- */
class SimpleCache {
    constructor() {
        this.prefix = 'api_cache_';
    }

    get(key) {
        const itemStr = localStorage.getItem(this.prefix + key);
        if (!itemStr) return null;

        try {
            const item = JSON.parse(itemStr);
            const now = new Date().getTime();
            if (now > item.expiry) {
                localStorage.removeItem(this.prefix + key);
                return null;
            }
            return item.value;
        } catch (e) {
            console.warn('Cache parse error', e);
            return null;
        }
    }

    set(key, value, ttlInMinutes = 60) {
        const now = new Date().getTime();
        const item = {
            value: value,
            expiry: now + (ttlInMinutes * 60 * 1000)
        };
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(item));
        } catch (e) {
            console.warn('Cache set error (quota exceeded?)', e);
        }
    }
}

const apiCache = new SimpleCache();

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

    async fetchForecast(location) {
        // Normalize location for cache key
        const cacheKey = `weather_${location.toLowerCase().replace(/\s/g, '_')}`;
        const cached = apiCache.get(cacheKey);

        if (cached) {
            this.render(cached.daily, cached.name, cached.isSimulated);
            return;
        }

        this.displayContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Fetching forecast...</div>';

        if (this.apiKey === 'YOUR_OPENWEATHER_API_KEY') {
            await new Promise(resolve => setTimeout(resolve, 800));
            const mockData = this.generateMockData(location);

            apiCache.set(cacheKey, mockData, 60);
            this.render(mockData.daily, mockData.name, true);
        } else {
            try {
                const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${this.apiKey}`);
                if (!geoResponse.ok) throw new Error('Location not found');
                const geoData = await geoResponse.json();
                if (geoData.length === 0) throw new Error('Location not found');

                const { lat, lon, name } = geoData[0];
                const weatherResponse = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=imperial&appid=${this.apiKey}`);
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
        this.displayContainer.innerHTML = '';
        const header = document.createElement('div');
        header.className = 'weather-header';
        header.innerHTML = `<h4>7-Day Forecast for ${locationName} ${isSimulated ? '<span style="font-size: 0.8rem; color: #6c757d; font-weight: normal;">(Simulated Data)</span>' : ''}</h4>`;
        this.displayContainer.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'weather-grid';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
        grid.style.gap = '1rem';
        grid.style.marginTop = '1rem';

        dailyData.slice(0, 7).forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            let iconHtml;
            if (day.weather[0].iconClass) {
                 iconHtml = `<i class="fas ${day.weather[0].iconClass} weather-icon"></i>`;
            } else {
                 const iconCode = day.weather[0].icon;
                 iconHtml = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${day.weather[0].main}" style="width: 50px; height: 50px;">`;
            }

            const card = document.createElement('div');
            card.className = 'weather-card';
            card.style.background = '#f8f9fa';
            card.style.padding = '1rem';
            card.style.borderRadius = '8px';
            card.style.textAlign = 'center';
            card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            card.innerHTML = `
                <div class="weather-day" style="font-weight: bold; margin-bottom: 0.5rem;">${dayName}</div>
                <div class="weather-date" style="font-size: 0.9rem; color: #6c757d; margin-bottom: 0.5rem;">${dateStr}</div>
                <div class="weather-icon-container" style="font-size: 2rem; color: #004A99; margin-bottom: 0.5rem;">${iconHtml}</div>
                <div class="weather-temps" style="font-size: 1.1rem;">
                    <span class="high-temp" style="font-weight: bold;">${Math.round(day.temp.max)}°</span> /
                    <span class="low-temp" style="color: #6c757d;">${Math.round(day.temp.min)}°</span>
                </div>
                <div class="weather-desc" style="font-size: 0.9rem; margin-top: 0.5rem; text-transform: capitalize;">${day.weather[0].description}</div>
            `;
            grid.appendChild(card);
        });
        this.displayContainer.appendChild(grid);
    }
}

/* --- GitHub Profile API --- */

/* --- YouTube Trending Tracker --- */
class YouTubeTracker {
    constructor() {
        this.track = document.getElementById('youtube-track');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.scrollAmount = 0;
        this.maxScroll = 0;
        this.cardWidth = 270;
        this.videos = [
            { id: "YmwskGLycHo", title: "iPhone 15 Pro: 3 Months Later!", views: "6.6M", channel: "Marques Brownlee" },
            { id: "305YfKMyqVw", title: "iPhone 15 Event Reactions!", views: "3.2M", channel: "Marques Brownlee" },
            { id: "c5aouiBgmUM", title: "Lion vs. Cape Buffalo: Battle Zone", views: "10M", channel: "Nat Geo Animals" },
            { id: "VCMPWI0iDQU", title: "Lions vs Buffalo - BBC Wildlife", views: "50M", channel: "BBC Earth" },
            { id: "l0TJCVQmDbE", title: "Making Pasta Aglio e Olio", views: "600K", channel: "Nick Janaskie" },
            { id: "k3GKcSs7g2s", title: "Pasta Aglio e Olio from Chef", views: "200K", channel: "Cook Master Tips" },
            { id: "-EqBmIJq8uM", title: "10 Interesting Scientific Discoveries", views: "1.2M", channel: "John Michael Godier" },
            { id: "lJ8NLGIsXwA", title: "25 Most Exciting Scientific Discoveries", views: "2.1M", channel: "List25" },
            { id: "jfKfPfyJRdk", title: "lofi hip hop radio - beats to study/relax to", views: "Live", channel: "Lofi Girl" },
            { id: "xX2y-2VhfZY", title: "iPhone 15 Pro Camera First Impressions", views: "1M", channel: "Marques Brownlee" }
        ];
        this.init();
    }

    init() {
        this.render();
        if(this.prevBtn) this.prevBtn.addEventListener('click', () => this.scroll(-1));
        if(this.nextBtn) this.nextBtn.addEventListener('click', () => this.scroll(1));
        setInterval(() => this.scroll(1), 3000);
    }

    render() {
        this.track.innerHTML = '';
        this.videos.forEach((video) => {
            const card = document.createElement('div');
            card.className = 'video-card';
            const thumbUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
            const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
            card.innerHTML = `
                <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="video-link">
                    <img src="${thumbUrl}" class="video-thumbnail" alt="${video.title}" loading="lazy">
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <div class="video-stats">${video.channel} • ${video.views} views</div>
                    </div>
                </a>
            `;
            this.track.appendChild(card);
        });
        const containerWidth = document.querySelector('.youtube-carousel').offsetWidth;
        this.maxScroll = (this.videos.length * this.cardWidth) - containerWidth;
    }

    scroll(direction) {
        const containerWidth = document.querySelector('.youtube-carousel').offsetWidth;
        this.maxScroll = Math.max(0, (this.videos.length * this.cardWidth) - containerWidth);
        this.scrollAmount += direction * this.cardWidth;
        if (this.scrollAmount > this.maxScroll) this.scrollAmount = 0;
        else if (this.scrollAmount < 0) this.scrollAmount = this.maxScroll;
        this.track.style.transform = `translateX(-${this.scrollAmount}px)`;
    }
}

/* --- Stock Tracker --- */
class StockTracker {
    constructor() {
        this.list = document.getElementById('stock-list');
        this.stocks = [
            { symbol: "WMT", name: "Walmart", price: 60.50, change: 0.5 },
            { symbol: "AMZN", name: "Amazon", price: 175.30, change: -1.2 },
            { symbol: "AAPL", name: "Apple", price: 185.90, change: 1.5 },
            { symbol: "CVS", name: "CVS Health", price: 75.20, change: 0.8 },
            { symbol: "UNH", name: "UnitedHealth", price: 480.10, change: -2.5 }
        ];
        this.init();
    }
    init() {
        this.render();
        setInterval(() => this.updatePrices(), 2000);
    }
    render() {
        this.list.innerHTML = '';
        this.stocks.forEach(stock => {
            const item = document.createElement('div');
            item.className = 'stock-item';
            const changeClass = stock.change >= 0 ? 'positive' : 'negative';
            const sign = stock.change >= 0 ? '+' : '';
            item.innerHTML = `
                <span class="stock-symbol">${stock.symbol}</span>
                <span class="stock-name">${stock.name}</span>
                <span class="stock-price">$${stock.price.toFixed(2)}</span>
                <span class="stock-change ${changeClass}">${sign}${stock.change.toFixed(2)}%</span>
            `;
            this.list.appendChild(item);
        });
    }
    updatePrices() {
        this.stocks = this.stocks.map(stock => {
            const fluctuation = (Math.random() - 0.5);
            return {
                ...stock,
                price: stock.price + fluctuation,
                change: stock.change + (fluctuation * 10)
            };
        });
        this.render();
    }
}

/* --- Commodity Tracker --- */
class CommodityTracker {
    constructor() {
        this.grid = document.getElementById('commodity-grid');
        this.commodities = [
            { name: "Eggs", price: 2.85, unit: "Dozen" },
            { name: "Beef", price: 5.40, unit: "LB" },
            { name: "Gold", price: 2045.50, unit: "oz" },
            { name: "Silver", price: 24.30, unit: "oz" }
        ];
        this.init();
    }
    init() { this.render(); }
    render() {
        this.grid.innerHTML = '';
        this.commodities.forEach(comm => {
            const card = document.createElement('div');
            card.className = 'commodity-card';
            card.innerHTML = `
                <div class="commodity-name">${comm.name}</div>
                <div class="commodity-price">$${comm.price.toFixed(2)}</div>
                <div class="commodity-unit">per ${comm.unit}</div>
            `;
            this.grid.appendChild(card);
        });
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
            this.container.innerHTML = '<p>Failed to load games. Please try again later.</p>';
        }
    }

    async fetchLeagueData(leagueInfo) {
        const url = `${this.baseApiUrl}/${leagueInfo.sport}/${leagueInfo.league}/scoreboard`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${leagueInfo.name}`);
            const data = await response.json();
            return { ...leagueInfo, events: data.events || [] };
        } catch (error) {
            console.warn(`Error fetching ${leagueInfo.name}:`, error);
            return { ...leagueInfo, events: [] };
        }
    }

    renderAll(results) {
        this.container.innerHTML = '';
        const sections = {};
        results.forEach(result => {
            if (!sections[result.section]) sections[result.section] = [];
            sections[result.section].push(...result.events);
        });

        const sectionOrder = ['Football (NFL & NCAA)', 'Baseball (MLB & NCAA)', 'Basketball (NBA & NCAA)', 'Hockey (NHL & NCAA)'];

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
            header.innerHTML = `
                <h4 style="margin: 0; color: #212529; font-size: 1.1rem;">${sectionTitle}</h4>
                <i class="fas fa-chevron-down" style="transition: transform 0.3s ease;"></i>
            `;
            sectionDiv.appendChild(header);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'section-content';
            contentDiv.style.display = 'none';
            contentDiv.style.padding = '1rem';
            contentDiv.style.borderTop = '1px solid #dee2e6';

            if (events.length === 0) {
                contentDiv.innerHTML = '<p style="margin: 0; color: #6c757d;">No active games scheduled today.</p>';
            } else {
                const grid = document.createElement('div');
                grid.className = 'games-grid';
                events.forEach(event => grid.appendChild(this.createGameCard(event)));
                contentDiv.appendChild(grid);
            }
            sectionDiv.appendChild(contentDiv);
            this.container.appendChild(sectionDiv);

            header.addEventListener('click', () => {
                const icon = header.querySelector('i');
                const isHidden = contentDiv.style.display === 'none';
                contentDiv.style.display = isHidden ? 'block' : 'none';
                icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            });
        });
    }

    createGameCard(event) {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        const competitors = event.competitions[0].competitors;
        const homeTeam = competitors.find(c => c.homeAway === 'home');
        const awayTeam = competitors.find(c => c.homeAway === 'away');
        let status = event.status.type.detail || event.status.type.description;

        const awayLogo = awayTeam.team.logo || 'https://placehold.co/50x50?text=Logo';
        const homeLogo = homeTeam.team.logo || 'https://placehold.co/50x50?text=Logo';

        gameCard.innerHTML = `
            <div class="game-teams">
                <div class="team">
                    <img src="${awayLogo}" alt="${awayTeam.team.displayName}" class="team-logo" onerror="this.src='https://placehold.co/50x50?text=Logo'">
                    <span class="team-name">${awayTeam.team.shortDisplayName}</span>
                    <span class="team-score">${awayTeam.score || '-'}</span>
                </div>
                <div class="vs">@</div>
                <div class="team">
                    <img src="${homeLogo}" alt="${homeTeam.team.displayName}" class="team-logo" onerror="this.src='https://placehold.co/50x50?text=Logo'">
                    <span class="team-name">${homeTeam.team.shortDisplayName}</span>
                    <span class="team-score">${homeTeam.score || '-'}</span>
                </div>
            </div>
            <div class="game-status">${status}</div>
        `;
        return gameCard;
    }
}

/* --- Gemini 2.5 Flash Image Generator --- */

/* --- QR Code Generator --- */

/* --- Dictionary API --- */

// Initialize
document.addEventListener('DOMContentLoaded', () => {

    new YouTubeTracker();
    new StockTracker();
    new CommodityTracker();

    new ESPNGameTracker();
    new WeatherTracker();

});
