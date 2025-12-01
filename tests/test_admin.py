import re
from playwright.sync_api import Page, expect
import datetime

def test_admin_monthly_calendar(page: Page):
    page.goto("http://localhost:8000/pages/index.html")

    # First, create a user to assign the event to
    admin_btn = page.locator("#admin-btn")
    admin_btn.click()
    page.locator("#calendar-btn").click()

    page.locator("#user-first-name").fill("Calendar")
    page.locator("#user-last-name").fill("TestUser")
    page.locator("#user-wage").fill("50")
    page.locator("#user-form button[type='submit']").click()

    # --- Test adding an event ---
    today = datetime.date.today()
    test_date = today.strftime("%Y-%m-%d")

    # Select the newly created user and fill out the rest of the form
    day_to_select = page.locator(f".calendar-day[data-date='{test_date}']")
    day_to_select.click()
    day_to_select.click() # Double click to select a single day range
    expect(page.locator("#cal-start-date")).to_have_value(test_date)
    expect(page.locator("#cal-end-date")).to_have_value(test_date)
    page.locator("#cal-user-select").select_option(label="Calendar TestUser")
    page.locator("#cal-start-time").fill("10:00")
    page.locator("#cal-end-time").fill("11:00")
    page.locator("#calendar-form button[type='submit']").click()

    # Verify the event appears in the correct cell
    payroll_table = page.locator("#payroll-table-body")
    expect(payroll_table.locator("tr")).to_contain_text("Calendar TestUser")
    event_cell = page.locator(f".calendar-day[data-date='{test_date}']")
    expect(event_cell).to_be_visible()
    expect(event_cell.locator(".calendar-event")).to_have_count(1)
    expect(event_cell.locator(".calendar-event strong")).to_have_text("Calendar TestUser")

    # --- Test month navigation ---
    next_month_btn = page.locator("#next-month-btn")
    prev_month_btn = page.locator("#prev-month-btn")

    next_month_btn.click() # To December
    expect(page.locator(f".calendar-day[data-date='{test_date}'] .calendar-event")).to_have_count(0)

    prev_month_btn.click() # Back to November
    expect(event_cell.locator(".calendar-event")).to_have_count(1)