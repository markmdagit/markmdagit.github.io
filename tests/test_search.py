import re
from playwright.sync_api import Page, expect

def test_laptop_search(page: Page):
    page.goto("http://localhost:8000/pages/index.html")

    # Navigate to Hardware Details
    page.locator("#computers-btn").click()
    page.locator("#laptops-btn").click()

    # 1. Verify the title is removed
    title = page.locator("h2.section-title:has-text('HP Laptops Parts List Database')")
    expect(title).to_have_count(0)

    # 2. Verify the search bar is present
    search_bar = page.locator("#laptop-search")
    expect(search_bar).to_be_visible()

    # Wait for the initial list of laptops to be rendered
    page.wait_for_selector(".card-grid .laptop-card")
    expect(page.locator(".card-grid .laptop-card")).to_have_count(28)

    # 3. Test searching for a specific model
    search_bar.fill("G5")

    # After searching, all G5 models should be visible
    # page.screenshot(path="tests/screenshots/search_g5.png")
    assert page.locator(".card-grid .laptop-card").count() > 0

    # 4. Test searching for a specific component
    search_bar.fill("i7-8650U")

    # This should find the EliteBook G5
    assert page.locator(".card-grid .laptop-card").count() > 0

    # 5. Test clearing the search
    search_bar.fill("")

    # The list should return to its original state
    expect(page.locator(".card-grid .laptop-card")).to_have_count(28)

    # 6. Test searching for a ZBook
    search_bar.fill("Studio G8")
    assert page.locator(".card-grid .laptop-card").count() > 0
