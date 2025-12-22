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

document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    initInfographic();
    loadProjects();
});

async function loadProjects() {
    const carousel = document.getElementById('projects-carousel');
    if (!carousel) return;

    try {
        const projects = await fetchData('../data/projects.json');

        // Clear any existing content
        carousel.innerHTML = '';

        if (projects.length === 0) {
            carousel.innerHTML = '<li class="no-projects">Projects content coming soon.</li>';
            return;
        }

        projects.forEach(project => {
            const li = document.createElement('li');
            li.className = 'project-card';

            // Create technologies HTML
            const technologiesHtml = project.technologies
                .map(tech => `<span class="tag">${tech}</span>`)
                .join('');

            li.innerHTML = `
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-technologies">
                    ${technologiesHtml}
                </div>
            `;

            carousel.appendChild(li);
        });

    } catch (error) {
        console.error('Error loading projects:', error);
        carousel.innerHTML = '<p>Error loading projects. Please try again later.</p>';
    }
}

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
