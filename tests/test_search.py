import re
from playwright.sync_api import Page, expect

def test_laptop_search(page: Page):
    page.goto("http://localhost:8000/pages/projects.html")

    # Ensure the Laptops section is visible by default
    laptops_section = page.locator("#laptops")
    expect(laptops_section).to_be_visible()

    # 1. Verify the title is removed
    title = page.locator("h2.section-title:has-text('HP Laptops Parts List Database')")
    expect(title).to_have_count(0)

    # 2. Verify the search bar is present
    search_bar = page.locator("#laptop-search")
    expect(search_bar).to_be_visible()

    # Wait for the initial list of laptops to be rendered
    expect(page.locator("#elitebook-cards .laptop-card")).to_have_count(7)
    expect(page.locator("#zbook-cards .laptop-card")).to_have_count(7)

    # 3. Test searching for a specific model
    search_bar.fill("G5")

    # After searching, all G5 models should be visible
    expect(page.locator("#elitebook-cards .laptop-card")).to_have_count(4)
    expect(page.locator("#zbook-cards .laptop-card")).to_have_count(1)

    # 4. Test searching for a specific component
    search_bar.fill("i7-8650U")

    # This should find the EliteBook G5
    expect(page.locator("#elitebook-cards .laptop-card")).to_have_count(1)
    expect(page.locator("#elitebook-cards .laptop-card h3")).to_have_text("HP EliteBook G5")
    expect(page.locator("#zbook-cards .laptop-card")).to_have_count(0)

    # 5. Test clearing the search
    search_bar.fill("")

    # The list should return to its original state
    expect(page.locator("#elitebook-cards .laptop-card")).to_have_count(7)
    expect(page.locator("#zbook-cards .laptop-card")).to_have_count(7)

    # 6. Test searching for a ZBook
    search_bar.fill("Studio G8")
    expect(page.locator("#elitebook-cards .laptop-card")).to_have_count(0)
    expect(page.locator("#zbook-cards .laptop-card")).to_have_count(1)
    expect(page.locator("#zbook-cards .laptop-card h3")).to_have_text("HP ZBook Studio G8")