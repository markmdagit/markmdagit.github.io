from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.goto("http://localhost:8000/pages/index.html")
    page.wait_for_timeout(1000)

    # Take screenshot of the nav menu
    os.makedirs("/app/verification", exist_ok=True)
    page.screenshot(path="/app/verification/nav_screenshot.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
