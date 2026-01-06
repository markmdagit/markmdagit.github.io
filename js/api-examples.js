
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
class TechyTextGenerator {
    constructor() {
        this.output = document.getElementById('techy-text-output');
        this.generateBtn = document.getElementById('generate-techy-text-btn');
        this.apiUrl = 'https://techy-api.vercel.app/api/text';

        this.init();
    }

    init() {
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.fetchText(false));
        }
        // Initial fetch (Sample)
        this.fetchText(true);
    }

    async fetchText(useCache = false) {
        this.output.textContent = 'Loading...';

        if (useCache) {
            const cached = apiCache.get('techy_sample');
            if (cached) {
                this.render(cached);
                return;
            }
        }

        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) throw new Error('Failed to fetch text');
            const text = await response.text();

            if (useCache) {
                apiCache.set('techy_sample', text, 60); // Cache sample for 1 hour
            }

            this.render(text);
        } catch (error) {
            console.error('Error fetching techy text:', error);
            this.output.textContent = 'Error: System Malfunction. Reboot Required.';
            this.output.style.color = '#ff0000'; // Red for error
        }
    }

    render(text) {
        this.output.style.color = '#0f0'; // Reset to green in case of previous error
        this.output.textContent = text;
    }
}

/* --- Meme API & Generator --- */
class MemeAPI {
    constructor() {
        this.apiUrl = 'https://api.imgflip.com/get_memes';
    }

    async fetchTemplates() {
        const cached = apiCache.get('meme_templates');
        if (cached) return cached;

        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();
            if (data.success) {
                const memes = data.data.memes;
                apiCache.set('meme_templates', memes, 1440); // Cache for 24 hours
                return memes;
            } else {
                console.error('Failed to load memes');
                return [];
            }
        } catch (error) {
            console.error('Error fetching memes:', error);
            return [];
        }
    }
}

class MemeGenerator {
    constructor() {
        this.api = new MemeAPI();
        this.canvas = document.getElementById('meme-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.templateSelect = document.getElementById('meme-template');
        this.topTextInput = document.getElementById('top-text');
        this.bottomTextInput = document.getElementById('bottom-text');
        this.generateBtn = document.getElementById('generate-btn');
        this.downloadBtn = document.getElementById('download-btn');
        this.previewText = document.getElementById('preview-text');

        this.currentImage = null;
        this.memes = [];

        this.init();
    }

    async init() {
        this.memes = await this.api.fetchTemplates();
        if (this.memes.length === 0) {
            this.previewText.textContent = "Error loading templates.";
            return;
        }

        this.populateDropdown(this.memes);

        this.generateBtn.addEventListener('click', () => this.generate());
        this.templateSelect.addEventListener('change', () => this.loadTemplate());
        this.downloadBtn.addEventListener('click', () => this.download());

        // Sample: Load first meme with text
        this.templateSelect.value = this.memes[0].id;
        this.topTextInput.value = "API Examples";
        this.bottomTextInput.value = "Are Awesome";
        this.loadTemplate(true);
    }

    populateDropdown(templates) {
        this.templateSelect.innerHTML = '';
        templates.forEach(meme => {
            const option = document.createElement('option');
            option.value = meme.id;
            option.textContent = meme.name;
            this.templateSelect.appendChild(option);
        });
    }

    loadTemplate(autoGenerate = false) {
        const id = this.templateSelect.value;
        const meme = this.memes.find(m => m.id === id);

        if (meme) {
            this.previewText.style.display = 'none';
            this.currentImage = new Image();
            this.currentImage.crossOrigin = "Anonymous";
            this.currentImage.src = meme.url;

            this.currentImage.onload = () => {
                const maxWidth = 500;
                const scale = Math.min(1, maxWidth / this.currentImage.width);

                this.canvas.width = this.currentImage.width * scale;
                this.canvas.height = this.currentImage.height * scale;

                if (autoGenerate) {
                    this.generate();
                } else {
                     // Just draw image if not auto-generating with text
                     this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);
                }
            };

            this.currentImage.onerror = () => {
                console.error("Failed to load meme image");
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillText("Error loading image", 10, 50);
            }
        }
    }

    generate() {
        if (!this.currentImage) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Image
        this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);

        // Text Settings
        const fontSize = this.canvas.width * 0.1;
        this.ctx.font = `bold ${fontSize}px Oswald, sans-serif`;
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = fontSize * 0.05;
        this.ctx.textAlign = 'center';

        // Draw Top Text
        const topText = this.topTextInput.value.toUpperCase();
        this.ctx.textBaseline = 'top';
        this.drawText(topText, this.canvas.width / 2, 10, this.canvas.width - 20);

        // Draw Bottom Text
        const bottomText = this.bottomTextInput.value.toUpperCase();
        this.ctx.textBaseline = 'bottom';
        this.drawText(bottomText, this.canvas.width / 2, this.canvas.height - 10, this.canvas.width - 20);

        this.downloadBtn.style.display = 'inline-block';
    }

    drawText(text, x, y, maxWidth) {
        this.ctx.strokeText(text, x, y, maxWidth);
        this.ctx.fillText(text, x, y, maxWidth);
    }

    download() {
        const link = document.createElement('a');
        link.download = 'meme.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

/* --- LinkedIn Profile API --- */
class LinkedInProfileAPI {
    constructor() {
        this.container = document.getElementById('linkedin-profile-container');
        this.profileUrl = "https://www.linkedin.com/in/marcos-alvarez-ab2ba5109/";
        this.data = {
            name: "Marcos Alvarez",
            headline: "IT Support Associate II at Amazon Robotics Sort Center",
            location: "United States",
            about: "IT Support Associate II with over 8 years of experience at Amazon. Currently pursuing a Bachelor of Science in Computer Science at CSUSB.",
            connections: 500,
            avatar: "../images/headshot.png"
        };
        this.init();
    }

    async init() {
        // Simulated, so caching isn't strictly necessary for data,
        // but consistent with "simulate network delay"
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="linkedin-profile-card">
                <div class="linkedin-banner"></div>
                <div class="linkedin-content">
                    <img src="${this.data.avatar}" alt="${this.data.name}" class="linkedin-avatar">
                    <div class="linkedin-name">${this.data.name}</div>
                    <div class="linkedin-headline">${this.data.headline}</div>
                    <div class="linkedin-location">${this.data.location}</div>
                    <div class="linkedin-about">${this.data.about}</div>
                    <div class="linkedin-stats">${this.data.connections}+ connections</div>
                    <a href="${this.profileUrl}" target="_blank" rel="noopener noreferrer" class="linkedin-btn">View Profile</a>
                </div>
            </div>
        `;
    }
}

/* --- Google Calendar Tracker --- */
class GoogleCalendarTracker {
    constructor() {
        this.container = document.getElementById('google-calendar-container');
        this.isSignedIn = false;
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        if (!this.isSignedIn) {
            this.container.innerHTML = `
                <div class="calendar-auth" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-calendar-alt" style="font-size: 3rem; color: #4285F4; margin-bottom: 1rem;"></i>
                    <p>Connect your Google Calendar to view upcoming events.</p>
                    <button id="calendar-signin-btn" class="action-btn" style="background-color: #4285F4; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                        <i class="fab fa-google"></i> Sign In with Google
                    </button>
                </div>
            `;
            const btn = document.getElementById('calendar-signin-btn');
            if(btn) btn.addEventListener('click', () => this.signIn());
        } else {
            this.renderEvents();
        }
    }

    signIn() {
        this.container.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i> Connecting to Google...
            </div>
        `;
        setTimeout(() => {
            this.isSignedIn = true;
            this.render();
        }, 1500);
    }

    renderEvents() {
        const events = [
            { title: "Team Standup", time: "10:00 AM - 10:30 AM", location: "Google Meet", color: "#4285F4" },
            { title: "Project Review with Client", time: "11:30 AM - 12:30 PM", location: "Zoom", color: "#DB4437" },
            { title: "Lunch with Sarah", time: "1:00 PM - 2:00 PM", location: "Cafeteria", color: "#F4B400" },
            { title: "Code Deployment", time: "3:30 PM - 4:30 PM", location: "Server Room", color: "#0F9D58" },
            { title: "Wrap-up Meeting", time: "5:00 PM - 5:15 PM", location: "Office", color: "#4285F4" }
        ];

        let eventsHtml = events.map(event => `
            <div class="calendar-event" style="display: flex; align-items: center; padding: 0.75rem; border-bottom: 1px solid #eee; transition: background 0.2s;">
                <div class="event-color" style="width: 4px; height: 40px; background-color: ${event.color}; border-radius: 2px; margin-right: 1rem;"></div>
                <div class="event-details">
                    <div class="event-title" style="font-weight: bold; font-size: 1rem;">${event.title}</div>
                    <div class="event-meta" style="font-size: 0.85rem; color: #6c757d;">
                        <i class="far fa-clock"></i> ${event.time} &nbsp;&nbsp; <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </div>
                </div>
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="calendar-view">
                <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f8f9fa;">
                    <h4 style="margin: 0;">Today's Schedule</h4>
                    <button id="calendar-signout-btn" style="background: none; border: none; color: #6c757d; cursor: pointer; font-size: 0.9rem;">Sign Out</button>
                </div>
                <div class="events-list">
                    ${eventsHtml}
                </div>
            </div>
        `;
        const btn = document.getElementById('calendar-signout-btn');
        if(btn) btn.addEventListener('click', () => {
            this.isSignedIn = false;
            this.render();
        });
    }
}

/* --- Location Tracker (ipinfo.io) --- */
class LocationTracker {
    constructor() {
        this.detailsContainer = document.getElementById('location-details');
        this.mapContainer = document.getElementById('location-map');
        this.apiUrl = 'https://ipinfo.io/json';
        this.init();
    }

    async init() {
        const cached = apiCache.get('location_data');
        if (cached) {
            this.render(cached);
            return;
        }

        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) throw new Error('Failed to fetch location data');
            const data = await response.json();

            apiCache.set('location_data', data, 1440); // Cache for 24 hours
            this.render(data);

        } catch (error) {
            console.error('Location API Error:', error);
            this.renderError(error.message);
        }
    }

    render(data) {
        const [lat, lon] = (data.loc || '0,0').split(',');
        this.detailsContainer.innerHTML = `
            <ul class="location-list" style="list-style: none; padding: 0;">
                <li><strong>IP Address:</strong> ${data.ip}</li>
                <li><strong>Location:</strong> ${data.city}, ${data.region}, ${data.country}</li>
                <li><strong>ISP/Org:</strong> ${data.org}</li>
                <li><strong>Timezone:</strong> ${data.timezone}</li>
                <li><strong>Coordinates:</strong> ${lat}, ${lon}</li>
            </ul>
        `;
        const mapUrl = `https://maps.google.com/maps?q=${lat},${lon}&z=14&output=embed`;
        this.mapContainer.innerHTML = `
            <iframe width="100%" height="300" frameborder="0" style="border:0; border-radius: 8px;" src="${mapUrl}" allowfullscreen></iframe>
        `;
    }

    renderError(message) {
        this.detailsContainer.innerHTML = `
            <div class="error-message" style="color: #721c24; background-color: #f8d7da; border-color: #f5c6cb; padding: 1rem; border-radius: 8px;">
                <i class="fas fa-exclamation-triangle"></i> <strong>Error:</strong> ${message}
                <br><br><small>Unable to fetch location data.</small>
            </div>
        `;
        this.mapContainer.innerHTML = '';
    }
}

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
class GitHubProfileAPI {
    constructor() {
        this.container = document.getElementById('github-profile-container');
        this.username = 'markmdagit';
        this.apiUrl = `https://api.github.com/users/${this.username}`;
        this.init();
    }

    async init() {
        const cached = apiCache.get(`github_${this.username}`);
        if (cached) {
            this.render(cached);
            return;
        }

        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                if (response.status === 403) throw new Error('Rate limit exceeded');
                throw new Error('Failed to fetch GitHub profile');
            }
            const data = await response.json();
            apiCache.set(`github_${this.username}`, data, 60);
            this.render(data);
        } catch (error) {
            console.error('Error fetching GitHub profile:', error);
            this.container.innerHTML = `<p style="color: #d73a49; text-align: center;">Failed to load GitHub profile. Please try again later.</p>`;
        }
    }

    render(data) {
        this.container.innerHTML = `
            <div class="github-profile-card">
                <img src="${data.avatar_url}" alt="${data.login}" class="github-avatar">
                <div class="github-info">
                    <div class="github-name">${data.name || data.login}</div>
                    <div class="github-username">${data.login}</div>
                    <div class="github-stats">
                        <div class="github-stat"><strong>${data.public_repos}</strong> repos</div>
                        <div class="github-stat"><strong>${data.followers}</strong> followers</div>
                        <div class="github-stat"><strong>${data.following}</strong> following</div>
                    </div>
                    <a href="${data.html_url}" target="_blank" rel="noopener noreferrer" class="github-link">View GitHub Profile</a>
                </div>
            </div>
        `;
    }
}

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
                    <img src="${thumbUrl}" class="video-thumbnail" alt="${video.title}">
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
class GeminiImageGenerator {
    constructor() {
        this.promptInput = document.getElementById('gemini-prompt');
        this.generateBtn = document.getElementById('generate-gemini-btn');
        this.resultContainer = document.getElementById('gemini-result');
        this.init();
    }

    init() {
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generate());
        }
        // Sample: Auto-generate
        this.promptInput.value = "Futuristic City";
        this.generate("Futuristic City");
    }

    async generate(inputPrompt = null) {
        const prompt = inputPrompt || this.promptInput.value.trim();
        if (!prompt) {
            alert('Please enter a prompt.');
            return;
        }

        const cacheKey = `gemini_${prompt.toLowerCase().replace(/\s/g, '_')}`;
        const cached = apiCache.get(cacheKey);

        if (cached) {
            this.render(cached, prompt);
            return;
        }

        this.resultContainer.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i> Generating image with Gemini 2.5 Flash...
            </div>
        `;

        const keywords = prompt.trim().split(/\s+/).join(',');
        const imageUrl = `https://loremflickr.com/500/300/${encodeURIComponent(keywords)}/all`;

        const img = new Image();
        img.onload = () => {
            const resultData = { imageUrl: imageUrl };
            apiCache.set(cacheKey, resultData, 1440); // Cache image URL
            this.render(resultData, prompt);
        };
        img.onerror = () => {
             this.resultContainer.innerHTML = `
                <div class="error-message" style="color: #d73a49;">
                    <i class="fas fa-exclamation-circle"></i> Failed to generate image. Please try again.
                </div>
            `;
        };
        img.src = imageUrl;
    }

    render(data, prompt) {
        this.resultContainer.innerHTML = `
            <div class="gemini-image-card" style="border: 1px solid #ddd; padding: 10px; border-radius: 8px; background: #f9f9f9; display: inline-block;">
                <img src="${data.imageUrl}" alt="Generated Image" style="max-width: 100%; height: auto; border-radius: 4px;">
                <p style="margin-top: 10px; color: #555; font-size: 0.9rem;">
                    <strong>Prompt:</strong> <span class="gemini-prompt-text"></span>
                </p>
                <div style="font-size: 0.8rem; color: #888; margin-top: 5px;">
                    <i class="fas fa-magic"></i> Generated by Gemini 2.5 Flash (Simulated)
                </div>
            </div>
        `;
        this.resultContainer.querySelector('.gemini-prompt-text').textContent = prompt;
    }
}

/* --- QR Code Generator --- */
class QRCodeGenerator {
    constructor() {
        this.input = document.getElementById('qr-text');
        this.generateBtn = document.getElementById('generate-qr-btn');
        this.resultContainer = document.getElementById('qr-result');
        this.init();
    }

    init() {
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generate());
        }
        // Sample
        const currentUrl = "https://markmdagit.github.io";
        this.input.value = currentUrl;
        this.generate(currentUrl);
    }

    generate(inputText = null) {
        const text = inputText || this.input.value.trim();
        if (!text) {
            alert('Please enter text or a URL.');
            return;
        }

        const cacheKey = `qr_${text.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const cached = apiCache.get(cacheKey);

        if (cached) {
            this.render(cached);
            return;
        }

        this.resultContainer.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i> Generating QR Code...
            </div>
        `;

        const size = '150x150';
        const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(text)}`;

        const img = new Image();
        img.onload = () => {
            const data = { imageUrl: imageUrl };
            apiCache.set(cacheKey, data, 1440);
            this.render(data);
        };
        img.onerror = () => {
            this.resultContainer.innerHTML = '<p style="color: red;">Failed to generate QR Code.</p>';
        };
        img.src = imageUrl;
    }

    render(data) {
        this.resultContainer.innerHTML = `
            <div class="qr-card" style="border: 1px solid #ddd; padding: 10px; border-radius: 8px; background: #fff; display: inline-block;">
                <img src="${data.imageUrl}" alt="QR Code" style="width: 150px; height: 150px;">
                <p style="margin-top: 10px; color: #555; font-size: 0.9rem;">Scan to view content</p>
            </div>
        `;
    }
}

/* --- Dictionary API --- */
class DictionaryAPI {
    constructor() {
        this.input = document.getElementById('dictionary-word');
        this.searchBtn = document.getElementById('search-dictionary-btn');
        this.resultContainer = document.getElementById('dictionary-result');
        this.errorContainer = document.getElementById('dictionary-error');
        this.defEl = document.getElementById('dict-definition');
        this.exEl = document.getElementById('dict-example');
        this.synEl = document.getElementById('dict-synonyms');
        this.antEl = document.getElementById('dict-antonyms');
        this.init();
    }

    init() {
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.search());
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.search();
            });
        }
        // Sample
        this.input.value = "Technology";
        this.search("Technology");
    }

    async search(inputWord = null) {
        const word = (inputWord || this.input.value).trim();
        if (!word) {
            alert('Please enter a word.');
            return;
        }

        const cacheKey = `dict_${word.toLowerCase()}`;
        const cached = apiCache.get(cacheKey);

        if (cached) {
            this.render(cached);
            return;
        }

        this.resultContainer.style.display = 'none';
        this.errorContainer.style.display = 'none';
        const originalBtnText = this.searchBtn.textContent;
        this.searchBtn.textContent = 'Searching...';
        this.searchBtn.disabled = true;

        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

            if (!response.ok) {
                if (response.status === 404) throw new Error('Word not found.');
                throw new Error('Failed to fetch definition.');
            }

            const data = await response.json();
            apiCache.set(cacheKey, data, 1440); // Cache for 24 hours
            this.render(data);
        } catch (error) {
            this.errorContainer.textContent = error.message;
            this.errorContainer.style.display = 'block';
        } finally {
            this.searchBtn.textContent = originalBtnText;
            this.searchBtn.disabled = false;
        }
    }

    render(data) {
        const entry = data[0];
        let definition = null;
        let example = null;
        let allSynonyms = new Set();
        let allAntonyms = new Set();

        for (const meaning of entry.meanings) {
            if (meaning.synonyms) meaning.synonyms.forEach(s => allSynonyms.add(s));
            if (meaning.antonyms) meaning.antonyms.forEach(a => allAntonyms.add(a));
            for (const def of meaning.definitions) {
                if (!definition) definition = def.definition;
                if (!example && def.example) example = def.example;
                if (def.synonyms) def.synonyms.forEach(s => allSynonyms.add(s));
                if (def.antonyms) def.antonyms.forEach(a => allAntonyms.add(a));
            }
        }

        this.defEl.textContent = definition || 'N/A';
        this.exEl.textContent = example || 'N/A';
        const synonymsArray = Array.from(allSynonyms);
        const antonymsArray = Array.from(allAntonyms);
        this.synEl.textContent = synonymsArray.length > 0 ? synonymsArray.slice(0, 5).join(', ') : 'N/A';
        this.antEl.textContent = antonymsArray.length > 0 ? antonymsArray.slice(0, 5).join(', ') : 'N/A';
        this.resultContainer.style.display = 'block';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new LinkedInProfileAPI();
    new GitHubProfileAPI();
    new YouTubeTracker();
    new StockTracker();
    new CommodityTracker();
    new MemeGenerator();
    new ESPNGameTracker();
    new WeatherTracker();
    new LocationTracker();
    new GoogleCalendarTracker();
    new TechyTextGenerator();
    new GeminiImageGenerator();
    new QRCodeGenerator();
    new DictionaryAPI();
});
