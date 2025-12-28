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

document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    initInfographic();
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
