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

    const table = document.createElement("table");
    table.classList.add("table", "table-striped", "table-bordered");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.forEach(item => {
        const row = document.createElement("tr");
        headers.forEach(header => {
            const cell = document.createElement("td");
            cell.textContent = String(item[header] || '');
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    container.innerHTML = ''; // Clear any previous content
    container.appendChild(table);
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
    initInfographic();
    loadProjects();
});

function initInfographic() {
    const timelineDots = document.querySelectorAll(".timeline-dot");
    const stories = document.querySelectorAll(".story");

    if (timelineDots.length === 0) return;

    // Set the first dot and story as active by default
    timelineDots[0].classList.add("active");
    stories[0].classList.add("active");

    timelineDots.forEach(dot => {
        dot.addEventListener("click", () => {
            const storyId = dot.dataset.story;
            const story = document.getElementById(storyId);

            timelineDots.forEach(d => d.classList.remove("active"));
            stories.forEach(s => s.classList.remove("active"));

            dot.classList.add("active");
            story.classList.add("active");
        });
    });
}

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
