from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:8000/pages/projects.html")

    # Click the Computers dropdown
    page.click("#computers-btn")

    # Click the Supply Chain button and take a screenshot
    page.click("#supply-chain-btn")
    page.screenshot(path="jules-scratch/verification/supply_chain.png")

    # Click the Computers dropdown again to make the buttons visible
    page.click("#computers-btn")

    # Click the W10 Incompatible Solution button and take a screenshot
    page.click("#w10-incompatible-btn")
    page.screenshot(path="jules-scratch/verification/w10_incompatible.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
