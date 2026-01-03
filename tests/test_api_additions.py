from playwright.sync_api import Page, expect

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
