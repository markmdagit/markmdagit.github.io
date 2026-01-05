
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
            this.generateBtn.addEventListener('click', () => this.fetchText());
        }
        // Initial fetch
        this.fetchText();
    }

    async fetchText() {
        this.output.textContent = 'Loading...';
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) throw new Error('Failed to fetch text');
            const text = await response.text();
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

class MemeAPI {
    constructor() {
        this.apiUrl = 'https://api.imgflip.com/get_memes';
        this.memes = [];
    }

    async fetchTemplates() {
        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();
            if (data.success) {
                this.memes = data.data.memes;
                return this.memes;
            } else {
                console.error('Failed to load memes');
                return [];
            }
        } catch (error) {
            console.error('Error fetching memes:', error);
            return [];
        }
    }

    getMemeById(id) {
        return this.memes.find(meme => meme.id === id);
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

        this.init();
    }

    async init() {
        const templates = await this.api.fetchTemplates();
        this.populateDropdown(templates);

        this.generateBtn.addEventListener('click', () => this.generate());
        this.templateSelect.addEventListener('change', () => this.loadTemplate());
        this.downloadBtn.addEventListener('click', () => this.download());

        // Initial load
        if (templates.length > 0) {
             this.templateSelect.value = templates[0].id;
             this.loadTemplate();
        }
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

    loadTemplate() {
        const id = this.templateSelect.value;
        const meme = this.api.getMemeById(id);

        if (meme) {
            this.previewText.style.display = 'none';
            this.currentImage = new Image();
            this.currentImage.crossOrigin = "Anonymous"; // Crucial for canvas export
            this.currentImage.src = meme.url;

            this.currentImage.onload = () => {
                // Resize canvas to fit image, but limit max width for display
                const maxWidth = 500;
                const scale = Math.min(1, maxWidth / this.currentImage.width);

                this.canvas.width = this.currentImage.width * scale;
                this.canvas.height = this.currentImage.height * scale;

                this.generate(); // Render initial state
            };
        }
    }

    generate() {
        if (!this.currentImage) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Image
        this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);

        // Text Settings
        const fontSize = this.canvas.width * 0.1; // Dynamic font size
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
        // Simple word wrap or shrinking could be added here,
        // but for now standard stroke/fill
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new MemeGenerator();
});

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
        // Simulate network delay
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

            document.getElementById('calendar-signin-btn').addEventListener('click', () => {
                this.signIn();
            });
        } else {
            this.renderEvents();
        }
    }

    signIn() {
        // Simulate auth flow
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
        // Mock Data
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

        document.getElementById('calendar-signout-btn').addEventListener('click', () => {
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
        this.apiUrl = 'https://ipinfo.io/json?token=YOUR_TOKEN_HERE'; // Free tier works without token for limited requests, but better with one.
        // Note: For this demo, we'll try without a token first, or rely on limited free access.
        // In a real app, you should proxy this or use a token.
        // Since I don't have a token, I'll use the public endpoint which is rate limited but works for simple testing.
        this.apiUrl = 'https://ipinfo.io/json';

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch location data');
            }
            const data = await response.json();

            this.render(data);

        } catch (error) {
            console.error('Location API Error:', error);
            this.renderError(error.message);
        }
    }

    render(data) {
        // ipinfo returns loc as "lat,lon" string
        const [lat, lon] = (data.loc || '0,0').split(',');

        // Render Details
        this.detailsContainer.innerHTML = `
            <ul class="location-list" style="list-style: none; padding: 0;">
                <li><strong>IP Address:</strong> ${data.ip}</li>
                <li><strong>Location:</strong> ${data.city}, ${data.region}, ${data.country}</li>
                <li><strong>ISP/Org:</strong> ${data.org}</li>
                <li><strong>Timezone:</strong> ${data.timezone}</li>
                <li><strong>Coordinates:</strong> ${lat}, ${lon}</li>
            </ul>
        `;

        // Render Map
        const mapUrl = `https://maps.google.com/maps?q=${lat},${lon}&z=14&output=embed`;

        this.mapContainer.innerHTML = `
            <iframe
                width="100%"
                height="300"
                frameborder="0"
                style="border:0; border-radius: 8px;"
                src="${mapUrl}"
                allowfullscreen>
            </iframe>
        `;
    }

    renderError(message) {
        this.detailsContainer.innerHTML = `
            <div class="error-message" style="color: #721c24; background-color: #f8d7da; border-color: #f5c6cb; padding: 1rem; border-radius: 8px;">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Error:</strong> ${message}
                <br><br>
                <small>Unable to fetch location data. Valid API token may be required.</small>
            </div>
        `;
        this.mapContainer.innerHTML = '';
    }
}

/* --- Weather Tracker --- */
class WeatherTracker {
    constructor() {
        this.apiKey = 'YOUR_OPENWEATHER_API_KEY'; // Placeholder for security
        this.locationInput = document.getElementById('weather-location');
        this.getWeatherBtn = document.getElementById('get-weather-btn');
        this.displayContainer = document.getElementById('weather-display');

        this.init();
    }

    init() {
        if (this.getWeatherBtn) {
            this.getWeatherBtn.addEventListener('click', () => {
                const location = this.locationInput.value.trim();
                if (location) {
                    this.fetchForecast(location);
                } else {
                    alert('Please enter a location.');
                }
            });

            // Also allow Enter key
            this.locationInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const location = this.locationInput.value.trim();
                    if (location) {
                        this.fetchForecast(location);
                    }
                }
            });
        }
    }

    async fetchForecast(location) {
        this.displayContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Fetching forecast...</div>';

        // Check for real API key vs placeholder
        if (this.apiKey === 'YOUR_OPENWEATHER_API_KEY') {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            this.mockForecast(location);
        } else {
            // Real API implementation (Conceptual - would require valid key)
            try {
                // 1. Geocoding API to get Lat/Lon
                const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${this.apiKey}`);
                if (!geoResponse.ok) throw new Error('Location not found');
                const geoData = await geoResponse.json();

                if (geoData.length === 0) throw new Error('Location not found');

                const { lat, lon, name } = geoData[0];

                // 2. One Call API for 7-day forecast
                const weatherResponse = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=imperial&appid=${this.apiKey}`);
                if (!weatherResponse.ok) throw new Error('Failed to fetch weather');
                const weatherData = await weatherResponse.json();

                this.render(weatherData.daily, name);

            } catch (error) {
                console.warn('Weather API Error (falling back to mock):', error);
                this.mockForecast(location);
            }
        }
    }

    mockForecast(location) {
        // Generate dates for the next 7 days
        const days = [];
        const today = new Date();
        const conditions = ['Sunny', 'Cloudy', 'Rain', 'Partly Cloudy', 'Thunderstorm', 'Snow', 'Clear'];
        const icons = ['fa-sun', 'fa-cloud', 'fa-cloud-rain', 'fa-cloud-sun', 'fa-bolt', 'fa-snowflake', 'fa-moon'];

        // Normalize input for display
        const displayLocation = location.charAt(0).toUpperCase() + location.slice(1);

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Random realistic temperatures
            const maxTemp = Math.floor(Math.random() * (85 - 60 + 1)) + 60;
            const minTemp = maxTemp - Math.floor(Math.random() * 15 + 10);

            // Random condition
            const randIdx = Math.floor(Math.random() * conditions.length);

            days.push({
                dt: Math.floor(date.getTime() / 1000),
                temp: { max: maxTemp, min: minTemp },
                weather: [{ main: conditions[randIdx], description: conditions[randIdx], iconClass: icons[randIdx] }]
            });
        }

        this.render(days, displayLocation, true);
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

            // Determine icon (mock uses FontAwesome classes, real API uses icon codes)
            let iconHtml;
            if (day.weather[0].iconClass) {
                 iconHtml = `<i class="fas ${day.weather[0].iconClass} weather-icon"></i>`;
            } else {
                 // Map OpenWeather icons to FontAwesome or use image
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
                <div class="weather-icon-container" style="font-size: 2rem; color: #004A99; margin-bottom: 0.5rem;">
                    ${iconHtml}
                </div>
                <div class="weather-temps" style="font-size: 1.1rem;">
                    <span class="high-temp" style="font-weight: bold;">${Math.round(day.temp.max)}°</span> /
                    <span class="low-temp" style="color: #6c757d;">${Math.round(day.temp.min)}°</span>
                </div>
                <div class="weather-desc" style="font-size: 0.9rem; margin-top: 0.5rem; text-transform: capitalize;">
                    ${day.weather[0].description}
                </div>
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
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Rate limit exceeded');
                }
                throw new Error('Failed to fetch GitHub profile');
            }
            const data = await response.json();
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
                        <div class="github-stat">
                            <strong>${data.public_repos}</strong> repos
                        </div>
                        <div class="github-stat">
                            <strong>${data.followers}</strong> followers
                        </div>
                        <div class="github-stat">
                            <strong>${data.following}</strong> following
                        </div>
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
        this.cardWidth = 270; // 250px width + 20px gap

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
        this.prevBtn.addEventListener('click', () => this.scroll(-1));
        this.nextBtn.addEventListener('click', () => this.scroll(1));

        // Auto-scroll loop
        setInterval(() => {
            this.scroll(1);
        }, 3000);
    }

    render() {
        this.track.innerHTML = '';
        this.videos.forEach((video) => {
            const card = document.createElement('div');
            card.className = 'video-card';

            // Use standard YouTube max quality thumbnail
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

        // Calculate max scroll
        const containerWidth = document.querySelector('.youtube-carousel').offsetWidth;
        this.maxScroll = (this.videos.length * this.cardWidth) - containerWidth;
    }

    scroll(direction) {
        const containerWidth = document.querySelector('.youtube-carousel').offsetWidth;
        this.maxScroll = Math.max(0, (this.videos.length * this.cardWidth) - containerWidth);

        this.scrollAmount += direction * this.cardWidth;

        // Loop handling
        if (this.scrollAmount > this.maxScroll) {
            this.scrollAmount = 0; // Reset to start
        } else if (this.scrollAmount < 0) {
            this.scrollAmount = this.maxScroll; // Go to end
        }

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
        // Simulate live updates
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
            // Random fluctuation between -0.5 and +0.5
            const fluctuation = (Math.random() - 0.5);
            let newPrice = stock.price + fluctuation;
            let newChange = stock.change + (fluctuation * 10); // Exaggerate change % for demo

            return {
                ...stock,
                price: newPrice,
                change: newChange
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

    init() {
        this.render();
    }

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
        try {
            const promises = this.leagues.map(l => this.fetchLeagueData(l));
            const results = await Promise.all(promises);
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
            return {
                ...leagueInfo,
                events: data.events || []
            };
        } catch (error) {
            console.warn(`Error fetching ${leagueInfo.name}:`, error);
            return {
                ...leagueInfo,
                events: []
            };
        }
    }

    renderAll(results) {
        this.container.innerHTML = '';
        const sections = {};

        // Group by section
        results.forEach(result => {
            if (!sections[result.section]) {
                sections[result.section] = [];
            }
            sections[result.section].push(...result.events);
        });

        const sectionOrder = [
            'Football (NFL & NCAA)',
            'Baseball (MLB & NCAA)',
            'Basketball (NBA & NCAA)',
            'Hockey (NHL & NCAA)'
        ];

        sectionOrder.forEach(sectionTitle => {
            const events = sections[sectionTitle] || [];

            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'sport-section';
            sectionDiv.style.marginBottom = '1rem';
            sectionDiv.style.border = '1px solid #dee2e6';
            sectionDiv.style.borderRadius = '8px';
            sectionDiv.style.overflow = 'hidden';

            // Collapsible Header
            const header = document.createElement('div');
            header.className = 'section-header';
            header.style.padding = '1rem';
            header.style.background = '#f8f9fa';
            header.style.cursor = 'pointer';
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.userSelect = 'none';

            const title = document.createElement('h4');
            title.textContent = sectionTitle;
            title.style.margin = '0';
            title.style.color = '#212529';
            title.style.fontSize = '1.1rem';

            const icon = document.createElement('i');
            icon.className = 'fas fa-chevron-down';
            icon.style.transition = 'transform 0.3s ease';

            header.appendChild(title);
            header.appendChild(icon);
            sectionDiv.appendChild(header);

            // Collapsible Content
            const contentDiv = document.createElement('div');
            contentDiv.className = 'section-content';
            contentDiv.style.display = 'none'; // Default to collapsed
            contentDiv.style.padding = '1rem';
            contentDiv.style.borderTop = '1px solid #dee2e6';

            if (events.length === 0) {
                const p = document.createElement('p');
                p.textContent = 'No active games scheduled today.';
                p.style.margin = '0';
                p.style.color = '#6c757d';
                contentDiv.appendChild(p);
            } else {
                const grid = document.createElement('div');
                grid.className = 'games-grid';

                events.forEach(event => {
                    const card = this.createGameCard(event);
                    grid.appendChild(card);
                });
                contentDiv.appendChild(grid);
            }

            sectionDiv.appendChild(contentDiv);
            this.container.appendChild(sectionDiv);

            // Event Listener for Toggle
            header.addEventListener('click', () => {
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

        // Handle status description
        let status = event.status.type.detail;
        if (!status) {
                status = event.status.type.description;
        }

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

// Initialize new trackers
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
});
