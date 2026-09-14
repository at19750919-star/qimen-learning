from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).parent
page_path = (root / "index.html").resolve().as_uri()
shots = root / "verification"
shots.mkdir(exist_ok=True)

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, channel="msedge")
    for name, viewport in {
        "desktop": {"width": 1440, "height": 1000},
        "mobile": {"width": 390, "height": 844},
    }.items():
        page = browser.new_page(viewport=viewport)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(page_path, wait_until="load")
        assert page.locator("img").count() == 6
        assert page.locator("img").evaluate_all("els => els.every(x => x.complete && x.naturalWidth > 0)")
        assert page.locator(".palace").count() == 9
        page.locator('[data-palace="坎一"]').click()
        assert page.locator("#detailTitle").inner_text() == "坎一宮"
        page.locator("#spiritsTab").click()
        assert page.locator("#spiritsPanel").is_visible()
        assert page.locator("#spiritsPanel img").is_visible()
        assert page.locator("#spiritsPanel img").evaluate("el => el.complete && el.naturalWidth > 0")
        page.locator("#revealBtn").click()
        assert "先在心裡回答" not in page.locator("#quizAnswer").inner_text()
        page.locator('[data-progress="elements"]').check()
        assert page.locator("#progressText").inner_text() == "完成 1／6"
        overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
        if overflow:
            offenders = page.evaluate("""[...document.querySelectorAll('*')]
              .filter(x => x.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
              .slice(0, 8).map(x => [x.tagName, x.className, Math.round(x.getBoundingClientRect().right)])""")
            raise AssertionError(f"horizontal overflow: {offenders}")
        assert not errors, errors
        page.screenshot(path=str(shots / f"{name}.png"), full_page=True)
        page.close()
    browser.close()

print("PASS: desktop/mobile rendering, images, navigation interactions, quiz, and progress state.")
