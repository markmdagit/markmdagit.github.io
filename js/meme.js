
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
