async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
    }
    return response.json();
}

function createTable(container, data, headers) {
    if (!container || !data || data.length === 0) {
        return;
    }

    let table = container.querySelector('table');
    if (!table) {
        table = document.createElement("table");
        table.classList.add("table", "table-striped", "table-bordered");
    }

    let thead = table.querySelector('thead');
    if (!thead) {
        thead = document.createElement("thead");
    }

    const headerRow = document.createElement("tr");
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.replaceChildren(headerRow);

    let tbody = table.querySelector('tbody');
    if (!tbody) {
        tbody = document.createElement("tbody");
    }

    const rows = data.map(item => {
        const row = document.createElement("tr");
        headers.forEach(header => {
            const cell = document.createElement("td");
            cell.textContent = String(item[header] || '');
            row.appendChild(cell);
        });
        return row;
    });
    tbody.replaceChildren(...rows);

    table.replaceChildren(thead, tbody);
    container.replaceChildren(table);
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

        const title = document.createElement('h3');
        title.textContent = p.name || 'Project';
        card.appendChild(title);

        if (p.description) {
            const desc = document.createElement('p');
            desc.textContent = p.description;
            card.appendChild(desc);
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
