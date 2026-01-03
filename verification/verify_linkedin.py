from playwright.sync_api import sync_playwright, expect

def verify_linkedin_profile():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the local server page
        page.goto("http://localhost:8000/pages/api-ideas.html")

        # Wait for the card to be visible
        # We need to wait a bit because there is a simulated delay of 1.5s
        profile_card = page.locator(".linkedin-profile-card")

        # Wait for the loading indicator to disappear or the card to appear
        expect(profile_card).to_be_visible(timeout=5000)

        # Verify content
        expect(page.locator(".linkedin-name")).to_have_text("Marcos Alvarez")
        expect(page.locator(".linkedin-headline")).to_have_text("IT Support Associate II at Amazon Robotics Sort Center")

        # Take screenshot
        page.screenshot(path="verification/linkedin_verification.png")
        print("Screenshot taken at verification/linkedin_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_linkedin_profile()
