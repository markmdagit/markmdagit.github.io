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
