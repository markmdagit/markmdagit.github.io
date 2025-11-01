document.addEventListener('DOMContentLoaded', function() {
    const computersBtn = document.getElementById('computers-btn');
    const computerOptions = document.getElementById('computer-options');
    const computerButtons = [
        document.getElementById('laptops-btn'),
        document.getElementById('supply-chain-btn'),
        document.getElementById('w10-incompatible-btn')
    ];
    const computerSections = [
        document.getElementById('laptops'),
        document.getElementById('supply-chain'),
        document.getElementById('w10-incompatible')
    ];

    const adminBtn = document.getElementById('admin-btn');
    const adminOptions = document.getElementById('admin-options');
    const adminButtons = [
        document.getElementById('calendar-btn'),
        document.getElementById('income-manager-btn'),
        document.getElementById('payroll-report-btn')
    ];
    const adminSections = [
        document.getElementById('calendar-view'),
        document.getElementById('income-manager'),
        document.getElementById('payroll-report')
    ];

    const funStuffBtn = document.getElementById('fun-stuff-btn');
    const funStuffOptions = document.getElementById('fun-stuff-options');
    const funStuffButtons = [
        document.getElementById('game-btn'),
        document.getElementById('youtube-playlist-btn'),
        document.getElementById('vst-search-btn')
    ];
    const funStuffSections = [
        document.getElementById('game'),
        document.getElementById('youtube-playlist'),
        document.getElementById('vst-search')
    ];

    function setupDropdown(btn, options, ...otherOptions) {
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const isDisplayed = options.style.display !== 'none';
            otherOptions.forEach(opt => opt.style.display = 'none');
            options.style.display = isDisplayed ? 'none' : 'block';
        });
    }

    function setupMenu(buttons, sections, allSections) {
        buttons.forEach((button, index) => {
            button.addEventListener('click', () => {
                allSections.forEach(section => section.style.display = 'none');
                sections[index].style.display = 'block';
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                button.closest('.dropdown-menu').style.display = 'none';

                if (button.id === 'laptops-btn') {
                    loadAccessories();
                } else if (button.id === 'supply-chain-btn') {
                    loadSupplyChainData();
                } else if (button.id === 'w10-incompatible-btn') {
                    loadW10Incompatible();
                }
            });
        });
    }

    const allSections = [...computerSections, ...adminSections, ...funStuffSections];

    setupDropdown(computersBtn, computerOptions, adminOptions, funStuffOptions);
    setupDropdown(adminBtn, adminOptions, computerOptions, funStuffOptions);
    setupDropdown(funStuffBtn, funStuffOptions, computerOptions, adminOptions);
    setupMenu(computerButtons, computerSections, allSections);
    setupMenu(adminButtons, adminSections, allSections);
    setupMenu(funStuffButtons, funStuffSections, allSections);

    window.addEventListener('click', function(event) {
        if (!computersBtn.contains(event.target)) {
            computerOptions.style.display = 'none';
        }
        if (!adminBtn.contains(event.target)) {
            adminOptions.style.display = 'none';
        }
        if (!funStuffBtn.contains(event.target)) {
            funStuffOptions.style.display = 'none';
        }
    });
});

function createW10Card(item) {
    const cardLink = document.createElement('a');
    cardLink.href = item.url;
    cardLink.target = '_blank';
    cardLink.rel = 'noopener noreferrer';
    cardLink.className = 'laptop-card';

    if (item.image_url) {
        const image = document.createElement('img');
        image.src = item.image_url;
        image.alt = `${item.name} logo`;
        image.className = 'card-image';
        image.loading = 'lazy';
        cardLink.appendChild(image);
    }

    const title = document.createElement('h3');
    title.textContent = item.name;
    cardLink.appendChild(title);

    const description = document.createElement('p');
    description.textContent = item.description;
    cardLink.appendChild(description);

    return cardLink;
}

function loadW10Incompatible() {
    const section = document.getElementById('w10-incompatible');
    const loadingIndicator = section.querySelector('.loading-indicator');
    const container = document.getElementById('w10-incompatible-cards');

    loadingIndicator.style.display = 'block';
    container.innerHTML = '';
    console.log("Attempting to load W10 incompatible data...");

    fetchData('/data/w10_incompatible.json')
        .then(data => {
            console.log("Successfully fetched W10 data:", data);
            loadingIndicator.style.display = 'none';
            if (container) {
                if (typeof data !== 'object' || data === null) {
                    console.error("Fetched data is not an object:", data);
                    throw new Error("Invalid data format");
                }
                for (const category in data) {
                    console.log("Processing category:", category);
                    const categoryContainer = document.createElement('div');

                    const categoryTitle = document.createElement('h3');
                    categoryTitle.className = 'section-title';
                    categoryTitle.textContent = category;
                    categoryContainer.appendChild(categoryTitle);

                    const cardGrid = document.createElement('div');
                    cardGrid.className = 'card-grid';
                    if (Array.isArray(data[category])) {
                        data[category].forEach(item => {
                            cardGrid.appendChild(createW10Card(item));
                        });
                    } else {
                        console.error(`Data for category "${category}" is not an array.`);
                    }
                    categoryContainer.appendChild(cardGrid);

                    container.appendChild(categoryContainer);
                }
                console.log("Finished rendering W10 incompatible data.");
            } else {
                console.error("Container #w10-incompatible-cards not found.");
            }
        })
        .catch(error => {
            console.error('Error in loadW10Incompatible function:', error);
            loadingIndicator.style.display = 'none';
            if (container) {
                container.textContent = 'Error loading data.';
            }
        });
}

function loadSupplyChainData() {
    const section = document.getElementById('supply-chain');
    const loadingIndicator = section.querySelector('.loading-indicator');
    const elitebookContainer = document.getElementById("elitebook-supply-chain-cards");
    const zbookContainer = document.getElementById("zbook-supply-chain-cards");

    loadingIndicator.style.display = 'block';
    elitebookContainer.innerHTML = '';
    zbookContainer.innerHTML = '';

    if (elitebookContainer && zbookContainer) {
        fetchData("/data/supply_chain.json")
            .then(data => {
                loadingIndicator.style.display = 'none';
                const elitebookSupplyData = data.filter(item => item["Model Series"] === "Elitebook");
                const zbookSupplyData = data.filter(item => item["Model Series"] === "Zbook Studio");

                elitebookSupplyData.forEach(item => createSupplyChainCard(elitebookContainer, item));
                zbookSupplyData.forEach(item => createSupplyChainCard(zbookContainer, item));
            })
            .catch(error => {
                loadingIndicator.style.display = 'none';
                elitebookContainer.textContent = 'Error loading data.';
                zbookContainer.textContent = 'Error loading data.';
                console.error("Error fetching or creating supply chain cards:", error);
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
