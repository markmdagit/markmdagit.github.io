document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('laptop-search');

    if (!searchInput) {
        return;
    }

    function handleSearch(event) {
        const query = event.target.value.toLowerCase().trim();
        const customEvent = new CustomEvent('searchQueryChanged', { detail: query });
        document.dispatchEvent(customEvent);
    }

    searchInput.addEventListener('input', handleSearch);
});