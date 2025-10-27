import re
from playwright.sync_api import Page, expect

def test_payroll_report(page: Page):
    page.goto("http://localhost:8000/pages/projects.html")

    # --- SETUP ---
    # 1. Create a user with a known wage
    admin_btn = page.locator("#admin-btn")
    admin_btn.click()
    page.locator("#income-manager-btn").click()

    page.locator("#user-first-name").fill("Payroll")
    page.locator("#user-last-name").fill("Test")
    page.locator("#user-wage").fill("20.00") # $20/hour
    page.locator("#user-form button[type='submit']").click()

    # 2. Add two calendar events for this user in the same month
    admin_btn.click()
    page.locator("#calendar-btn").click()

    # Event 1: 8 hours (in October)
    page.locator(".month-tab[data-month='9']").click()
    page.locator(".calendar-day[data-date='2025-10-10']").click()
    page.locator(".calendar-day[data-date='2025-10-10']").click() # Click twice to select a single day
    expect(page.locator("#cal-start-date")).to_have_value("2025-10-10")
    page.locator("#cal-user-select").select_option(label="Payroll Test")
    page.locator("#cal-start-time").fill("09:00")
    page.locator("#cal-end-time").fill("17:00")
    page.locator("#calendar-form button[type='submit']").click()

    # Event 2: 4.5 hours (in October)
    page.locator(".calendar-day[data-date='2025-10-12']").click()
    page.locator(".calendar-day[data-date='2025-10-12']").click() # Click twice to select a single day
    expect(page.locator("#cal-start-date")).to_have_value("2025-10-12")
    page.locator("#cal-user-select").select_option(label="Payroll Test")
    page.locator("#cal-start-time").fill("12:30")
    page.locator("#cal-end-time").fill("17:00")
    page.locator("#calendar-form button[type='submit']").click()

    # --- VERIFICATION ---
    # 3. Select the correct month in the CALENDAR view first
    page.locator(".month-tab[data-month='9']").click() # October

    # 4. Navigate to the Payroll Report
    admin_btn.click()
    page.locator("#payroll-report-btn").click()

    # 5. Check the report calculations for October
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

    # 6. Go back to calendar and check a month with no events
    admin_btn.click()
    page.locator("#calendar-btn").click()
    page.locator(".month-tab[data-month='8']").click() # September

    # 7. Go back to payroll and verify it's empty
    admin_btn.click()
    page.locator("#payroll-report-btn").click()
    expect(page.locator("#payroll-table-body tr")).to_have_count(0)