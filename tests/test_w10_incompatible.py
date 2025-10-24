from playwright.sync_api import Page, expect
import re

def test_w10_incompatible_loads_without_errors(page: Page):
    console_logs = []
    page.on("console", lambda msg: console_logs.append(msg.text))

    page.goto("http://localhost:8000/pages/projects.html")

    # Click the "Computers" dropdown
    page.locator("#computers-btn").click()

    # Click the "W10 Incompatible Solution" button
    page.locator("#w10-incompatible-btn").click()

    # Check for the "Error loading data" message
    error_message = page.locator("#w10-incompatible-cards")
    expect(error_message).not_to_have_text("Error loading data.")

    # Verify that at least one card is visible
    expect(page.locator("#w10-incompatible-cards .laptop-card").first).to_be_visible()

    # Print console logs for debugging if the test fails
    if page.locator("#w10-incompatible-cards").inner_text() == "Error loading data.":
        for log in console_logs:
            print(f"Console log: {log}")
