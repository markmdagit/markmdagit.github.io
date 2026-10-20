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
    initThemeToggle();

    // Check if we need to auto-trigger the resume print
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('printResume') === 'true') {
        // Wait a small amount for DOM/fonts to be ready, then print
        setTimeout(() => {
            if (typeof window.generateResumePDF === 'function') {
                window.generateResumePDF();

                // Remove the query parameter so refreshing doesn't keep printing
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }
        }, 500);
    }
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
    if (!projects || projects.length === 0) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        return;
    }

    // Use a grid layout if possible, similar to other sections
    if (!container.classList.contains('card-grid')) {
        container.classList.add('card-grid');
    }

    const existingCards = Array.from(container.children);

    projects.forEach((p, i) => {
        let card;
        if (i < existingCards.length) {
            card = existingCards[i];
        } else {
            card = document.createElement('div');
            card.classList.add('skill-card');
            container.appendChild(card);
        }

        let contentWrapper;
        let a = card.querySelector('a');

        if (p.url) {
            if (!a) {
                while(card.firstChild) card.removeChild(card.firstChild);
                a = document.createElement('a');
                a.style.textDecoration = 'none';
                a.style.color = 'inherit';
                a.style.display = 'block';
                card.appendChild(a);
            }
            a.href = p.url;
            contentWrapper = a;
        } else {
            if (a) {
                while(card.firstChild) card.removeChild(card.firstChild);
            }
            contentWrapper = card;
        }

        let title = contentWrapper.querySelector('h3');
        if (!title) {
            title = document.createElement('h3');
            contentWrapper.appendChild(title);
        }
        title.textContent = p.name || 'Project';

        let desc = contentWrapper.querySelector('p');
        if (p.description) {
            if (!desc) {
                desc = document.createElement('p');
                contentWrapper.appendChild(desc);
            }
            desc.textContent = p.description;
        } else {
            if (desc) {
                contentWrapper.removeChild(desc);
            }
        }
    });

    for (let i = projects.length; i < existingCards.length; i++) {
        container.removeChild(existingCards[i]);
    }
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

window.generateResumePDF = function() {
    // Ensure we are on the main page where these sections exist.
    if (!document.getElementById('experience')) {
        window.location.href = 'index.html?printResume=true';
        return;
    }

    const printContent = document.createElement('div');
    printContent.id = 'resume-print-container';

    // Header
    const header = document.createElement('div');
    header.className = 'resume-header-clean';

    const name = document.createElement('h1');
    name.textContent = 'Marcos Alvarez';

    const title = document.createElement('p');
    title.textContent = 'Information Systems & Technology | Business Intelligence & Analytics';

    header.appendChild(name);
    header.appendChild(title);
    printContent.appendChild(header);

    // Extract Sections
    const sectionsToExtract = ['experience', 'technologies', 'education'];

    sectionsToExtract.forEach(sectionId => {
        const originalSection = document.getElementById(sectionId);
        if (originalSection) {
            const clonedSection = originalSection.cloneNode(true);

            // Strip attributes from the section itself
            clonedSection.removeAttribute('id');
            clonedSection.removeAttribute('class');
            clonedSection.removeAttribute('style');

            // Strip attributes and remove icons from all children
            const allElements = clonedSection.querySelectorAll('*');
            allElements.forEach(el => {
                el.removeAttribute('id');
                el.removeAttribute('class');
                el.removeAttribute('style');

                if (el.tagName.toLowerCase() === 'i' || el.tagName.toLowerCase() === 'svg') {
                    el.remove();
                }
            });

            printContent.appendChild(clonedSection);
        }
    });

    // We append the container to body, call print, then remove it
    // To only print this container, we'll use CSS @media print
    document.body.appendChild(printContent);

    // Add a temporary class to body to hide everything else
    document.body.classList.add('resume-print-mode');

    window.print();

    // Cleanup
    document.body.classList.remove('resume-print-mode');
    document.body.removeChild(printContent);
}

function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const icon = toggleBtn.querySelector('i');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        let theme = 'light';
        if (document.body.classList.contains('dark-mode')) {
            theme = 'dark';
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        localStorage.setItem('theme', theme);
    });
}
