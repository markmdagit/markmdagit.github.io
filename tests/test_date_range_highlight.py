
import pytest
from playwright.sync_api import Page, expect
import re

def test_date_range_highlighting(page: Page):
    page.goto("http://localhost:8000/pages/projects.html")

    # Open the admin dropdown and click the calendar button
    page.click("button#admin-btn")
    page.click("button#calendar-btn")

    # Switch to October
    page.click("button[data-month='9']")

    # Select the date range
    page.click(".calendar-day[data-date='2025-10-26']")
    page.click(".calendar-day[data-date='2025-10-30']")

    # Verify that the intermediate days are highlighted
    for day in range(26, 31):
        date_str = f"2025-10-{day}"
        day_element = page.locator(f".calendar-day[data-date='{date_str}']")
        expect(day_element).to_have_class(re.compile(r'in-range'))

    # Take a screenshot to visually confirm
    page.screenshot(path="tests/screenshots/date_range_highlight.png")
