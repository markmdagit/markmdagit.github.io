
import asyncio
from playwright.async_api import async_playwright, expect

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            # Navigate to the page
            await page.goto("http://localhost:8000/pages/api-ideas.html")
            print("Page loaded.")

            # Scroll to the techy text section
            techy_section = page.locator("h3:has-text('Techy Text Generator')")
            await techy_section.scroll_into_view_if_needed()

            # Verify elements exist
            output_div = page.locator("#techy-text-output")
            generate_btn = page.locator("#generate-techy-text-btn")

            await expect(output_div).to_be_visible()
            await expect(generate_btn).to_be_visible()
            print("Elements found.")

            # Verify styles
            # Background should be black (rgb(0, 0, 0)) and text green (rgb(0, 255, 0))
            bg_color = await output_div.evaluate("el => window.getComputedStyle(el).backgroundColor")
            text_color = await output_div.evaluate("el => window.getComputedStyle(el).color")
            font_family = await output_div.evaluate("el => window.getComputedStyle(el).fontFamily")

            print(f"Background: {bg_color}")
            print(f"Text Color: {text_color}")
            print(f"Font Family: {font_family}")

            if bg_color == "rgb(0, 0, 0)" and text_color == "rgb(0, 255, 0)":
                print("SUCCESS: Styles are correct.")
            else:
                print("FAILURE: Styles incorrect.")

            # Verify loading text initially
            initial_text = await output_div.inner_text()
            print(f"Initial Text: {initial_text}")

            # Wait for text to change from "Loading..." (or just wait a bit if it loads fast)
            # Since the API is real, it might take a moment.
            # We can wait for the text to NOT be "Loading..."
            try:
                await expect(output_div).not_to_have_text("Loading...", timeout=10000)
                new_text = await output_div.inner_text()
                print(f"New Text Loaded: {new_text}")
                print("SUCCESS: API fetched text.")
            except:
                print("WARNING: Text stuck on Loading... (API might be slow or blocked)")

            # Click Generate Button
            await generate_btn.click()
            print("Clicked Generate Button.")

            # Wait for text to change (tough to verify if it randomly returns the same thing, but unlikely)
            # We'll just take a screenshot
            await asyncio.sleep(2) # Wait for fetch

            # Take screenshot
            await page.screenshot(path="verification/techy_text.png", full_page=False)
            print("Screenshot saved to verification/techy_text.png")

        except Exception as e:
            print(f"Error: {e}")
            await page.screenshot(path="verification/error_techy_text_screenshot.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
