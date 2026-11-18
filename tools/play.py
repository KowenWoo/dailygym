import asyncio, sys
from playwright.async_api import async_playwright
async def play(b, day, shots=False):
    pg = await b.new_page(viewport={'width':1200,'height':900})
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    url='file://' + __import__('os').path.abspath('dist/index.html') + f'?day={day}'
    await pg.goto(url); await pg.wait_for_timeout(800)
    if await pg.query_selector('.dialog'): await pg.click('.dialog .primary')
    await pg.click('text=Start the draft')
    n = await pg.evaluate("document.querySelectorAll('.lmon').length")
    for i in range(n): await pg.locator('.card').nth(i).click()
    await pg.click('.sticky .primary'); await pg.click('.dialog .primary')
    turns=0; reloaded=False
    for t in range(80):
        if await pg.query_selector('text=See results'): break
        btn = await pg.query_selector('.movebtn:not([disabled])') or await pg.query_selector('.pmon:not([disabled])')
        if btn: await btn.click(); turns+=1
        await pg.wait_for_timeout(1500)
        if turns==2 and not reloaded:
            reloaded=True
            await pg.wait_for_timeout(4000); await pg.reload(); await pg.wait_for_timeout(1500)
            txt = await pg.inner_text('.log'); ok = 'Resumed' in txt
            if shots: await pg.screenshot(path=f'/tmp/r_{day}.png')
            print(day,'resumed ok' if ok else 'RESUME FAIL')
    res = await pg.query_selector('text=See results')
    if res: await res.click(); await pg.wait_for_timeout(300)
    share = await pg.inner_text('.share') if await pg.query_selector('.share') else 'NO RESULT'
    print(day, 'clicks', turns, '|', share.replace('\n',' / '), '| errors', errs[:3])
    await pg.close()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=__import__('os').environ.get('CHROME', '/usr/bin/google-chrome'), args=['--no-sandbox'])
        for d in map(int, sys.argv[1:]): await play(b, d, True)
        await b.close()
asyncio.run(main())
