import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=__import__('os').environ.get('CHROME', '/usr/bin/google-chrome'), args=['--no-sandbox'])
        for w,hh,tag in [(1200,900,'d'),(390,844,'m')]:
            pg = await b.new_page(viewport={'width':w,'height':hh})
            errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
            await pg.goto('file://' + __import__('os').path.abspath('dist/index.html'))
            await pg.wait_for_timeout(1500)
            await pg.screenshot(path=f'/tmp/s_{tag}_1.png')
            await pg.click('.dialog .primary'); await pg.click('text=Start the draft'); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f'/tmp/s_{tag}_2.png', full_page=True)
            n = await pg.evaluate("document.querySelectorAll('.lmon').length")
            for i in range(n): await pg.locator('.card').nth(i).click()
            await pg.click('.sticky .primary'); await pg.click('.dialog .primary')
            await pg.wait_for_timeout(2500)
            await pg.screenshot(path=f'/tmp/s_{tag}_3.png')
            for t in range(40):
                if await pg.query_selector('text=See results'): break
                btn = await pg.query_selector('.movebtn:not([disabled])') or await pg.query_selector('.pmon:not([disabled])')
                if btn:
                    await btn.click()
                await pg.wait_for_timeout(5000 if t<2 else 2500)
                if t==2: await pg.screenshot(path=f'/tmp/s_{tag}_4.png')
            if await pg.query_selector('text=See results'):
                await pg.click('text=See results'); await pg.wait_for_timeout(400)
            await pg.screenshot(path=f'/tmp/s_{tag}_5.png', full_page=True)
            print(tag, 'errors:', errs[:5])
            if tag=='d': 
                # reload mid/after to test persistence
                await pg.reload(); await pg.wait_for_timeout(1500); await pg.screenshot(path=f'/tmp/s_{tag}_6.png')
        await b.close()
asyncio.run(main())
