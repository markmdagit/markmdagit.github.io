import re
from playwright.sync_api import Page, expect

def test_admin_calendar(page: Page):
    page.goto("http://localhost:8000/pages/projects.html")

    # Test Admin dropdown
    admin_btn = page.locator("#admin-btn")
    expect(admin_btn).to_be_visible()
    admin_btn.click()

    admin_options = page.locator("#admin-options")
    expect(admin_options).to_be_visible()

    # Test Calendar
    calendar_btn = page.locator("#calendar-btn")
    expect(calendar_btn).to_be_visible()
    calendar_btn.click()

    calendar_section = page.locator("#calendar-view")
    expect(calendar_section).to_be_visible()

    cal_first_name_input = page.locator("#cal-first-name")
    cal_last_name_input = page.locator("#cal-last-name")
    cal_day_select = page.locator("#cal-day")
    cal_start_time_input = page.locator("#cal-start-time")
    cal_end_time_input = page.locator("#cal-end-time")
    add_to_calendar_btn = page.locator("#calendar-form button[type='submit']")

    cal_first_name_input.fill("Test")
    cal_last_name_input.fill("User")
    cal_day_select.select_option("Monday")
    cal_start_time_input.fill("10:00")
    cal_end_time_input.fill("11:00")
    add_to_calendar_btn.click()

    monday_cell = page.locator("#cal-day-Monday")
    expect(monday_cell.locator(".calendar-event")).to_have_count(1)
    expect(monday_cell.locator(".calendar-event strong")).to_have_text("Test User")