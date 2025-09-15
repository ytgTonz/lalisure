
import { test, expect } from '@playwright/test';

test.describe('Staff Authentication', () => {
  test('should redirect unauthenticated users to staff login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/staff\/login/);
  });

  test('should allow a staff member to log in and log out', async ({ page }) => {
    // Go to the login page
    await page.goto('/staff/login');

    // Fill in the form
    await page.fill('#email', 'admin@lalisure.com');
    await page.fill('#password', 'password'); // Replace with a test user's password

    // Click the sign in button
    await page.click('button[type="submit"]');

    // Wait for navigation to the dashboard
    await page.waitForURL('/admin/dashboard');
    await expect(page).toHaveURL('/admin/dashboard');

    // Check for a welcome message or some dashboard content
    await expect(page.locator('h1')).toContainText('Admin Dashboard');

    // Find and click the logout button
    await page.click('button:has-text("Logout")');

    // Wait for redirection to the login page
    await page.waitForURL('/staff/login');
    await expect(page).toHaveURL('/staff/login');
  });

  test('should prevent access to other staff roles routes', async ({ page }) => {
    // Log in as an agent
    await page.goto('/staff/login');
    await page.fill('#email', 'agent@lalisure.com');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/agent/dashboard');

    // Try to access an admin route
    await page.goto('/admin/dashboard');

    // Should be redirected to the login page
    await expect(page).toHaveURL(/\/staff\/login/);
  });
});
