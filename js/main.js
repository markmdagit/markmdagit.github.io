async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
    }
    return response.json();
}

function isSafeUrl(url, allowRelative = true) {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    try {
        const parsed = new URL(trimmed, window.location.href);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            return false;
        }
        if (!allowRelative && !/^https?:\/\//i.test(trimmed)) {
            return false;
        }
        return true;
    } catch (_) {
        return false;
    }
}

function setActiveNav() {
    const navLinks = document.querySelectorAll('nav a');
    const currentPage = window.location.pathname.split('/').pop();

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const linkPage = href.split('/').pop();
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
    const fragment = document.createDocumentFragment();

    projects.forEach((p, i) => {
        let card;
        const isExisting = i < existingCards.length;
        if (isExisting) {
            card = existingCards[i];
        } else {
            card = document.createElement('div');
            card.classList.add('skill-card');
        }

        let contentWrapper;
        let a = card.querySelector('a');

        if (p.url && isSafeUrl(p.url, true)) {
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

        if (!isExisting) {
            fragment.appendChild(card);
        }
    });

    if (fragment.childNodes.length > 0) {
        container.appendChild(fragment);
    }

    for (let i = projects.length; i < existingCards.length; i++) {
        container.removeChild(existingCards[i]);
    }
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

            // Remove icons first to avoid iterating over removed subtrees
            clonedSection.querySelectorAll('i, svg').forEach(el => el.remove());

            // Strip attributes from remaining children
            clonedSection.querySelectorAll('[id], [class], [style]').forEach(el => {
                el.removeAttribute('id');
                el.removeAttribute('class');
                el.removeAttribute('style');
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
    let currentTheme = null;
    try {
        currentTheme = localStorage.getItem('theme');
    } catch (_) {
        // Ignore storage errors in restricted environments
    }

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        let theme = 'light';
        if (document.body.classList.contains('dark-mode')) {
            theme = 'dark';
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        } else if (icon) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        try {
            localStorage.setItem('theme', theme);
        } catch (_) {
            // Ignore storage errors in restricted environments
        }
    });
}
