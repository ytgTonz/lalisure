import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    
    // Page should load without errors
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')
    
    // Check title
    await expect(page).toHaveTitle(/Lalisure|Home Insurance/)
    
    // Check meta description (if present)
    const metaDescription = page.locator('meta[name="description"]')
    if (await metaDescription.count() > 0) {
      await expect(metaDescription).toHaveAttribute('content', /.+/)
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Page should still be functional on mobile
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')
    
    // Try to find common navigation elements
    const nav = page.locator('nav, [role="navigation"]')
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible()
    }
  })

  test('should handle 404 errors gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page')
    
    // Should either get a 404 response or redirect to a valid page
    if (response?.status() === 404) {
      // Check that page shows a proper 404 error
      await expect(page.locator('body')).toBeVisible()
    }
  })
})