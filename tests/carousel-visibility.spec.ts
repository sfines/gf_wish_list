
import { test, expect } from "@playwright/test";

const createTestUser = () => {
    const seq = Date.now() + Math.floor(Math.random() * 1000);
    return {
        email: `carousel${seq}@test.goodandfine.com`,
        password: "test1234",
        name: `Carousel User ${seq}`,
    };
};

test.describe("Carousel Visibility States", () => {
    test("shows loading state and then images", async ({ page }) => {
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        // Setup User
        const user = createTestUser();
        await page.goto("/");
        await page.getByRole("tab", { name: "Sign Up" }).click();
        await page.getByLabel("Name").fill(user.name);
        await page.getByLabel("Email").fill(user.email);
        await page.getByLabel("Password").fill(user.password);
        await page.getByRole("button", { name: "Sign Up" }).click();
        await expect(page.getByText(`Welcome, ${user.name}`)).toBeVisible();

        // Create Wishlist
        await page.getByRole("button", { name: "Create New Wishlist" }).click();
        await page.getByLabel("Name").fill("Carousel Test List");
        await page.getByRole("button", { name: "Create Wishlist" }).click();
        await page.getByText("Carousel Test List").click();

        // Mock API with delay
        await page.route("**/product-details?asin=B0DQRH6LR4&country=us", async (route) => {
            await new Promise(r => setTimeout(r, 1000)); // 1s delay
            const json = {
                status: "success",
                images: ["https://example.com/image.jpg"]
            };
            await route.fulfill({ json });
        });

        // Add Item
        await page.getByRole("button", { name: "Add Item" }).click();
        await page.getByLabel("URL").fill("https://www.amazon.com/Michael-Kors-Malone-Billfold-Admiral/dp/B0DQRH6LR4");

        // Expect Loading
        await expect(page.getByText("Loading images...")).toBeVisible();

        // Expect Carousel
        await expect(page.locator('[aria-label="Image selection carousel"]')).toBeVisible();
    });

    test("shows no images found state", async ({ page }) => {
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        // Setup User (reuse helper if possible, but duplication is fine for isolated test file)
        const user = createTestUser();
        await page.goto("/");
        await page.getByRole("tab", { name: "Sign Up" }).click();
        await page.getByLabel("Name").fill(user.name);
        await page.getByLabel("Email").fill(user.email);
        await page.getByLabel("Password").fill(user.password);
        await page.getByRole("button", { name: "Sign Up" }).click();

        await page.getByRole("button", { name: "Create New Wishlist" }).click();
        await page.getByLabel("Name").fill("Empty Test List");
        await page.getByRole("button", { name: "Create Wishlist" }).click();
        await page.getByText("Empty Test List").click();

        // Mock API failure/empty
        await page.route("**/product-details?asin=B0DQRH6LR4&country=us", async (route) => {
            const json = { status: "success", images: [] };
            await route.fulfill({ json });
        });

        // Mock fallback/proxy failure
        await page.route("https://corsproxy.io/**", async route => route.abort());
        await page.route("https://api.allorigins.win/**", async route => route.abort());

        // Add Item
        await page.getByRole("button", { name: "Add Item" }).click();
        await page.getByLabel("URL").fill("https://www.amazon.com/Michael-Kors-Malone-Billfold-Admiral/dp/B0DQRH6LR4");

        // Wait for debounce
        await page.waitForTimeout(1100);

        // Expect No Images Found
        await expect(page.getByText("No images found")).toBeVisible();
        await expect(page.locator('[aria-label="Image selection carousel"]')).not.toBeVisible();
    });
});
