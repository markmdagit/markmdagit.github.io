import re
from playwright.sync_api import Page, expect
from datetime import datetime

def test_payroll_report(page: Page):
    page.goto("http://localhost:8000/pages/index.html")

    # --- SETUP ---
    # 1. Create a user with a known wage
    admin_btn = page.locator("#admin-btn")
    admin_btn.click()
    page.locator("#income-manager-btn").click()

    # Ensure the admin dashboard is visible
    expect(page.locator("#admin-dashboard")).to_be_visible()

    page.locator("#user-first-name").fill("Payroll")
    page.locator("#user-last-name").fill("Test")
    page.locator("#user-wage").fill("20.00") # $20/hour
    page.locator("#user-form button[type='submit']").click()

    # 2. Add two calendar events for this user in the same month

    # Use current month dates
    now = datetime.now()
    year = now.year
    month = now.month

    day1 = 10
    day2 = 12
    date1_str = f"{year}-{month:02d}-{day1:02d}"
    date2_str = f"{year}-{month:02d}-{day2:02d}"

    # Wait for calendar (current month loaded by default)
    page.wait_for_selector(f".calendar-day[data-date='{date1_str}']")

    # Event 1: 8 hours
    page.locator(f".calendar-day[data-date='{date1_str}']").click()
    page.locator(f".calendar-day[data-date='{date1_str}']").click() # Click twice to select a single day
    expect(page.locator("#cal-start-date")).to_have_value(date1_str)
    page.locator("#cal-user-select").select_option(label="Payroll Test")
    page.locator("#cal-start-time").fill("09:00")
    page.locator("#cal-end-time").fill("17:00")
    page.locator("#calendar-form button[type='submit']").click()

    # Event 2: 4.5 hours
    page.locator(f".calendar-day[data-date='{date2_str}']").click()
    page.locator(f".calendar-day[data-date='{date2_str}']").click() # Click twice to select a single day
    expect(page.locator("#cal-start-date")).to_have_value(date2_str)
    page.locator("#cal-user-select").select_option(label="Payroll Test")
    page.locator("#cal-start-time").fill("12:30")
    page.locator("#cal-end-time").fill("17:00")
    page.locator("#calendar-form button[type='submit']").click()

    # --- VERIFICATION ---
    # 3. Check the report calculations for the current month
    # Since we are already on the current month, the report should update automatically or be visible?
    # The report is part of the admin dashboard, visible below calendar.

    admin_btn.click()
    page.locator("#payroll-btn").click()

    report_row = page.locator("#payroll-table-body tr")
    expect(report_row).to_have_count(1)

    user_cell = report_row.locator("td").nth(0)
    scheduled_hours_cell = report_row.locator("td").nth(1)
    paid_hours_cell = report_row.locator("td").nth(2)
    income_cell = report_row.locator("td").nth(3)

    expect(user_cell).to_have_text("Payroll Test")
    # Scheduled Hours = 8 + 4.5 = 12.5
    expect(scheduled_hours_cell).to_have_text("12.50")
    # Paid Hours = (8 - 0.5) + (4.5 - 0.5) = 7.5 + 4 = 11.5
    expect(paid_hours_cell).to_have_text("11.50")
    # Total Income = 11.5 hours * $20/hour = $230.00
    expect(income_cell).to_have_text("$230.00")

    # 4. Go to previous month (should be empty if we just added to current)
    admin_btn.click()
    page.locator("#calendar-btn").click()
    page.locator("#prev-month-btn").click()

    # 5. Check payroll is empty for previous month
    admin_btn.click()
    page.locator("#payroll-btn").click()
    expect(page.locator("#payroll-table-body tr")).to_have_count(0)
