
function initScraper() {
    loadScraperData('Laptops'); // Load default category
}

function loadScraperData(category) {
    const grid = $("#scraper-grid");

    // Fetch relative to the current location (pages/index.html), so data is in ../data/
    fetch('../data/amazon_bestsellers.json')
        .then(response => response.json())
        .then(data => {
            if (data[category]) {
                renderGrid(data[category]);
            } else {
                console.error(`Category ${category} not found in data.`);
            }
        })
        .catch(error => {
            console.error('Error loading scraper data:', error);
            grid.html('<p>Error loading data. Please try again later.</p>');
        });
}

function renderGrid(data) {
    $("#scraper-grid").jsGrid({
        width: "100%",
        height: "auto",

        inserting: false,
        editing: false,
        sorting: true,
        paging: false,

        data: data,

        fields: [
            { name: "Rank", type: "number", width: 50, align: "center" },
            {
                name: "Image",
                type: "text",
                width: 60,
                align: "center",
                itemTemplate: function(value) {
                    return $("<img>").attr("src", value).css({ width: "50px", height: "50px", "object-fit": "cover" });
                }
            },
            {
                name: "Name",
                type: "text",
                width: 300,
                itemTemplate: function(value, item) {
                    return $("<a>").attr("href", item.Link).attr("target", "_blank").text(value);
                }
            },
            {
                name: "Price",
                type: "number",
                width: 100,
                align: "right",
                itemTemplate: function(value) {
                    return "$" + value.toFixed(2);
                }
            },
            { name: "Rating", type: "number", width: 80, align: "center" },
            {
                name: "ReviewCount",
                title: "Reviews",
                type: "number",
                width: 100,
                align: "right",
                itemTemplate: function(value) {
                    return value.toLocaleString();
                }
            }
        ]
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.scraper-cat-btn');

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Load data for selected category
            const category = btn.dataset.category;
            loadScraperData(category);
        });
    });
});
