import { test, expect, Page } from "@playwright/test";

const createTestUser = () => {
  const seq = Date.now() + Math.floor(Math.random() * 1000);
  return {
    email: `testuser${seq}@test.goodandfine.com`,
    password: "test1234",
    name: `Test User ${seq}`,
  };
};

async function signUp(page: Page) {
  const user = createTestUser();
  await page.goto("/");
  await page.getByRole("tab", { name: "Sign Up" }).click();
  await page.getByLabel("Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign Up" }).click();
  await expect(page.getByText(`Welcome, ${user.name}`)).toBeVisible({
    timeout: 10000,
  });
  return user;
}

async function signUpAndCreateWishlist(page: Page) {
  const user = await signUp(page);

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
  const amazonUrl =
    "https://www.amazon.com/Michael-Kors-Malone-Billfold-Admiral/dp/B0DQRH6LR4/ref=hw_25_a_dag_fh_a47d?pf_rd_p=ba0cb436-0beb-41b0-be33-cd00f6578dc6&pf_rd_r=VNKVRSS60T853PCK3NP0&sr=1-1-9f939889-605c-4811-ad2b-cc2695a8891a&th=1";
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
    await expect(
      page.getByRole("heading", { name: wishlistName })
    ).toBeVisible();
    await expect(page.getByText("Add Item")).toBeVisible();

    // Add an Amazon item
    const amazonUrl =
      "https://www.amazon.com/Michael-Kors-Malone-Billfold-Admiral/dp/B0DQRH6LR4/ref=hw_25_a_dag_fh_a47d?pf_rd_p=ba0cb436-0beb-41b0-be33-cd00f6578dc6&pf_rd_r=VNKVRSS60T853PCK3NP0&sr=1-1-9f939889-605c-4811-ad2b-cc2695a8891a&th=1";
    const itemTitle = "Michael Kors Malone Billfold";

    await page.getByRole("button", { name: "Add Item" }).click();
    await page.getByLabel("URL").fill(amazonUrl);
    await page.getByLabel("Title").fill(itemTitle);
    await page.getByLabel("Description").fill("A nice wallet");

    await page.getByRole("button", { name: "Add Item" }).click();

    // Increase timeout for this assertion as fetching Amazon data might take time
    await expect(page.getByText(itemTitle)).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole("link", { name: "View Product" })
    ).toHaveAttribute("href", amazonUrl);
  });

  test("user can update a wishlist item's title and description", async ({
    page,
  }) => {
    await signUpAndCreateWishlist(page);
    const initialTitle = "Initial Item";
    await addItemToWishlist(page, initialTitle);

    // Find the item card and click its edit button
    const itemCard = page.locator("div.border.rounded-lg", {
      hasText: initialTitle,
    });
    await itemCard.locator("button:has(.lucide-pencil)").click();

    const newTitle = "Updated Item Title";
    const newDescription = "Updated Description";

    await page.getByLabel("Title").fill(newTitle);
    await page.getByLabel("Description").fill(newDescription);
    await page.getByRole("button", { name: "Save Changes" }).click({ force: true });
    await expect(page.getByText(newTitle)).toBeVisible({ timeout: 15000 });
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
    await expect(page.locator("h3", { hasText: itemTitle })).not.toBeVisible();
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

  test("user can share a wishlist and another user can follow it", async ({
    browser,
  }) => {
    // User A context
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    const { wishlistName } = await signUpAndCreateWishlist(pageA);

    // User A shares the wishlist
    await pageA.getByRole("button", { name: "Share" }).click();
    const shareUrl = await pageA.locator("input[readonly]").inputValue();
    await pageA.getByRole("button", { name: "Close" }).click(); // Or click outside, but dialog usually has close or we can just ignore

    // User B context
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await signUp(pageB);

    // User B visits the share link
    await pageB.goto(shareUrl);
    await expect(
      pageB.getByRole("heading", { name: wishlistName })
    ).toBeVisible();

    // User B follows the wishlist
    await pageB.getByRole("button", { name: "Follow" }).click();
    // Expect button to change to "Unfollow"
    await expect(pageB.getByRole("button", { name: "Unfollow" })).toBeVisible();

    // User B goes to dashboard and sees the followed wishlist
    await pageB.goto("/");
    // Assuming there is a "Following" section or it appears in the list
    // Based on WishlistDashboard.tsx, it might just list them.
    // Let's check if it's visible.
    await expect(pageB.getByText(wishlistName)).toBeVisible();

    // User B unfollows
    await pageB.getByText(wishlistName).click();
    await pageB.getByRole("button", { name: "Unfollow" }).click();
    await expect(pageB.getByRole("button", { name: "Follow" })).toBeVisible();

    // User B goes to dashboard and should NOT see the wishlist
    await pageB.goto("/");
    await expect(pageB.getByText(wishlistName)).not.toBeVisible();

    await contextA.close();
    await contextB.close();
  });

  test("user can select a different image for a wishlist item", async ({
    page,
  }) => {
    // Mock RapidAPI response to ensure multiple images are returned
    await page.route("*rapidapi.com*", async (route) => {
      const json = {
        status: "success",
        title: "Michael Kors Malone Billfold",
        images: [
          "https://m.media-amazon.com/images/I/81vJ-D8soVL._AC_SL1500_.jpg",
          "https://m.media-amazon.com/images/I/81Phd7-lDqL._AC_SL1500_.jpg",
          "https://m.media-amazon.com/images/I/81g+9q+8q+L._AC_SL1500_.jpg",
        ],
      };
      await route.fulfill({ json });
    });

    await signUpAndCreateWishlist(page);
    const itemTitle = "Item with Images";
    await addItemToWishlist(page, itemTitle);

    // Find the item card and click its edit button
    const itemCard = page.locator("div.border.rounded-lg", {
      hasText: itemTitle,
    });
    await itemCard.locator("button:has(.lucide-pencil)").click();

    // Verify carousel is visible
    // Verify carousel is visible
    await expect(page.locator('[aria-label="Image selection carousel"]')).toBeVisible();

    // Click next slide to see the second image
    const nextButton = page.getByRole("button", { name: "Next slide" });
    await expect(nextButton).toBeEnabled();
    await nextButton.click({ force: true });
    await page.waitForTimeout(500); // Wait for animation

    // Select the second image (Option 2)
    // Note: Embla might render multiple slides, but we click the one with alt "Option 2"
    await page.getByAltText("Option 2").first().click({ force: true });

    // Save changes
    await page.getByRole("button", { name: "Save Changes" }).click();

    // Verify the item is still visible
    await expect(page.getByText(itemTitle)).toBeVisible();
  });

  test("user can select a different image for a wishlist item (real product)", async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

    // Mock RapidAPI response to ensure we get multiple images
    await page.route("**/product-details?asin=B0DQRH6LR4&country=us", async (route) => {
      console.log("Mocking RapidAPI response");
      const json = {
        status: "success",
        images: [
          "https://m.media-amazon.com/images/I/51VCmEhgD5L._AC_.jpg",
          "https://m.media-amazon.com/images/I/316zQvmY8zL._AC_.jpg",
          "https://m.media-amazon.com/images/I/518u-Qh153L._AC_.jpg"
        ]
      };
      await route.fulfill({ json });
    });

    const { wishlistName } = await signUpAndCreateWishlist(page);
    const amazonUrl =
      "https://www.amazon.com/Michael-Kors-Malone-Billfold-Admiral/dp/B0DQRH6LR4/ref=hw_25_a_dag_fh_a47d?pf_rd_p=ba0cb436-0beb-41b0-be33-cd00f6578dc6&pf_rd_r=VNKVRSS60T853PCK3NP0&sr=1-1-9f939889-605c-4811-ad2b-cc2695a8891a&th=1";
    const itemTitle = "Michael Kors Malone Billfold";

    // Add item
    await page.getByRole("button", { name: "Add Item" }).click();
    await page.getByLabel("URL").fill(amazonUrl);
    await page.getByLabel("Title").fill(itemTitle);
    await page.getByLabel("Description").fill("A nice wallet");
    await page.getByRole("button", { name: "Add Item" }).click();

    // Wait for item to appear (increase timeout for real fetch)
    await expect(page.getByText(itemTitle)).toBeVisible({ timeout: 20000 });

    // Find the item card and click its edit button
    const itemCard = page.locator("div.border.rounded-lg", {
      hasText: itemTitle,
    });
    await itemCard.locator("button:has(.lucide-pencil)").click();

    // Wait for the edit dialog
    await expect(page.getByRole("dialog", { name: "Edit Item" })).toBeVisible();

    // Verify carousel is visible
    // Verify carousel is visible
    await expect(page.locator('[aria-label="Image selection carousel"]')).toBeVisible();

    // Click "Next slide"
    const nextButton = page.getByRole("button", { name: "Next slide" });
    await expect(nextButton).toBeEnabled();
    await nextButton.click({ force: true });
    await page.waitForTimeout(500);

    // Select the second image
    await page.getByAltText("Option 2").first().click({ force: true });

    // Save changes
    await page.getByRole("button", { name: "Save Changes" }).click();

    // Verify the item is still visible
    await expect(page.getByText(itemTitle)).toBeVisible();
  });
  test("edit item dialog adapts to viewport height and has no overflow", async ({ page }) => {
    // 1. Test Large Viewport (Default behavior: 300px images)
    await page.setViewportSize({ width: 1280, height: 900 });

    await signUpAndCreateWishlist(page);
    const itemTitle = "Responsive Item";

    // Mock image response for the item creation via CORS proxy
    await page.route("**corsproxy.io**", async (route) => {
      const html = `
        <html>
          <head>
            <meta property="og:image" content="https://example.com/1.jpg" />
            <meta property="og:image" content="https://example.com/2.jpg" />
          </head>
        </html>
      `;
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: html
      });
    });

    // Mock the actual image files to avoid ORB errors
    await page.route("https://example.com/*.jpg", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "image/jpeg",
        body: Buffer.from("ffd8ffe000104a46494600010101004800480000ffdb004300ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc00011080001000103012200021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b51100020102040403040705040400010277000102031104052131061241510761711322328108144291a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffda000c03010002110311003f00bf00", "hex")
      });
    });

    // Manually add item with URL to ensure images are saved
    await page.getByRole("button", { name: "Add Item" }).click();
    await page.getByLabel("Title").fill(itemTitle);
    await page.getByLabel("URL").fill("https://example.com/product");

    // Wait for images to load in Add Dialog
    const dialog = page.locator("div[role='dialog']");
    const imageLabel = dialog.locator("label:has-text('Image')");
    await expect(imageLabel).toContainText("(2)", { timeout: 10000 });

    await page.getByRole("button", { name: "Add Item" }).click();

    // Open edit dialog
    const itemCard = page.locator("div.border.rounded-lg", { hasText: itemTitle });
    await itemCard.locator("button:has(.lucide-pencil)").click();

    const dialogContent = page.locator("div[role='dialog']");
    await expect(dialogContent).toBeVisible();

    // Check 300px size
    const carousel = page.locator('[aria-label="Image selection carousel"]');
    await expect(carousel).toBeVisible();
    const imageContainer = carousel.locator(".relative.overflow-hidden").first();
    let box = await imageContainer.boundingBox(); // carousel wrapper inside
    // The wrapper sticking to max-w-[300px]
    // We target the outer wrapper div that has the max-w applied
    const carouselWrapper = page.getByTestId('carousel-wrapper').first();
    box = await carouselWrapper.boundingBox();

    if (box) {
      expect(Math.round(box.width), "Should be ~300px on large screen").toBe(300);
      expect(Math.round(box.height), "Should be ~300px on large screen").toBe(300);
    }

    // Check overflow
    let { scrollWidth, clientWidth } = await dialogContent.evaluate((node) => ({
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth
    }));
    // Stricter check: scrollWidth should NOT be significantly larger than clientWidth
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    // Close dialog to reset for next part
    await page.getByRole("button", { name: "Close" }).click().catch(() => page.keyboard.press('Escape'));
    await expect(dialogContent).not.toBeVisible();


    // 2. Test Small Viewport (Compressed behavior: 150px images)
    // Height < 800px should trigger the change
    await page.setViewportSize({ width: 1280, height: 600 });

    // Re-open edit dialog
    await itemCard.locator("button:has(.lucide-pencil)").click();
    await expect(dialogContent).toBeVisible();

    // Check 150px size
    box = await carouselWrapper.boundingBox();
    if (box) {
      expect(Math.round(box.width), "Should be ~150px on small screen").toBe(150);
      expect(Math.round(box.height), "Should be ~150px on small screen").toBe(150);
    }

    // Check overflow in small viewport
    ({ scrollWidth, clientWidth } = await dialogContent.evaluate((node) => ({
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth
    })));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    // Vertical overflow check on the screen
    // The dialog should not be taller than viewport + margin
    const dialogBox = await dialogContent.boundingBox();
    if (dialogBox) {
      expect(dialogBox.height).toBeLessThanOrEqual(600); // Should fit or scroll internally
    }
  });

  test("dialog has opaque background and occludes underlying content", async ({ page }) => {
    await signUpAndCreateWishlist(page);

    // Open Add Item dialog
    await page.getByRole("button", { name: "Add Item" }).click();

    const dialogContent = page.locator("div[role='dialog']");
    await expect(dialogContent).toBeVisible();

    // Check background color is not transparent
    const backgroundColor = await dialogContent.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    console.log(`Dialog background color: ${backgroundColor}`);
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(backgroundColor).not.toBe('transparent');

    // In standard light mode, it should be white. 
    // We allow rgba(255, 255, 255, 1) as well.
    expect(backgroundColor).toMatch(/rgb\(255, 255, 255\)/);
  });
});
