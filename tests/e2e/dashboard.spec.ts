import { test, expect } from '@playwright/test'

// Note: These tests require authentication setup
// For now, they test the unauthenticated state
test.describe('Dashboard - Unauthenticated', () => {
  test('should redirect to sign-in when accessing dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to authentication
    await expect(page).toHaveURL(/sign-in/)
  })
})

test.describe('Policies - Unauthenticated', () => {
  test('should redirect to sign-in when accessing policies', async ({ page }) => {
    await page.goto('/policies')
    
    // Should redirect to authentication
    await expect(page).toHaveURL(/sign-in/)
  })

  test('should redirect to sign-in when accessing policy creation', async ({ page }) => {
    await page.goto('/policies/new')
    
    // Should redirect to authentication
    await expect(page).toHaveURL(/sign-in/)
  })
})

test.describe('Claims - Unauthenticated', () => {
  test('should redirect to sign-in when accessing claims', async ({ page }) => {
    await page.goto('/claims')
    
    // Should redirect to authentication
    await expect(page).toHaveURL(/sign-in/)
  })

  test('should redirect to sign-in when accessing claim creation', async ({ page }) => {
    await page.goto('/claims/new')
    
    // Should redirect to authentication
    await expect(page).toHaveURL(/sign-in/)
  })
})

// TODO: Add authenticated tests once we have proper test user setup
// These would test:
// - Dashboard content and stats
// - Policy creation workflow
// - Claims submission
// - Payment functionality
// - Settings and profile management