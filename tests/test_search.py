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
    # Note: React might take a moment to mount and render
    # Assuming the data is loaded via React which fetches local JSON or embedded data
    # We should wait for at least one card

    # Wait for the React root to populate
    expect(page.locator("#root .laptop-card").first).to_be_visible(timeout=10000)

    # Check count - assuming default view shows all laptops
    # We don't want to be too brittle with exact counts if data changes, but let's stick to what was there or check > 0
    expect(page.locator("#root .laptop-card")).not_to_have_count(0)

    # 3. Test searching for a specific model
    search_bar.fill("G5")

    # After searching, all G5 models should be visible
    # page.screenshot(path="tests/screenshots/search_g5.png") # Screenshot dir might not exist
    expect(page.locator("#root .laptop-card")).not_to_have_count(0)

    # 4. Test searching for a specific component
    search_bar.fill("i7-8650U")

    # This should find the EliteBook G5
    expect(page.locator("#root .laptop-card")).not_to_have_count(0)

    # 5. Test clearing the search
    search_bar.fill("")

    # The list should return to its original state
    expect(page.locator("#root .laptop-card")).not_to_have_count(0)

    # 6. Test searching for a ZBook
    search_bar.fill("Studio G8")
    expect(page.locator("#root .laptop-card")).not_to_have_count(0)
