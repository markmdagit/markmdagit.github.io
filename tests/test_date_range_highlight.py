import pytest
from playwright.sync_api import Page, expect
import re
from datetime import datetime

def test_date_range_highlighting(page: Page):
    page.goto("http://localhost:8000/pages/index.html")

    # Open the admin dropdown and click the calendar button
    page.click("button#admin-btn")
    page.click("button#admin-dashboard-btn")

    # Ensure the calendar is visible
    expect(page.locator("#admin-dashboard")).to_be_visible()

    # Use current month
    now = datetime.now()
    year = now.year
    month = now.month

    # We will pick days 10 to 14 of the current month
    start_day = 10
    end_day = 14

    start_date_str = f"{year}-{month:02d}-{start_day:02d}"
    end_date_str = f"{year}-{month:02d}-{end_day:02d}"

    # Wait for the calendar to be loaded (current month is default)
    page.wait_for_selector(f".calendar-day[data-date='{start_date_str}']")

    # Select the date range
    page.click(f".calendar-day[data-date='{start_date_str}']")
    page.click(f".calendar-day[data-date='{end_date_str}']")

    # Verify that the intermediate days are highlighted
    for day in range(start_day, end_day + 1):
        date_str = f"{year}-{month:02d}-{day:02d}"
        day_element = page.locator(f".calendar-day[data-date='{date_str}']")
        expect(day_element).to_have_class(re.compile(r'in-range'))
