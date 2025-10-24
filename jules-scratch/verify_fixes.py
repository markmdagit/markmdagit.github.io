import re
from playwright.sync_api import Page, expect

def test_verify_fixes(page: Page):
    page.goto("http://localhost:8000/pages/projects.html")

    # Open the computers dropdown
    page.get_by_role("button", name="Computers").click()

    # Verify the W10 Incompatible links
    page.get_by_role("button", name="W10 Incompatible Solution").click()
    page.screenshot(path="jules-scratch/verification/w10_incompatible.png")

    # Open the computers dropdown again to access laptops button
    page.get_by_role("button", name="Computers").click()

    # Verify the copy buttons
    page.get_by_role("button", name="Laptops").click()
    page.screenshot(path="jules-scratch/verification/laptops.png")
