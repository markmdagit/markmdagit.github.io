document.addEventListener('DOMContentLoaded', () => {
    initBlogSystem();
});

function initBlogSystem() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const addBlogBtn = document.getElementById('add-blog-btn');
    const loginModal = document.getElementById('login-modal');
    const blogModal = document.getElementById('blog-modal');
    const loginForm = document.getElementById('login-form');
    const blogForm = document.getElementById('blog-form');
    const closeButtons = document.querySelectorAll('.close-modal');

    // Check login status
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Update UI based on login status
    updateUI(isLoggedIn);

    // Render blogs
    renderBlogs();

    // Event Listeners
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            updateUI(false);
            renderBlogs(); // Re-render to hide delete buttons
        });
    }

    if (addBlogBtn) {
        addBlogBtn.addEventListener('click', () => {
            if (blogModal) blogModal.style.display = 'block';
        });
    }

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'none';
            if (blogModal) blogModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === blogModal) blogModal.style.display = 'none';
    });

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            // Simple hardcoded check
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('isLoggedIn', 'true');
                updateUI(true);
                renderBlogs(); // Re-render to show delete buttons
                loginModal.style.display = 'none';
                loginForm.reset();
            } else {
                alert('Invalid credentials');
            }
        });
    }

    if (blogForm) {
        blogForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = blogForm.title.value;
            const date = blogForm.date.value;
            const description = blogForm.description.value;
            const url = blogForm.url.value; // Optional

            const newBlog = {
                id: Date.now(),
                title,
                date,
                description,
                url
            };

            const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
            blogs.unshift(newBlog); // Add to beginning
            localStorage.setItem('blogs', JSON.stringify(blogs));

            renderBlogs();
            blogModal.style.display = 'none';
            blogForm.reset();
        });
    }
}

function updateUI(isLoggedIn) {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const addBlogBtn = document.getElementById('add-blog-btn');

    if (isLoggedIn) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (addBlogBtn) addBlogBtn.style.display = 'inline-block';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (addBlogBtn) addBlogBtn.style.display = 'none';
    }
}

function renderBlogs() {
    const container = document.getElementById('dynamic-blogs-container');
    if (!container) return;

    const blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    container.innerHTML = '';

    blogs.forEach(blog => {
        const item = document.createElement('div');
        item.classList.add('timeline-item');

        // Create inner HTML structure safely
        // But for description we might want HTML? For now, textContent to be safe or innerHTML if user trusts themselves.
        // Since only admin adds blogs, we can allow some HTML or just text.

        let titleHtml = `<h3>${escapeHtml(blog.title)}</h3>`;
        if (blog.url) {
            titleHtml = `<a href="${escapeHtml(blog.url)}" target="_blank"><h3>${escapeHtml(blog.title)}</h3></a>`;
        }

        const dateHtml = blog.date ? `<p class="item-meta">${new Date(blog.date).toLocaleDateString()}</p>` : '';
        const descHtml = `<p class="item-description">${escapeHtml(blog.description)}</p>`;

        // Add delete button if logged in
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        let deleteBtnHtml = '';
        if (isLoggedIn) {
            deleteBtnHtml = `<button class="delete-blog-btn" data-id="${blog.id}" style="background: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; margin-top: 10px; border-radius: 4px;">Delete</button>`;
        }

        item.innerHTML = `
            ${titleHtml}
            ${dateHtml}
            ${descHtml}
            ${deleteBtnHtml}
        `;

        container.appendChild(item);
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-blog-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deleteBlog(id);
        });
    });
}

function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    let blogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    blogs = blogs.filter(b => b.id !== id);
    localStorage.setItem('blogs', JSON.stringify(blogs));
    renderBlogs();
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
