import { test, expect, Page } from "@playwright/test";

const createTestUser = () => {
    const seq = Date.now() + Math.floor(Math.random() * 1000);
    return {
        email: `testuser${seq}@test.goodandfine.com`,
        password: "test1234",
        name: `Test User ${seq}`,
    };
};

async function signUp(page: Page, userOverride?: any) {
    const user = userOverride || createTestUser();
    await page.goto("/");
    await page.getByRole("tab", { name: "Sign Up" }).click();
    await page.getByLabel("Name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Sign Up" }).click();
    try {
        await expect(page.getByText(`Welcome, ${user.name}`)).toBeVisible({
            timeout: 30000,
        });
    } catch (e) {
        const errorMsg = await page.locator(".text-red-600").textContent().catch(() => "No specific error message found");
        throw new Error(`Signup failed. UI Error: ${errorMsg}`);
    }
    return user;
}

async function createWishlist(page: Page, name: string) {
    await page.getByRole("button", { name: "Create New Wishlist" }).click();
    await page.getByLabel("Name").fill(name);
    await page.getByRole("button", { name: "Create Wishlist" }).click();
    await expect(page.getByText(name)).toBeVisible();
}

test.describe("Follow Wishlist E2E Tests", () => {
    test("user can search for and follow another user's wishlist", async ({
        browser,
    }) => {
        // 1. User A creates a wishlist
        const contextA = await browser.newContext();
        const pageA = await contextA.newPage();
        const userA = createTestUser();

        await signUp(pageA, userA);
        const wishlistName = `User A's Wishlist ${Date.now()}`;
        await createWishlist(pageA, wishlistName);

        // 2. User B searches for User A's wishlist
        const pageB = await browser.newPage();
        const userB = createTestUser();

        await signUp(pageB, userB);

        // Open Find Wishlist Dialog
        await pageB.getByRole("button", { name: "Find Wishlists" }).click();

        // Search by User A's name
        await pageB.getByPlaceholder("Search by owner name or token").fill(userA.name);
        await pageB.getByRole("button", { name: "Search" }).click();

        // Verify search result appears
        // The search result should contain the wishlist name and owner name
        await expect(pageB.locator("h4", { hasText: wishlistName })).toBeVisible({ timeout: 10000 });
        await expect(pageB.getByText(`by ${userA.name}`)).toBeVisible();

        // 3. User B follows the wishlist
        await pageB.getByRole("button", { name: "Follow" }).click();

        // Expect button to change to "Following"
        await expect(pageB.getByRole("button", { name: "Following" })).toBeVisible();

        // Close the dialog
        await pageB.getByRole("button", { name: "Close" }).click().catch(() => pageB.keyboard.press("Escape"));
        await expect(pageB.getByRole("dialog")).toBeHidden();

        // 4. Verify it appears on User B's dashboard
        await expect(pageB.locator("h2", { hasText: "Following" })).toBeVisible();

        const followingCard = pageB.locator(".border-pink-100", { hasText: wishlistName });
        await expect(followingCard).toBeVisible();
        await expect(followingCard.getByText(`by ${userA.name}`)).toBeVisible();

        // 5. User B unfollows from the dashboard
        // Hover or click text to ensure visibility if needed, but the button should be there
        const unfollowBtn = followingCard.locator("button[title='Unfollow']");
        await unfollowBtn.click();

        // Verify it disappears from the dashboard
        await expect(followingCard).not.toBeVisible();

        await contextA.close();
    });
});
