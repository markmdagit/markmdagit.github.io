from playwright.sync_api import Page, expect
import re

def test_api_additions_exist(page: Page):
    page.goto('http://localhost:8000/pages/api-ideas.html')

    # Check YouTube Section
    expect(page.locator('h3', has_text='YouTube Trending Tracker')).to_be_visible()
    expect(page.locator('.youtube-carousel')).to_be_visible()
    expect(page.locator('.video-card')).to_have_count(10)

    # Check Stock Section
    expect(page.locator('h3', has_text='Fortune 500 Stock Tracker')).to_be_visible()
    expect(page.locator('.stock-item')).to_have_count(5)
    expect(page.locator('.stock-symbol', has_text='AMZN')).to_be_visible()

    # Check Commodity Section
    expect(page.locator('h3', has_text='Commodity Price Tracker')).to_be_visible()
    expect(page.locator('.commodity-card')).to_have_count(4)
    expect(page.locator('.commodity-name', has_text='Eggs')).to_be_visible()
    expect(page.locator('.commodity-name', has_text='Gold')).to_be_visible()

def test_gemini_image_generation(page: Page):
    page.goto('http://localhost:8000/pages/api-ideas.html')

    # Check Gemini Section exists
    expect(page.locator('h3', has_text='Gemini 2.5 Flash Image API')).to_be_visible()

    # Enter prompt
    page.fill('#gemini-prompt', 'Test Image')
    page.click('#generate-gemini-btn')

    # Expect image to load
    img = page.locator('#gemini-result img')
    expect(img).to_be_visible(timeout=15000)

    # Check src contains loremflickr
    expect(img).to_have_attribute('src', re.compile(r'https://loremflickr\.com'))

def test_stock_ticker_updates(page: Page):
    page.goto('http://localhost:8000/pages/api-ideas.html')

    # Get initial price of first stock
    first_price_loc = page.locator('.stock-price').first
    initial_price = first_price_loc.inner_text()

    # Wait for update (interval is 2000ms)
    page.wait_for_timeout(3000)

    # Get new price
    new_price = first_price_loc.inner_text()

    # Assert price changed (it's random, but probability of exact same float is low, though possible.
    # For robustness, we might check if text content updates at all, or run loop)
    # Since it renders every 2 seconds, the DOM element is replaced.
    # checking not equal is usually safe enough for random float + noise.
    assert initial_price != new_price

def test_qr_code_generator(page: Page):
    page.goto('http://localhost:8000/pages/api-ideas.html')

    # Check section exists
    expect(page.locator('h3', has_text='QR Code Generator')).to_be_visible()

    # Fill input
    page.fill('#qr-text', 'https://www.google.com')

    # Click generate
    page.click('#generate-qr-btn')

    # Wait for image
    img = page.locator('#qr-result img')
    expect(img).to_be_visible(timeout=10000)

    # Check src
    expect(img).to_have_attribute('src', re.compile(r'https://api.qrserver.com/v1/create-qr-code/'))

    # Verify the data param in src contains encoded URL
    expect(img).to_have_attribute('src', re.compile(r'data=https%3A%2F%2Fwww\.google\.com'))

def test_dictionary_api(page: Page):
    page.goto('http://localhost:8000/pages/api-ideas.html')

    # Check section exists
    expect(page.locator('h3', has_text='Free Dictionary API')).to_be_visible()

    # Fill input
    page.fill('#dictionary-word', 'hello')

    # Click search
    page.click('#search-dictionary-btn')

    # Wait for result
    def_el = page.locator('#dict-definition')
    expect(def_el).not_to_have_text('-', timeout=10000)
    expect(def_el).not_to_have_text('N/A')

    # Check that the result container is visible
    expect(page.locator('#dictionary-result')).to_be_visible()

def test_dictionary_api_budget(page: Page):
    page.goto('http://localhost:8000/pages/api-ideas.html')

    # Fill input
    page.fill('#dictionary-word', 'budget')

    # Click search
    page.click('#search-dictionary-btn')

    # Wait for result
    expect(page.locator('#dict-definition')).not_to_have_text('N/A', timeout=10000)

    # Verify synonyms are populated (expect "low-cost" or similar found in adjective meaning)
    expect(page.locator('#dict-synonyms')).not_to_have_text('N/A')

    # Verify example is populated (expect example from verb meaning)
    expect(page.locator('#dict-example')).not_to_have_text('N/A')
