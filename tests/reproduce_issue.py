from playwright.sync_api import Page, expect

def test_dropdown_contents_and_visibility(page: Page):
    page.goto("http://localhost:8000/pages/index.html")

    # Check Computers -> Laptops
    page.locator("#computers-btn").click()
    page.locator("#laptops-btn").click()
    expect(page.locator("#hardware-details")).to_be_visible()
    expect(page.locator("#laptops-content")).to_have_class("tab-pane active")

    # Check Computers -> Supply Chain
    page.locator("#computers-btn").click()
    page.locator("#supply-chain-btn").click()
    expect(page.locator("#hardware-details")).to_be_visible()
    expect(page.locator("#supply-chain-content")).to_have_class("tab-pane active")

    # Check Admin -> Calendar
    page.locator("#admin-btn").click()
    page.locator("#calendar-btn").click()
    expect(page.locator("#admin-dashboard")).to_be_visible()
