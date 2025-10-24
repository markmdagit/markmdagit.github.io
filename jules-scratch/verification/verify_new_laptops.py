import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.goto("http://localhost:8000/pages/projects.html")

        # Click the "Computers" dropdown
        await page.click("#computers-btn")

        # Click the "W10 Incompatible Solution" button
        await page.click("#w10-incompatible-btn")

        # Wait for the "New Laptops to Consider" section to be visible
        new_laptops_section = page.get_by_role("heading", name="New Laptops to Consider")
        await expect(new_laptops_section).to_be_visible()

        # Take a screenshot
        await page.screenshot(path="jules-scratch/verification/new_laptops.png")

        await browser.close()

asyncio.run(main())
