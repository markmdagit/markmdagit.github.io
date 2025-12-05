from playwright.sync_api import Page, expect

def test_travel_dropdown(page: Page):
    page.goto("http://localhost:8000/pages/index.html")

    # 1. Check Travel Dropdown exists
    travel_btn = page.locator("#travel-btn")
    travel_options = page.locator("#travel-options")
    expect(travel_btn).to_be_visible()

    # 2. Open Travel Dropdown
    travel_btn.click()
    expect(travel_options).to_be_visible()

    # 3. Check "1 Hour Drive From..." button
    one_hour_btn = page.locator("#one-hour-drive-btn")
    expect(one_hour_btn).to_be_visible()
    expect(one_hour_btn).to_have_text("1 Hour Drive From...")

    # 4. Click the button and verify content
    one_hour_btn.click()

    # Content section should be visible
    one_hour_section = page.locator("#one-hour-drive")
    expect(one_hour_section).to_be_visible()

    # Verify title and text
    expect(one_hour_section.locator("h2")).to_have_text("1 Hour Drive From...")
    expect(one_hour_section.locator("p")).to_have_text("Work in progress")

    # 5. Verify other sections are hidden
    expect(page.locator("#hardware-details")).to_be_hidden()
    expect(page.locator("#admin-dashboard")).to_be_hidden()
