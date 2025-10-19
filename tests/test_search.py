import re
from playwright.sync_api import Page, expect

def test_search_functionality(page: Page):
    page.goto("http://localhost:8000/pages/projects.html")

    # Wait for the search input to be available
    search_input = page.locator("#laptop-search")
    expect(search_input).to_be_visible()

    # Type a search query for a model
    search_input.fill("EliteBook")

    # Wait for the search results to appear
    results_container = page.locator("#search-results")

    # Check that the correct number of results is displayed
    expect(results_container.locator(".search-result")).to_have_count(15, timeout=10000)

    # Check the content of the first result
    first_result = results_container.locator(".search-result").first
    expect(first_result.locator("h3")).to_contain_text("EliteBook")
    expect(first_result.locator("p").first).to_contain_text("Part Number:")

    # Type a search query for a part number
    search_input.fill("SS03XL")

    # Check that the correct number of results is displayed
    expect(results_container.locator(".search-result")).to_have_count(1, timeout=10000)

    # Check the content of the first result
    first_result = results_container.locator(".search-result").first
    expect(first_result.locator("p").first).to_contain_text("Part Number: SS03XL")