
function initBestServiceScraper() {
    loadBestServiceData('Instruments'); // Load default category
}

function loadBestServiceData(category) {
    const grid = $("#bestservice-grid");

    // Fetch relative to the current location (pages/index.html)
    fetch('../data/bestservice_products.json')
        .then(response => response.json())
        .then(data => {
            if (data[category]) {
                renderBestServiceGrid(data[category]);
            } else {
                console.error(`Category ${category} not found in data.`);
            }
        })
        .catch(error => {
            console.error('Error loading best service data:', error);
            grid.html('<p>Error loading data. Please try again later.</p>');
        });
}

function renderBestServiceGrid(data) {
    $("#bestservice-grid").jsGrid({
        width: "100%",
        height: "auto",

        inserting: false,
        editing: false,
        sorting: true,
        paging: true,
        pageSize: 50,
        pageButtonCount: 5,

        data: data,

        fields: [
            { name: "Year", type: "number", width: 50, align: "center" },
            { name: "Name", type: "text", width: 250 },
            { name: "Category", type: "text", width: 100 },
            {
                name: "Price",
                type: "number",
                width: 80,
                align: "right",
                itemTemplate: function(value) {
                    return value === 0 ? "Free" : "$" + value.toFixed(2);
                }
            },
            { name: "Description", type: "text", width: 300 }
        ]
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.bestservice-cat-btn');

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Load data for selected category
            const category = btn.dataset.category;
            loadBestServiceData(category);
        });
    });
});
