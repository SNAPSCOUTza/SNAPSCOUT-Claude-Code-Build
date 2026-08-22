import { chromium } from "playwright"
import path from "path"

const BASE = "http://localhost:3001"
const OUT_DIR = path.join(process.cwd(), "screenshots", "source")

const targets = [
  {
    name: "03-get-discovered.png",
    url: `${BASE}/crew/2c5258ad-5011-4094-8fe4-065037e3538c`,
    scrollY: 0,
  },
  {
    name: "01-see-rates.png",
    url: `${BASE}/crew/2c5258ad-5011-4094-8fe4-065037e3538c`,
    scrollY: 720,
  },
  {
    name: "04-showcase-portfolio.png",
    url: `${BASE}/crew/2c5258ad-5011-4094-8fe4-065037e3538c`,
    scrollY: 1850,
  },
  {
    name: "02-book-creatives.png",
    url: `${BASE}/creators`,
    scrollY: 0,
  },
  {
    name: "05-scout-locations.png",
    url: `${BASE}/locations`,
    scrollY: 0,
  },
]

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
})
const page = await context.newPage()

for (const target of targets) {
  await page.goto(target.url, { waitUntil: "networkidle" })
  await page.waitForTimeout(1500)
  if (target.scrollY) {
    await page.evaluate((y) => window.scrollTo(0, y), target.scrollY)
    await page.waitForTimeout(800)
  }
  const outPath = path.join(OUT_DIR, target.name)
  await page.screenshot({ path: outPath })
  console.log("saved", outPath, "from", page.url())
}

await browser.close()
