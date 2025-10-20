import re
from playwright.sync_api import Page, expect
import datetime

def test_admin_monthly_calendar(page: Page):
    page.goto("http://localhost:8000/pages/projects.html")

    # Open the calendar view
    admin_btn = page.locator("#admin-btn")
    expect(admin_btn).to_be_visible()
    admin_btn.click()
    calendar_btn = page.locator("#calendar-btn")
    expect(calendar_btn).to_be_visible()
    calendar_btn.click()
    calendar_section = page.locator("#calendar-view")
    expect(calendar_section).to_be_visible()

    # --- Test adding an event ---

    # Use a fixed year for reproducible tests
    test_year = 2025
    test_date = f"{test_year}-11-15" # November 15th

    # Switch to November tab
    nov_tab = page.locator(".month-tab[data-month='10']")
    expect(nov_tab).to_have_text("Nov")
    nov_tab.click()
    expect(nov_tab).to_have_class(re.compile(r'\bactive\b'))

    # Fill out and submit the form
    page.locator("#cal-first-name").fill("Test")
    page.locator("#cal-last-name").fill("User")
    page.locator("#cal-date").fill(test_date)
    page.locator("#cal-start-time").fill("10:00")
    page.locator("#cal-end-time").fill("11:00")
    page.locator("#calendar-form button[type='submit']").click()

    # Verify the event appears in the correct cell in November
    # Note: After submission, the calendar re-renders for the month of the added event.
    event_cell = page.locator(f".calendar-day[data-date='{test_date}']")
    expect(event_cell).to_be_visible()
    expect(event_cell.locator(".calendar-event")).to_have_count(1)
    expect(event_cell.locator(".calendar-event strong")).to_have_text("Test User")

    # --- Test tab switching ---

    # Switch to December
    dec_tab = page.locator(".month-tab[data-month='11']")
    expect(dec_tab).to_have_text("Dec")
    dec_tab.click()
    expect(dec_tab).to_have_class(re.compile(r'\bactive\b'))

    # Verify the event is NOT visible in December
    expect(page.locator(f".calendar-day[data-date='{test_date}']")).to_have_count(0)
    expect(page.locator(".calendar-event")).to_have_count(0)

    # Switch back to November
    nov_tab.click()
    expect(nov_tab).to_have_class(re.compile(r'\bactive\b'))

    # Verify the event is visible again
    event_cell_after_switch = page.locator(f".calendar-day[data-date='{test_date}']")
    expect(event_cell_after_switch).to_be_visible()
    expect(event_cell_after_switch.locator(".calendar-event")).to_have_count(1)
    expect(event_cell_after_switch.locator(".calendar-event strong")).to_have_text("Test User")