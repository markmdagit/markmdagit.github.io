import re
from playwright.sync_api import Page, expect

def test_admin_schedulers(page: Page):
    page.goto("http://localhost:8000/pages/projects.html")

    # Test Admin dropdown
    admin_btn = page.locator("#admin-btn")
    expect(admin_btn).to_be_visible()
    admin_btn.click()

    admin_options = page.locator("#admin-options")
    expect(admin_options).to_be_visible()

    start_time_btn = page.locator("#start-time-btn")
    expect(start_time_btn).to_be_visible()
    start_time_btn.click()

    start_time_section = page.locator("#start-time-scheduler")
    expect(start_time_section).to_be_visible()

    # Test Start Time Scheduler
    start_first_name_input = page.locator("#start-first-name")
    start_last_name_input = page.locator("#start-last-name")
    start_time_input = page.locator("#start-time")
    add_start_time_btn = page.locator("#start-time-form button[type='submit']")

    start_first_name_input.fill("John")
    start_last_name_input.fill("Doe")
    start_time_input.fill("09:00")
    add_start_time_btn.click()

    start_time_table_body = page.locator("#start-time-table-body")
    expect(start_time_table_body.locator("tr")).to_have_count(1)
    expect(start_time_table_body.locator("tr td").first).to_have_text("John")

    # Test End Time Scheduler
    admin_btn.click()
    end_time_btn = page.locator("#end-time-btn")
    expect(end_time_btn).to_be_visible()
    end_time_btn.click()

    end_time_section = page.locator("#end-time-scheduler")
    expect(end_time_section).to_be_visible()

    end_first_name_input = page.locator("#end-first-name")
    end_last_name_input = page.locator("#end-last-name")
    end_time_input = page.locator("#end-time")
    add_end_time_btn = page.locator("#end-time-form button[type='submit']")

    end_first_name_input.fill("Jane")
    end_last_name_input.fill("Doe")
    end_time_input.fill("17:00")
    add_end_time_btn.click()

    end_time_table_body = page.locator("#end-time-table-body")
    expect(end_time_table_body.locator("tr")).to_have_count(1)
    expect(end_time_table_body.locator("tr td").first).to_have_text("Jane")

    # Test Calendar
    admin_btn.click()
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