import { expect, test } from "@playwright/test";

test("/hello-world renders verification content", async ({ page }) => {
  await page.goto("/hello-world");

  await expect(
    page.getByRole("heading", { name: /hello world/i }),
  ).toBeVisible();
  await expect(page.getByText(/ruta de verificación inicial/i)).toBeVisible();
});
