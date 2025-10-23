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
});

function loadSupplyChainData() {
    const elitebookSupplyChainContainer = document.getElementById("elitebook-supply-chain-cards");
    const zbookSupplyChainContainer = document.getElementById("zbook-supply-chain-cards");
    const loadingIndicator = document.querySelector("#supply-chain .loading-indicator");

    if (elitebookSupplyChainContainer && zbookSupplyChainContainer && !elitebookSupplyChainContainer.dataset.loaded) {
        elitebookSupplyChainContainer.dataset.loaded = "true";
        zbookSupplyChainContainer.dataset.loaded = "true";
        loadingIndicator.style.display = 'block';
        fetchData("/data/supply_chain.json")
            .then(data => {
                loadingIndicator.style.display = 'none';
                const elitebookSupplyData = data.filter(item => item["Model Series"] === "Elitebook");
                const zbookSupplyData = data.filter(item => item["Model Series"] === "Zbook Studio");

                elitebookSupplyData.forEach(item => createSupplyChainCard(elitebookSupplyChainContainer, item));
                zbookSupplyData.forEach(item => createSupplyChainCard(zbookSupplyChainContainer, item));
            })
            .catch(error => {
                loadingIndicator.textContent = "Error loading data.";
                console.error("Error fetching or creating supply chain cards:", error)
            });
    }
}

function createSupplyChainCard(container, item) {
    const card = document.createElement('div');
    card.className = 'laptop-card';

    const title = document.createElement('h3');
    title.textContent = `${item["Model Series"]} ${item["Generation"]}`;
    card.appendChild(title);

    // Maps for Assembly Location(s)
    if (Array.isArray(item["Typical Final Assembly Location(s)"]) && item["Typical Final Assembly Location(s)"].length > 0) {
        const specDiv = document.createElement('div');
        specDiv.className = 'spec';

        const keySpan = document.createElement('span');
        keySpan.className = 'spec-key';
        keySpan.textContent = 'Assembly Location(s):';
        specDiv.appendChild(keySpan);
        card.appendChild(specDiv);

        item["Typical Final Assembly Location(s)"].forEach(location => {
            if (location.map_url) {
                const mapContainer = document.createElement('div');
                mapContainer.className = 'map-container';

                const locationTitle = document.createElement('h4');
                locationTitle.className = 'map-title';
                locationTitle.textContent = location.name;
                mapContainer.appendChild(locationTitle);

                const iframe = document.createElement('iframe');
                iframe.src = location.map_url;
                iframe.width = '100%';
                iframe.height = '250';
                iframe.style.border = 0;
                iframe.allowFullscreen = true;
                iframe.loading = 'lazy';
                iframe.title = `Map of ${location.name}`;

                mapContainer.appendChild(iframe);
                card.appendChild(mapContainer);
            }
        });
    }

    // Text links for Assembly Partners (ODMs)
    if (Array.isArray(item["Primary Assembly Partners (ODMs)"]) && item["Primary Assembly Partners (ODMs)"].length > 0) {
        const specDiv = document.createElement('div');
        specDiv.className = 'spec';

        const keySpan = document.createElement('span');
        keySpan.className = 'spec-key';
        keySpan.textContent = 'Assembly Partners (ODMs):';
        specDiv.appendChild(keySpan);

        const valueSpan = document.createElement('span');
        valueSpan.className = 'spec-value';

        item["Primary Assembly Partners (ODMs)"].forEach((partner, index) => {
            if (partner.map_url && partner.name) {
                const partnerLink = document.createElement('a');
                partnerLink.href = partner.map_url;
                partnerLink.target = '_blank';
                partnerLink.rel = 'noopener noreferrer';
                partnerLink.textContent = partner.name;

                valueSpan.appendChild(partnerLink);

                // Add a separator if it's not the last item
                if (index < item["Primary Assembly Partners (ODMs)"].length - 1) {
                    const separator = document.createTextNode(', ');
                    valueSpan.appendChild(separator);
                }
            }
        });

        specDiv.appendChild(valueSpan);
        card.appendChild(specDiv);
    }

    // Infographic for Notes & Context
    if (item["Notes & Context"]) {
        const specDiv = document.createElement('div');
        specDiv.className = 'spec';

        const keySpan = document.createElement('span');
        keySpan.className = 'spec-key';
        keySpan.textContent = 'Notes & Context:';
        specDiv.appendChild(keySpan);

        const valueDiv = document.createElement('div');
        valueDiv.className = 'spec-value-context';

        const text = item["Notes & Context"];
        let iconClass = '';

        if (text.toLowerCase().includes('pandemic')) {
            iconClass = 'fas fa-virus';
        } else if (text.toLowerCase().includes('diversify') || text.toLowerCase().includes('diversification')) {
            iconClass = 'fas fa-sitemap';
        } else if (text.toLowerCase().includes('china +1')) {
            iconClass = 'fas fa-plus-circle';
        } else if (text.toLowerCase().includes('tariffs')) {
            iconClass = 'fas fa-file-invoice-dollar';
        } else if (text.toLowerCase().includes('largest laptop manufacturing base')) {
            iconClass = 'fas fa-industry';
        }

        if (iconClass) {
            const icon = document.createElement('i');
            icon.className = iconClass + ' context-icon';
            valueDiv.appendChild(icon);
        }

        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        valueDiv.appendChild(textSpan);

        specDiv.appendChild(valueDiv);
        card.appendChild(specDiv);
    }

    container.appendChild(card);
}

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
    if (!accessoriesContainer || accessoriesContainer.dataset.loaded) return;

    accessoriesContainer.dataset.loaded = "true";
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

function createW10Card(item) {
    const imageHTML = item.image_url ? `<img src="${item.image_url}" alt="${item.name}" class="card-logo">` : '';
    return `
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="laptop-card">
            ${imageHTML}
            <h3>${item.name}</h3>
            <p>${item.description}</p>
        </a>
    `;
}

function loadW10Incompatible() {
    const container = document.getElementById('w10-incompatible-cards');
    const loadingIndicator = document.querySelector("#w10-incompatible .loading-indicator");
    if (!container || container.dataset.loaded) return;

    container.dataset.loaded = "true";
    loadingIndicator.style.display = 'block';
    fetchData('/data/w10_incompatible.json')
        .then(data => {
            loadingIndicator.style.display = 'none';
            if (container) {
                container.innerHTML = ''; // Clear existing content
                for (const category in data) {
                    const categoryContainer = document.createElement('div');

                    const categoryTitle = document.createElement('h3');
                    categoryTitle.className = 'section-title';
                    categoryTitle.textContent = category;
                    categoryContainer.appendChild(categoryTitle);

                    const cardGrid = document.createElement('div');
                    cardGrid.className = 'card-grid';
                    cardGrid.innerHTML = data[category].map(createW10Card).join('');
                    categoryContainer.appendChild(cardGrid);

                    container.appendChild(categoryContainer);
                }
            }
        })
        .catch(error => {
            loadingIndicator.textContent = "Error loading data.";
            console.error('Error loading W10 incompatible solutions data:', error)
        });
}