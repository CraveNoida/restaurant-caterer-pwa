const playwrightImport = process.env.PLAYWRIGHT_IMPORT || "playwright";
const { chromium } = await import(playwrightImport);

const baseUrl = process.env.UI_QA_BASE_URL || "http://localhost:5173";
const loginPhone = process.env.UI_QA_DELIVERY_PHONE || "9123400002";
const loginPassword = process.env.UI_QA_DELIVERY_PASSWORD || "Delivery123";

const results = [];
const browserErrors = [];

function pass(message) {
  results.push(message);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectVisible(page, text, message = `${text} should be visible`) {
  const locator = page.getByText(text, { exact: false });
  await locator.first().waitFor({ state: "visible", timeout: 10000 });
  pass(message);
}

async function clickCardLink(page, orderId, linkText = "View Details") {
  const card = page.locator(".delivery-order-card").filter({ hasText: orderId });
  await card.waitFor({ state: "visible", timeout: 10000 });
  await card.getByText(linkText, { exact: false }).click();
}

async function updateStatus(page, label, needsConfirm = false) {
  await page.getByRole("button", { name: label }).click();
  if (needsConfirm) {
    await expectVisible(page, "Confirm status update", "confirmation modal opened");
    const confirmButton = label === "Delivered" ? "Mark delivered" : "Mark failed";
    await page.getByRole("button", { name: confirmButton }).click();
  }
  await expectVisible(page, "Status updated to", `${label} toast shown`);
}

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROME_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROME_PATH } : {})
});
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  const page = await context.newPage();

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      browserErrors.push(`console ${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => browserErrors.push(`page error: ${error.message}`));
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (!url.includes("chrome-extension://")) {
      browserErrors.push(`request failed: ${url} ${request.failure()?.errorText || ""}`.trim());
    }
  });

  await page.goto(`${baseUrl}/delivery/login`, { waitUntil: "domcontentloaded" });
  await expectVisible(page, "Delivery Login", "delivery login page opened");
  await page.getByLabel("Phone or email").fill(loginPhone);
  await page.getByLabel("Password").fill(loginPassword);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL("**/delivery/dashboard", { timeout: 15000 });
  await expectVisible(page, "Dashboard", "dashboard opened after login");
  await expectVisible(page, "QA-DELIVERY-001", "assigned order visible on dashboard");
  assert(!(await page.getByText("QA-DELIVERY-003").isVisible().catch(() => false)), "Unassigned order appeared on dashboard");
  assert(!(await page.getByText("QA-DELIVERY-004").isVisible().catch(() => false)), "Other delivery boy order appeared on dashboard");

  await page.getByRole("link", { name: "Orders" }).click();
  await page.waitForURL("**/delivery/orders", { timeout: 10000 });
  await expectVisible(page, "Assigned Orders", "orders page opened");
  await expectVisible(page, "QA-DELIVERY-001", "assigned order visible on orders page");
  await expectVisible(page, "QA-DELIVERY-002", "second assigned order visible on orders page");
  assert(!(await page.getByText("QA-DELIVERY-003").isVisible().catch(() => false)), "Unassigned order appeared on orders page");
  assert(!(await page.getByText("QA-DELIVERY-004").isVisible().catch(() => false)), "Other driver order appeared on orders page");

  await clickCardLink(page, "QA-DELIVERY-001");
  await page.waitForURL("**/delivery/orders/QA-DELIVERY-001", { timeout: 10000 });
  await expectVisible(page, "QA Customer", "order detail customer name visible");
  await expectVisible(page, "QA House 12", "order detail address visible");
  await expectVisible(page, "Near QA Circle", "order detail landmark visible");
  await expectVisible(page, "QA Chicken Biryani", "order detail item visible");
  await expectVisible(page, "Cash on Delivery - pending", "order detail payment visible");
  await expectVisible(page, "Ring the bell twice.", "order detail notes visible");

  const callHref = await page.getByText("Call Customer").getAttribute("href");
  const whatsappHref = await page.getByText("WhatsApp").getAttribute("href");
  const mapsHref = await page.getByText("Open Maps").getAttribute("href");
  assert(callHref === "tel:9123400001", `Call href was ${callHref}`);
  assert(whatsappHref?.startsWith("https://wa.me/919123400001?text="), `WhatsApp href was ${whatsappHref}`);
  assert(mapsHref?.startsWith("https://www.google.com/maps/search/?api=1&query="), `Maps href was ${mapsHref}`);
  assert(mapsHref.includes("QA%20House%2012"), `Maps href did not include encoded address: ${mapsHref}`);
  pass("call, whatsapp, and maps links formatted correctly");

  await updateStatus(page, "Picked up");
  await updateStatus(page, "On the way");
  await updateStatus(page, "Delivered", true);

  await page.getByRole("link", { name: "Completed" }).click();
  await page.waitForURL("**/delivery/completed", { timeout: 10000 });
  await expectVisible(page, "QA-DELIVERY-001", "delivered order appears on completed page");

  await page.getByRole("link", { name: "Orders" }).click();
  await page.waitForURL("**/delivery/orders", { timeout: 10000 });
  await clickCardLink(page, "QA-DELIVERY-002");
  await page.waitForURL("**/delivery/orders/QA-DELIVERY-002", { timeout: 10000 });
  await updateStatus(page, "Failed delivery", true);

  await page.getByRole("link", { name: "Profile" }).click();
  await page.waitForURL("**/delivery/profile", { timeout: 10000 });
  await expectVisible(page, "QA Delivery", "profile page opened");
  await expectVisible(page, "completed deliveries", "completed delivery count visible");

  await page.setViewportSize({ width: 360, height: 740 });
  await expectVisible(page, "Profile", "mobile narrow viewport still renders profile");

  await page.getByRole("main").getByRole("button", { name: "Logout" }).click();
  await page.waitForURL("**/delivery/login", { timeout: 10000 });
  await expectVisible(page, "Delivery Login", "logout returned to delivery login");

  const desktopPage = await context.newPage();
  await desktopPage.goto(`${baseUrl}/delivery/login`, { waitUntil: "domcontentloaded" });
  await desktopPage.setViewportSize({ width: 1280, height: 800 });
  await expectVisible(desktopPage, "Delivery Login", "desktop viewport renders delivery login");

  assert(browserErrors.length === 0, `Browser errors found: ${browserErrors.join("; ")}`);

  console.log(JSON.stringify({ ok: true, results, browserErrors }, null, 2));
} finally {
  await browser.close();
}
