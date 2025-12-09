from playwright.sync_api import Page, expect

def test_new_project_standalone(page: Page):
    # Navigate to the new project index.html
    page.goto("http://localhost:8000/computers_project/index.html")

    # 1. Check Title
    expect(page.locator("h1")).to_have_text("Computers Project")

    # 2. Check Tabs
    expect(page.locator(".tab-btn[data-tab='laptops-content']")).to_be_visible()
    expect(page.locator(".tab-btn[data-tab='supply-chain-content']")).to_be_visible()
    expect(page.locator(".tab-btn[data-tab='chatbot-content']")).to_be_visible()

    # 3. Check React Laptops (should be loaded by bundle.js)
    # Wait for the React root to populate
    expect(page.locator("#root .laptop-card").first).to_be_visible(timeout=10000)

    # 4. Check Supply Chain
    page.locator(".tab-btn[data-tab='supply-chain-content']").click()
    expect(page.locator("#elitebook-supply-chain-cards .laptop-card").first).to_be_visible()

    # 5. Check Chatbot
    page.locator(".tab-btn[data-tab='chatbot-content']").click()
    expect(page.locator(".chat-window")).to_be_visible()
