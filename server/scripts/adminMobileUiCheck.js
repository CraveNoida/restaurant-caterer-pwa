const playwrightImport = process.env.PLAYWRIGHT_IMPORT || "playwright";
const { chromium } = await import(playwrightImport);

const baseUrl = process.env.UI_QA_BASE_URL || "http://localhost:5173";
const adminIdentifier = process.env.SMOKE_ADMIN_EMAIL || "admin@example.com";
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD || "admin123";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function assertNoHorizontalOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  assert(metrics.scrollWidth <= metrics.clientWidth + 2, `${label} has horizontal overflow: ${metrics.scrollWidth} > ${metrics.clientWidth}`);
}

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROME_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROME_PATH } : {})
});

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  const browserErrors = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) browserErrors.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Phone or email").fill(adminIdentifier);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Login to Dashboard" }).click();
  await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  await page.getByText("Dashboard", { exact: false }).first().waitFor({ state: "visible", timeout: 10000 });
  await assertNoHorizontalOverflow(page, "dashboard");

  await page.getByRole("button", { name: "Menu" }).click();
  await page.locator(".admin-drawer.open").getByRole("heading", { name: "Ahmad Admin" }).waitFor({ state: "visible", timeout: 10000 });
  await page.getByRole("link", { name: "Orders" }).click();
  await page.waitForURL("**/admin/orders", { timeout: 10000 });
  await page.getByText("Orders", { exact: false }).first().waitFor({ state: "visible", timeout: 10000 });
  await assertNoHorizontalOverflow(page, "orders");

  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("link", { name: "Delivery Boys" }).click();
  await page.waitForURL("**/admin/delivery-boys", { timeout: 10000 });
  await page.getByText("Delivery Boys", { exact: false }).first().waitFor({ state: "visible", timeout: 10000 });
  await assertNoHorizontalOverflow(page, "delivery boys");

  const menuButtonVisible = await page.getByRole("button", { name: "Menu" }).isVisible();
  assert(menuButtonVisible, "Menu button is not visible on mobile");
  assert(browserErrors.length === 0, `Browser errors: ${browserErrors.join("; ")}`);

  console.log(JSON.stringify({ ok: true, pages: ["dashboard", "orders", "delivery-boys"] }, null, 2));
} finally {
  await browser.close();
}
