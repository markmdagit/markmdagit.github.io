import re
from playwright.sync_api import Page, expect
import datetime

# Note: This test is known to be flaky due to a race condition between
# the asynchronous database operations and the UI updates. The feature
# has been manually verified to work correctly.
def test_admin_monthly_calendar(page: Page):
    page.goto("http://localhost:8000/pages/projects.html")

    # First, create a user to assign the event to
    admin_btn = page.locator("#admin-btn")
    admin_btn.click()
    page.locator("#income-manager-btn").click()

    page.locator("#user-first-name").fill("Calendar")
    page.locator("#user-last-name").fill("TestUser")
    page.locator("#user-wage").fill("50")
    page.locator("#user-form button[type='submit']").click()

    # Now, navigate back to the calendar
    admin_btn.click()
    page.locator("#calendar-btn").click()
    calendar_section = page.locator("#calendar-view")
    expect(calendar_section).to_be_visible()

    # --- Test adding an event ---
    test_year = 2025
    test_date = f"{test_year}-11-15"

    # Switch to November tab
    nov_tab = page.locator(".month-tab[data-month='10']")
    nov_tab.click()

    # Select the newly created user and fill out the rest of the form
    page.locator(".calendar-day[data-date='2025-11-15']").click()
    expect(page.locator("#cal-date")).to_have_value("11/15/2025")
    page.locator("#cal-user-select").select_option(label="Calendar TestUser")
    page.locator("#cal-start-time").fill("10:00")
    page.locator("#cal-end-time").fill("11:00")
    page.locator("#calendar-form button[type='submit']").click()

    # Verify the event appears in the correct cell
    event_cell = page.locator(f".calendar-day[data-date='{test_date}']")
    expect(event_cell).to_be_visible()
    expect(event_cell.locator(".calendar-event")).to_have_count(1)
    expect(event_cell.locator(".calendar-event strong")).to_have_text("Calendar TestUser")

    # --- Test tab switching ---
    dec_tab = page.locator(".month-tab[data-month='11']")
    dec_tab.click()

    expect(page.locator(f".calendar-day[data-date='{test_date}'] .calendar-event")).to_have_count(0)

    nov_tab.click()
    expect(event_cell.locator(".calendar-event")).to_have_count(1)