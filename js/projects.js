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

    function setupDropdown(btn, options, otherOptions) {
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const isDisplayed = options.style.display !== 'none';
            otherOptions.style.display = 'none';
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

    const allSections = [...computerSections, ...adminSections];

    setupDropdown(computersBtn, computerOptions, adminOptions);
    setupDropdown(adminBtn, adminOptions, computerOptions);
    setupMenu(computerButtons, computerSections, allSections);
    setupMenu(adminButtons, adminSections, allSections);

    window.addEventListener('click', function(event) {
        if (!computersBtn.contains(event.target)) {
            computerOptions.style.display = 'none';
        }
        if (!adminBtn.contains(event.target)) {
            adminOptions.style.display = 'none';
        }
    });
});

function createW10Card(item) {
    const cardLink = document.createElement('a');
    cardLink.href = item.url;
    cardLink.target = '_blank';
    cardLink.className = 'laptop-card';

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

    fetchData('/data/w10_incompatible.json')
        .then(data => {
            loadingIndicator.style.display = 'none';
            if (container) {
                for (const category in data) {
                    const categoryContainer = document.createElement('div');

                    const categoryTitle = document.createElement('h3');
                    categoryTitle.className = 'section-title';
                    categoryTitle.textContent = category;
                    categoryContainer.appendChild(categoryTitle);

                    const cardGrid = document.createElement('div');
                    cardGrid.className = 'card-grid';
                    data[category].forEach(item => {
                        cardGrid.appendChild(createW10Card(item));
                    });
                    categoryContainer.appendChild(cardGrid);

                    container.appendChild(categoryContainer);
                }
            }
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            container.textContent = 'Error loading data.';
            console.error('Error loading W10 incompatible solutions data:', error);
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
