from playwright.sync_api import Page, expect
import re

def test_api_additions_exist(page: Page):
    page.goto('http://localhost:8000/pages/api-examples.html')

    # Check Weather Section
    expect(page.locator('h3', has_text='Weather Forecast')).to_be_visible()

    # Check ESPN Section
    expect(page.locator('h3', has_text='What game is playing today?')).to_be_visible()
