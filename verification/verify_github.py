from playwright.sync_api import sync_playwright, expect

def verify_github_profile():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the local server page
        page.goto("http://localhost:8000/pages/api-ideas.html")

        # Wait for the GitHub card to be visible
        card = page.locator(".github-profile-card")
        expect(card).to_be_visible(timeout=10000)

        # Scroll the card into view
        card.scroll_into_view_if_needed()

        # Take screenshot
        page.screenshot(path="verification/github_verification.png")
        print("Screenshot taken at verification/github_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_github_profile()
