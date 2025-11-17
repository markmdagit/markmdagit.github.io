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
    if (document.getElementById("accessories")) {
        loadAccessories();
    }
    initInfographic();
});

function createAccessoryCard(container, item) {
    const card = document.createElement('div');
    card.className = 'laptop-card';

    const title = document.createElement('h3');
    title.textContent = item.model;
    card.appendChild(title);

    if (item.part_number) {
        const specDiv = document.createElement('div');
        specDiv.className = 'spec';
        specDiv.innerHTML = `<span class="spec-key">Part Number:</span><span class="spec-value">${item.part_number}</span>`;
        card.appendChild(specDiv);
    }

    if (item.description) {
        const specDiv = document.createElement('div');
        specDiv.className = 'spec';
        specDiv.style.alignItems = 'flex-start';
        specDiv.innerHTML = `<span class="spec-key">Description:</span><span class="spec-value">${item.description}</span>`;
        card.appendChild(specDiv);
    }

    container.appendChild(card);
}

function loadAccessories() {
    const accessoriesContainer = document.getElementById("accessories");
    if (!accessoriesContainer) return;

    fetchData("/data/accessories.json")
        .then(data => {
            // Clear container in case of re-population
            accessoriesContainer.innerHTML = '';

            const mainTitle = document.createElement('h2');
            mainTitle.className = 'section-title';
            mainTitle.textContent = 'Laptop Accessories';
            accessoriesContainer.appendChild(mainTitle);

            for (const productLine in data) {
                const productLineTitle = document.createElement('h3');
                productLineTitle.className = 'section-title';
                productLineTitle.textContent = productLine;
                accessoriesContainer.appendChild(productLineTitle);

                const categories = data[productLine];
                for (const category in categories) {
                    const categoryTitle = document.createElement('h4');
                    categoryTitle.className = 'section-title';
                    categoryTitle.textContent = category;
                    accessoriesContainer.appendChild(categoryTitle);

                    const cardGrid = document.createElement('div');
                    cardGrid.className = 'card-grid';

                    categories[category].forEach(item => {
                        createAccessoryCard(cardGrid, item);
                    });

                    accessoriesContainer.appendChild(cardGrid);
                }
            }
        })
        .catch(error => console.error("Error fetching or creating accessory cards:", error));
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
