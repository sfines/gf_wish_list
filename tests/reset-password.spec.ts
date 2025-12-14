import { test, expect } from "@playwright/test";

test.describe("Reset Password Routing", () => {
    test("navigating to recovery link shows invalid link message when no valid session", async ({ page }) => {
        // Navigate to the app with the recovery hash
        await page.goto("/#type=recovery");

        await expect(page.getByText("Invalid or Expired Link")).toBeVisible({ timeout: 10000 });
        await expect(page.getByText("This password reset link is invalid or has expired")).toBeVisible();

        // Check we can go back
        await page.getByRole("button", { name: "Back to Sign In" }).click();

        // Should return to main auth form or at least clear the reset mode
        // Check for the Sign In tab to confirm we are on the auth page
        await expect(page.getByRole("tab", { name: "Sign In" })).toBeVisible();
    });
});
