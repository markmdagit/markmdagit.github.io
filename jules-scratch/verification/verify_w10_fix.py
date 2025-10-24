from playwright.sync_api import Page, expect

def test_w10_incompatible_loads_correctly(page: Page):
    page.goto("http://localhost:8000/pages/projects.html")

    # Click the "Computers" dropdown
    page.locator("#computers-btn").click()

    # Click the "W10 Incompatible Solution" button
    page.locator("#w10-incompatible-btn").click()

    # Wait for the cards to be visible
    expect(page.locator("#w10-incompatible-cards .laptop-card").first).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")
