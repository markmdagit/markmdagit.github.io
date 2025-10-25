
import re
from playwright.sync_api import Page, expect

def test_removal_of_refurbished_laptops_section(page: Page):
    """
    This test verifies that the 'Refurbished Laptops to Consider' section
    has been completely removed from the Projects page.
    """
    # 1. Arrange: Navigate to the local projects page.
    # The local server should be running on port 8000.
    page.goto("http://localhost:8000/pages/projects.html")

    # 2. Act: Click the buttons to display the 'W10 Incompatible' section.
    # First, click the 'Computers' dropdown button.
    page.get_by_role("button", name="Computers").click()

    # Then, click the 'W10 Incompatible Solution' button to load the data.
    page.get_by_role("button", name="W10 Incompatible Solution").click()

    # 3. Assert: Check that the 'Refurbished Laptops to Consider' heading is NOT visible.
    # We expect the locator to find no matching elements.
    refurbished_heading = page.get_by_role("heading", name="Refurbished Laptops to Consider")
    expect(refurbished_heading).not_to_be_visible()

    # 4. Screenshot: Capture the state of the section for visual confirmation.
    # This screenshot will show the 'W10 Incompatible Solutions' section
    # without the 'Refurbished Laptops' category.
    page.screenshot(path="jules-scratch/verification/removal-verification.png")
