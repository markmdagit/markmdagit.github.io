
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

// Initialize new trackers
document.addEventListener('DOMContentLoaded', () => {
    new YouTubeTracker();
    new StockTracker();
    new CommodityTracker();
});
