import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show sign in page when not authenticated', async ({ page }) => {
    await page.goto('/')
    
    // Should redirect to sign-in page or show sign-in UI
    await expect(page).toHaveURL(/sign-in/)
  })

  test('should navigate to different auth pages', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Check if Clerk sign-in form is visible
    await expect(page.locator('[data-clerk-component]')).toBeVisible()
    
    // Navigate to sign-up page
    await page.click('text=Sign up')
    await expect(page).toHaveURL(/sign-up/)
  })
})

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users to sign-in', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard')
    
    // Should redirect to sign-in
    await expect(page).toHaveURL(/sign-in/)
  })

  test('should redirect from policies page when not authenticated', async ({ page }) => {
    await page.goto('/policies')
    
    // Should redirect to sign-in
    await expect(page).toHaveURL(/sign-in/)
  })

  test('should redirect from claims page when not authenticated', async ({ page }) => {
    await page.goto('/claims')
    
    // Should redirect to sign-in
    await expect(page).toHaveURL(/sign-in/)
  })
})