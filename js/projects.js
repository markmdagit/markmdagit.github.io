document.addEventListener('DOMContentLoaded', function() {
    const computersBtn = document.getElementById('computers-btn');
    const computerOptions = document.getElementById('computer-options');
    const computerButtons = [
        document.getElementById('hardware-details-btn'),
    ];
    const computerSections = [
        document.getElementById('hardware-details'),
    ];

    const adminBtn = document.getElementById('admin-btn');
    const adminOptions = document.getElementById('admin-options');

    // Admin Sub-buttons
    const calendarBtn = document.getElementById('calendar-btn');
    const incomeManagerBtn = document.getElementById('income-manager-btn');
    const payrollBtn = document.getElementById('payroll-btn');

    const hardwareSection = document.getElementById('hardware-details');
    const adminSection = document.getElementById('admin-dashboard');

    const allSections = [hardwareSection, adminSection].filter(s => s !== null);
    const allButtons = [laptopsBtn, supplyChainBtn, chatbotBtn, calendarBtn, incomeManagerBtn, payrollBtn].filter(b => b !== null);

    function setupDropdown(btn, options, ...otherOptions) {
        if (!btn || !options) return;
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const isDisplayed = options.style.display !== 'none';
            otherOptions.forEach(opt => {
                if (opt) opt.style.display = 'none';
            });
            options.style.display = isDisplayed ? 'none' : 'block';
        });
    }

    function setupMenu(buttons, sections, allSections) {
        buttons.forEach((button, index) => {
            if (!button) return;

            button.addEventListener('click', () => {
                allSections.forEach(section => {
                    if (section) section.style.display = 'none';
                });

                if (sections[index]) {
                    sections[index].style.display = 'block';
                }

                // Remove active class from all known buttons across all menus
                [...computerButtons, ...adminButtons].forEach(btn => {
                    if (btn) btn.classList.remove('active');
                });
                button.classList.add('active');

                const dropdown = button.closest('.dropdown-menu');
                if (dropdown) dropdown.style.display = 'none';

                if (button.id === 'hardware-details-btn') {
                    // Load the content for the default active tab
                    loadSupplyChainData();
                }
            });
        });
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }
    }

    function activateTab(tabId) {
        const tabs = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabs.forEach(t => t.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        const tabPane = document.getElementById(tabId);

        if (tabBtn) tabBtn.classList.add('active');
        if (tabPane) tabPane.classList.add('active');

        // Trigger data load if needed
        if (tabId === 'supply-chain-content') {
             loadSupplyChainData();
        }
    }

    // Filter out null sections
    const allSections = [...computerSections, ...adminSections].filter(s => s !== null);

    setupMenu(computerButtons, computerSections, allSections);
    setupMenu(adminButtons, adminSections, allSections);

    // Initialize tabs once
    setupTabs();

    window.addEventListener('click', function(event) {
        if (computersBtn && !computersBtn.contains(event.target) && computerOptions) {
            computerOptions.style.display = 'none';
        }
        if (adminBtn && !adminBtn.contains(event.target) && adminOptions) {
            adminOptions.style.display = 'none';
        }
    });
});

function loadSupplyChainData() {
    const section = document.getElementById('hardware-details');
    if (!section) return;

    const loadingIndicator = section.querySelector('.loading-indicator');
    const elitebookContainer = document.getElementById("elitebook-supply-chain-cards");
    const zbookContainer = document.getElementById("zbook-supply-chain-cards");

    if (loadingIndicator) loadingIndicator.style.display = 'block';
    if (elitebookContainer) elitebookContainer.innerHTML = '';
    if (zbookContainer) zbookContainer.innerHTML = '';

    if (elitebookContainer && zbookContainer) {
        fetchData("/data/supply_chain.json")
            .then(data => {
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                const elitebookSupplyData = data.filter(item => item["Model Series"] === "Elitebook");
                const zbookSupplyData = data.filter(item => item["Model Series"] === "Zbook Studio");

                elitebookSupplyData.forEach(item => createSupplyChainCard(elitebookContainer, item));
                zbookSupplyData.forEach(item => createSupplyChainCard(zbookContainer, item));
            })
            .catch(error => {
                if (loadingIndicator) loadingIndicator.style.display = 'none';
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
