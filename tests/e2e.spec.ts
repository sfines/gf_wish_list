import { test, expect, Page } from "@playwright/test";

const createTestUser = () => {
  const seq = Date.now() + Math.floor(Math.random() * 1000);
  return {
    email: `testuser${seq}@test.goodandfine.com`,
    password: "test1234",
    name: `Test User ${seq}`,
  };
};

async function signUpAndCreateWishlist(page: Page) {
  const user = createTestUser();
  
  // Sign up
  await page.goto("/");
  await page.getByRole("tab", { name: "Sign Up" }).click();
  await page.getByLabel("Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign Up" }).click();

  // Verify dashboard
  await expect(page.getByText(`Welcome, ${user.name}`)).toBeVisible({ timeout: 10000 });

  // Create wishlist
  const wishlistName = `Wishlist ${Date.now()}`;
  await page.getByRole("button", { name: "Create New Wishlist" }).click();
  await page.getByLabel("Name").fill(wishlistName);
  await page.getByRole("button", { name: "Create Wishlist" }).click();

  await expect(page.getByText(wishlistName)).toBeVisible();
  
  // Enter wishlist
  await page.getByText(wishlistName).click();
  
  return { user, wishlistName };
}

async function addItemToWishlist(page: Page, title: string) {
    const amazonUrl = "https://www.amazon.com/Michael-Kors-Malone-Billfold-Admiral/dp/B0DQRH6LR4/ref=hw_25_a_dag_fh_a47d?pf_rd_p=ba0cb436-0beb-41b0-be33-cd00f6578dc6&pf_rd_r=VNKVRSS60T853PCK3NP0&sr=1-1-9f939889-605c-4811-ad2b-cc2695a8891a&th=1";
    await page.getByRole("button", { name: "Add Item" }).click();
    await page.getByLabel("URL").fill(amazonUrl);
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Description").fill("Description");
    await page.getByRole("button", { name: "Add Item" }).click();
    await expect(page.getByText(title)).toBeVisible({ timeout: 15000 });
}

test.describe("Wishlist End-to-End Tests", () => {
  
  test("user can sign up, create, and view a wishlist", async ({ page }) => {
    const { wishlistName } = await signUpAndCreateWishlist(page);

    // Verify the wishlist view is loaded
    await expect(page.getByRole("heading", { name: wishlistName })).toBeVisible();
    await expect(page.getByText("Add Item")).toBeVisible();

    // Add an Amazon item
    const amazonUrl = "https://www.amazon.com/Michael-Kors-Malone-Billfold-Admiral/dp/B0DQRH6LR4/ref=hw_25_a_dag_fh_a47d?pf_rd_p=ba0cb436-0beb-41b0-be33-cd00f6578dc6&pf_rd_r=VNKVRSS60T853PCK3NP0&sr=1-1-9f939889-605c-4811-ad2b-cc2695a8891a&th=1";
    const itemTitle = "Michael Kors Malone Billfold";
    
    await page.getByRole("button", { name: "Add Item" }).click();
    await page.getByLabel("URL").fill(amazonUrl);
    await page.getByLabel("Title").fill(itemTitle);
    await page.getByLabel("Description").fill("A nice wallet");
    
    await page.getByRole("button", { name: "Add Item" }).click();

    // Increase timeout for this assertion as fetching Amazon data might take time
    await expect(page.getByText(itemTitle)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("link", { name: "View Product" })).toHaveAttribute("href", amazonUrl);
  });

  test("user can update a wishlist item's title and description", async ({ page }) => {
    await signUpAndCreateWishlist(page);
    const initialTitle = "Initial Item";
    await addItemToWishlist(page, initialTitle);

    // Find the item card and click its edit button
    const itemCard = page.locator('div.border.rounded-lg', { hasText: initialTitle });
    await itemCard.locator('button:has(.lucide-pencil)').click();

    const newTitle = "Updated Item Title";
    const newDescription = "Updated Description";

    await page.getByLabel("Title").fill(newTitle);
    await page.getByLabel("Description").fill(newDescription);
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page.getByText(newTitle)).toBeVisible();
    await expect(page.getByText(newDescription)).toBeVisible();
    await expect(page.getByText(initialTitle)).not.toBeVisible();
  });

  test("user can delete a wishlist item", async ({ page }) => {
    await signUpAndCreateWishlist(page);
    const itemTitle = "Item to Delete";
    await addItemToWishlist(page, itemTitle);

    // Click delete button for the item
    await page.getByLabel("Delete item").click();

    // Confirm deletion in AlertDialog
    await page.getByRole("button", { name: "Delete" }).click();

    // Wait for the dialog to close
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Verify item is gone from the list
    await expect(page.locator('h3', { hasText: itemTitle })).not.toBeVisible();
  });

  test("user can delete the wishlist itself", async ({ page }) => {
    const { wishlistName } = await signUpAndCreateWishlist(page);

    // Click delete wishlist button
    await page.getByLabel("Delete wishlist").click();

    // Confirm deletion
    await page.getByRole("button", { name: "Delete" }).click();

    // Should be redirected to dashboard
    await expect(page.getByText("Create New Wishlist")).toBeVisible();
    await expect(page.getByText(wishlistName)).not.toBeVisible();
  });

});
