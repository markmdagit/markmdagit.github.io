async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
    }
    return response.json();
}

function setActiveNav() {
    const navLinks = document.querySelectorAll('nav a');
    const currentPage = window.location.pathname.split('/').pop();

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

let projectsCache = null;
let projectsFetchPromise = null;

document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    loadProjects();
    initAudioLog();
});

async function loadProjects() {
    const carousel = document.getElementById('projects-carousel');
    if (!carousel) return;

    if (projectsCache) {
        renderProjects(carousel, projectsCache);
        return;
    }

    if (projectsFetchPromise) {
        try {
            const projects = await projectsFetchPromise;
            renderProjects(carousel, projects);
        } catch (error) {
            console.error("Error waiting for projects:", error);
        }
        return;
    }

    try {
        projectsFetchPromise = fetchData('../data/projects.json');
        const projects = await projectsFetchPromise;
        projectsCache = projects;
        renderProjects(carousel, projects);
    } catch (error) {
        console.error("Error loading projects:", error);
        projectsFetchPromise = null;
    }
}

function renderProjects(container, projects) {
    container.innerHTML = '';
    if (!projects || projects.length === 0) return;

    // Use a grid layout if possible, similar to other sections
    if (!container.classList.contains('card-grid')) {
        container.classList.add('card-grid');
    }

    projects.forEach(p => {
        const card = document.createElement('div');
        card.classList.add('skill-card'); // Reusing skill-card for consistent styling

        // Wrap content in link if URL exists
        let contentWrapper = card;
        if (p.url) {
            const link = document.createElement('a');
            link.href = p.url;
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';
            link.style.display = 'block';
            card.appendChild(link);
            contentWrapper = link;
        }

        const title = document.createElement('h3');
        title.textContent = p.name || 'Project';
        contentWrapper.appendChild(title);

        if (p.description) {
            const desc = document.createElement('p');
            desc.textContent = p.description;
            contentWrapper.appendChild(desc);
        }

        container.appendChild(card);
    });
}

const AUDIO_LOG_SUMMARY = "Welcome to the portfolio of Marcos Alvarez, an IT Support Professional with over 8 years of experience at Amazon. Marcos specializes in troubleshooting, network infrastructure, and asset management. His core competencies include CompTIA certifications and proficiency in languages like Java, Python, and SQL. Currently pursuing a Bachelor's in Computer Engineering, Marcos has a strong track record in improving operational efficiency, such as reducing network troubleshooting time by 30%. Explore his projects including API integrations and GraphQL experiments.";

function initAudioLog() {
    const playButton = document.getElementById('play-audio-log');
    if (!playButton) return;

    if (!('speechSynthesis' in window)) {
        playButton.style.display = 'none';
        return;
    }

    let isPlaying = false;

    playButton.addEventListener('click', () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            isPlaying = false;
            playButton.innerHTML = '<i class="fas fa-volume-up"></i> Play Audio Log';
        } else {
            const utterance = new SpeechSynthesisUtterance(AUDIO_LOG_SUMMARY);
            utterance.onend = () => {
                isPlaying = false;
                playButton.innerHTML = '<i class="fas fa-volume-up"></i> Play Audio Log';
            };
            utterance.onerror = () => {
                 isPlaying = false;
                 playButton.innerHTML = '<i class="fas fa-volume-up"></i> Play Audio Log';
            }
            window.speechSynthesis.speak(utterance);
            isPlaying = true;
            playButton.innerHTML = '<i class="fas fa-stop"></i> Stop Audio Log';
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const elitebookSupplyChainContainer = document.getElementById("elitebook-supply-chain-cards");
    const zbookSupplyChainContainer = document.getElementById("zbook-supply-chain-cards");
    if (elitebookSupplyChainContainer && zbookSupplyChainContainer) {
        fetchData("../data/supply_chain.json")
            .then(data => {
                const elitebookSupplyData = data.filter(item => item["Model Series"] === "Elitebook");
                const zbookSupplyData = data.filter(item => item["Model Series"] === "Zbook Studio");

                elitebookSupplyData.forEach(item => createSupplyChainCard(elitebookSupplyChainContainer, item));
                zbookSupplyData.forEach(item => createSupplyChainCard(zbookSupplyChainContainer, item));
            })
            .catch(error => console.error("Error fetching or creating supply chain cards:", error));
    }
});

function createSupplyChainCard(container, item) {
    const card = document.createElement('div');
    card.className = 'laptop-card'; // Re-use laptop-card styling

    const title = document.createElement('h3');
    title.textContent = `${item["Model Series"]} ${item["Generation"]}`;
    card.appendChild(title);

    const specsToShow = {
        "Assembly Location(s)": item["Typical Final Assembly Location(s)"],
        "Assembly Partners (ODMs)": item["Primary Assembly Partners (ODMs)"],
        "Notes & Context": item["Notes & Context"]
    };

    for (const [key, value] of Object.entries(specsToShow)) {
        if (value) {
            const specDiv = document.createElement('div');
            specDiv.className = 'spec';

            const keySpan = document.createElement('span');
            keySpan.className = 'spec-key';
            keySpan.textContent = key + ':';
            specDiv.appendChild(keySpan);

            const valueSpan = document.createElement('span');
            valueSpan.className = 'spec-value';

            if (key === "Assembly Partners (ODMs)" && Array.isArray(value)) {
                valueSpan.textContent = value.map(partner => partner.name).join(', ');
            } else if (key === "Assembly Location(s)" && Array.isArray(value)) {
                valueSpan.textContent = value.map(loc => loc.name).join(', ');
            } else {
                valueSpan.textContent = value;
            }

            specDiv.appendChild(valueSpan);
            card.appendChild(specDiv);

            if (key === "Assembly Partners (ODMs)" && Array.isArray(value)) {
                value.forEach(partner => {
                    if (partner.map_url) {
                        const mapContainer = document.createElement('div');
                        mapContainer.className = 'map-container';

                        const iframe = document.createElement('iframe');
                        iframe.src = partner.map_url;
                        iframe.width = '100%';
                        iframe.height = '250';
                        iframe.style.border = 0;
                        iframe.allowFullscreen = true;
                        iframe.loading = 'lazy';
                        iframe.title = `Map of ${partner.name} headquarters`;

                        mapContainer.appendChild(iframe);
                        card.appendChild(mapContainer);
                    }
                });
            }
        }
    }
    container.appendChild(card);
}
