import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Add a listener for console events
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  // Clear session storage and local storage to ensure a clean state for each test
  await page.goto("/");
  await page.evaluate(() => {
    console.log("Before clear:", JSON.stringify(localStorage));
    window.sessionStorage.clear();
    window.localStorage.clear();
    console.log("After clear:", JSON.stringify(localStorage));
  });
});

test("has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Wishlist/);
});

test("shows login form", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Loading...")).not.toBeVisible();
  await expect(page.getByText("Wishlist App")).toBeVisible();
  await expect(
    page.getByText("Sign in or create an account to manage your wishlists")
  ).toBeVisible();
});
