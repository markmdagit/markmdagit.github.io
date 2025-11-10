import re
from playwright.sync_api import Page, expect

def test_income_manager_crud(page: Page):
    page.goto("http://localhost:8000/pages/projects.html")

    # Navigate to the Income Manager
    admin_btn = page.locator("#admin-btn")
    admin_btn.click()
    page.locator("#admin-dashboard-btn").click()

    # Ensure the admin dashboard is visible
    expect(page.locator("#admin-dashboard")).to_be_visible()

    # --- CREATE ---
    page.locator("#user-first-name").fill("John")
    page.locator("#user-last-name").fill("Doe")
    page.locator("#user-wage").fill("25.50")
    page.locator("#user-form button[type='submit']").click()

    # --- READ ---
    expect(page.locator("#user-table-body")).to_contain_text("John")
    user_row = page.locator("#user-table-body tr[data-user-id='1']")
    expect(user_row.locator("td").nth(0)).to_have_text("John")
    expect(user_row.locator("td").nth(1)).to_have_text("Doe")
    expect(user_row.locator("td").nth(2)).to_have_text("$25.50")

    # --- UPDATE ---
    user_row.locator(".edit-btn").click()
    wage_input = user_row.locator("input.wage-input")
    expect(wage_input).to_be_visible()
    wage_input.fill("30.00")
    user_row.locator(".save-btn").click()
    expect(user_row.locator("td").nth(2)).to_have_text("$30.00")

    # --- Test Cascading Delete ---
    # Add a calendar event for the user
    admin_btn.click()
    page.locator("#admin-dashboard-btn").click()
    page.locator("#prev-month-btn").click() # To October
    page.wait_for_selector(".calendar-day[data-date='2025-10-15']")
    day_to_select = page.locator(".calendar-day[data-date='2025-10-15']")
    day_to_select.click()
    day_to_select.click()
    page.locator("#cal-user-select").select_option(label="John Doe")
    page.locator("#cal-start-time").fill("09:00")
    page.locator("#cal-end-time").fill("17:00")
    page.locator("#calendar-form button[type='submit']").click()

    # Verify the event is on the calendar
    event_cell = page.locator(".calendar-day[data-date='2025-10-15']")
    expect(event_cell.locator(".calendar-event")).to_have_count(1)

    # --- DELETE ---
    admin_btn.click()
    page.locator("#admin-dashboard-btn").click()

    # Accept the confirmation dialog for deletion
    page.on("dialog", lambda dialog: dialog.accept())

    page.locator("#user-table-body tr[data-user-id='1'] .delete-btn").click()

    # Verify the user is removed from the table
    expect(page.locator("#user-table-body tr")).to_have_count(0)

    # Verify the user's event is also removed from the calendar
    admin_btn.click()
    page.locator("#admin-dashboard-btn").click()
    expect(page.locator(".calendar-day[data-date='2025-10-15'] .calendar-event")).to_have_count(0)